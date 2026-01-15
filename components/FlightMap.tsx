"use client";

import { useState, useCallback } from "react";
import Panel from "./Panel";

export default function FlightMap() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // ADS-B Exchange map centered on Iran
  // Lat: 32.4279, Lon: 53.6880 (center of Iran)
  const adsbUrl = "https://globe.adsbexchange.com/?icao=&lat=32.43&lon=53.69&zoom=5.5&showTrace=false&trackLabels=false&noIsolation";

  // FlightRadar24 alternative
  const fr24Url = "https://www.flightradar24.com/32.43,53.69/6";

  return (
    <Panel title="Flight Tracking" icon="✈️" onRefresh={handleRefresh} className="h-full">
      <div className="h-full flex flex-col">
        {/* Quick links */}
        <div className="flex gap-2 p-2 bg-gray-800/50">
          <a
            href={adsbUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-white transition-colors"
          >
            ADS-B Exchange ↗
          </a>
          <a
            href={fr24Url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-white transition-colors"
          >
            FlightRadar24 ↗
          </a>
          <a
            href="https://www.flightradar24.com/data/airports/ika"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white transition-colors"
          >
            IKA Airport ↗
          </a>
        </div>

        {/* Map embed */}
        <div className="flex-1 relative">
          <iframe
            key={refreshKey}
            src={adsbUrl}
            className="absolute inset-0 w-full h-full border-0"
            allow="fullscreen"
            title="ADS-B Exchange Flight Map - Iran"
          />
        </div>

        {/* Status indicators */}
        <div className="p-2 bg-gray-800/50 text-xs text-gray-400 flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live tracking
          </span>
          <span>Coverage: Iran, Persian Gulf, Caspian Sea</span>
        </div>
      </div>
    </Panel>
  );
}
