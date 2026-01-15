"use client";

import TwitterWidget from "./TwitterWidget";
import FlightMap from "./FlightMap";
import InternetStatus from "./InternetStatus";
import NewsPanel from "./NewsPanel";
import ShipTracker from "./ShipTracker";
import SeismicPanel from "./SeismicPanel";
import FiresPanel from "./FiresPanel";
import CurrencyPanel from "./CurrencyPanel";
import NOTAMsPanel from "./NOTAMsPanel";
import AlertsPanel from "./AlertsPanel";
import OilPanel from "./OilPanel";

export default function Dashboard() {
  return (
    <div className="space-y-4">
      {/* Row 1: Primary Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="h-[400px]">
          <FlightMap />
        </div>
        <div className="h-[400px]">
          <NewsPanel />
        </div>
        <div className="h-[400px]">
          <AlertsPanel />
        </div>
      </div>

      {/* Row 2: Maps & Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-[350px]">
          <ShipTracker />
        </div>
        <div className="h-[350px]">
          <FiresPanel />
        </div>
      </div>

      {/* Row 3: Social & Connectivity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="h-[400px]">
          <TwitterWidget />
        </div>
        <div className="h-[400px]">
          <InternetStatus />
        </div>
        <div className="h-[400px]">
          <SeismicPanel />
        </div>
      </div>

      {/* Row 4: Economic & Aviation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="h-[350px]">
          <CurrencyPanel />
        </div>
        <div className="h-[350px]">
          <OilPanel />
        </div>
        <div className="h-[350px]">
          <NOTAMsPanel />
        </div>
      </div>
    </div>
  );
}
