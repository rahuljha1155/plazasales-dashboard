// component.tsx
import { useEffect, useRef, useState } from "react";
import type { FC } from "react";
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl";
import { gsap } from "gsap";
import io from "socket.io-client";

interface ComponentProps {
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleColors?: string[];
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
  alphaParticles?: boolean;
  particleBaseSize?: number;
  sizeRandomness?: number;
  cameraDistance?: number;
  disableRotation?: boolean;
  className?: string;
}

const defaultColors: string[] = ["#7CFC00"];

const hexToRgb = (hex: string): [number, number, number] => {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const int = parseInt(hex, 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  return [r, g, b];
};

const vertexShader = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;

  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;

  varying vec4 vRandom;
  varying vec3 vColor;
  varying float vPulse;

  void main() {
    vRandom = random;
    vColor = color;

    // Reduce spread to keep particles tighter within bounds
    vec3 pos = position * (uSpread * 0.7);

    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime * 0.1;

    // Minimal movement to keep particles within bounds
    float moveAmount = 0.15;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.02, moveAmount, random.x);
    mPos.y += cos(t * random.y + 6.28 * random.x) * mix(0.02, moveAmount, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.02, moveAmount, random.z);

    // Clamp positions to stay within visible bounds
    float maxBound = uSpread * 0.85;
    mPos.x = clamp(mPos.x, -maxBound, maxBound);
    mPos.y = clamp(mPos.y, -maxBound, maxBound);
    mPos.z = clamp(mPos.z, -maxBound, maxBound);

    vec4 mvPos = viewMatrix * mPos;

    // FIXED: Use particle's unique random value for timing with faster blink
    float pulseTime = uTime + random.x * 10.0;
    vPulse = sin(pulseTime * 400.0) * 0.5 + 0.5;
    float pulseSize = mix(0.5, 1.5, vPulse);
    
    gl_PointSize = (uBaseSize * pulseSize * (1.0 + uSizeRandomness * (random.y - 0.5))) / -mvPos.z;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  
  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;
  varying float vPulse;
  
  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5)); 
    
    vec3 pulseColor = vColor * (0.7 + 0.5 * vPulse);
    float pulseAlpha = 0.7 + 0.3 * vPulse;

    if(uAlphaParticles < 0.5) { 
      if(d > 0.5) discard;
      gl_FragColor = vec4(pulseColor, pulseAlpha);
    } else { 
      float circleAlpha = smoothstep(0.5, 0.4, d) * pulseAlpha; 
      gl_FragColor = vec4(pulseColor, circleAlpha); 
    }
  }
