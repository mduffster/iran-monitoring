import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// NASA FIRMS (Fire Information for Resource Management System)
// Using the open CSV feed for MODIS/VIIRS
const FIRMS_API = "https://firms.modaps.eosdis.nasa.gov/api/country/csv";

interface Fire {
  lat: number;
  lon: number;
  brightness: number;
  date: string;
  time: string;
  confidence: string;
  satellite: string;
}

export async function GET() {
  try {
    // FIRMS requires an API key for direct access, but we can use their map embed
    // For now, return metadata and links - could add API key later

    // Alternative: Use the FIRMS active fire map iframe
    const firmsMapUrl = "https://firms.modaps.eosdis.nasa.gov/map/#d:24hrs;@53.7,32.4,6z";

    // Try to fetch from FIRMS open data (last 24h, Iran region)
    // Note: This may require API key for production use
    const iranBbox = "44,25,64,40"; // minLon,minLat,maxLon,maxLat

    return NextResponse.json({
      mapUrl: firmsMapUrl,
      embedUrl: `https://firms.modaps.eosdis.nasa.gov/map/#d:24hrs;@53.7,32.4,6z`,
      region: "Iran",
      note: "NASA FIRMS satellite fire detection - shows thermal anomalies",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("FIRMS API error:", error);
    return NextResponse.json({ error: "Failed to fetch fire data" }, { status: 500 });
  }
}
