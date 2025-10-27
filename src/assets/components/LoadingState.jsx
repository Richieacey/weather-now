import { getCoordinates, getForecast, getCityFromIP } from "../services/Api";
import { useState, useEffect } from "react"
import { useSettings } from "../contexts/settingsContext";
import DailyForecast, { DailyForecastNull } from './DailyForecast'
import HourlySection from "./HourlySection";
import weatherImages from "../utils/weatherImages";
import DaySelector from "./DaySelector";

import {
    convertTemperature,
    convertWindSpeed,
    convertPrecipitation,
    round,
} from "../utils/conversion";


export function WeatherValues({ title, value }) {
    return (
        <div className="bg-[hsl(243,27%,20%)] flex-auto w-[150px] md:w-1/3 h-[130px] rounded-xl flex flex-col px-4 py-4">
            <span className="font-sans text-lg">{title}</span>
            <span className="whitespace-nowrap block font-sans text-4xl pt-4">{value}</span>
        </div>
    )
}




export default function LoadingState() {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searching, setSearching] = useState(false);
    const [forecast, setForecast] = useState(null);
    const [timeIndex, setTimeIndex] = useState(null);
    const [country, setCountry] = useState(null);
    const [city, setCity] = useState(null);
    const [getDate, setDate] = useState(null);
    const [getCode, setCode] = useState(null);
    const { selected } = useSettings();
    const [isOpen, setIsOpen] = useState(false);
    
    // NEW STATE: Tracks if the app has ever loaded data successfully since mount/refresh.
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);


    const imageSrc = weatherImages[getCode] || "Unknown";

    // Centralized fetch and processing function
    const fetchWeather = async (cityName) => {
        // Set loading *only if* it's the very first load (forecast is null)
        // or if it's a search operation.
        if (!forecast || !hasLoadedOnce) {
            setLoading(true);
        }
        setError(null);
        
        try {
            // 1. Get Coordinates
            const data = await getCoordinates(cityName);

            // 2. Get Forecast
            const foreCastData = await getForecast(data.latitude, data.longitude);

            // 3. Extract and Format Data
            const currentTime = foreCastData.current_weather.time;
            const code = foreCastData.current_weather.weathercode;
            
            // Find the index using the 30-minute tolerance window (your original method)
            let timeIndexData = foreCastData.hourly.time.findIndex(t => {
                const diff = Math.abs(new Date(t) - new Date(currentTime));
                return diff < 1800 * 1000;
            });


            if (timeIndexData === -1) {
                // Fallback: Use the index of the first hourly entry as a guarantee
                // This ensures data for humidity, etc., is always available.
                timeIndexData = 0; 
                console.warn("Could not find precise current time index. Falling back to the first hourly entry.");
            }
            // 4. Format Date and Update State
            const localDate = new Date(currentTime);
            const cityDate = localDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: foreCastData.timezone
            });
            
            setCountry(data.country);
            setCity(cityName);
            setCode(code);
            setDate(cityDate);
            setTimeIndex(timeIndexData);
            setForecast(foreCastData);
            
            // Critical change: Mark data as loaded successfully
            setHasLoadedOnce(true);

        } catch (error) {
            console.error("Error fetching weather data:", error);
            const errorMessage = "No search result found!";
            setError(errorMessage);
            setForecast(null);
        } finally {
            setLoading(false);
        }
    };
    
    // Initial Load Logic (runs only on mount if no data is present)
    useEffect(() => {
        // Only run if we don't have data yet
        if (!forecast) { 
            const CurrentLocationData = async () => {
                try {
                    // This sets loading for the initial skeleton display
                    setLoading(true); 
                    const getCity = await getCityFromIP();
                    let cityName = getCity === "too many requests" ? "Paris" : getCity;
                    
                    if (getCity === "too many requests") setCity("Paris");
                    
                    await fetchWeather(cityName); 
                } catch (error) {
                    console.error("Initial data error:", error);
                    setError("Failed to get Data.");
                    setLoading(false);
                }
            };

            CurrentLocationData();
        }
    }, []); 


    // Search Handler (now only sets `searching` flag, not `loading`)
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim() || searching) return;
        
        setSearching(true);
        
        await fetchWeather(searchQuery);
        
        setSearchQuery('');
        setSearching(false);
    }

    const weatherMetrics = [
        { title: "Feels Like", value: "_" },
        { title: "Humidity", value: "_" },
        { title: "Wind", value: "_" },
        { title: "Precipitation", value: "_" }
    ];

    // DETERMINES SKELETON: Show skeleton ONLY if loading AND it hasn't loaded once before.
    const shouldShowSkeleton = loading && !hasLoadedOnce;


    return (
        <main>
            <div className='flex flex-col justify-center items-center'>
                <h1 className='font-grotesque text-[50px] text-center font-bold py-[50px]'>How's the sky looking today?</h1>
                <form onSubmit={handleSearch} className='flex flex-col md:flex-row gap-4 w-full md:w-[50%] relative'>
                    {searching && (
                        <>
                            <div className="absolute px-[50px] w-full md:w-[75%] h-[65px] rounded-lg bg-[hsl(243,27%,20%)] bottom-[-70px] z-10 flex flex-row gap-4 items-center">
                                <img
                                    src="https://o5vtbz71klu9q45y.public.blob.vercel-storage.com/icon-loading.svg"
                                    alt="Loading..."
                                    className="w-6 h-6 animate-spin"
                                />
                                <span>Searching in progress</span>
                            </div>
                        </>
                    )}

                    <img
                        src="https://o5vtbz71klu9q45y.public.blob.vercel-storage.com/icon-search.svg"
                        className="absolute top-[15px] left-[15px]"
                        alt="search"
                    />

                    <input
                        type="text"
                        placeholder="Search for a place..."
                        className="py-3 px-[50px] w-full md:w-[75%] font-sans rounded-lg text-white placeholder-[hsl(250, 6%, 84%)] bg-[hsl(243,27%,20%)]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className='bg-[hsl(233,67%,56%)] py-4 md:py-auto px-6 font-sans rounded-lg focus:ring-2 focus:ring-white-500'>Search</button>


                </form>
            </div>

            {error ? (
                <h1 className="error-message text-2xl text-center mt-8 font-semibold">
                    {error}
                </h1>
            ) : (

                <>
                    {/* CONDITION CORRECTED: Only show skeleton if it's the first time loading */}
                    {shouldShowSkeleton ? (

                        <div className="flex flex-row w-[100%] mt-12 gap-8 mb-[50px]">
                            <div className="flex flex-col items-center w-full md:w-[62.5%]">
                                <div className="bg-[hsl(243,23%,24%)] w-[100%] h-[286px] rounded-2xl relative flex items-center justify-center">
                                    <img src="https://o5vtbz71klu9q45y.public.blob.vercel-storage.com/icon-loading.svg" alt="Loading..." className="absolute w-16 h-16 animate-spin top-[110px]" />
                                    <span className="text-white text-sm font-semibold">Loading...</span>
                                </div>
                                <div className="flex flex-row flex-wrap md:flex-nowrap gap-5 w-full mt-8">
                                    {weatherMetrics.map((metric, index) => (
                                        <WeatherValues key={index} title={metric.title} value={metric.value} />
                                    ))}

                                </div>
                                <div className="flex flex-col w-full justify-left mt-20">
                                    <span>Daily Forecast</span>
                                    <div className="flex flex-row gap-4 w-[100%] mt-6">
                                        {[...Array(7)].map((_, index) => (
                                            <DailyForecastNull key={index} />
                                        ))}

                                    </div>
                                </div>
                            </div>
                            <div className="w-1/8 md:w-[36.25%] h-auto  bg-[hsl(243,23%,24%)] rounded-xl">

                            </div>
                        </div>



                    ) : (
                        // Regular content only shows if initial data loaded OR if we are currently searching 
                        // (in which case, `loading` is false and `hasLoadedOnce` is true)
                        forecast && (
                            <div className="flex flex-col md:flex-row w-full mt-12 gap-8 mb-[50px]">
                                <div className="flex flex-col items-center w-full md:w-[62.5%]">
                                    <div className="bg-transparent w-full h-auto rounded-2xl relative flex items-center justify-center">
                                        <img src="https://o5vtbz71klu9q45y.public.blob.vercel-storage.com/bg-today-large.svg" className="w-full h-auto hidden md:block" alt="background image" />
                                        <img src="https://o5vtbz71klu9q45y.public.blob.vercel-storage.com/bg-today-small.svg" className="w-full h-auto block md:hidden" alt="background image" />

                                        <div className="flex flex-col absolute gap-6 left-10 items-center md:items-start top-12 md:top-auto">
                                            <span className="font-sans text-2xl">{city}, {country}</span>
                                            <span>{getDate}</span>
                                        </div>
                                        <div className="flex flex-row absolute bottom-[-30px] left-1/2 -translate-x-[120px] -translate-y-1/2 items-center
                                                md:bottom-auto md:left-auto md:-translate-x-0 md:-translate-y-0 md:right-10">
                                            <img src={imageSrc ? imageSrc : ''} className="w-[120px]" alt="weather-icon" />
                                            <span className="font-grotesque text-8xl italic">{forecast?.current_weather ? `${round(convertTemperature(forecast.current_weather.temperature, selected.temperature))}°` : ''}</span>
                                        </div>

                                    </div>
                                    <div className="flex flex-row flex-wrap md:flex-nowrap gap-5 w-full mt-8">
                                        <WeatherValues title={'Feels Like'} value={
                                            timeIndex !== null && timeIndex !== -1 && forecast?.hourly?.apparent_temperature?.[timeIndex] !== undefined
                                                ? `${round(convertTemperature(forecast.hourly.apparent_temperature[timeIndex], selected.temperature))}°`
                                                : '_'
                                        } />

                                        <WeatherValues title={'Humidity'} value={
                                            timeIndex !== null && timeIndex !== -1 && forecast?.hourly?.relative_humidity_2m?.[timeIndex] !== undefined
                                                ? `${forecast.hourly.relative_humidity_2m[timeIndex]}%`
                                                : '_'
                                        }

                                        />
                                        <WeatherValues title={'Wind'} value={
                                            forecast?.current_weather?.windspeed !== undefined
                                                ? `${round(convertWindSpeed(forecast.current_weather.windspeed, selected.wind))} ${selected.wind === "mph" ? "mph" : "km/h"}`
                                                : "_"
                                        } />

                                        <WeatherValues title={'Precipitation'} value={
                                            timeIndex !== null && timeIndex !== -1 && forecast?.hourly?.precipitation?.[timeIndex] !== undefined
                                                ? `${round(convertPrecipitation(forecast?.hourly?.precipitation?.[timeIndex], selected.precipitation))} ${selected.precipitation === "in" ? "in" : "mm" || "mm"}`
                                                : '_'
                                        }

                                        />

                                    </div>
                                    <div className="flex flex-col w-full justify-left mt-20">
                                        <span>Daily Forecast</span>
                                        <div className="flex flex-row flex-wrap md:flex-nowrap gap-4 w-full mt-6">
                                            {forecast.daily.time.map((date, index) => (
                                                <DailyForecast
                                                    key={date}
                                                    day={new Date(date).toLocaleDateString("en-US", {
                                                        weekday: "short"
                                                    })}
                                                    image_source={`${weatherImages[forecast.daily.weathercode[index]]}`}
                                                    temp_max={`${round(convertTemperature(forecast.daily.temperature_2m_max[index], selected.temperature))}°`}
                                                    temp_min={`${round(convertTemperature(forecast.daily.temperature_2m_min[index], selected.temperature))}°`}
                                                />
                                            ))}


                                        </div>
                                    </div>
                                </div>
                                <div className="w-1/8 md:w-[36.25%] h-auto bg-[hsl(243,27%,20%)] rounded-xl flex flex-col p-6 relative">
                                    <HourlySection forecast={forecast} selected={selected} />

                                    <DaySelector isOpen={isOpen} />

                                </div>
                            </div>
                        )
                    )}
                </>
            )}
        </main>
    )
}