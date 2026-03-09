import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface FireHotspot {
  lat: number;
  lon: number;
  brightness: number;
  confidence: string | number;
  date: string;
  time: string;
  satellite: string;
  frp: number; // fire radiative power in MW
  daynight: string;
}

interface FireSummary {
  hotspots: FireHotspot[];
  totalCount: number;
  highConfidenceCount: number;
  regions: { name: string; count: number; maxBrightness: number }[];
  lastDetection: string | null;
  timestamp: string;
}

// Iran bounding box: west, south, east, north
const IRAN_BBOX = "44,25,64,40";

// Named regions within Iran for categorizing detections
const IRAN_REGIONS: { name: string; lat: [number, number]; lon: [number, number] }[] = [
  { name: "Tehran Province", lat: [35, 36.5], lon: [50, 53] },
  { name: "Isfahan", lat: [31, 34], lon: [50, 54] },
  { name: "Khuzestan (Oil)", lat: [29.5, 33], lon: [47, 51] },
  { name: "Bushehr (Nuclear)", lat: [27.5, 30], lon: [50, 52.5] },
  { name: "Bandar Abbas / Hormuz", lat: [25.5, 28], lon: [54, 58] },
  { name: "Tabriz / NW", lat: [36, 39], lon: [44, 49] },
  { name: "Mashhad / NE", lat: [34, 37], lon: [57, 61] },
  { name: "Shiraz / Fars", lat: [28, 31], lon: [51, 55] },
  { name: "Kerman / SE", lat: [27, 32], lon: [55, 60] },
  { name: "Natanz Area", lat: [33, 34.5], lon: [51, 53] },
];

function classifyRegion(lat: number, lon: number): string {
  for (const region of IRAN_REGIONS) {
    if (
      lat >= region.lat[0] &&
      lat <= region.lat[1] &&
      lon >= region.lon[0] &&
      lon <= region.lon[1]
    ) {
      return region.name;
    }
  }
  return "Other Iran";
}

function parseCSV(csv: string): FireHotspot[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const latIdx = headers.indexOf("latitude");
  const lonIdx = headers.indexOf("longitude");
  const brightIdx = headers.findIndex((h) => h === "brightness" || h === "bright_ti4");
  const confIdx = headers.indexOf("confidence");
  const dateIdx = headers.indexOf("acq_date");
  const timeIdx = headers.indexOf("acq_time");
  const satIdx = headers.indexOf("satellite");
  const frpIdx = headers.indexOf("frp");
  const dnIdx = headers.indexOf("daynight");

  const hotspots: FireHotspot[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length < 5) continue;

    const lat = parseFloat(cols[latIdx]);
    const lon = parseFloat(cols[lonIdx]);
    if (isNaN(lat) || isNaN(lon)) continue;

    hotspots.push({
      lat,
      lon,
      brightness: parseFloat(cols[brightIdx]) || 0,
      confidence: cols[confIdx]?.trim() || "unknown",
      date: cols[dateIdx]?.trim() || "",
      time: cols[timeIdx]?.trim() || "",
      satellite: cols[satIdx]?.trim() || "unknown",
      frp: parseFloat(cols[frpIdx]) || 0,
      daynight: cols[dnIdx]?.trim() || "",
    });
  }

  return hotspots;
}

// Iran bounding box limits for filtering global data
const IRAN_LAT_MIN = 25;
const IRAN_LAT_MAX = 40;
const IRAN_LON_MIN = 44;
const IRAN_LON_MAX = 64;

function isInIran(lat: number, lon: number): boolean {
  return lat >= IRAN_LAT_MIN && lat <= IRAN_LAT_MAX && lon >= IRAN_LON_MIN && lon <= IRAN_LON_MAX;
}

