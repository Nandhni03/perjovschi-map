import { useLayoutEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const DARK_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const POSITRON_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const LIGHT_STYLE = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

const Map = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const geojsonRef = useRef(null);
  const markersRef = useRef([]); // to store current markers
  const [mapStyle, setMapStyle] = useState(DARK_STYLE);

  const handleStyleChange = (style) => {
    setMapStyle(style);
    if (mapRef.current) {
      mapRef.current.setStyle(style);
      mapRef.current.once("styledata", () => addMarkers());
    }
  };

  const addMarkers = () => {
    if (!geojsonRef.current) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const coordMap = {};
    geojsonRef.current.features.forEach((feature) => {
      const key = feature.geometry.coordinates.join(",");
      if (!coordMap[key]) coordMap[key] = [];
      coordMap[key].push(feature.properties);
    });

    Object.entries(coordMap).forEach(([coordStr, propertiesList]) => {
      const [lng, lat] = coordStr.split(",").map(Number);

      // Create pin element with color based on style
      const el = document.createElement("div");
      el.innerHTML = "📍";
      el.style.fontSize = "20px";
      el.style.cursor = "pointer";
      el.style.textShadow =
        mapStyle === DARK_STYLE
          ? "0 0 12px rgba(255,0,0,0.8)"
          : mapStyle === LIGHT_STYLE
          ? "0 0 12px rgba(0,128,128,0.8)"  
          : mapStyle === POSITRON_STYLE
          ? "0 0 12px rgba(0,128,0,0.8)"
          : "0 0 12px rgba(128,0,128,0.8)";


      // Sort projects by year descending
      propertiesList.sort((a, b) => b.year[0] - a.year[0]);
      const mostRecent = propertiesList[0];
      const olderCount = propertiesList.length - 1;

      let popupContent = `<h3>${mostRecent.title}</h3>
                          <p>${mostRecent.description}</p>
                          <small>${mostRecent.year.join(", ")}, ${mostRecent.city}, ${mostRecent.country}</small>`;
      if (olderCount > 0) {
        popupContent += `<p style="margin-top:8px; font-style:italic;">+${olderCount} more older project${olderCount > 1 ? "s" : ""}</p>`;
      }

      const marker = new maplibregl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(popupContent))
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  };

  useLayoutEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [10, 48],
      zoom: 3,
    });

    mapRef.current.on("load", () => {
      fetch(import.meta.env.BASE_URL + "data/pins.geojson")
        .then((res) => res.json())
        .then((geojson) => {
          geojsonRef.current = geojson;
          addMarkers();
        })
        .catch((err) => console.error("Error loading pins.geojson:", err));
    });
  }, []);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          backgroundColor: "rgba(0,0,0,0.6)",
          padding: "6px",
          borderRadius: "6px",
          display: "flex",
          gap: "4px",
          zIndex: 10,
        }}
      >
        <button style={buttonStyle(mapStyle === DARK_STYLE)} onClick={() => handleStyleChange(DARK_STYLE)}>
          dark
        </button>
        <button style={buttonStyle(mapStyle === LIGHT_STYLE)} onClick={() => handleStyleChange(LIGHT_STYLE)}>
          light
        </button>
        <button style={buttonStyle(mapStyle === POSITRON_STYLE)} onClick={() => handleStyleChange(POSITRON_STYLE)}>
          positron
        </button>
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

const buttonStyle = (active) => ({
  padding: "4px 8px",
  border: "none",
  borderRadius: "4px",
  backgroundColor: active ? "#fff" : "#444",
  color: active ? "#000" : "#fff",
  cursor: "pointer",
  fontWeight: active ? "600" : "400",
  fontSize: "12px",
  transition: "0.3s",
});

export default Map;
