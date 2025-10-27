export default function DailyForecast({ day, image_source, temp_max, temp_min }) {
    return (
        <div className="bg-[hsl(243,23%,24%)] flex-auto max-w-[80px] md:max-w-none h-[180px] rounded-xl flex flex-col justify-center items-center gap-5">
            <span className="font-sans font-bold">{day}</span>
            <img src={image_source} className="w-[70px]" alt="weather-icon" />
            <div className="flex flex-row justify-between gap-6">
                <span>{temp_max}</span>
                <span>{temp_min}</span>
            </div>
        </div>
    )
}

export function DailyForecastNull(){
    return (
        <div className="bg-[hsl(243,23%,24%)] flex-auto max-w-[80px] md:max-w-none h-[180px] rounded-xl flex flex-col justify-center items-center gap-5">
           
        </div>
    )
}