import { createContext, useContext, useEffect, useState, useCallback } from "react"; // Added useCallback

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [selected, setSelected] = useState(() => {
    const saved = localStorage.getItem("selectedSettings");
    return saved
      ? JSON.parse(saved)
      : {
          temperature: "celsius",
          wind: "kmh",
          precipitation: "mm",
        };
  });

  useEffect(() => {
    localStorage.setItem("selectedSettings", JSON.stringify(selected));
  }, [selected]);

  // Wrapped in useCallback for performance (prevents function recreation on every render)
  const handleToggle = useCallback((category, value) => {
    setSelected((prev) => ({ ...prev, [category]: value }));
  }, []); // Empty dependency array means this function is stable

  const toggleAllUnits = useCallback(() => { // Also wrapped this in useCallback
    setSelected((prev) => {
      const isMetric = prev.temperature === "celsius";
      return isMetric
        ? {
            temperature: "fahrenheit",
            wind: "mph",
            precipitation: "in",
          }
        : {
            temperature: "celsius",
            wind: "kmh",
            precipitation: "mm",
          };
    });
  }, []); // Empty dependency array means this function is stable

  return (
    // Exposing the stable handleToggle function
    <SettingsContext.Provider value={{ selected, handleToggle, toggleAllUnits }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}