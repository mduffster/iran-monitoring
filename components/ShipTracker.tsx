"use client";

import { useState, useEffect, useCallback } from "react";
import Panel from "./Panel";

interface MaritimeIncident {
  title: string;
  description: string;
  time: string;
  link: string;
  source: string;
  severity: "info" | "warning" | "critical";
}

interface MaritimeData {
  incidents: MaritimeIncident[];
  status: {
    strait: "normal" | "elevated" | "disrupted";
    criticalCount: number;
    warningCount: number;
    totalIncidents: number;
    lastCheck: string;
  };
  feedsOnline: number;
  feedsTotal: number;
  timestamp: string;
}

const STATUS_CONFIG = {
  normal: {
    label: "OPEN / NORMAL",
    color: "text-green-400",
    bg: "bg-green-900/30 border-green-700/50",
    dot: "bg-green-500",
    description: "No significant disruptions reported",
  },
  elevated: {
    label: "ELEVATED RISK",
    color: "text-yellow-400",
    bg: "bg-yellow-900/30 border-yellow-700/50",
    dot: "bg-yellow-500",
    description: "Maritime warnings or incidents reported",
  },
  disrupted: {
    label: "DISRUPTED",
    color: "text-red-400",
    bg: "bg-red-900/30 border-red-700/50",
    dot: "bg-red-500",
    description: "Critical incidents affecting transit",
  },
};

const SEVERITY_STYLE = {
  critical: "bg-red-600 text-white",
  warning: "bg-yellow-600 text-white",
  info: "bg-gray-600 text-gray-200",
};

export default function ShipTracker() {
  const [data, setData] = useState<MaritimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/maritime");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Maritime fetch error:", e);
      setError("Failed to load maritime data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3 * 60 * 1000); // refresh every 3min
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatTime = (time: string) => {
    const date = new Date(time);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const status = data?.status;
  const cfg = status ? STATUS_CONFIG[status.strait] : STATUS_CONFIG.normal;

  return (
    <Panel title="Strait of Hormuz" icon="⚓" onRefresh={fetchData} className="h-full">
      <div className="h-full flex flex-col overflow-hidden">
        {/* Top bar with external links */}
        <div className="p-2 bg-gray-800/50 border-b border-gray-700 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://www.marinetraffic.com/en/ais/home/centerx:56.25/centery:26.56/zoom:9"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-white transition-colors"
            >
              MarineTraffic ↗
            </a>
            <a
              href="https://www.vesselfinder.com/?lat=26.56&lon=56.25&zoom=10"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-white transition-colors"
            >
              VesselFinder ↗
            </a>
            <a
              href="https://www.ukmto.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
            >
              UKMTO ↗
            </a>
            <a
              href="https://gcaptain.com/tag/strait-of-hormuz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white transition-colors"
            >
              gCaptain ↗
            </a>
            {data && (
              <span className="ml-auto text-xs text-gray-500">
                {data.feedsOnline}/{data.feedsTotal} feeds
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {loading && !data ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400 text-sm animate-pulse">
                Loading maritime intelligence...
              </div>
            </div>
          ) : error && !data ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-400 text-sm">{error}</div>
            </div>
          ) : (
            <>
              {/* Strait Status Card */}
              <div className={`p-3 rounded border ${cfg.bg}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} ${status?.strait !== "normal" ? "animate-pulse" : ""}`} />
                    <span className={`text-sm font-bold ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Strait of Hormuz
                  </span>
                </div>
                <div className="text-xs text-gray-400">{cfg.description}</div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className="text-lg font-bold text-white">
                    {status?.totalIncidents ?? "—"}
                  </div>
                  <div className="text-xs text-gray-400">24h Reports</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className={`text-lg font-bold ${(status?.criticalCount ?? 0) > 0 ? "text-red-400" : "text-white"}`}>
                    {status?.criticalCount ?? "—"}
                  </div>
                  <div className="text-xs text-gray-400">Critical</div>
                </div>
                <div className="bg-gray-800 rounded p-2 text-center">
                  <div className={`text-lg font-bold ${(status?.warningCount ?? 0) > 0 ? "text-yellow-400" : "text-white"}`}>
                    {status?.warningCount ?? "—"}
                  </div>
                  <div className="text-xs text-gray-400">Warnings</div>
                </div>
              </div>

              {/* Chokepoint Context */}
              <div className="bg-gray-800 rounded p-2">
                <div className="text-xs text-gray-400 mb-1">Chokepoint Profile</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="text-gray-500">Width:</div>
                  <div className="text-gray-300">21 nm (narrowest)</div>
                  <div className="text-gray-500">Shipping lanes:</div>
                  <div className="text-gray-300">2 × 2-mile lanes</div>
                  <div className="text-gray-500">Daily oil transit:</div>
                  <div className="text-gray-300">~21M barrels/day</div>
                  <div className="text-gray-500">Global oil share:</div>
                  <div className="text-gray-300">~21% of consumption</div>
                  <div className="text-gray-500">LNG transit:</div>
                  <div className="text-gray-300">~25% of global LNG</div>
                </div>
              </div>

              {/* Incident Feed */}
              {data && data.incidents.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                    Maritime Intelligence Feed
                  </h3>
                  <div className="space-y-2">
                    {data.incidents.slice(0, 12).map((incident, i) => (
                      <a
                        key={i}
                        href={incident.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${SEVERITY_STYLE[incident.severity]}`}
                          >
                            {incident.severity.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {incident.source}
                          </span>
                          <span className="text-[10px] text-gray-600 ml-auto">
                            {formatTime(incident.time)}
                          </span>
                        </div>
                        <div className="text-sm text-white line-clamp-2">
                          {incident.title}
                        </div>
                        {incident.description && (
                          <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                            {incident.description}
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {data && data.incidents.length === 0 && (
                <div className="text-center text-sm text-gray-500 py-4">
                  No recent maritime incidents matching Hormuz/Gulf criteria
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}
