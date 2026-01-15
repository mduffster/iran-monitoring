"use client";

import { useState, useEffect, useCallback } from "react";
import Panel from "./Panel";

interface CurrencyData {
  source: string;
  rates: {
    usd: { sell: number; buy: number; sellRial: number; unit: string };
    eur: { sell: number; buy: number; unit: string };
    gbp: { sell: number | null; buy: number | null; unit: string };
  } | null;
  gold?: {
    ounce: string;
    gram18: string;
  };
  lastUpdate?: string;
  error?: string;
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
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatNumber = (n: number | null | undefined) => {
    if (n === null || n === undefined) return "—";
    return n.toLocaleString();
  };

  return (
    <Panel title="Iranian Rial (Bonbast)" icon="💱" onRefresh={fetchData} className="h-full">
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
          ) : data?.rates ? (
            <div className="space-y-3">
              {/* USD Rate - Main */}
              <div className="p-3 bg-green-900/30 border border-green-700/50 rounded">
                <div className="text-xs text-green-400 uppercase mb-1">USD / IRR (Free Market)</div>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(data.rates.usd.sell)} <span className="text-sm text-gray-400">Toman</span>
                </div>
                <div className="text-sm text-gray-400">
                  = {formatNumber(data.rates.usd.sellRial)} Rial
                </div>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>Buy: {formatNumber(data.rates.usd.buy)}</span>
                  <span>Sell: {formatNumber(data.rates.usd.sell)}</span>
                </div>
              </div>

              {/* EUR & GBP */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-gray-800 rounded">
                  <div className="text-xs text-gray-400">EUR</div>
                  <div className="text-lg font-semibold text-white">
                    {formatNumber(data.rates.eur.sell)}
                  </div>
                  <div className="text-xs text-gray-500">Toman</div>
                </div>
                <div className="p-2 bg-gray-800 rounded">
                  <div className="text-xs text-gray-400">GBP</div>
                  <div className="text-lg font-semibold text-white">
                    {formatNumber(data.rates.gbp.sell)}
                  </div>
                  <div className="text-xs text-gray-500">Toman</div>
                </div>
              </div>

              {/* Gold */}
              {data.gold && (
                <div className="p-2 bg-yellow-900/20 border border-yellow-700/30 rounded">
                  <div className="text-xs text-yellow-400 mb-1">Gold</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Ounce:</span>
                    <span className="text-white">${data.gold.ounce}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">18K (gram):</span>
                    <span className="text-white">{formatNumber(parseInt(data.gold.gram18))} T</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-4">
              <p>Could not fetch rates</p>
              <p className="text-xs mt-1">Check Bonbast directly</p>
            </div>
          )}
        </div>

        <div className="p-2 bg-gray-800/50 text-xs border-t border-gray-700">
          <div className="flex items-center justify-between text-gray-500">
            <span>Source: Bonbast</span>
            {data?.lastUpdate && <span>{data.lastUpdate}</span>}
          </div>
        </div>
      </div>
    </Panel>
  );
}
