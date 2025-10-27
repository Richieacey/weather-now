export default function HourlyForecast({image_source, time, temperature}) {
    return (
        <div className="flex flex-col h-1/4 gap-6">
            <div className="flex flex-row items-center justify-between px-4 py-1 bg-[hsl(243,23%,24%)] rounded-lg">
                <div className="flex flex-row items-center gap-[10px]">
                    <img src={image_source} className="w-[60px]" alt="weather-icon" />
                    <span>{time}</span>
                </div>
                <span>{temperature}</span>
            </div>
        </div>
    )
}