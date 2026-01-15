import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// USGS Earthquake API - Iran bounding box roughly: 25-40°N, 44-64°E
const USGS_API = "https://earthquake.usgs.gov/fdsnws/event/1/query";

interface Earthquake {
  magnitude: number;
  place: string;
  time: string;
  depth: number;
  lat: number;
  lon: number;
  url: string;
}

export async function GET() {
  try {
    // Get earthquakes in Iran region from last 7 days
    const endTime = new Date().toISOString();
    const startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const params = new URLSearchParams({
      format: "geojson",
      starttime: startTime,
      endtime: endTime,
      minlatitude: "25",
      maxlatitude: "40",
      minlongitude: "44",
      maxlongitude: "64",
      minmagnitude: "2.5",
      orderby: "time",
    });

    const res = await fetch(`${USGS_API}?${params}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`USGS API error: ${res.status}`);

    const data = await res.json();

    const earthquakes: Earthquake[] = data.features.slice(0, 20).map((f: any) => ({
      magnitude: f.properties.mag,
      place: f.properties.place,
      time: new Date(f.properties.time).toISOString(),
      depth: f.geometry.coordinates[2],
      lat: f.geometry.coordinates[1],
      lon: f.geometry.coordinates[0],
      url: f.properties.url,
    }));

    return NextResponse.json({
      earthquakes,
      count: data.metadata.count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Seismic API error:", error);
    return NextResponse.json({ error: "Failed to fetch seismic data", earthquakes: [] }, { status: 500 });
  }
}
