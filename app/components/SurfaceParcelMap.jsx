"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export default function SurfaceParcelMap({ parcel }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      // Dynamic import prevents Leaflet from being evaluated during SSR.
      const L = await import("leaflet");

      if (cancelled || !mapContainerRef.current || mapRef.current) {
        return;
      }

      /*
       * Parcel coordinates.
       *
       * Expected:
       * parcel.lat
       * parcel.lng
       *
       * Optional:
       * parcel.footprint = {
       *   length: number,
       *   width: number
       * }
       */

      const lat = Number(parcel?.lat);
      const lng = Number(parcel?.lng);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        console.error("Invalid parcel coordinates:", parcel);
        return;
      }

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
        minZoom: 16,
        maxZoom: 21,
      });

      mapRef.current = map;

      /*
       * OpenStreetMap base layer
       */
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 21,
      }).addTo(map);

      /*
       * GNSS reference point
       */
      const gnssMarker = L.circleMarker([lat, lng], {
        radius: 7,
        color: "#ffffff",
        weight: 2,
        fillColor: "#2563eb",
        fillOpacity: 1,
      }).addTo(map);

      gnssMarker.bindTooltip("GNSS Reference", {
        direction: "top",
        offset: [0, -8],
      });

      /*
       * Parcel footprint
       *
       * If your parcel data already contains a polygon,
       * use parcel.geometry.coordinates instead.
       */
      let footprint;

      if (
        Array.isArray(parcel?.footprintCoordinates) &&
        parcel.footprintCoordinates.length >= 3
      ) {
        footprint = parcel.footprintCoordinates.map(([lngValue, latValue]) => [
          Number(latValue),
          Number(lngValue),
        ]);
      } else {
        /*
         * Fallback footprint around GNSS point.
         *
         * This is only for the prototype.
         * Replace with your actual GIS polygon when available.
         */

        const length = Number(parcel?.footprint?.length) || 30;

        const width = Number(parcel?.footprint?.width) || 20;

        const metersPerLat = 111320;

        const metersPerLng = 111320 * Math.cos((lat * Math.PI) / 180);

        const latOffset = width / 2 / metersPerLat;
        const lngOffset = length / 2 / metersPerLng;

        footprint = [
          [lat - latOffset, lng - lngOffset],
          [lat - latOffset, lng + lngOffset],
          [lat + latOffset, lng + lngOffset],
          [lat + latOffset, lng - lngOffset],
        ];
      }

      /*
       * GIS parcel layer
       */
      const parcelPolygon = L.polygon(footprint, {
        color: "#b88645",
        weight: 3,
        opacity: 1,
        fillColor: "#b88645",
        fillOpacity: 0.18,
      }).addTo(map);

      parcelPolygon.bindPopup(`
        <div style="min-width:180px">
          <strong>Surface Parcel</strong>
          <br />
          ${parcel.name || "Unnamed Parcel"}
          <br /><br />
          <strong>ULPIN:</strong>
          ${parcel.ulpin || "N/A"}
          <br />
          <strong>Reference:</strong>
          GNSS
        </div>
      `);

      /*
       * Fit map to parcel
       */
      map.fitBounds(parcelPolygon.getBounds(), {
        padding: [40, 40],
        maxZoom: 19,
      });

      /*
       * Make sure Leaflet knows the container's
       * actual size.
       */
      requestAnimationFrame(() => {
        if (!cancelled && mapRef.current) {
          mapRef.current.invalidateSize();
        }
      });
    }

    initMap();

    return () => {
      cancelled = true;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [parcel]);

  return (
    <div className="relative h-105 w-full overflow-hidden rounded-xl border border-[#d9d5cd]">
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Map information overlay */}
      <div className="pointer-events-none absolute left-4 top-4 z-1000">
        <div className="rounded-lg border border-[#d9d5cd] bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#777]">
            01 — Surface Parcel
          </p>

          <p className="mt-1 text-sm font-semibold text-[#171717]">
            GNSS-referenced footprint
          </p>

          <p className="mt-1 text-[11px] text-[#666]">GIS parcel layer</p>
        </div>
      </div>

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-1000">
        <div className="rounded-lg border border-[#d9d5cd] bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2 text-[10px] text-[#555]">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            GNSS reference
          </div>

          <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[#555]">
            <span className="h-2.5 w-2.5 rounded-sm bg-[#b88645]" />
            GIS parcel
          </div>
        </div>
      </div>
    </div>
  );
}
