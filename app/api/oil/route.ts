import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch oil prices - using free API
    // Brent crude is most relevant for Iran

    let brentPrice: number | null = null;
    let wtiPrice: number | null = null;
    let source = "unavailable";

    // Try to get from a free oil price API
    try {
      // Using exchangerate API which sometimes includes commodities
      const res = await fetch(
        "https://api.exchangerate-api.com/v4/latest/USD",
        { signal: AbortSignal.timeout(5000) }
      );
      // This API doesn't have oil, so we'll use static links instead
    } catch (e) {
      console.error("Oil price fetch error:", e);
    }

    return NextResponse.json({
      brent: brentPrice,
      wti: wtiPrice,
      source,
      links: {
        tradingview: "https://www.tradingview.com/symbols/TVC-UKOIL/",
        oilprice: "https://oilprice.com/",
        investing: "https://www.investing.com/commodities/brent-oil",
      },
      note: "Brent crude prices most relevant for Iranian oil exports",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Oil API error:", error);
    return NextResponse.json({ error: "Failed to fetch oil prices" }, { status: 500 });
  }
}
