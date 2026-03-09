import { NextResponse } from "next/server";
import Parser from "rss-parser";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; IranMonitor/1.0)",
    Accept: "application/rss+xml, application/xml, text/xml",
  },
});

interface MaritimeIncident {
  title: string;
  description: string;
  time: string;
  link: string;
  source: string;
  severity: "info" | "warning" | "critical";
}

const MARITIME_KEYWORDS = [
  "hormuz",
  "persian gulf",
  "gulf of oman",
  "arabian sea",
  "strait",
  "tanker",
  "iran",
  "iranian",
  "irgc navy",
  "bandar abbas",
  "kharg island",
  "oil tanker",
  "shipping lane",
  "maritime security",
  "vessel seized",
  "vessel seize",
  "navy",
  "blockade",
  "mine",
  "drone boat",
  "houthi",
  "red sea",
  "bab el-mandeb",
  "oman",
  "fujairah",
  "pipeline",
  "lng carrier",
  "crude carrier",
  "vlcc",
  "supertanker",
];

const CRITICAL_KEYWORDS = [
  "seized",
  "attacked",
  "explosion",
  "mine",
  "blockade",
  "closed",
  "disrupted",
  "missile",
  "drone strike",
  "collision",
  "fire",
  "sinking",
  "hijack",
  "piracy",
];

const WARNING_KEYWORDS = [
  "warning",
  "advisory",
  "threat",
  "tensions",
  "military",
  "exercise",
  "escort",
  "patrol",
  "detained",
  "inspection",
  "diversion",
  "delay",
  "congestion",
];

function classifySeverity(text: string): "info" | "warning" | "critical" {
  const lower = text.toLowerCase();
  if (CRITICAL_KEYWORDS.some((k) => lower.includes(k))) return "critical";
  if (WARNING_KEYWORDS.some((k) => lower.includes(k))) return "warning";
  return "info";
}

function isMaritimeRelevant(text: string): boolean {
  const lower = text.toLowerCase();
  return MARITIME_KEYWORDS.some((k) => lower.includes(k));
}

const RSS_SOURCES = [
  {
    name: "gCaptain",
    url: "https://gcaptain.com/feed/",
    icon: "ship",
  },
  {
    name: "Maritime Executive",
    url: "https://maritime-executive.com/rss",
    icon: "anchor",
  },
  {
    name: "The Maritime Post",
    url: "https://themaritimepost.com/feed/",
    icon: "waves",
  },
  {
    name: "Splash247",
    url: "https://splash247.com/feed/",
    icon: "ship",
  },
  {
    name: "Google News - Hormuz",
    url: "https://news.google.com/rss/search?q=%22strait+of+hormuz%22+OR+%22persian+gulf%22+shipping+OR+tanker&hl=en-US&gl=US&ceid=US:en",
    icon: "search",
  },
  {
    name: "Google News - Maritime Iran",
    url: "https://news.google.com/rss/search?q=iran+maritime+OR+%22oil+tanker%22+OR+%22naval%22+OR+%22hormuz%22&hl=en-US&gl=US&ceid=US:en",
    icon: "search",
  },
  {
    name: "CENTCOM",
    url: "https://www.centcom.mil/rss/feed/",
    icon: "shield",
  },
];

export async function GET() {
  const incidents: MaritimeIncident[] = [];

  const feedPromises = RSS_SOURCES.map(async (source) => {
    try {
      const feed = await parser.parseURL(source.url);
      const items = (feed.items || [])
        .filter((item) => {
          const text = `${item.title || ""} ${item.contentSnippet || ""}`;
          // Google News feeds are already keyword-filtered
          if (source.name.startsWith("Google News")) return true;
          return isMaritimeRelevant(text);
        })
        .slice(0, 10)
        .map((item) => {
          const text = `${item.title || ""} ${item.contentSnippet || ""}`;
          return {
            title: item.title || "No title",
            description: (item.contentSnippet || "").slice(0, 250),
            time: item.pubDate || item.isoDate || new Date().toISOString(),
            link: item.link || "#",
            source: source.name,
            severity: classifySeverity(text),
          };
        });
      return items;
    } catch (error) {
      console.error(`Maritime feed error (${source.name}):`, error);
      return [];
    }
  });

  const results = await Promise.allSettled(feedPromises);
  for (const result of results) {
    if (result.status === "fulfilled") {
      incidents.push(...result.value);
    }
  }

  // Sort by date, newest first
  incidents.sort((a, b) => {
    const dateA = new Date(a.time).getTime();
    const dateB = new Date(b.time).getTime();
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateB - dateA;
  });

  // Deduplicate by title similarity
  const seen = new Set<string>();
  const unique = incidents.filter((item) => {
    const key = item.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Derive strait status from recent incidents
  const last24h = unique.filter((i) => {
    const age = Date.now() - new Date(i.time).getTime();
    return age < 24 * 60 * 60 * 1000;
  });
  const criticalCount = last24h.filter((i) => i.severity === "critical").length;
  const warningCount = last24h.filter((i) => i.severity === "warning").length;

  let straitStatus: "normal" | "elevated" | "disrupted" = "normal";
  if (criticalCount >= 2) straitStatus = "disrupted";
  else if (criticalCount >= 1 || warningCount >= 3) straitStatus = "elevated";

  return NextResponse.json({
    incidents: unique.slice(0, 30),
    status: {
      strait: straitStatus,
      criticalCount,
      warningCount,
      totalIncidents: last24h.length,
      lastCheck: new Date().toISOString(),
    },
    feedsOnline: results.filter((r) => r.status === "fulfilled").length,
    feedsTotal: RSS_SOURCES.length,
    timestamp: new Date().toISOString(),
  });
}
