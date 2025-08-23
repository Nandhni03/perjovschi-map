import { useLayoutEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "../App.css";

const DARK_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";
const LIGHT_STYLE =
  "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

const Map = ({ onOpenSidebar }) => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const geojsonRef = useRef(null);
  const markersRef = useRef([]); // store current markers
  const [mapStyle, setMapStyle] = useState(DARK_STYLE);
  const activePopupRef = useRef(null); // track currently open popup

  const handleStyleChange = (style) => {
    if (!mapRef.current) return;

    // If a popup is open, save its state
    const popupData = activePopupRef.current
      ? {
          lngLat: activePopupRef.current._lngLat,
          html: activePopupRef.current._content.innerHTML,
        }
      : null;

    setMapStyle(style);
    mapRef.current.setStyle(style);

    mapRef.current.once("styledata", () => {
      addMarkers();

      // Restore popup if it was open
      if (popupData) {
        const restoredPopup = new maplibregl.Popup({ offset: 25 })
          .setLngLat(popupData.lngLat)
          .setHTML(popupData.html)
          .addTo(mapRef.current);

        activePopupRef.current = restoredPopup;
      }
    });

    // Toggle body class for global CSS theming
    if (style.includes("dark-matter")) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
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
          : "0 0 12px rgba(128,0,0,0.8)";

      // Sort projects by year descending
      propertiesList.sort((a, b) => b.year[0] - a.year[0]);
      const mostRecent = propertiesList[0];
      const olderCount = propertiesList.length - 1;

      // Wrap the title in a link that opens the sidebar
      let popupContent = `
        <h3 style="margin:0 0 6px;">
          <a href="#" class="js-open-sidebar" style="text-decoration:none;">
            ${mostRecent.title}
          </a>
        </h3>
        <p style="margin:4px 0;">${mostRecent.description ?? ""}</p>
        <small>
          ${(Array.isArray(mostRecent.year) ? mostRecent.year.join(", ") : mostRecent.year) || ""}
          ${mostRecent.city ? `, ${mostRecent.city}` : ""}
          ${mostRecent.country ? `, ${mostRecent.country}` : ""}
        </small>
      `;
      if (olderCount > 0) {
        popupContent += `<p style="margin-top:8px; font-style:italic;">+${olderCount} more older project${olderCount > 1 ? "s" : ""}</p>`;
      }

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(popupContent);

      // When popup opens, wire the title click → open sidebar
      popup.on("open", () => {
        const root = popup.getElement();
        const titleLink = root?.querySelector(".js-open-sidebar");
        if (titleLink) {
          titleLink.addEventListener(
            "click",
            (e) => {
              e.preventDefault();
              if (onOpenSidebar) {
                onOpenSidebar({
                  city: mostRecent.city || "",
                  coord: [lng, lat],
                  projects: propertiesList,
                });
              }
              popup.remove(); // close popup after opening sidebar
            },
            { once: true }
          );
        }
      });

      const marker = new maplibregl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(mapRef.current);

      // Track the popup when opened
      marker.getElement().addEventListener("click", () => {
        activePopupRef.current = popup;
      });

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
  }, []); // eslint-disable-line

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      {/* Style toggle (kept as you had it) */}
      <div className="style-toggle">
        <button
          className={mapStyle === DARK_STYLE ? "active" : ""}
          onClick={() => handleStyleChange(DARK_STYLE)}
        >
          Dark
        </button>
        <button
          className={mapStyle === LIGHT_STYLE ? "active" : ""}
          onClick={() => handleStyleChange(LIGHT_STYLE)}
        >
          Light
        </button>
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default Map;
