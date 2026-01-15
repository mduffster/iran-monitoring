import { NextResponse } from "next/server";
import { fetchNews } from "@/lib/rss";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const news = await fetchNews();
    return NextResponse.json({ news, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news", news: [] },
      { status: 500 }
    );
  }
}
