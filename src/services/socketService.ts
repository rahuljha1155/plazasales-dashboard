import { io, Socket } from "socket.io-client";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "https://plaza-api.webxnepal.com/api/v1";

const resolveSocketUrl = () => {
    const envUrl = import.meta.env.VITE_SOCKET_URL?.trim();
    if (envUrl) {
        // Remove trailing slashes and any path segments
        const url = envUrl.replace(/\/+$/, "");
        try {
            const parsed = new URL(url);
            return parsed.origin; // Return only origin (protocol + host)
        } catch {
            return url;
        }
    }

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
            .filter((s: string): s is "polling" | "websocket" =>
                s === "polling" || s === "websocket"
            );
        if (parsed.length) return parsed;
    }
    return ["polling"];
};

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

    connect() {
        if (this.socket?.connected) return this.socket;

        const socketUrl = resolveSocketUrl();
        const transports = resolveSocketTransports();

        // Get namespace from env or extract from VITE_SOCKET_URL
        const envUrl = import.meta.env.VITE_SOCKET_URL?.trim();
        let namespace = import.meta.env.VITE_SOCKET_NAMESPACE?.trim() || "/";

        // If no explicit namespace, try to extract from VITE_SOCKET_URL
        if (namespace === "/" && envUrl) {
            try {
                const url = new URL(envUrl);
                // Get path as namespace (e.g., /api/v1/plaza)
                namespace = url.pathname || "/";
            } catch {
                // If not a full URL, treat the path as namespace
                const pathMatch = envUrl.match(/https?:\/\/[^\/]+(.+)/);
                if (pathMatch) {
                    namespace = pathMatch[1];
                }
            }
        }

        this.socket = io(socketUrl + namespace, {
            transports,
            upgrade: transports.includes("websocket"),
            withCredentials: false,
            reconnectionAttempts: 5,
            timeout: 10_000,
        });

        this.socket.on("connect", () => {
            // Socket connected
        });

        this.socket.on("connect_error", (err) => {
            // Socket connection error
        });

        this.socket.on("disconnect", () => {
            // Socket disconnected
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
        }
    }

    on(event: string, callback: (...args: any[]) => void) {
        if (!this.socket) this.connect();

        this.socket?.on(event, callback);

        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)?.add(callback);
    }

    off(event: string, callback?: (...args: any[]) => void) {
        if (!this.socket) return;

        if (callback) {
            this.socket.off(event, callback);
            this.listeners.get(event)?.delete(callback);
        } else {
            this.socket.off(event);
            this.listeners.delete(event);
        }
    }

    emit(event: string, ...args: any[]) {
        if (!this.socket) this.connect();
        this.socket?.emit(event, ...args);
    }

    isConnected() {
        return this.socket?.connected ?? false;
    }

    getSocket() {
        return this.socket;
    }
}

export const socketService = new SocketService();
