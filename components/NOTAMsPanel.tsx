"use client";

import { useState, useEffect, useCallback } from "react";
import Panel from "./Panel";

const IRAN_AIRPORTS = [
  { icao: "OIIE", name: "Tehran IKA" },
  { icao: "OIII", name: "Tehran Mehrabad" },
  { icao: "OISS", name: "Shiraz" },
  { icao: "OIMM", name: "Mashhad" },
  { icao: "OIFM", name: "Isfahan" },
  { icao: "OIKB", name: "Bandar Abbas" },
];

export default function NOTAMsPanel() {
  const [data, setData] = useState<any>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/notams");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("NOTAMs fetch error:", e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Panel title="NOTAMs / Airspace" icon="📋" onRefresh={fetchData} className="h-full">
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex flex-wrap gap-2 p-2 bg-gray-800/50 border-b border-gray-700 shrink-0">
          <a
            href="https://notaminfo.com/country/IR"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            NOTAMInfo ↗
          </a>
          <a
            href="https://www.notams.faa.gov/dinsQueryWeb/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white"
          >
            FAA NOTAM ↗
          </a>
          <a
            href="https://skyvector.com/notams"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white"
          >
            SkyVector ↗
          </a>
        </div>

        <div className="flex-1 p-3 overflow-y-auto">
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Key Airports</h3>
            <div className="grid grid-cols-2 gap-2">
              {IRAN_AIRPORTS.map((airport) => (
                <a
                  key={airport.icao}
                  href={`https://notaminfo.com/search?q=${airport.icao}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
                >
                  <div className="text-xs font-mono text-blue-400">{airport.icao}</div>
                  <div className="text-xs text-gray-300">{airport.name}</div>
                </a>
              ))}
            </div>
          </div>

          <div className="mb-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Iran FIR</h3>
            <a
              href="https://notaminfo.com/search?q=OIIX"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-2 bg-gray-800 rounded hover:bg-gray-700"
            >
              <span className="text-xs font-mono text-blue-400">OIIX</span>
              <span className="text-xs text-gray-400 ml-2">Tehran FIR (entire Iran airspace)</span>
            </a>
          </div>

          <div className="p-2 bg-red-900/30 border border-red-700/50 rounded">
            <div className="text-xs font-medium text-red-400 mb-1">🔴 Watch For:</div>
            <ul className="text-xs text-gray-300 space-y-0.5">
              <li>• Airspace closures / TFRs</li>
              <li>• Military exercise areas</li>
              <li>• Navigation aid outages</li>
              <li>• Airport restrictions</li>
            </ul>
          </div>
        </div>

        <div className="p-2 bg-gray-800/50 text-xs text-gray-500 border-t border-gray-700">
          NOTAMs often signal military activity before public announcements
        </div>
      </div>
    </Panel>
  );
}
