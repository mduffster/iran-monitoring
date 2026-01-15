import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// NOTAMs are typically accessed through ICAO or FAA sources
// For Iran, key airports: OIIE (Tehran IKA), OIII (Tehran Mehrabad), OISS (Shiraz), OIMM (Mashhad)

const IRAN_AIRPORTS = [
  { icao: "OIIE", name: "Tehran Imam Khomeini (IKA)" },
  { icao: "OIII", name: "Tehran Mehrabad" },
  { icao: "OISS", name: "Shiraz" },
  { icao: "OIMM", name: "Mashhad" },
  { icao: "OIFM", name: "Isfahan" },
  { icao: "OIKB", name: "Bandar Abbas" },
];

// Iran FIR (Flight Information Region): OIIX
const IRAN_FIR = "OIIX";

export async function GET() {
  try {
    // NOTAMs require authenticated access to official sources
    // We'll provide links to free NOTAM services

    return NextResponse.json({
      airports: IRAN_AIRPORTS,
      fir: IRAN_FIR,
      links: {
        faa: "https://www.notams.faa.gov/dinsQueryWeb/",
        icao: "https://www.icao.int/safety/iStars/Pages/API-Data-Service.aspx",
        skyvector: "https://skyvector.com/notams",
        notaminfo: "https://notaminfo.com/country/IR",
        eurocontrol: "https://www.eurocontrol.int/service/digital-notam",
      },
      checkItems: [
        "Airspace closures (danger areas, restricted zones)",
        "Airport closures or restrictions",
        "Military exercises (often coded)",
        "Navigation aid outages",
        "Temporary flight restrictions",
      ],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("NOTAMs API error:", error);
    return NextResponse.json({ error: "Failed to fetch NOTAMs" }, { status: 500 });
  }
}
