"use client";
import { useEffect, useRef } from "react";
import AdPlaceholder from "./AdPlaceholder";

function extractPins(days: any[] = []) {
  const pins: { name: string; lat: number; lon: number; day: number }[] = [];
  for (const day of days) {
    for (const period of ["morning", "afternoon", "evening"]) {
      const block = day[period];
      if (!block?.activities) continue;
      for (const act of block.activities) {
        if (act.lat && act.lon) {
          pins.push({ name: act.name, lat: act.lat, lon: act.lon, day: day.day_number });
        }
      }
    }
  }
  return pins;
}

export default function MapSidebar({ itinerary, accommodationLat, accommodationLon, activePin }: {
  itinerary: any;
  accommodationLat?: number;
  accommodationLon?: number;
  activePin: string | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || leafletMap.current) return;

    import("leaflet").then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const lat = accommodationLat || 48.8566;
      const lon = accommodationLon || 2.3522;

      leafletMap.current = L.map(mapRef.current!).setView([lat, lon], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(leafletMap.current);

      const homeIcon = L.divIcon({
        className: "",
        html: `<div style="background:#C1440E;border:2px solid white;border-radius:50%;width:16px;height:16px;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([lat, lon], { icon: homeIcon }).addTo(leafletMap.current).bindPopup("<strong>Your Accommodation</strong>");
    });
  }, [accommodationLat, accommodationLon]);

  useEffect(() => {
    if (!leafletMap.current) return;
    import("leaflet").then(L => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (!itinerary?.days) return;

      const pins = extractPins(itinerary.days);
      const colors = ["#C1440E", "#2D5E42", "#F4A835", "#4A6FA5", "#8B5E3C"];

      pins.forEach((pin, i) => {
        const color = colors[(pin.day - 1) % colors.length];
        const icon = L.divIcon({
          className: "",
          html: `<div style="background:${color};color:white;border:2px solid white;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.25)">${i + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        const marker = L.marker([pin.lat, pin.lon], { icon })
          .addTo(leafletMap.current)
          .bindPopup(`<strong>${pin.name}</strong><br>Day ${pin.day}`);
        markersRef.current.push(marker);
      });

      if (pins.length > 0 && accommodationLat && accommodationLon) {
        try {
          leafletMap.current.fitBounds(
            [[accommodationLat, accommodationLon], ...pins.map(p => [p.lat, p.lon])],
            { padding: [30, 30] }
          );
        } catch {}
      }
    });
  }, [itinerary, accommodationLat, accommodationLon]);

  return (
    <div className="map-sidebar">
      <div className="map-sidebar__header">
        <span className="map-sidebar__title">All Stops</span>
      </div>
      <div className="map-container" ref={mapRef} style={{ flex: 1, minHeight: 0 }} />
      <div style={{ padding: "1rem", borderTop: "1px solid var(--color-border)", background: "var(--color-white)" }}>
        <AdPlaceholder variant="sidebar" />
      </div>
    </div>
  );
}
