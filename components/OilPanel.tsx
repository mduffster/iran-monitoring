"use client";

import { useState, useCallback } from "react";
import Panel from "./Panel";

export default function OilPanel() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  // TradingView widget for Brent crude
  const tradingViewUrl = "https://www.tradingview.com/chart/?symbol=TVC%3AUKOIL";

  return (
    <Panel title="Oil Prices (Brent)" icon="🛢️" onRefresh={handleRefresh} className="h-full">
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex flex-wrap gap-2 p-2 bg-gray-800/50 border-b border-gray-700 shrink-0">
          <a
            href="https://www.tradingview.com/symbols/TVC-UKOIL/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            TradingView ↗
          </a>
          <a
            href="https://oilprice.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-white"
          >
            OilPrice.com ↗
          </a>
          <a
            href="https://www.investing.com/commodities/brent-oil"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white"
          >
            Investing.com ↗
          </a>
        </div>

        <div className="flex-1 p-3 overflow-y-auto">
          {/* TradingView Mini Chart Widget */}
          <div className="mb-3 bg-gray-800 rounded p-3">
            <div className="text-xs text-gray-400 uppercase mb-2">Brent Crude (UKOIL)</div>
            <div className="h-32 bg-gray-900 rounded flex items-center justify-center">
              <iframe
                key={refreshKey}
                src="https://www.tradingview.com/widgetembed/?hideideas=1&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en&symbol=TVC%3AUKOIL&interval=D&timezone=exchange&theme=dark&style=1&withdateranges=1&hide_side_toolbar=1&allow_symbol_change=0&save_image=0&hide_top_toolbar=1&hide_legend=1"
                className="w-full h-full border-0 rounded"
                title="Brent Crude Chart"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="p-2 bg-gray-800 rounded">
              <div className="text-xs text-gray-400">Why Brent matters for Iran:</div>
              <ul className="text-xs text-gray-300 mt-1 space-y-0.5">
                <li>• Iran's oil exports priced off Brent</li>
                <li>• ~80% of government revenue from oil</li>
                <li>• Price spikes often follow regional tensions</li>
              </ul>
            </div>

            <div className="p-2 bg-yellow-900/30 border border-yellow-700/50 rounded">
              <div className="text-xs text-yellow-400">
                📈 Sharp price moves can indicate:
              </div>
              <ul className="text-xs text-gray-300 mt-1">
                <li>• Strait of Hormuz disruption fears</li>
                <li>• Sanctions enforcement changes</li>
                <li>• Regional conflict escalation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}