`;

const API_BASE =
  import.meta.env.VITE_BACKEND_URL ||
  "https://app.plazasales.com.np/api/v1/plaza";

const resolveSocketUrl = () => {
  const envUrl = import.meta.env.VITE_SOCKET_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");

  try {
    return new URL(API_BASE).origin;
  } catch (error) {
    return window.location.origin;
  }
};

const resolveSocketTransports = (): ("polling" | "websocket")[] => {
  const raw = import.meta.env.VITE_SOCKET_TRANSPORTS;
  if (raw) {
    const parsed = raw
      .split(",")
      .map((s: string) => s.trim())
      .filter(
        (s: string): s is "polling" | "websocket" =>
          s === "polling" || s === "websocket",
      );
    if (parsed.length) return parsed;
  }
  // Default to polling to avoid websocket upgrade failures on proxies/CDNs that block upgrades.
  return ["polling"];
};

export const Component: FC<ComponentProps> = ({
  particleCount = 200,
  particleSpread = 10,
  speed = 0.1,
  particleColors,
  moveParticlesOnHover = false,
  particleHoverFactor = 1,
  alphaParticles = false,
  particleBaseSize = 100,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rendererRef = useRef<Renderer | null>(null);
  const sceneRef = useRef<Mesh | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const programRef = useRef<Program | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [isPresenceConnected, setIsPresenceConnected] = useState(false);
  const [liveSockets, setLiveSockets] = useState<number | null>(null);

  useEffect(() => {
    const socketUrl = resolveSocketUrl();
    const transports = resolveSocketTransports();
    const socket = io(socketUrl, {
      transports,
      upgrade: transports.includes("websocket"),
      withCredentials: false,
      path: "/socket.io",
      reconnectionAttempts: 5,
      timeout: 10_000,
    });

    const handleOnlineUsers = (payload?: {
      total?: number;
      totalUnique?: number;
      totalSockets?: number;
    }) => {
      const unique =
        typeof payload?.totalUnique === "number"
          ? payload.totalUnique
          : typeof payload?.total === "number"
            ? payload.total
            : null;
      if (unique !== null) setOnlineUsers(unique);
      if (typeof payload?.total === "number") {
        setTotalUsers(payload.total);
      }

      if (typeof payload?.totalSockets === "number") {
        setLiveSockets(payload.totalSockets);
      }
    };

    socket.on("connect", () => setIsPresenceConnected(true));
    socket.on("connect_error", (err) => {
      setIsPresenceConnected(false);
      setOnlineUsers(0);
      setLiveSockets(null);
    });
    socket.on("disconnect", () => {
      setIsPresenceConnected(false);
      setOnlineUsers(0);
      setLiveSockets(null);
    });
    socket.on("online-users", handleOnlineUsers);

    return () => {
      socket.off("online-users", handleOnlineUsers);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === "undefined") return;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 2),
      depth: false,
      alpha: true,
    });
    rendererRef.current = renderer;
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 35 });
    camera.position.set(0, 0, cameraDistance);
    cameraRef.current = camera;

    const resize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      rendererRef.current.setSize(width, height);
      cameraRef.current.perspective({
        aspect: gl.canvas.width / gl.canvas.height,
      });
    };
    window.addEventListener("resize", resize, false);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current = { x, y };
    };

    if (moveParticlesOnHover) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    // Use onlineUsers for particle count, with fallback to particleCount prop
    const count = Math.max(onlineUsers, 1);
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const palette =
      particleColors && particleColors.length > 0
        ? particleColors
        : defaultColors;

    for (let i = 0; i < count; i++) {
      let x: number, y: number, z: number, lenSq: number;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        lenSq = x * x + y * y + z * z;
      } while (lenSq > 1 || lenSq === 0);

      const r = Math.cbrt(Math.random());
      positions.set([x * r, y * r, z * r], i * 3);
      randoms.set(
        [Math.random(), Math.random(), Math.random(), Math.random()],
        i * 4,
      );
      const col = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
      colors.set(col, i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors },
    });

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize },
        uSizeRandomness: { value: sizeRandomness },
        uAlphaParticles: { value: alphaParticles ? 1.0 : 0.0 },
      },
      transparent: true,
      depthTest: false,
    });
    programRef.current = program;

    const particlesMesh = new Mesh(gl, { mode: gl.POINTS, geometry, program });
    sceneRef.current = particlesMesh;

    let animationFrameId: number;
    let lastTime = performance.now();
    let elapsed = 0;

    const update = (t: number) => {
      animationFrameId = requestAnimationFrame(update);

      const currentTime = performance.now();
      const delta = currentTime - lastTime;
      lastTime = currentTime;
      elapsed += delta * speed;

      if (programRef.current) {
        programRef.current.uniforms.uTime.value = elapsed * 0.05;
      }

      if (sceneRef.current) {
        if (moveParticlesOnHover) {
          gsap.to(sceneRef.current.position, {
            x: -mouseRef.current.x * particleHoverFactor * 0.1,
            y: -mouseRef.current.y * particleHoverFactor * 0.1,
            duration: 0.5,
            ease: "power2.out",
          });
        } else {
          if (
            sceneRef.current.position.x !== 0 ||
            sceneRef.current.position.y !== 0
          ) {
            gsap.to(sceneRef.current.position, {
              x: 0,
              y: 0,
              duration: 0.5,
              ease: "power2.out",
            });
          }
        }

        if (!disableRotation) {
          sceneRef.current.rotation.x = Math.sin(elapsed * 0.00005) * 0.1;
          sceneRef.current.rotation.y += 0.0005 * speed;
        }
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render({
          scene: sceneRef.current,
          camera: cameraRef.current,
        });
      }
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("resize", resize);
      if (moveParticlesOnHover && container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
      if (sceneRef?.current?.position) {
        gsap.killTweensOf(sceneRef.current.position);
      }

      if (
        container &&
        rendererRef.current &&
        container.contains(rendererRef.current.gl.canvas)
      ) {
        container.removeChild(rendererRef.current.gl.canvas);
      }
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      programRef.current = null;
    };
  }, [
    particleCount,
    particleSpread,
    speed,
    JSON.stringify(particleColors),
    moveParticlesOnHover,
    particleHoverFactor,
    alphaParticles,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    disableRotation,
    onlineUsers, // Add onlineUsers as dependency to recreate particles when user count changes
  ]);

  return (
    <>
      <div
        ref={containerRef}
        className={`relative w-full z-[45] h-full overflow-hidden ${className || ""}`}
        style={{
          touchAction: "none",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div className="absolute inset-0 h-full w-full z-5 bg-[linear-gradient(to_right,#0c270c_1px,transparent_1px),linear-gradient(to_bottom,#0c270c_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-4 pointer-events-none right-4 z-50 bg-black/50 flex  gap-4">
          <div className="flex border border-green-500 px-3 rounded-full py-1  items-center gap-2">
            <span className="text-green-400  flex gap-2 items-center font-semibold text-sm">
              Total Users: <span className="text-white">{totalUsers}</span>
            </span>
          </div>
          <div className="flex border border-green-500 px-3 rounded-full py-1  items-center gap-2">
            <span className="text-green-400 font-semibold text-sm flex gap-2 items-center">
              <span>Unique Users:</span>{" "}
              <span className="text-white">{onlineUsers}</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
