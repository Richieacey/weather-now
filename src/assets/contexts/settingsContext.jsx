// settingsContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

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

  const handleToggle = (category, value) => {
    setSelected((prev) => ({ ...prev, [category]: value }));
  };

  // New: toggle all units at once between metric <-> imperial
  const toggleAllUnits = () => {
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
  };

  return (
    <SettingsContext.Provider value={{ selected, handleToggle, toggleAllUnits }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
