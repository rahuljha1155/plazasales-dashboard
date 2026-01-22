"use client";

import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import worldMap from "../../../public/maps/world-110m.json";

interface Props {
  data: {
    country_code: string;
    visitors: number;
  }[];
}

const countryCoords: Record<string, [number, number]> = {
  NP: [84.124, 28.3949],
  US: [-95.7129, 37.0902],
  GB: [-3.4359, 55.3781],
  IN: [78.9629, 20.5937],
  NL: [5.2913, 52.1326],
  PH: [121.7740, 12.8797],
};

const countryNames: Record<string, string> = {
  NP: "Nepal",
  US: "United States",
  GB: "United Kingdom",
  IN: "India",
  NL: "Netherlands",
  PH: "Philippines",
};

const countryCodeMap: Record<string, string> = {
  "NPL": "NP",
  "USA": "US",
  "GBR": "GB",
  "IND": "IN",
  "NLD": "NL",
  "PHL": "PH",
};

export default function ActiveVisitorsMap({ data }: Props) {
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1.5 });
  const [tooltip, setTooltip] = useState<{ name: string; visitors: number; x: number; y: number } | null>(null);

  const dataMap = new Map(data.map(item => [item.country_code, item.visitors]));

  function handleMoveEnd(position: any) {
    setPosition(position);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (tooltip) {
      setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
    }
  }

  return (
    <div 
      className="h-[60vh] bg-black rounded-lg  max-w-7xl mx-auto w-full overflow-hidden cursor-grab active:cursor-grabbing relative"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 h-full w-full z-5 bg-[linear-gradient(to_right,#0c270c_1px,transparent_1px),linear-gradient(to_bottom,#0c270c_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.75;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.3);
          }
        }
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .tooltip-enter {
          animation: tooltipFadeIn 0.2s ease-out forwards;
        }
      `}</style>

      {tooltip && (
        <div
          className="absolute pointer-events-none z-50 tooltip-enter"
          style={{
            left: `${tooltip.x - 200}px`,
            top: `${tooltip.y - 100}px`,
          }}
        >
          <div className="bg-gray-900/95 backdrop-blur-sm text-white px-3 py-2 rounded-lg shadow-xl border border-green-500/30">
            <div className="text-sm font-semibold text-green-400">{tooltip.name}</div>
            <div className="text-xs text-gray-300">{tooltip.visitors} active visitors</div>
          </div>
        </div>
      )}

      <ComposableMap projection="geoMercator">
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates as [number, number]}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={worldMap}>
            {({ geographies }: any) =>
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="none"
                  stroke="#0B260B"
                  className="transition-colors hover:border-none hover:outline-none focus:outline-none"
                />
              ))
            }
          </Geographies>

          {data.map(({ country_code, visitors }) => {
            const coords = countryCoords[country_code];
            if (!coords) return null;

            // Generate stable positions for dots
            const dots = [...Array(Math.min(visitors, 50))].map((_, i) => {
              const seed = country_code.charCodeAt(0) * 1000 + i;
              const pseudoRandom1 = Math.sin(seed * 0.1) * 10000;
              const pseudoRandom2 = Math.sin(seed * 0.2) * 10000;
              const pseudoRandom3 = Math.sin(seed * 0.3) * 10000;
              const pseudoRandom4 = Math.sin(seed * 0.4) * 10000;
              
              return {
                cx: (pseudoRandom1 - Math.floor(pseudoRandom1)) * 12 - 6,
                cy: (pseudoRandom2 - Math.floor(pseudoRandom2)) * 12 - 6,
                delay: (pseudoRandom3 - Math.floor(pseudoRandom3)) * 2,
                duration: 1.5 + (pseudoRandom4 - Math.floor(pseudoRandom4)) * 1.5,
              };
            });

            return (
              <Marker key={country_code} coordinates={coords}>
                <g
                  onMouseEnter={(e: any) => {
                    setTooltip({
                      name: countryNames[country_code] || country_code,
                      visitors,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  className="cursor-pointer"
                >
                  <circle
                    r={8}
                    fill="transparent"
                    stroke="transparent"
                  />
                  {dots.map((dot, i) => (
                    <circle
                      key={i}
                      r={1}
                      cx={dot.cx}
                      cy={dot.cy}
                      fill="green"
                      style={{
                        animation: `pulse ${dot.duration}s ease-in-out ${dot.delay}s infinite`,
                      }}
                    />
                  ))}
                </g>
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
