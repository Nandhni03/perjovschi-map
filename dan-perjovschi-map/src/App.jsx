import { useState } from "react";
import Map from "./components/Map";
import Sidebar from "./components/Sidebar";
import "./App.css";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarData, setSidebarData] = useState(null);

  const openSidebar = (payload) => {
    setSidebarData(payload); // { city, coord, projects: [...] }
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div id="root">
      <div className="app-container">
        <div className="map-container">
          <Map onOpenSidebar={openSidebar} />
        </div>
      </div>

      <Sidebar isOpen={sidebarOpen} data={sidebarData} onClose={closeSidebar} />
    </div>
  );
}

export default App;
