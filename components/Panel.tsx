"use client";

import { useState, useCallback, ReactNode } from "react";

interface PanelProps {
  title: string;
  children: ReactNode;
  refreshInterval?: number; // in milliseconds
  onRefresh?: () => void;
  className?: string;
  icon?: string;
}

export default function Panel({
  title,
  children,
  refreshInterval,
  onRefresh,
  className = "",
  icon,
}: PanelProps) {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setLastRefresh(new Date());
    onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  }, [onRefresh]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div
      className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden flex flex-col ${
        isRefreshing ? "refreshing" : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {formatTime(lastRefresh)}
          </span>
          <button
            onClick={handleRefresh}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
            title="Refresh"
          >
            <svg
              className={`w-4 h-4 text-gray-400 ${isRefreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
