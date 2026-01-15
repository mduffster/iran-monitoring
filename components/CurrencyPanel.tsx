"use client";

import { useState, useEffect, useCallback } from "react";
import Panel from "./Panel";

interface CurrencyData {
  rates: {
    official: number | null;
    market: number | null;
    source: string;
  };
  links: {
    bonbast: string;
    tgju: string;
  };
}

export default function CurrencyPanel() {
  const [data, setData] = useState<CurrencyData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/currency");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Currency fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10 * 60 * 1000); // Every 10 min
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatNumber = (n: number | null) => {
    if (n === null) return "—";
    return n.toLocaleString();
  };

  return (
    <Panel title="Iranian Rial (IRR/USD)" icon="💱" onRefresh={fetchData} className="h-full">
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
        </div>

        <div className="flex-1 p-3 overflow-y-auto">
          {loading && !data ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-gray-800 rounded">
                <div className="text-xs text-gray-400 uppercase mb-1">Official Rate</div>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(data?.rates?.official ?? null)} <span className="text-sm text-gray-400">IRR</span>
                </div>
                <div className="text-xs text-gray-500">per 1 USD</div>
              </div>

              <div className="p-3 bg-gray-800 rounded">
                <div className="text-xs text-gray-400 uppercase mb-1">Market Rate (Est.)</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {formatNumber(data?.rates?.market ?? null)} <span className="text-sm text-gray-400">IRR</span>
                </div>
                <div className="text-xs text-gray-500">~15% premium (unofficial)</div>
              </div>

              <div className="p-2 bg-yellow-900/30 border border-yellow-700/50 rounded text-xs text-yellow-400">
                ⚠️ Black market rate fluctuates. Check Bonbast for real-time street rates.
              </div>

              <div className="text-xs text-gray-500">
                <strong>Why it matters:</strong> Large gaps between official/market rates indicate economic stress. Rapid devaluation often precedes unrest.
              </div>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
