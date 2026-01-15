"use client";

import { useState, useEffect, useCallback } from "react";
import Panel from "./Panel";

interface Earthquake {
  magnitude: number;
  place: string;
  time: string;
  depth: number;
  lat: number;
  lon: number;
  url: string;
}

export default function SeismicPanel() {
  const [quakes, setQuakes] = useState<Earthquake[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/seismic");
      const data = await res.json();
      if (data.earthquakes) {
        setQuakes(data.earthquakes);
        setCount(data.count || 0);
      }
    } catch (e) {
      console.error("Seismic fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getMagnitudeColor = (mag: number) => {
    if (mag >= 5) return "bg-red-500";
    if (mag >= 4) return "bg-orange-500";
    if (mag >= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <Panel title="Seismic Activity" icon="🌍" onRefresh={fetchData} className="h-full">
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex gap-2 p-2 bg-gray-800/50 border-b border-gray-700 shrink-0">
          <a
            href="https://earthquake.usgs.gov/earthquakes/map/?extent=24.5,43&extent=40.5,65"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            USGS Map ↗
          </a>
          <span className="text-xs text-gray-400 self-center">
            {count} events (7 days, M2.5+)
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && quakes.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : quakes.length === 0 ? (
            <div className="p-4 text-center text-gray-400 text-sm">
              No significant seismic activity
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {quakes.map((q, i) => (
                <a
                  key={i}
                  href={q.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${getMagnitudeColor(q.magnitude)} text-white`}>
                      {q.magnitude.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-400">{formatTime(q.time)}</span>
                    <span className="text-xs text-gray-500">{q.depth.toFixed(0)}km deep</span>
                  </div>
                  <div className="text-sm text-gray-200 mt-1 truncate">{q.place}</div>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="p-2 bg-yellow-900/30 border-t border-yellow-700/50 text-xs text-yellow-400">
          ⚠️ Large explosions can appear as seismic events
        </div>
      </div>
    </Panel>
  );
}
