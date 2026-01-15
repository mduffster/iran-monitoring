import { NextResponse } from "next/server";
import Parser from "rss-parser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const parser = new Parser({
  timeout: 8000,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  },
});

// More Nitter instances to try - updated list
const NITTER_INSTANCES = [
  "nitter.cz",
  "nitter.privacydev.net",
  "nitter.poast.org",
  "nitter.net",
  "nitter.1d4.us",
  "nitter.kavin.rocks",
  "nitter.unixfox.eu",
  "nitter.namazso.eu",
];

// Key Iran-focused accounts to fetch from
const IRAN_ACCOUNTS = [
  "IranIntl_En",
  "BBCPersian",
  "VOAIran",
];

interface Tweet {
  text: string;
  author: string;
  link: string;
  date: string;
}

async function tryFetchFromInstance(instance: string, path: string): Promise<any> {
  const url = `https://${instance}${path}`;
  const feed = await parser.parseURL(url);
  return feed;
}

async function fetchAccountRSS(account: string): Promise<Tweet[]> {
  for (const instance of NITTER_INSTANCES) {
    try {
      const feed = await tryFetchFromInstance(instance, `/${account}/rss`);
      if (feed.items && feed.items.length > 0) {
        return feed.items.slice(0, 5).map((item: any) => ({
          text: item.contentSnippet || item.title || "",
          author: `@${account}`,
          link: item.link?.replace(instance, "twitter.com") || `https://twitter.com/${account}`,
          date: item.pubDate || new Date().toISOString(),
        }));
      }
    } catch (e) {
      continue;
    }
  }
  return [];
}

async function fetchSearchRSS(query: string): Promise<Tweet[]> {
  for (const instance of NITTER_INSTANCES) {
    try {
      const feed = await tryFetchFromInstance(
        instance,
        `/search/rss?f=tweets&q=${encodeURIComponent(query)}`
      );
      if (feed.items && feed.items.length > 0) {
        return feed.items.slice(0, 15).map((item: any) => ({
          text: item.contentSnippet || item.title || "",
          author: item.creator || extractAuthor(item.link || ""),
          link: item.link?.replace(instance, "twitter.com") || "#",
          date: item.pubDate || new Date().toISOString(),
        }));
      }
    } catch (e) {
      continue;
    }
  }
  return [];
}

function extractAuthor(link: string): string {
  const match = link.match(/\/([^/]+)\/status/);
  return match ? `@${match[1]}` : "Unknown";
}

export async function GET() {
  const allTweets: Tweet[] = [];

  try {
    // Try search first
    const searchTweets = await fetchSearchRSS("Iran");
    allTweets.push(...searchTweets);

    // If search failed, try fetching from specific accounts
    if (allTweets.length === 0) {
      const accountPromises = IRAN_ACCOUNTS.map(fetchAccountRSS);
      const results = await Promise.allSettled(accountPromises);
      for (const result of results) {
        if (result.status === "fulfilled") {
          allTweets.push(...result.value);
        }
      }
    }

    // Sort by date
    allTweets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Dedupe
    const seen = new Set<string>();
    const unique = allTweets.filter((t) => {
      const key = t.text.slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return NextResponse.json({
      tweets: unique.slice(0, 20),
      timestamp: new Date().toISOString(),
      source: allTweets.length > 0 ? "nitter" : "none",
    });
  } catch (error) {
    console.error("Twitter fetch error:", error);
    return NextResponse.json({
      tweets: [],
      timestamp: new Date().toISOString(),
      source: "error",
      error: "All Nitter instances unavailable",
    });
  }
}
