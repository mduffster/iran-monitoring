"use client";

import { useState, useEffect, useCallback } from "react";
import Panel from "./Panel";

interface ConnectivityData {
  ioda: {
    status: "normal" | "warning" | "critical" | "unknown";
    score: number | null;
    lastUpdate: string;
  };
  reachability: {
    name: string;
    reachable: boolean;
    latency: number | null;
  }[];
}

const MONITORING_LINKS = [
  { name: "Cloudflare Radar", url: "https://radar.cloudflare.com/traffic/ir", color: "bg-orange-500" },
  { name: "IODA", url: "https://ioda.inetintel.cc.gatech.edu/country/IR", color: "bg-purple-600" },
  { name: "NetBlocks", url: "https://netblocks.org/iran", color: "bg-red-600" },
  { name: "OONI", url: "https://explorer.ooni.org/country/IR", color: "bg-blue-600" },
];

export default function InternetStatus() {
  const [data, setData] = useState<ConnectivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/connectivity");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError("Failed to fetch connectivity data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 3 minutes
    const interval = setInterval(fetchStatus, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "critical": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "normal": return "Normal";
      case "warning": return "Degraded";
      case "critical": return "Major Outage";
      default: return "Unknown";
    }
  };

  return (
    <Panel title="Internet Connectivity" icon="🌐" onRefresh={fetchStatus} className="h-full">
      <div className="h-full flex flex-col overflow-hidden">
        {/* Quick links */}
        <div className="flex flex-wrap gap-2 p-2 bg-gray-800/50 border-b border-gray-700 shrink-0">
          {MONITORING_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-xs px-2 py-1 ${link.color} hover:opacity-80 rounded text-white transition-opacity`}
            >
              {link.name} ↗
            </a>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {/* IODA Status Card */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">IODA Status (Iran)</h3>
            {loading && !data ? (
              <div className="p-4 bg-gray-800 rounded animate-pulse">
                <div className="h-8 bg-gray-700 rounded"></div>
              </div>
            ) : data?.ioda ? (
              <div className="p-4 bg-gray-800 rounded">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(data.ioda.status)} ${data.ioda.status === "critical" ? "animate-pulse" : ""}`}></div>
                  <span className="text-lg font-semibold text-white">
                    {getStatusText(data.ioda.status)}
                  </span>
                </div>
                {data.ioda.score !== null && (
                  <div className="text-sm text-gray-400">
                    Signal score: <span className="text-white font-mono">{data.ioda.score}</span>
                    <span className="text-xs ml-2">(1.0 = normal, &lt;0.5 = outage)</span>
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  Data from IODA (Internet Outage Detection & Analysis)
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-800 rounded text-gray-400">
                Unable to fetch IODA data
              </div>
            )}
          </div>

          {/* Reachability checks */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Service Reachability</h3>
            <div className="grid grid-cols-3 gap-2">
              {data?.reachability?.map((service) => (
                <div key={service.name} className="p-2 bg-gray-800 rounded text-center">
                  <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${service.reachable ? "bg-green-500" : "bg-red-500"}`}></div>
                  <div className="text-xs text-white">{service.name}</div>
                  {service.latency && (
                    <div className="text-xs text-gray-500">{service.latency}ms</div>
                  )}
                </div>
              )) || (
                <>
                  <div className="p-2 bg-gray-800 rounded animate-pulse h-16"></div>
                  <div className="p-2 bg-gray-800 rounded animate-pulse h-16"></div>
                  <div className="p-2 bg-gray-800 rounded animate-pulse h-16"></div>
                </>
              )}
            </div>
          </div>

          {/* Info cards */}
          <div className="space-y-3">
            <div className="p-3 bg-yellow-900/30 border border-yellow-700/50 rounded">
              <div className="font-medium text-yellow-400 text-sm mb-1">⚠️ Shutdown Indicators</div>
              <ul className="text-xs text-gray-300 space-y-0.5">
                <li>• IODA score drops below 0.5</li>
                <li>• Traffic cliff on Cloudflare Radar</li>
                <li>• NetBlocks real-time alerts</li>
              </ul>
            </div>

            <div className="p-3 bg-gray-800 rounded">
              <div className="font-medium text-gray-300 text-sm mb-1">🔗 More Tools</div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <a href="https://bgpstream.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">BGPStream ↗</a>
                <a href="https://atlas.ripe.net/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">RIPE Atlas ↗</a>
                <a href="https://www.thousandeyes.com/outages" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">ThousandEyes ↗</a>
                <a href="https://downdetector.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">DownDetector ↗</a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 bg-gray-800/50 text-xs text-gray-500 border-t border-gray-700">
          {data ? `Updated ${new Date(data.ioda?.lastUpdate || Date.now()).toLocaleTimeString()}` : "Loading..."}
        </div>
      </div>
    </Panel>
  );
}
