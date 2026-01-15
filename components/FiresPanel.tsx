"use client";

import { useState, useCallback } from "react";
import Panel from "./Panel";

export default function FiresPanel() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [source, setSource] = useState<"windy" | "zoom">("windy");

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Windy.com with fires layer - centered on Iran
  const windyUrl = "https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=5&overlay=fires&product=fires&level=surface&lat=32.5&lon=53.5&detailLat=32.5&detailLon=53.5&marker=true";

  // Zoom Earth fires layer
  const zoomUrl = "https://zoom.earth/maps/fires/#view=32.5,53.5,5z";

  return (
    <Panel title="Fire / Thermal Detection" icon="🔥" onRefresh={handleRefresh} className="h-full">
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-800/50 border-b border-gray-700 shrink-0">
          <button
            onClick={() => setSource("windy")}
            className={`text-xs px-2 py-1 rounded transition-colors ${source === "windy" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}
          >
            Windy
          </button>
          <button
            onClick={() => setSource("zoom")}
            className={`text-xs px-2 py-1 rounded transition-colors ${source === "zoom" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}
          >
            Zoom Earth
          </button>
          <div className="flex-1" />
          <a
            href="https://firms.modaps.eosdis.nasa.gov/map/#d:24hrs;@53.0,32.0,6z"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-white"
          >
            NASA FIRMS ↗
          </a>
          <a
            href="https://www.globalforestwatch.org/map/?map=eyJjZW50ZXIiOnsibGF0IjozMiwibG5nIjo1M30sInpvb20iOjV9"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-white"
          >
            Forest Watch ↗
          </a>
        </div>

        <div className="flex-1 relative bg-gray-900">
          {source === "windy" ? (
            <iframe
              key={`windy-${refreshKey}`}
              src={windyUrl}
              className="absolute inset-0 w-full h-full border-0"
              title="Windy Fires Map - Iran"
            />
          ) : (
            <iframe
              key={`zoom-${refreshKey}`}
              src={zoomUrl}
              className="absolute inset-0 w-full h-full border-0"
              title="Zoom Earth Fires - Iran"
            />
          )}
        </div>

        <div className="p-2 bg-gray-800/50 text-xs text-gray-400 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Satellite thermal hotspots - explosions, fires, flares</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
