"use client";

import { useState, useCallback } from "react";
import Panel from "./Panel";

const KEY_LOCATIONS = [
  { name: "Strait of Hormuz", lat: 26.5, lon: 56.5, zoom: 9 },
  { name: "Bandar Abbas", lat: 27.2, lon: 56.3, zoom: 11 },
  { name: "Kharg Island", lat: 29.2, lon: 50.3, zoom: 10 },
  { name: "Persian Gulf", lat: 27, lon: 52, zoom: 6 },
];

export default function ShipTracker() {
  const [location, setLocation] = useState(KEY_LOCATIONS[3]); // Default to Persian Gulf overview
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // OpenSeaMap embed URL - this actually works!
  const mapUrl = `https://map.openseamap.org/?zoom=${location.zoom}&lat=${location.lat}&lon=${location.lon}&layers=BFTFFTTFFTF`;

  return (
    <Panel title="Maritime Traffic" icon="🚢" onRefresh={handleRefresh} className="h-full">
      <div className="h-full flex flex-col overflow-hidden">
        {/* Location selector + external links */}
        <div className="p-2 bg-gray-800/50 border-b border-gray-700 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400">View:</span>
            {KEY_LOCATIONS.map((loc) => (
              <button
                key={loc.name}
                onClick={() => setLocation(loc)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  location.name === loc.name
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {loc.name}
              </button>
            ))}
            <div className="flex-1"></div>
            <a
              href={`https://www.marinetraffic.com/en/ais/home/centerx:${location.lon}/centery:${location.lat}/zoom:${location.zoom}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-1 bg-cyan-600 hover:bg-cyan-700 rounded text-white transition-colors"
            >
              MarineTraffic ↗
            </a>
            <a
              href={`https://www.vesselfinder.com/?lat=${location.lat}&lon=${location.lon}&zoom=${location.zoom}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-white transition-colors"
            >
              VesselFinder ↗
            </a>
          </div>
        </div>

        {/* Map embed - OpenSeaMap */}
        <div className="flex-1 relative bg-gray-900">
          <iframe
            key={`${location.name}-${refreshKey}`}
            src={mapUrl}
            className="absolute inset-0 w-full h-full border-0"
            allow="fullscreen"
            title={`OpenSeaMap - ${location.name}`}
          />
        </div>

        {/* Footer with info */}
        <div className="p-2 bg-gray-800/50 text-xs text-gray-500 border-t border-gray-700 flex items-center justify-between">
          <span>OpenSeaMap - nautical chart overlay</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {location.name}
          </span>
        </div>
      </div>
    </Panel>
  );
}
