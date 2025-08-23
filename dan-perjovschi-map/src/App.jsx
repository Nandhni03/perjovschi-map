import Map from "./components/Map";
import "./App.css";
import "maplibre-gl/dist/maplibre-gl.css";

function App() {
  return (
      <div className="app-container">
        <div className="map-container">
          <Map />
        </div>
      </div>
  );
}

export default App;
