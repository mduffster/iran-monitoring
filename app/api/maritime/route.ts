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

interface OilSnapshot {
  brent: number | null;
  wti: number | null;
  source: string | null;
}

interface CarrierMention {
  name: string;
  action: string; // e.g. "suspended", "diverted", "surcharge"
  headline: string;
}

const MARITIME_KEYWORDS = [
  "hormuz", "persian gulf", "gulf of oman", "arabian sea", "strait",
  "tanker", "iran", "iranian", "irgc navy", "bandar abbas", "kharg island",
  "oil tanker", "shipping lane", "maritime security", "vessel seized",
  "vessel seize", "navy", "blockade", "mine", "drone boat", "houthi",
  "red sea", "bab el-mandeb", "oman", "fujairah", "pipeline",
  "lng carrier", "crude carrier", "vlcc", "supertanker",
];

const CRITICAL_KEYWORDS = [
  "seized", "attacked", "explosion", "mine", "blockade", "closed",
  "disrupted", "missile", "drone strike", "collision", "fire", "sinking",
  "hijack", "piracy", "halt", "suspend", "shut",
];

const WARNING_KEYWORDS = [
  "warning", "advisory", "threat", "tensions", "military", "exercise",
  "escort", "patrol", "detained", "inspection", "diversion", "delay",
  "congestion", "surcharge", "premium", "insurance", "risk",
];

const CARRIER_NAMES = [
  "Maersk", "MSC", "CMA CGM", "COSCO", "Hapag-Lloyd", "ONE",
  "Evergreen", "HMM", "Yang Ming", "ZIM",
];

const CARRIER_ACTIONS = [
  "suspend", "halt", "pause", "divert", "reroute", "surcharge",
  "avoid", "cancel", "delay", "trapped", "idle",
];

const INSURANCE_KEYWORDS = [
  "war risk", "insurance", "premium", "p&i", "underwriter",
  "coverage", "indemnity", "hull", "cargo insurance",
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

// Extract oil prices mentioned in headlines/descriptions
function extractOilPrices(incidents: MaritimeIncident[]): OilSnapshot {
  let brent: number | null = null;
  let wti: number | null = null;
  let source: string | null = null;

  for (const inc of incidents) {
    const text = `${inc.title} ${inc.description}`;

    // Match patterns like "$119", "$83.74", "119 a barrel"
    const brentMatch = text.match(/brent[^$]*\$(\d+(?:\.\d+)?)/i)
      || text.match(/\$(\d+(?:\.\d+)?)[^)]*(?:brent|barrel)/i);
    if (brentMatch && !brent) {
      brent = parseFloat(brentMatch[1]);
      source = inc.source;
    }

    const wtiMatch = text.match(/wti[^$]*\$(\d+(?:\.\d+)?)/i)
      || text.match(/\$(\d+(?:\.\d+)?)[^)]*wti/i);
    if (wtiMatch && !wti) {
      wti = parseFloat(wtiMatch[1]);
      if (!source) source = inc.source;
    }

    // Generic "oil" + price if we haven't found specific ones
    if (!brent && !wti) {
      const genericMatch = text.match(/oil[^$]*\$(\d+(?:\.\d+)?)/i)
        || text.match(/\$(\d+(?:\.\d+)?)[^)]*(?:oil|barrel|crude)/i);
      if (genericMatch) {
        brent = parseFloat(genericMatch[1]);
        source = inc.source;
      }
    }
  }

  return { brent, wti, source };
}

// Extract carrier disruption mentions
function extractCarrierMentions(incidents: MaritimeIncident[]): CarrierMention[] {
  const mentions: CarrierMention[] = [];
  const seen = new Set<string>();

  for (const inc of incidents) {
    const text = `${inc.title} ${inc.description}`;
    const lower = text.toLowerCase();

    for (const carrier of CARRIER_NAMES) {
      if (lower.includes(carrier.toLowerCase()) && !seen.has(carrier)) {
        const action = CARRIER_ACTIONS.find((a) => lower.includes(a)) || "mentioned";
        mentions.push({ name: carrier, action, headline: inc.title });
        seen.add(carrier);
      }
    }
  }

  return mentions;
}

// Detect insurance-related content
function extractInsuranceSignals(incidents: MaritimeIncident[]): {
  mentioned: boolean;
  headlines: string[];
} {
  const headlines: string[] = [];
  for (const inc of incidents) {
    const text = `${inc.title} ${inc.description}`.toLowerCase();
    if (INSURANCE_KEYWORDS.some((k) => text.includes(k))) {
      headlines.push(inc.title);
    }
  }
  return { mentioned: headlines.length > 0, headlines: headlines.slice(0, 3) };
}

const RSS_SOURCES = [
  { name: "gCaptain", url: "https://gcaptain.com/feed/" },
  { name: "Maritime Executive", url: "https://maritime-executive.com/rss" },
  { name: "The Maritime Post", url: "https://themaritimepost.com/feed/" },
  { name: "Splash247", url: "https://splash247.com/feed/" },
  {
    name: "Google News - Hormuz",
    url: "https://news.google.com/rss/search?q=%22strait+of+hormuz%22+OR+%22persian+gulf%22+shipping+OR+tanker&hl=en-US&gl=US&ceid=US:en",
  },
  {
    name: "Google News - Maritime Iran",
    url: "https://news.google.com/rss/search?q=iran+maritime+OR+%22oil+tanker%22+OR+%22naval%22+OR+%22hormuz%22&hl=en-US&gl=US&ceid=US:en",
  },
  {
    name: "Google News - Shipping Insurance",
    url: "https://news.google.com/rss/search?q=%22war+risk%22+OR+%22shipping+insurance%22+hormuz+OR+%22persian+gulf%22&hl=en-US&gl=US&ceid=US:en",
  },
  { name: "CENTCOM", url: "https://www.centcom.mil/rss/feed/" },
];

export async function GET() {
  const incidents: MaritimeIncident[] = [];

  const feedPromises = RSS_SOURCES.map(async (source) => {
    try {
      const feed = await parser.parseURL(source.url);
      const items = (feed.items || [])
        .filter((item) => {
          const text = `${item.title || ""} ${item.contentSnippet || ""}`;
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

  // Derive strait status
  const last24h = unique.filter((i) => {
    const age = Date.now() - new Date(i.time).getTime();
    return age < 24 * 60 * 60 * 1000;
  });
  const criticalCount = last24h.filter((i) => i.severity === "critical").length;
  const warningCount = last24h.filter((i) => i.severity === "warning").length;

  let straitStatus: "normal" | "elevated" | "disrupted" = "normal";
  if (criticalCount >= 2) straitStatus = "disrupted";
  else if (criticalCount >= 1 || warningCount >= 3) straitStatus = "elevated";

  // Compute severity score (1-10)
  const severityScore = Math.min(
    10,
    Math.round(criticalCount * 3 + warningCount * 1.5 + Math.min(last24h.length * 0.3, 2))
  );

  // Extract enriched data from incident text
  const oilPrices = extractOilPrices(unique);
  const carriers = extractCarrierMentions(unique);
  const insurance = extractInsuranceSignals(unique);

  return NextResponse.json({
    incidents: unique.slice(0, 30),
    status: {
      strait: straitStatus,
      severityScore,
      criticalCount,
      warningCount,
      totalIncidents: last24h.length,
      lastCheck: new Date().toISOString(),
    },
    oilPrices,
    carriers,
    insurance,
    feedsOnline: results.filter((r) => r.status === "fulfilled").length,
    feedsTotal: RSS_SOURCES.length,
    timestamp: new Date().toISOString(),
  });
}
