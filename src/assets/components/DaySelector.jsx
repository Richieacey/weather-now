import { useState } from "react";

export default function DaySelector({ isOpen }) {
    const [selectedDay, setSelectedDay] = useState(null);

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
        <div
            className={`absolute top-20 right-10 w-[230px] h-auto bg-[hsl(243,23%,24%)] rounded-xl shadow-md 
        border border-[hsl(240,6%,70%)] flex flex-col border-opacity-30 p-2 z-10 transition-all duration-300 origin-top transform 
        ${isOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"}`}
        >
            {days.map((day) => (
                <span
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`py-2 px-2 rounded-md cursor-pointer transition-all duration-200 ${selectedDay === day
                            ? "bg-[hsl(243,23%,40%)] text-white"
                            : "hover:bg-[hsl(243,23%,30%)] text-gray-200"
                        }`}
                >
                    {day}
                </span>
            ))}
        </div>
    );
}