"use client";

import { useState, useCallback } from "react";
import Panel from "./Panel";

export default function CurrencyPanel() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

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

        {/* Try to embed Bonbast chart */}
        <div className="flex-1 relative bg-gray-900">
          <iframe
            key={refreshKey}
            src="https://www.bonbast.com/chart"
            className="absolute inset-0 w-full h-full border-0"
            title="Bonbast USD/IRR Chart"
          />
        </div>

        <div className="p-2 bg-gray-800/50 text-xs border-t border-gray-700">
          <div className="flex items-center justify-between text-gray-400">
            <span>Free market rate (not official)</span>
            <span className="text-yellow-400">~1.46M IRR = 1 USD</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
