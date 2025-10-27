import { useState, useEffect } from "react";
import HourlyForecast from "./HourlyForecast";
import weatherImages from "../utils/weatherImages";
import { convertTemperature, round } from "../utils/conversion";

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
            return;
        }

        const timezone = forecast?.timezone;

        
        const now = new Date();
        
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


        const getWeekdayForTime = (isoTime) =>
            new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "long" }).format(new Date(isoTime));
        const getHourForTime = (isoTime) =>
            Number(new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "2-digit", hour12: false }).format(new Date(isoTime)));

     
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

        const countsByDay = hourlyArray.reduce((acc, item) => {
            acc[item.weekday] = (acc[item.weekday] || 0) + 1;
            return acc;
        }, {});

        const dayToShow = selectedDay || currentWeekday;

        const selectedDayData = hourlyArray.filter((h) => h.weekday === dayToShow);

        const next8Hours = selectedDayData.filter((h) => h.hour >= currentHour && h.hour < currentHour + 8);
        const displayData = next8Hours.length > 0 ? next8Hours : selectedDayData.slice(0, 8);

        setHourlyData(displayData);
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
            <div className="flex flex-row justify-between items-center mb-6">
                <span>Hourly Forecast</span>
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="cursor-pointer flex flex-row items-center py-1 px-4 bg-[hsl(243,23%,30%)] rounded gap-2 relative"
                >
                    <span>{selectedDay}</span>
                    <img src="https://o5vtbz71klu9q45y.public.blob.vercel-storage.com/icon-dropdown.svg" alt="dropdown" />

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
                                    ? `${round(convertTemperature(hour.temp, selected.temperature))}°`
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
