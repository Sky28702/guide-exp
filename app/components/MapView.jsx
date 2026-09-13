"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

function footprintPolygon(parcel) {
  const M_PER_DEG_LAT = 111320;

  const mPerDegLng = M_PER_DEG_LAT * Math.cos((parcel.lat * Math.PI) / 180);

  function metresToLatLng(xOffsetM, yOffsetM) {
    const dx = xOffsetM - parcel.footprint.length / 2;
    const dy = yOffsetM - parcel.footprint.width / 2;

    return [parcel.lat + dy / M_PER_DEG_LAT, parcel.lng + dx / mPerDegLng];
  }

  return [
    metresToLatLng(0, 0),
    metresToLatLng(parcel.footprint.length, 0),
    metresToLatLng(parcel.footprint.length, parcel.footprint.width),
    metresToLatLng(0, parcel.footprint.width),
  ];
}

export default function MapView({ parcel }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function createMap() {
      // IMPORTANT:
      // Leaflet is imported only inside useEffect,
      // so it never gets evaluated during SSR.
      const L = await import("leaflet");

      if (cancelled || !containerRef.current || mapRef.current) {
        return;
      }

      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([parcel.lat, parcel.lng], 18);

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        },
      ).addTo(map);

      const polygon = L.polygon(footprintPolygon(parcel), {
        color: "#C99A4B",
        weight: 2,
        fillColor: "#C99A4B",
        fillOpacity: 0.18,
      }).addTo(map);

      polygon.bindPopup(`
        <div style="
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          line-height: 1.5;
        ">
          <strong style="color:#C99A4B;">
            ${parcel.name}
          </strong>
          <br/>
          ULPIN: ${parcel.ulpin}
          <br/>
          Footprint:
          ${parcel.footprint.length}m ×
          ${parcel.footprint.width}m
          <br/>
          ${parcel.registryStatus}
        </div>
      `);

      L.circleMarker([parcel.lat, parcel.lng], {
        radius: 5,
        color: "#C99A4B",
        fillColor: "#C99A4B",
        fillOpacity: 1,
      }).addTo(map);

      mapRef.current = map;

      const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });

      resizeObserver.observe(containerRef.current);

      // Store observer so cleanup can access it.
      map._resizeObserver = resizeObserver;
    }

    createMap();

    return () => {
      cancelled = true;

      if (mapRef.current) {
        mapRef.current._resizeObserver?.disconnect();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [parcel]);

  return (
    <div
      ref={containerRef}
      className="w-full h-65 border border-line"
      aria-label={`Map showing ${parcel.name} parcel footprint`}
    />
  );
}
