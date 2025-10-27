import { useState, useEffect, useRef } from "react";
import { useSettings } from "../contexts/settingsContext";


export function SettingsMenu() {
  const { selected, toggleAllUnits } = useSettings();
  const isMetric = selected.temperature === "celsius";

  const ToggleGroup = ({ label, category, options }) => (
    <div className="border-b border-gray-100 border-opacity-30 pb-4 mb-2">
      <span className="text-[hsl(240,6%,70%)] text-sm">{label}</span>
      {options.map((option, i) => (
        <div
          key={i}
          className={`flex flex-row justify-between items-center px-2 py-2 rounded-lg mt-2 transition-all duration-200 ${selected[category] === option.value ? "bg-[hsl(243,23%,40%)]" : ""
            }`}
        >
          <span>{option.label}</span>
          {selected[category] === option.value && (
            <img
              src="https://o5vtbz71klu9q45y.public.blob.vercel-storage.com/icon-checkmark.svg"
              alt="checkmark"
              className="w-4 h-4"
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-xs mx-auto text-white">
      <span
        onClick={toggleAllUnits}
        className="block py-2 px-2 hover:bg-[hsl(243,23%,45%)] rounded-md cursor-pointer mb-3 transition-all duration-200"
      >
        {isMetric ? "Switch to Imperial" : "Switch to Metric"}
      </span>

      <ToggleGroup
        label="Temperature"
        category="temperature"
        options={[
          { label: "Celsius (°C)", value: "celsius" },
          { label: "Fahrenheit (°F)", value: "fahrenheit" },
        ]}
      />

      <ToggleGroup
        label="Wind Speed"
        category="wind"
        options={[
          { label: "km/h", value: "kmh" },
          { label: "mph", value: "mph" },
        ]}
      />

      <ToggleGroup
        label="Precipitation"
        category="precipitation"
        options={[
          { label: "Millimeters (mm)", value: "mm" },
          { label: "Inches (in)", value: "in" },
        ]}
      />
    </div>
  );
}

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <>
      <header className="flex justify-between flex-row w-full">
        <img src="https://o5vtbz71klu9q45y.public.blob.vercel-storage.com/logo.svg" className="md:w-auto w-40" alt="logo" />
        <div className="relative flex items-center" ref={dropdownRef}>
          <div onClick={() => setIsOpen(!isOpen)} className="flex w-30 items-center justify-evenly flex-row bg-[hsl(243,23%,24%)] px-[14px] py-[10px] rounded-md gap-2 cursor-pointer">
            <img src="https://o5vtbz71klu9q45y.public.blob.vercel-storage.com/icon-units.svg" alt="units" />
            <div >Units</div>
            <img src="https://o5vtbz71klu9q45y.public.blob.vercel-storage.com/icon-dropdown.svg" alt="dropdown" />


          </div>
          <div className={`absolute top-14 right-0 w-[14.375rem] h-auto bg-[hsl(243,23%,24%)] rounded-xl shadow-md 
                        border border-[hsl(240,6%,70%)] border-opacity-30 p-4 z-10 transition-all duration-300 origin-top transform 
                        ${isOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"}`}>

            <SettingsMenu />
          </div>
        </div>



      </header>

    </>
  )
}