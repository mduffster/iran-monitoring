import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface CurrencyData {
  official: number | null;
  market: number | null;
  source: string;
  timestamp: string;
}

export async function GET() {
  try {
    // Try to get IRR/USD rate from multiple sources
    // Note: Iranian Rial black market rate is tracked by various services

    let data: CurrencyData = {
      official: null,
      market: null,
      source: "unavailable",
      timestamp: new Date().toISOString(),
    };

    // Try exchangerate-api (free tier)
    try {
      const res = await fetch(
        "https://open.er-api.com/v6/latest/USD",
        { signal: AbortSignal.timeout(5000) }
      );
      if (res.ok) {
        const json = await res.json();
        if (json.rates?.IRR) {
          data.official = json.rates.IRR;
          data.source = "exchangerate-api";
        }
      }
    } catch (e) {
      console.error("Exchange rate API error:", e);
    }

    // The black market rate is typically 10-20% higher than official
    // This is an approximation - real tracking would need specialized sources
    if (data.official) {
      data.market = Math.round(data.official * 1.15); // Rough estimate
    }

    return NextResponse.json({
      currency: "IRR",
      baseCurrency: "USD",
      rates: data,
      links: {
        bonbast: "https://www.bonbast.com/", // Popular Iranian rate tracker
        tgju: "https://www.tgju.org/currency", // Tehran Gold & Currency
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Currency API error:", error);
    return NextResponse.json({ error: "Failed to fetch currency data" }, { status: 500 });
  }
}
