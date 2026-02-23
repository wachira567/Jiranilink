import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Note: In a real app, MOVE THIS TO .ENV
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const MapView = ({ items, selectedLocation }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    
    if (!mapboxgl.accessToken || mapboxgl.accessToken.trim() === '') {
        setMapError(true);
        return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [36.8219, -1.2921], // Nairobi default
        zoom: 12,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      map.current.on('error', (e) => {
          if (e && e.error && e.error.message && e.error.message.includes('401')) {
              setMapError(true);
          }
      });
    } catch (err) {
      setMapError(true);
    }
  }, []);

  useEffect(() => {
    if (!map.current || mapError) return;

    // Clear existing markers
    const markers = document.getElementsByClassName("mapboxgl-marker");
    while (markers[0]) markers[0].remove();

    // Add markers for items
    items.forEach((item) => {
      if (item.coordinates) {
        new mapboxgl.Marker({ color: "#6366f1" })
          .setLngLat([item.coordinates.lng, item.coordinates.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`<div style="color: var(--text);">
                          <h3 style="margin:0 0 5px 0; font-size:1.1rem; color: var(--primary)">${item.name}</h3>
                          <p style="margin:0; font-size: 0.9rem; color: var(--text-muted)">Owner: ${item.ownerName}</p>
                        </div>`)
          )
          .addTo(map.current);
      }
    });

    // Fly to selected location if it exists
    if (selectedLocation && selectedLocation.lat && selectedLocation.lng) {
      map.current.flyTo({
        center: [selectedLocation.lng, selectedLocation.lat],
        zoom: 16, // Zoom in closer on the specific item
        essential: true, // This animation is considered essential with respect to prefers-reduced-motion
        duration: 2000 // Smooth 2s animation
      });
    }
  }, [items, mapError, selectedLocation]);

  if (mapError) {
      return (
          <div className="map-error-container" style={{ height: "400px", borderRadius: "12px", border: "1px dashed var(--glass-border)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.2)", padding: "2rem", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗺️</div>
              <h3 style={{ marginBottom: "0.5rem" }}>Map Unavailable</h3>
              <p style={{ color: "var(--text-muted)", maxWidth: "500px" }}>The community map is currently unavailable due to an invalid configuration. To fix this, please update the <strong>VITE_MAPBOX_TOKEN</strong> in your .env file with a valid Mapbox access token.</p>
          </div>
      );
  }

  return (
    <div className="map-wrapper" style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid var(--glass-border)" }}>
      <div ref={mapContainer} className="map-container" style={{ height: "400px", width: "100%" }} />
    </div>
  );
};

export default MapView;
