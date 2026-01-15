"use client";

import { useEffect, useCallback, useState } from "react";
import Panel from "./Panel";

interface Tweet {
  text: string;
  author: string;
  link: string;
  date: string;
}

const IRAN_ACCOUNTS = [
  { handle: "IranIntl_En", name: "Iran International" },
  { handle: "BBCPersian", name: "BBC Persian" },
  { handle: "VOAIran", name: "VOA Persian" },
  { handle: "manikishan", name: "Mani K." },
  { handle: "JasonMBrodsky", name: "Jason Brodsky" },
  { handle: "Iran_HRM", name: "Iran HRM" },
];

export default function TwitterWidget() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTweets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/twitter");
      const data = await res.json();
      if (data.tweets) {
        setTweets(data.tweets);
      }
      if (data.error) {
        setError(data.error);
      }
    } catch (e) {
      setError("Failed to load tweets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTweets();
    const interval = setInterval(fetchTweets, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchTweets]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return date.toLocaleDateString();
  };

  return (
    <Panel title="Social Feed" icon="𝕏" onRefresh={fetchTweets} className="h-full">
      <div className="h-full flex flex-col overflow-hidden">
        {/* Quick links */}
        <div className="flex flex-wrap gap-2 p-2 bg-gray-800/50 shrink-0 border-b border-gray-700">
          <a
            href="https://twitter.com/search?q=Iran&f=live"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
          >
            X Live ↗
          </a>
          <a
            href="https://twitter.com/search?q=Tehran&f=live"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white transition-colors"
          >
            Tehran ↗
          </a>
          <a
            href="https://twitter.com/search?q=IRGC&f=live"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white transition-colors"
          >
            IRGC ↗
          </a>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && tweets.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : tweets.length > 0 ? (
            /* Show tweets if we have them */
            <div className="divide-y divide-gray-800">
              {tweets.map((tweet, i) => (
                <a
                  key={i}
                  href={tweet.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-blue-400">{tweet.author}</span>
                    <span className="text-xs text-gray-500">· {formatDate(tweet.date)}</span>
                  </div>
                  <p className="text-sm text-gray-200 line-clamp-3">{tweet.text}</p>
                </a>
              ))}
            </div>
          ) : (
            /* Fallback: show account list when no tweets available */
            <div className="p-3">
              {error && (
                <div className="p-2 mb-3 bg-yellow-900/30 border border-yellow-700/50 rounded text-xs text-yellow-400">
                  Nitter unavailable - showing key accounts to follow
                </div>
              )}
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Key Accounts</h3>
              <div className="space-y-1">
                {IRAN_ACCOUNTS.map((account) => (
                  <a
                    key={account.handle}
                    href={`https://twitter.com/${account.handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-300">
                      {account.name[0]}
                    </div>
                    <div>
                      <div className="text-sm text-white">{account.name}</div>
                      <div className="text-xs text-gray-500">@{account.handle}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 bg-gray-800/50 text-xs text-gray-500 border-t border-gray-700">
          {tweets.length > 0 ? `${tweets.length} tweets via Nitter` : "Click accounts to open on X"}
        </div>
      </div>
    </Panel>
  );
}
