import { useLayoutEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const Map = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  useLayoutEffect(() => {
    if (mapRef.current) return; // prevent reinit

    // Initialize MapLibre map
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [10, 48],
      zoom: 3,
    });

    console.log("Map initialized:", mapRef.current);
    console.log("Container size:", mapContainer.current.getBoundingClientRect());


    // Load GeoJSON pins
    fetch(import.meta.env.BASE_URL + "data/pins.geojson")
      .then((res) => res.json())
      .then((geojson) => {
        console.log("Loaded GeoJSON pins:", geojson);

        geojson.features.forEach(({ geometry, properties }) => {
          // Create glowing pin
          const el = document.createElement("div");
          el.innerHTML = "📍";
          el.style.fontSize = "22px";
          el.style.textShadow = "0 0 12px rgba(255,0,0,0.8)";

          // Add marker
          new maplibregl.Marker(el)
            .setLngLat(geometry.coordinates)
            .setPopup(
              new maplibregl.Popup({ offset: 25 }).setHTML(
                `<h3>${properties.title}</h3>
                 <p>${properties.description}</p>
                 <small>${properties.year}, ${properties.city}, ${properties.country}</small>`
              )
            )
            .addTo(mapRef.current);
        });
      })
      .catch((err) => console.error("Error loading pins.geojson:", err));
  }, []);

  return <div ref={mapContainer} className="map-container" />;
};

export default Map;
