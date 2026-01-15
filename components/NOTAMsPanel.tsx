"use client";

import { useState, useEffect, useCallback } from "react";
import Panel from "./Panel";

const IRAN_AIRPORTS = [
  { icao: "OIIE", iata: "IKA", name: "Tehran Imam Khomeini" },
  { icao: "OIII", iata: "THR", name: "Tehran Mehrabad" },
  { icao: "OISS", iata: "SYZ", name: "Shiraz" },
  { icao: "OIMM", iata: "MHD", name: "Mashhad" },
  { icao: "OIFM", iata: "IFN", name: "Isfahan" },
  { icao: "OIKB", iata: "BND", name: "Bandar Abbas" },
];

export default function NOTAMsPanel() {
  const handleRefresh = useCallback(() => {}, []);

  return (
    <Panel title="NOTAMs / Airspace" icon="📋" onRefresh={handleRefresh} className="h-full">
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex flex-wrap gap-2 p-2 bg-gray-800/50 border-b border-gray-700 shrink-0">
          <a
            href="https://safeairspace.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
          >
            Safe Airspace ↗
          </a>
          <a
            href="https://www.flightradar24.com/data/airports/ika"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-white"
          >
            FR24 IKA ↗
          </a>
          <a
            href="https://ourairports.com/countries/IR/airports.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white"
          >
            Iran Airports ↗
          </a>
        </div>

        <div className="flex-1 p-3 overflow-y-auto">
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Key Airports</h3>
            <div className="grid grid-cols-2 gap-2">
              {IRAN_AIRPORTS.map((airport) => (
                <a
                  key={airport.icao}
                  href={`https://www.flightradar24.com/data/airports/${airport.iata.toLowerCase()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-blue-400">{airport.icao}</span>
                    <span className="text-xs text-gray-500">{airport.iata}</span>
                  </div>
                  <div className="text-xs text-gray-300 truncate">{airport.name}</div>
                </a>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Airspace Status</h3>
            <a
              href="https://safeairspace.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-red-900/30 border border-red-700/50 rounded hover:bg-red-900/50"
            >
              <div className="text-sm font-medium text-red-400 mb-1">⚠️ Safe Airspace</div>
              <div className="text-xs text-gray-300">
                Check for warnings, closures, and conflict zone advisories
              </div>
            </a>
          </div>

          <div className="p-2 bg-gray-800 rounded">
            <div className="text-xs font-medium text-gray-300 mb-1">🔴 Watch For:</div>
            <ul className="text-xs text-gray-400 space-y-0.5">
              <li>• Airspace closures / TFRs</li>
              <li>• Airlines avoiding Iran airspace</li>
              <li>• Military exercise NOTAMs</li>
              <li>• Navigation aid outages</li>
            </ul>
          </div>
        </div>

        <div className="p-2 bg-gray-800/50 text-xs text-gray-500 border-t border-gray-700">
          Sudden NOTAMs often precede military activity
        </div>
      </div>
    </Panel>
  );
}
