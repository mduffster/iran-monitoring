"use client";

import { useState, useCallback } from "react";
import Panel from "./Panel";

export default function CurrencyPanel() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // Bonbast widget/embed approach - they have a chart we can reference
  return (
    <Panel title="Iranian Rial (IRR/USD)" icon="💱" onRefresh={handleRefresh} className="h-full">
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex gap-2 p-2 bg-gray-800/50 border-b border-gray-700 shrink-0">
          <a
            href="https://www.bonbast.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-white"
          >
            Bonbast ↗
          </a>
          <a
            href="https://www.tgju.org/currency"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            TGJU ↗
          </a>
          <a
            href="https://tradingeconomics.com/iran/currency"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white"
          >
            TradingEcon ↗
          </a>
        </div>

        <div className="flex-1 p-3 overflow-y-auto">
          <div className="p-3 bg-red-900/30 border border-red-700/50 rounded mb-3">
            <div className="text-xs text-red-400 uppercase mb-1">⚠️ Free Market Rate</div>
            <div className="text-xl font-bold text-white">
              ~1,460,000 <span className="text-sm text-gray-400">IRR/USD</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Check Bonbast for real-time rate (updates frequently)
            </div>
          </div>

          <div className="p-3 bg-gray-800 rounded mb-3">
            <div className="text-xs text-gray-500 uppercase mb-1">Official Rate (Meaningless)</div>
            <div className="text-lg text-gray-500">
              ~42,000 <span className="text-sm">IRR/USD</span>
            </div>
            <div className="text-xs text-gray-600">
              Government rate - not accessible to ordinary Iranians
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2 bg-yellow-900/30 border border-yellow-700/50 rounded text-yellow-400">
              <strong>Why it matters:</strong> The rial has lost 99.99% of its value since 1979. Rapid drops signal crisis/instability.
            </div>

            <div className="p-2 bg-gray-800 rounded text-gray-400">
              <strong>Key indicators:</strong>
              <ul className="mt-1 space-y-0.5">
                <li>• Sharp drops → sanctions pressure or crisis</li>
                <li>• Rate spikes → capital flight fears</li>
                <li>• Gap widening → economic stress</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-2 bg-gray-800/50 text-xs text-gray-500 border-t border-gray-700">
          Bonbast tracks street exchange rates in real-time
        </div>
      </div>
    </Panel>
  );
}