async function fetchFIRMS(): Promise<FireHotspot[]> {
  const allHotspots: FireHotspot[] = [];
  const mapKey = process.env.FIRMS_MAP_KEY;

  if (mapKey) {
    // If we have a registered API key, use the area endpoint (faster, pre-filtered)
    const sources = ["MODIS_NRT", "VIIRS_SNPP_NRT", "VIIRS_NOAA20_NRT"];
    const results = await Promise.allSettled(
      sources.map(async (source) => {
        const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/${source}/${IRAN_BBOX}/1`;
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; IranMonitor/1.0)" },
          signal: AbortSignal.timeout(12000),
        });
        if (!res.ok) return [];
        const text = await res.text();
        if (text.includes("Invalid MAP_KEY") || text.includes("Error")) return [];
        return parseCSV(text);
      })
    );
    for (const result of results) {
      if (result.status === "fulfilled") allHotspots.push(...result.value);
    }
  } else {
    // No API key: download the public global 24h CSV files and filter for Iran
    const globalFiles = [
      "https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_24h.csv",
      "https://firms.modaps.eosdis.nasa.gov/data/active_fire/suomi-npp-viirs-c2/csv/SUOMI_VIIRS_C2_Global_24h.csv",
      "https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_Global_24h.csv",
    ];

    const results = await Promise.allSettled(
      globalFiles.map(async (url) => {
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; IranMonitor/1.0)" },
          signal: AbortSignal.timeout(20000),
        });
        if (!res.ok) {
          console.error(`FIRMS global file: HTTP ${res.status} for ${url}`);
          return [];
        }
        const text = await res.text();
        const all = parseCSV(text);
        // Filter to Iran bounding box
        return all.filter((h) => isInIran(h.lat, h.lon));
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") allHotspots.push(...result.value);
    }
  }

  return allHotspots;
}

export async function GET() {
  try {
    const hotspots = await fetchFIRMS();

    // Deduplicate nearby detections (within ~1km)
    const deduped: FireHotspot[] = [];
    for (const h of hotspots) {
      const isDupe = deduped.some(
        (d) =>
          Math.abs(d.lat - h.lat) < 0.01 &&
          Math.abs(d.lon - h.lon) < 0.01 &&
          d.date === h.date
      );
      if (!isDupe) deduped.push(h);
    }

    // Sort by brightness descending (most intense first)
    deduped.sort((a, b) => b.brightness - a.brightness);

    // Classify high confidence
    const highConfidence = deduped.filter((h) => {
      const conf = typeof h.confidence === "string" ? h.confidence.toLowerCase() : h.confidence;
      return conf === "high" || conf === "h" || (typeof conf === "number" && conf >= 80);
    });

    // Group by region
    const regionCounts = new Map<string, { count: number; maxBrightness: number }>();
    for (const h of deduped) {
      const region = classifyRegion(h.lat, h.lon);
      const existing = regionCounts.get(region) || { count: 0, maxBrightness: 0 };
      existing.count++;
      existing.maxBrightness = Math.max(existing.maxBrightness, h.brightness);
      regionCounts.set(region, existing);
    }

    const regions = Array.from(regionCounts.entries())
      .map(([name, data]) => ({ name, count: data.count, maxBrightness: Math.round(data.maxBrightness) }))
      .sort((a, b) => b.count - a.count);

    // Find last detection time
    let lastDetection: string | null = null;
    if (deduped.length > 0) {
      const latest = deduped.reduce((best, h) => {
        const hTime = `${h.date} ${h.time}`;
        const bTime = `${best.date} ${best.time}`;
        return hTime > bTime ? h : best;
      });
      lastDetection = `${latest.date} ${latest.time} UTC`;
    }

    const summary: FireSummary = {
      hotspots: deduped.slice(0, 50), // Top 50 by brightness
      totalCount: deduped.length,
      highConfidenceCount: highConfidence.length,
      regions,
      lastDetection,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Fires API error:", error);
    return NextResponse.json(
      {
        hotspots: [],
        totalCount: 0,
        highConfidenceCount: 0,
        regions: [],
        lastDetection: null,
        timestamp: new Date().toISOString(),
        error: "Failed to fetch fire data",
      },
      { status: 500 }
    );
  }
}
