"use client";

import { useState, useEffect, useCallback } from "react";
import Panel from "./Panel";

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  snippet?: string;
}

export default function NewsPanel() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/news");
      const data = await response.json();
      if (data.news) {
        setNews(data.news);
      }
    } catch (err) {
      setError("Failed to load news");
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      Reuters: "bg-orange-600",
      "Reuters World": "bg-orange-600",
      "AP News": "bg-red-600",
      "BBC World": "bg-red-700",
      "Al Jazeera": "bg-amber-600",
      "Iran International": "bg-green-600",
    };
    return colors[source] || "bg-gray-600";
  };

  return (
    <Panel title="News Feed" icon="📰" onRefresh={fetchNews} className="h-full">
      <div className="h-full overflow-y-auto">
        {loading && news.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-400">
            <p>{error}</p>
          </div>
        ) : news.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No Iran-related news found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {news.map((item, index) => (
              <a
                key={index}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${getSourceColor(item.source)} text-white whitespace-nowrap`}
                  >
                    {item.source}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(item.pubDate)}
                  </span>
                </div>
                <h3 className="text-sm text-white mt-1 line-clamp-2 leading-tight">
                  {item.title}
                </h3>
                {item.snippet && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {item.snippet}
                  </p>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
}
