"use client";

import { useState, useEffect, useCallback } from "react";
import Panel from "./Panel";

interface FireHotspot {
  lat: number;
  lon: number;
  brightness: number;
  confidence: string | number;
  date: string;
  time: string;
  satellite: string;
  frp: number;
  daynight: string;
}

interface FireData {
  hotspots: FireHotspot[];
  totalCount: number;
  highConfidenceCount: number;
  regions: { name: string; count: number; maxBrightness: number }[];
  lastDetection: string | null;
  timestamp: string;
  error?: string;
}

// Sensitive sites to flag when hotspots appear nearby
const SENSITIVE_SITES = [
  { name: "Natanz (Nuclear)", lat: 33.72, lon: 51.73, radius: 0.15 },
  { name: "Isfahan (Nuclear)", lat: 32.65, lon: 51.68, radius: 0.15 },
  { name: "Bushehr (Nuclear)", lat: 28.83, lon: 50.89, radius: 0.15 },
  { name: "Fordow (Nuclear)", lat: 34.88, lon: 51.99, radius: 0.1 },
  { name: "Arak (Heavy Water)", lat: 34.38, lon: 49.24, radius: 0.1 },
  { name: "Parchin (Military)", lat: 35.52, lon: 51.77, radius: 0.15 },
  { name: "Kharg Island (Oil)", lat: 29.23, lon: 50.33, radius: 0.1 },
  { name: "Bandar Abbas (Port)", lat: 27.19, lon: 56.27, radius: 0.15 },
  { name: "Abadan Refinery", lat: 30.34, lon: 48.28, radius: 0.1 },
  { name: "Tehran", lat: 35.69, lon: 51.39, radius: 0.3 },
];

function getNearestSite(lat: number, lon: number): string | null {
  for (const site of SENSITIVE_SITES) {
    const dist = Math.sqrt(
      Math.pow(lat - site.lat, 2) + Math.pow(lon - site.lon, 2)
    );
    if (dist <= site.radius) return site.name;
  }
  return null;
}

function brightnessLevel(b: number): { label: string; color: string } {
  if (b >= 400) return { label: "Extreme", color: "text-red-400" };
  if (b >= 350) return { label: "Very High", color: "text-orange-400" };
  if (b >= 320) return { label: "High", color: "text-yellow-400" };
  if (b >= 300) return { label: "Moderate", color: "text-gray-300" };
  return { label: "Low", color: "text-gray-500" };
}

function confidenceLabel(c: string | number): { label: string; color: string } {
  const val = typeof c === "string" ? c.toLowerCase() : String(c);
  if (val === "high" || val === "h" || parseInt(val) >= 80)
    return { label: "HIGH", color: "bg-red-600 text-white" };
  if (val === "nominal" || val === "n" || parseInt(val) >= 50)
    return { label: "MED", color: "bg-yellow-600 text-white" };
  return { label: "LOW", color: "bg-gray-600 text-gray-200" };
}

