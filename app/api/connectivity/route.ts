import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ConnectivityData {
  ioda: {
    status: "normal" | "warning" | "critical" | "unknown";
    score: number | null;
    lastUpdate: string;
  };
  reachability: {
    name: string;
    reachable: boolean;
    latency: number | null;
  }[];
}

// IODA API endpoint for Iran
const IODA_API = "https://api.ioda.inetintel.cc.gatech.edu/v2/signals/raw/country/IR";

async function fetchIODAStatus(): Promise<ConnectivityData["ioda"]> {
  try {
    // Get data from last 24 hours
    const now = Math.floor(Date.now() / 1000);
    const dayAgo = now - 86400;

    const res = await fetch(
      `${IODA_API}?from=${dayAgo}&until=${now}`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      throw new Error(`IODA API returned ${res.status}`);
    }

    const data = await res.json();

    // Parse IODA response - look for recent alerts
    // IODA returns signal data, lower values indicate outages
    let status: "normal" | "warning" | "critical" | "unknown" = "unknown";
    let score: number | null = null;

    if (data && data.data && Array.isArray(data.data)) {
      const signals = data.data;
      if (signals.length > 0) {
        // Get most recent signal values
        const recent = signals.slice(-10);
        const avgScore = recent.reduce((sum: number, s: any) => sum + (s.value || 0), 0) / recent.length;
        score = Math.round(avgScore * 100) / 100;

        // Interpret score (IODA uses normalized values, 1 = normal, <0.5 = concerning)
        if (avgScore > 0.8) status = "normal";
        else if (avgScore > 0.5) status = "warning";
        else status = "critical";
      }
    }

    return { status, score, lastUpdate: new Date().toISOString() };
  } catch (e) {
    console.error("IODA fetch error:", e);
    return { status: "unknown", score: null, lastUpdate: new Date().toISOString() };
  }
}

async function checkReachability(url: string, name: string): Promise<ConnectivityData["reachability"][0]> {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    const latency = Date.now() - start;
    return { name, reachable: res.ok, latency };
  } catch {
    return { name, reachable: false, latency: null };
  }
}

export async function GET() {
  try {
    // Fetch IODA status
    const ioda = await fetchIODAStatus();

    // Check reachability of various services (as a proxy for internet health)
    const reachabilityChecks = await Promise.all([
      checkReachability("https://www.google.com", "Google"),
      checkReachability("https://cloudflare.com", "Cloudflare"),
      checkReachability("https://www.bbc.com", "BBC"),
    ]);

    return NextResponse.json({
      ioda,
      reachability: reachabilityChecks,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Connectivity check error:", error);
    return NextResponse.json(
      { error: "Failed to check connectivity" },
      { status: 500 }
    );
  }
}
