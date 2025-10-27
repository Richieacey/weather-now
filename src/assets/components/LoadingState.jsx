import { getCoordinates, getForecast, getCityFromIP } from "../services/Api";
import { useState, useEffect } from "react"
import { useSettings } from "../contexts/settingsContext";
import DailyForecast from './DailyForecast'
import { DailyForecastNull } from "./DailyForecast";
import HourlySection from "./HourlySection";
import weatherImages from "../utils/weatherImages";
import DaySelector from "./DaySelector";

import {
    convertTemperature,
    convertWindSpeed,
    convertPrecipitation,
    round,
} from "../utils/conversion";

const navEntries = performance.getEntriesByType("navigation");
if (navEntries.length > 0 && navEntries[0].type === "reload") {
    localStorage.removeItem("wasSearching");
}


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


    const imageSrc = weatherImages[getCode] || "Unknown";



    useEffect(() => {
        localStorage.setItem('wasSearching', JSON.stringify(searching));
    }, [searching]);



    useEffect(() => {
        // only run on first page load (refresh)
        const wasSearching = JSON.parse(localStorage.getItem("wasSearching") || "false");


        if (!wasSearching) {
            setLoading(true);

            const CurrentLocationData = async () => {
                try {
                    const getCity = await getCityFromIP();
                    console.log(getCity);

                    let cityName = getCity === "too many requests" ? "Paris" : getCity;
                    if (getCity === "too many requests") setCity("Paris");
                    else setCity(cityName);

                    const data = await getCoordinates(cityName);
                    setCountry(data.country);

                    const foreCastDefaultData = await getForecast(data.latitude, data.longitude);
                    const currentTime = foreCastDefaultData.current_weather.time;
                    const code = foreCastDefaultData.current_weather.weathercode;
                    setCode(code);

                    const timeIndexData = foreCastDefaultData.hourly.time.findIndex(t => {
                        const diff = Math.abs(new Date(t) - new Date(currentTime));
                        return diff < 1800 * 1000;
                    });

                    setTimeIndex(timeIndexData);
                    setForecast(foreCastDefaultData);

                    const now = new Date();
                    const formattedDate = now.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    });
                    setDate(formattedDate);
                } catch (error) {
                    setError("Failed to get Data.");
                    console.error("Error fetching Data:", error);
                } finally {
                    setLoading(false);
                }
            };

            CurrentLocationData();
        }
    }, []); // empty dependency array = run ONLY once on refresh



    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        if (loading) return;

        setSearching(true);
        localStorage.setItem("wasSearching", "true");

        try {
            const data = await getCoordinates(searchQuery)
            setCountry(data.country)
            setCity(searchQuery)
            const foreCastData = await getForecast(data.latitude, data.longitude);
            const code = foreCastData.current_weather.weathercode;
            setCode(code)
            const currentTime = foreCastData.current_weather.time;
            const timeIndexData = foreCastData.hourly.time.findIndex(t => {
                const diff = Math.abs(new Date(t) - new Date(currentTime));
                return diff < 1800 * 1000; // within 30 minutes
            });
            const localDate = new Date(currentTime);
            const cityDate = localDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric"
            });
            setDate(cityDate)


            setTimeIndex(timeIndexData)
            setForecast(foreCastData)


            setError(null);
            setSearchQuery('')
        }
        catch (error) {
            console.log("Error getting data:", error);
            setError("No search result found!");
        }
        finally { setLoading(false); setSearching(false) }
    }

    const weatherMetrics = [
        { title: "Feels Like", value: "_" },
        { title: "Humidity", value: "_" },
        { title: "Wind", value: "_" },
        { title: "Precipitation", value: "_" }
    ];



    return (
        <>
            <div className='flex flex-col justify-center items-center'>
                <h1 className='font-grotesque text-[50px] text-center font-bold py-[50px]'>How's the sky looking today?</h1>
                <form onSubmit={handleSearch} className='flex flex-col md:flex-row gap-4 w-full md:w-[50%] relative'>
                    {searching && (
                        <>
                            <div className="absolute px-[50px] w-full md:w-[75%] h-[65px] rounded-lg bg-[hsl(243,27%,20%)] bottom-[-70px] z-10 flex flex-row gap-4 items-center">
                                <img
                                    src="./src/assets/images/icon-loading.svg"
                                    alt="Loading..."
                                    className="w-6 h-6 animate-spin"
                                />
                                <span>Searching in progress</span>
                            </div>
                        </>
                    )}

                    <img
                        src="./src/assets/images/icon-search.svg"
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
                // Show error message only
                <h1 className="error-message text-2xl text-center mt-8 font-semibold">
                    {error}
                </h1>
            ) : (

                <>


                    {loading ? (

                        <div className="flex flex-row w-[100%] mt-12 gap-8 mb-[50px]">
                            <div className="flex flex-col items-center w-[62.5%]">
                                <div className="bg-[hsl(243,23%,24%)] w-[100%] h-[286px] rounded-2xl relative flex items-center justify-center">
                                    <img src="./src/assets/images/icon-loading.svg" alt="Loading..." className="absolute w-16 h-16 animate-spin top-[110px]" />
                                    <span className="text-white text-sm font-semibold">Loading...</span>
                                </div>
                                <div className="flex flex-row gap-5 w-[100%] mt-8">
                                    {weatherMetrics.map((metric, index) => (
                                        <WeatherValues key={index} title={metric.title} value={metric.value} />
                                    ))}

                                </div>
                                <div className="flex flex-col w-[100%] justify-left mt-20">
                                    <span>Daily Forecast</span>
                                    <div className="flex flex-row gap-4 w-[100%] mt-6">
                                        {[...Array(7)].map((_, index) => (
                                            <DailyForecastNull key={index} />
                                        ))}

                                    </div>
                                </div>
                            </div>
                            <div className="w-[36.25%] h-auto bg-[hsl(243,23%,24%)] rounded-xl">

                            </div>
                        </div>



                    ) : (

                        <div className="flex flex-col md:flex-row w-full mt-12 gap-8 mb-[50px]">
                            <div className="flex flex-col items-center w-full md:w-[62.5%]">
                                <div className="bg-transparent w-full h-auto rounded-2xl relative flex items-center justify-center">
                                    <img src="./src/assets/images/bg-today-large.svg" className="w-full h-auto hidden md:block" alt="background image" />
                                    <img src="./src/assets/images/bg-today-small.svg" className="w-full h-auto block md:hidden" alt="background image" />

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
                                        timeIndex !== -1 && forecast?.hourly?.apparent_temperature?.[timeIndex] !== undefined
                                            ? `${convertTemperature(round(forecast.hourly.apparent_temperature[timeIndex]), selected.temperature)}°`
                                            : '_'
                                    } />

                                    <WeatherValues title={'Humidity'} value={
                                        timeIndex !== -1 && forecast?.hourly?.relative_humidity_2m?.[timeIndex] !== undefined
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
                                        timeIndex !== -1 && forecast?.hourly?.precipitation?.[timeIndex] !== undefined
                                            ? `${round(convertPrecipitation(forecast?.hourly?.precipitation?.[timeIndex], selected.precipitation))} ${selected.precipitation === "in" ? "in" : "mm" || "mm"}`
                                            : '_'
                                    }

                                    />

                                </div>
                                <div className="flex flex-col w-full justify-left mt-20">
                                    <span>Daily Forecast</span>
                                    <div className="flex flex-row flex-wrap md:flex-nowrap gap-4 w-full mt-6">
                                        {forecast?.daily?.time?.map((date, index) => (
                                            <DailyForecast
                                                key={date}
                                                day={new Date(date).toLocaleDateString("en-US", {
                                                    weekday: "short" // e.g. "Tue"
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
                    )}




                </>



            )}




        </>


    )
}