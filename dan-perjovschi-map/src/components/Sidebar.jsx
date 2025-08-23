import { useEffect, useRef, useState } from "react";
import styles from "./Sidebar.module.css";

export default function Sidebar({ isOpen, data, onClose }) {
  const sidebarRef = useRef(null);
  const [touchStartX, setTouchStartX] = useState(null);

  // Swipe to close (mobile only)
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
    const handleTouchEnd = (e) => {
      if (touchStartX !== null) {
        const diff = e.changedTouches[0].clientX - touchStartX;
        if (diff > 80) onClose(); // swipe right closes
      }
      setTouchStartX(null);
    };

    sidebar.addEventListener("touchstart", handleTouchStart);
    sidebar.addEventListener("touchend", handleTouchEnd);
    return () => {
      sidebar.removeEventListener("touchstart", handleTouchStart);
      sidebar.removeEventListener("touchend", handleTouchEnd);
    };
  }, [touchStartX, onClose]);

  return (
    <div
      ref={sidebarRef}
      className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
    >
      <div className={styles.content}>
        {data?.projects?.length > 1 ? (
          <>
            <h2>{data.city}</h2>
            {data.projects.map((proj, i) => (
              <div key={i} className={styles.projectCard}>
                <h3>{proj.title}</h3>
                <p>{proj.year?.join(", ")}, {proj.country}</p>
              </div>
            ))}
          </>
        ) : data?.projects?.length === 1 ? (
          <>
            <h2>{data.projects[0].title}</h2>
            <p>{data.projects[0].description}</p>
            <small>
              {data.projects[0].year?.join(", ")} – {data.projects[0].city}, {data.projects[0].country}
            </small>
          </>
        ) : (
          <p className={styles.placeholder}>Select a project</p>
        )}

      </div>
      {/* Overlay only visible on mobile */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.show : ""}`}
        onClick={onClose}
      />
    </div>
  );
}
