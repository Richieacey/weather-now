import { useState, useEffect } from "react";
import HourlyForecast from "./HourlyForecast";
import weatherImages from "../utils/weatherImages";
import { convertTemperature } from "../utils/conversion";

export default function HourlySection({ forecast, selected }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState("");
    const [hourlyData, setHourlyData] = useState([]);

    useEffect(() => {
        // safety: must have arrays
        if (
            !forecast?.hourly?.time ||
            !forecast?.hourly?.temperature_2m ||
            !forecast?.hourly?.weather_code
        ) {
            console.log("HourlySection: forecast data not ready yet");
            console.log();
            return;
        }

        const timezone = forecast?.timezone || "Africa/Lagos";

        // Debug: show basic API info
        console.log("HourlySection: timezone from forecast:", timezone);
        console.log("HourlySection: forecast.hourly.time sample (first 6):", forecast.hourly.time.slice(0, 6));
        console.log("HourlySection: number of hourly entries:", forecast.hourly.time.length);

        // compute current local time in that timezone
        const now = new Date();
        // localNow string in timezone (we use toLocaleString with timeZone)
        const localNowStr = now.toLocaleString("en-US", { timeZone: timezone });
        const localNow = new Date(localNowStr);
        const currentHour = localNow.getHours();
        const dayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        const currentWeekday = dayNames[localNow.getDay()];

        if (selectedDay === "") {
            setSelectedDay(currentWeekday);
        }

        // if (selec)


        // Set default selected day to current local weekday (so not stuck on Monday)
        // if (!selectedDay) {
        //     setSelectedDay(currentWeekday);
        // } else{
            // If initial selectedDay is default "Monday", we may want to override to current:
            // Only set when component mounts
            // (Optional) uncomment next line to automatically set default to current local day:
        //     setSelectedDay(currentWeekday);
        // }

        console.log("HourlySection: localNow (in timezone):", localNow.toString());
        console.log("HourlySection: currentHour:", currentHour, "currentWeekday:", currentWeekday);
        console.log("HourlySection: selectedDay (before):", selectedDay);

        // Helpers to get weekday/hour of an ISO timestamp in the forecast timezone using Intl
        const getWeekdayForTime = (isoTime) =>
            new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "long" }).format(new Date(isoTime));
        const getHourForTime = (isoTime) =>
            Number(new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "2-digit", hour12: false }).format(new Date(isoTime)));

        // Quick debug: print first 8 parsed results (weekday + hour) for inspection
        const debugFirst = forecast.hourly.time.slice(0, 8).map((t) => ({
            raw: t,
            weekday: getWeekdayForTime(t),
            hour: getHourForTime(t),
            localString: new Date(t).toString(),
        }));
        console.log("HourlySection: debug parse (first 8 hourly entries):", debugFirst);

        // Build hourlyArray safely (guard if arrays lengths mismatch)
        const len = forecast.hourly.time.length;
        const temps = forecast.hourly.temperature_2m;
        const codes = forecast.hourly.weather_code;

        const hourlyArray = [];
        for (let i = 0; i < len; i++) {
            const t = forecast.hourly.time[i];
            const weekday = getWeekdayForTime(t);
            const hour = getHourForTime(t);
            hourlyArray.push({
                iso: t,
                weekday,
                hour,
                temp: temps?.[i] ?? null,
                code: codes?.[i] ?? 0,
            });
        }

        // Debug: show how many entries per weekday we have (useful to see if days match)
        const countsByDay = hourlyArray.reduce((acc, item) => {
            acc[item.weekday] = (acc[item.weekday] || 0) + 1;
            return acc;
        }, {});
        console.log("HourlySection: countsByDay:", countsByDay);

        // Determine which day to show: user selection OR current local weekday
        const dayToShow = selectedDay || currentWeekday;
        console.log("HourlySection: dayToShow:", dayToShow);

        // Filter hourlyArray by selected day
        const selectedDayData = hourlyArray.filter((h) => h.weekday === dayToShow);
        console.log("HourlySection: selectedDayData.length:", selectedDayData.length);
        // Debug sample of that day's entries
        console.log("HourlySection: selectedDayData (sample 0..7):", selectedDayData.slice(0, 8));

        // Select the next 8 hours starting from the CURRENT HOUR (in that timezone)
        // Note: currentHour is from localNow computed earlier (in timezone)
        const next8Hours = selectedDayData.filter((h) => h.hour >= currentHour && h.hour < currentHour + 8);
        console.log("HourlySection: next8Hours.length:", next8Hours.length);
        console.log("HourlySection: next8Hours sample:", next8Hours.slice(0, 8));

        // As fallback, if user selects a day/time combo that yields none, show first 8 entries of that day
        const displayData = next8Hours.length > 0 ? next8Hours : selectedDayData.slice(0, 8);

        setHourlyData(displayData);
        console.log("HourlySection: displayData.length -> setHourlyData:", displayData.length);
    }, [forecast, selectedDay, selected]);

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex flex-row justify-between items-center mb-6">
                <span>Hourly Forecast</span>
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="cursor-pointer flex flex-row items-center py-1 px-4 bg-[hsl(243,23%,30%)] rounded gap-2 relative"
                >
                    <span>{selectedDay}</span>
                    <img src="./src/assets/images/icon-dropdown.svg" alt="dropdown" />

                    {isOpen && (
                        <div className="absolute top-full right-0 w-[150px] mt-2 bg-[hsl(243,23%,24%)] rounded-md shadow-md border border-[hsl(240,6%,70%)] border-opacity-30 p-2 flex flex-col gap-2 z-10">
                            {days.map((day) => (
                                <span
                                    key={day}
                                    onClick={() => {
                                        setSelectedDay(day);
                                        setIsOpen(false);
                                    }}
                                    className={`cursor-pointer py-1 px-2 rounded-md transition-all ${selectedDay === day
                                            ? "bg-[hsl(243,23%,40%)]"
                                            : "hover:bg-[hsl(243,23%,35%)]"
                                        }`}
                                >
                                    {day}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Hourly Forecast */}
            <div className="flex flex-col gap-4">
                {hourlyData.length > 0 ? (
                    hourlyData.map((hour, index) => (
                        <HourlyForecast
                            key={index}
                            image_source={weatherImages[hour.code] || " "}
                            time={new Date(hour.iso).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                hour12: true,
                                timeZone: forecast?.timezone || "Africa/Lagos",
                            })}
                            temperature={
                                hour.temp !== null
                                    ? `${convertTemperature(hour.temp, selected.temperature)}°`
                                    : "--"
                            }
                        />
                    ))
                ) : (
                    <p className="text-sm opacity-70">No hourly data available.</p>
                )}
            </div>
        </div>
    );
}
