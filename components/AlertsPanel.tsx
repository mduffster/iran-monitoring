"use client";

import { useState, useEffect, useCallback } from "react";
import Panel from "./Panel";

interface Alert {
  title: string;
  description: string;
  time: string;
  link: string;
  source: string;
}

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/alerts");
      const data = await res.json();
      if (data.alerts) setAlerts(data.alerts);
    } catch (e) {
      console.error("Alerts fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatTime = (time: string) => {
    const date = new Date(time);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <Panel title="Regional Alerts" icon="🚨" onRefresh={fetchData} className="h-full">
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex flex-wrap gap-2 p-2 bg-gray-800/50 border-b border-gray-700 shrink-0">
          <a
            href="https://www.tzevaadom.co.il/en/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
          >
            Red Alert ↗
          </a>
          <a
            href="https://iran.liveuamap.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded text-white"
          >
            LiveUA Map ↗
          </a>
          <a
            href="https://www.centcom.mil/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            CENTCOM ↗
          </a>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {/* Alert Sources */}
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Live Alert Sources</h3>
            <div className="space-y-2">
              <a
                href="https://www.tzevaadom.co.il/en/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-gray-800 rounded hover:bg-gray-700"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <div>
                  <div className="text-sm text-white">Red Alert Israel</div>
                  <div className="text-xs text-gray-400">Real-time rocket/missile alerts</div>
                </div>
              </a>
              <a
                href="https://alerts.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-gray-800 rounded hover:bg-gray-700"
              >
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <div>
                  <div className="text-sm text-white">Alerts.me</div>
                  <div className="text-xs text-gray-400">Crowd-sourced Israel alerts</div>
                </div>
              </a>
              <a
                href="https://iran.liveuamap.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-gray-800 rounded hover:bg-gray-700"
              >
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <div>
                  <div className="text-sm text-white">LiveUA Map - Iran</div>
                  <div className="text-xs text-gray-400">OSINT incident mapping</div>
                </div>
              </a>
            </div>
          </div>

          {/* CENTCOM Alerts if any */}
          {alerts.length > 0 && (
            <div className="mb-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">CENTCOM Updates</h3>
              <div className="space-y-2">
                {alerts.map((alert, i) => (
                  <a
                    key={i}
                    href={alert.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2 bg-gray-800 rounded hover:bg-gray-700"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-1.5 py-0.5 bg-blue-600 rounded text-white">{alert.source}</span>
                      <span className="text-xs text-gray-500">{formatTime(alert.time)}</span>
                    </div>
                    <div className="text-sm text-white line-clamp-2">{alert.title}</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="p-2 bg-red-900/30 border border-red-700/50 rounded text-xs">
            <div className="font-medium text-red-400 mb-1">⚠️ In case of escalation:</div>
            <ul className="text-gray-300 space-y-0.5">
              <li>• Israel alerts indicate incoming missiles/drones</li>
              <li>• CENTCOM announcements for US response</li>
              <li>• LiveUA Map for ground truth</li>
            </ul>
          </div>
        </div>
      </div>
    </Panel>
  );
}
