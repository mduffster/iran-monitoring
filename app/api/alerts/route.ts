import { NextResponse } from "next/server";
import Parser from "rss-parser";

export const dynamic = "force-dynamic";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; IranMonitor/1.0)",
  },
});

interface Alert {
  title: string;
  description: string;
  time: string;
  link: string;
  source: string;
}

export async function GET() {
  const alerts: Alert[] = [];

  try {
    // Try to fetch from Red Alert Israel (Pikud Haoref) RSS feeds
    // These are often available through aggregator services

    // CENTCOM news/releases
    try {
      const centcomFeed = await parser.parseURL(
        "https://www.centcom.mil/rss/feed/"
      );
      const iranRelated = centcomFeed.items
        ?.filter((item) =>
          (item.title?.toLowerCase().includes("iran") ||
            item.contentSnippet?.toLowerCase().includes("iran"))
        )
        .slice(0, 5)
        .map((item) => ({
          title: item.title || "",
          description: item.contentSnippet?.slice(0, 200) || "",
          time: item.pubDate || new Date().toISOString(),
          link: item.link || "",
          source: "CENTCOM",
        }));
      if (iranRelated) alerts.push(...iranRelated);
    } catch (e) {
      console.error("CENTCOM feed error:", e);
    }

    return NextResponse.json({
      alerts,
      links: {
        // Israel Home Front Command
        pikudHaoref: "https://www.oref.org.il/en",
        redAlert: "https://www.tzevaadom.co.il/en/",
        // Live alert maps
        alertsLive: "https://www.israeldefenseforce.com/alerts",
        // CENTCOM
        centcom: "https://www.centcom.mil/",
        // LiveUA Map (often tracks Iran)
        liveuamap: "https://iran.liveuamap.com/",
      },
      sources: [
        { name: "Pikud HaOref", description: "Israel Home Front Command official alerts" },
        { name: "Red Alert", description: "Crowd-sourced Israel rocket alerts" },
        { name: "CENTCOM", description: "US Central Command press releases" },
        { name: "LiveUA Map", description: "OSINT conflict mapping" },
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Alerts API error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts", alerts: [] }, { status: 500 });
  }
}