export default function FiresPanel() {
  const [data, setData] = useState<FireData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/fires");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Fires fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // refresh every 5min
    return () => clearInterval(interval);
  }, [fetchData]);

  // Check for hotspots near sensitive sites
  const siteAlerts = data?.hotspots
    .map((h) => ({ hotspot: h, site: getNearestSite(h.lat, h.lon) }))
    .filter((a) => a.site !== null) || [];

  return (
    <Panel
      title="Fire / Thermal Detection"
      icon="🔥"
      onRefresh={fetchData}
      className="h-full"
    >
      <div className="h-full flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="p-2 bg-gray-800/50 border-b border-gray-700 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://firms.modaps.eosdis.nasa.gov/map/#d:24hrs;@53.0,32.0,6z"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-white transition-colors"
            >
              NASA FIRMS Map ↗
            </a>
            <a
              href="https://zoom.earth/maps/fires/#view=32.5,53.5,5z"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
            >
              Zoom Earth ↗
            </a>
            <a
              href="https://www.globalforestwatch.org/map/?map=eyJjZW50ZXIiOnsibGF0IjozMiwibG5nIjo1M30sInpvb20iOjV9"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-white transition-colors"
            >
              Forest Watch ↗
            </a>
            <span className="ml-auto text-xs text-gray-500">
              NASA MODIS + VIIRS
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {loading && !data ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400 text-sm animate-pulse">
                Loading satellite thermal data...
              </div>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-lg font-bold text-white">
                    {data?.totalCount ?? "—"}
                  </div>
                  <div className="text-xs text-gray-400">Hotspots (24h)</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div
                    className={`text-lg font-bold ${
                      (data?.highConfidenceCount ?? 0) > 0
                        ? "text-red-400"
                        : "text-white"
                    }`}
                  >
                    {data?.highConfidenceCount ?? "—"}
                  </div>
                  <div className="text-xs text-gray-400">High Confidence</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-lg font-bold text-white">
                    {data?.regions.length ?? "—"}
                  </div>
                  <div className="text-xs text-gray-400">Regions</div>
                </div>
              </div>

              {/* Sensitive Site Alerts */}
              {siteAlerts.length > 0 && (
                <div className="p-2 bg-red-900/40 border border-red-700/50 rounded">
                  <div className="text-xs font-bold text-red-400 mb-1">
                    THERMAL ACTIVITY NEAR SENSITIVE SITES
                  </div>
                  <div className="space-y-1">
                    {siteAlerts.map((a, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-white font-medium">
                          {a.site}
                        </span>
                        <span className="text-gray-400">
                          {a.hotspot.brightness.toFixed(0)}K brightness,{" "}
                          {a.hotspot.frp.toFixed(1)} MW
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regional Breakdown */}
              {data && data.regions.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                    By Region
                  </h3>
                  <div className="space-y-1">
                    {data.regions.map((region, i) => {
                      const level = brightnessLevel(region.maxBrightness);
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-between p-1.5 bg-gray-800 rounded text-xs"
                        >
                          <span className="text-gray-300">{region.name}</span>
                          <div className="flex items-center gap-3">
                            <span className={level.color}>
                              Peak: {region.maxBrightness}K
                            </span>
                            <span className="text-white font-medium w-8 text-right">
                              {region.count}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top Hotspots */}
              {data && data.hotspots.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                    Brightest Detections
                  </h3>
                  <div className="space-y-1.5">
                    {data.hotspots.slice(0, 10).map((h, i) => {
                      const level = brightnessLevel(h.brightness);
                      const conf = confidenceLabel(h.confidence);
                      const site = getNearestSite(h.lat, h.lon);
                      return (
                        <a
                          key={i}
                          href={`https://firms.modaps.eosdis.nasa.gov/map/#d:24hrs;@${h.lon},${h.lat},12z`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${conf.color}`}
                            >
                              {conf.label}
                            </span>
                            <span className="text-[10px] text-gray-500">
                              {h.satellite}
                            </span>
                            <span className="text-[10px] text-gray-600 ml-auto">
                              {h.date} {h.time}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-white">
                              {h.lat.toFixed(3)}°N, {h.lon.toFixed(3)}°E
                              {site && (
                                <span className="text-red-400 text-xs ml-2">
                                  near {site}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={`text-xs font-medium ${level.color}`}>
                                {h.brightness.toFixed(0)}K
                              </span>
                              {h.frp > 0 && (
                                <span className="text-[10px] text-gray-500 ml-1">
                                  {h.frp.toFixed(1)}MW
                                </span>
                              )}
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {data && data.totalCount === 0 && !data.error && (
                <div className="text-center text-sm text-gray-500 py-4">
                  No thermal hotspots detected in Iran (last 24h)
                </div>
              )}

              {data?.error && (
                <div className="p-2 bg-yellow-900/30 border border-yellow-700/50 rounded text-xs text-yellow-400">
                  API returned an error — data may be incomplete. Set
                  FIRMS_MAP_KEY in env for reliable access.
                </div>
              )}

              {/* Last detection footer */}
              {data?.lastDetection && (
                <div className="text-xs text-gray-600 text-center">
                  Last detection: {data.lastDetection}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}
