import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function fetchBonbastRates() {
  try {
    // Step 1: Fetch the main page to get the token AND cookies
    const pageRes = await fetch("https://www.bonbast.com/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      signal: AbortSignal.timeout(10000),
    });

    const html = await pageRes.text();

    // Get cookies from response
    const cookies = pageRes.headers.get("set-cookie") || "";

    // Step 2: Extract the token from the page
    const tokenMatch = html.match(/\$\.post\('\/json',\s*\{param:\s*"([^"]+)"\}/);

    if (!tokenMatch) {
      console.error("Could not find Bonbast token in page");
      return null;
    }

    const token = tokenMatch[1];
    console.log("Found Bonbast token:", token.substring(0, 20) + "...");
    console.log("Cookies:", cookies.substring(0, 50) + "...");

    // Step 3: Fetch the JSON data with the token AND cookies
    const jsonRes = await fetch("https://www.bonbast.com/json", {
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": "https://www.bonbast.com/",
        "X-Requested-With": "XMLHttpRequest",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Cookie": cookies,
        "Origin": "https://www.bonbast.com",
      },
      body: `param=${encodeURIComponent(token)}`,
      signal: AbortSignal.timeout(10000),
    });

    const data = await jsonRes.json();
    console.log("Bonbast response keys:", Object.keys(data).slice(0, 10));

    // Check if we got valid data (not just {rest: "1"})
    if (data.usd1) {
      return {
        usdSell: parseInt(data.usd1, 10), // Sell rate (Toman)
        usdBuy: parseInt(data.usd2, 10),  // Buy rate (Toman)
        eurSell: parseInt(data.eur1, 10),
        eurBuy: parseInt(data.eur2, 10),
        gbpSell: data.gbp1 ? parseInt(data.gbp1, 10) : null,
        gbpBuy: data.gbp2 ? parseInt(data.gbp2, 10) : null,
        goldOunce: data.ounce,
        goldGram18: data.gol18,
        lastUpdate: `${data.year}/${data.month}/${data.day} ${data.hour}:${data.minute}`,
      };
    }

    console.log("Bonbast returned invalid data:", JSON.stringify(data).substring(0, 100));
    return null;
  } catch (error) {
    console.error("Bonbast fetch error:", error);
    return null;
  }
}

export async function GET() {
  const bonbast = await fetchBonbastRates();

  if (bonbast) {
    // Convert Toman to Rial (1 Toman = 10 Rial)
    const usdRial = bonbast.usdSell * 10;

    return NextResponse.json({
      source: "bonbast",
      rates: {
        usd: {
          sell: bonbast.usdSell,
          buy: bonbast.usdBuy,
          sellRial: usdRial,
          unit: "Toman",
        },
        eur: {
          sell: bonbast.eurSell,
          buy: bonbast.eurBuy,
          unit: "Toman",
        },
        gbp: {
          sell: bonbast.gbpSell,
          buy: bonbast.gbpBuy,
          unit: "Toman",
        },
      },
      gold: {
        ounce: bonbast.goldOunce,
        gram18: bonbast.goldGram18,
      },
      lastUpdate: bonbast.lastUpdate,
      timestamp: new Date().toISOString(),
    });
  }

  // Fallback if Bonbast fails
  return NextResponse.json({
    source: "unavailable",
    rates: null,
    error: "Could not fetch Bonbast rates",
    links: {
      bonbast: "https://www.bonbast.com/",
      tgju: "https://www.tgju.org/currency",
    },
    timestamp: new Date().toISOString(),
  });
}
