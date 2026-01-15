import Parser from "rss-parser";

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  snippet?: string;
}

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; IranMonitor/1.0)",
    "Accept": "application/rss+xml, application/xml, text/xml",
  },
});

const RSS_FEEDS = [
  {
    name: "BBC Middle East",
    url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
  },
  {
    name: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
  },
  {
    name: "Google News - Iran",
    url: "https://news.google.com/rss/search?q=Iran&hl=en-US&gl=US&ceid=US:en",
  },
  {
    name: "NPR World",
    url: "https://feeds.npr.org/1004/rss.xml",
  },
  {
    name: "The Guardian World",
    url: "https://www.theguardian.com/world/rss",
  },
  {
    name: "France 24 Middle East",
    url: "https://www.france24.com/en/middle-east/rss",
  },
];

const IRAN_KEYWORDS = [
  "iran",
  "iranian",
  "tehran",
  "isfahan",
  "tabriz",
  "shiraz",
  "mashhad",
  "khamenei",
  "pezeshkian",
  "raisi",
  "irgc",
  "persian gulf",
  "strait of hormuz",
  "nuclear",
  "sanctions",
  "hezbollah",
  "proxy",
  "militia",
];

function containsIranKeyword(text: string): boolean {
  const lowerText = text.toLowerCase();
  return IRAN_KEYWORDS.some((keyword) => lowerText.includes(keyword));
}

export async function fetchNews(): Promise<NewsItem[]> {
  const allItems: NewsItem[] = [];

  const feedPromises = RSS_FEEDS.map(async (feed) => {
    try {
      const parsed = await parser.parseURL(feed.url);
      const items = (parsed.items || [])
        .filter((item) => {
          const title = item.title || "";
          const content = item.contentSnippet || item.content || "";
          // For Google News Iran feed, don't filter (it's already filtered)
          if (feed.name === "Google News - Iran") {
            return true;
          }
          return containsIranKeyword(title) || containsIranKeyword(content);
        })
        .slice(0, 8) // Take top 8 from each source
        .map((item) => ({
          title: item.title || "No title",
          link: item.link || "#",
          pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
          source: feed.name,
          snippet: item.contentSnippet?.slice(0, 150),
        }));

      return items;
    } catch (error) {
      console.error(`Error fetching ${feed.name}:`, error);
      return [];
    }
  });

  const results = await Promise.allSettled(feedPromises);

  for (const result of results) {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    }
  }

  // Sort by date, newest first
  allItems.sort((a, b) => {
    const dateA = new Date(a.pubDate).getTime();
    const dateB = new Date(b.pubDate).getTime();
    // Handle invalid dates
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateB - dateA;
  });

  // Deduplicate by title similarity
  const seen = new Set<string>();
  const unique = allItems.filter((item) => {
    const key = item.title.toLowerCase().slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.slice(0, 25); // Return top 25 items
}
