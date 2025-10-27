export async function getCoordinates (query){
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`)
  const data = await response.json();
  const { latitude, longitude, country } = data.results[0]
  return {latitude, longitude, country}
}

export async function getForecast (lat, long){
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(long)}&current_weather=true&hourly=apparent_temperature,precipitation,relative_humidity_2m,temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&models=gem_seamless`)
    const data = await response.json();
    return (data)
}

export async function getCityFromIP() {
  try {
    const response = await fetch('https://ipinfo.io/json');
    const data = await response.json();
    if (data && data.city) {
      console.log(`${data.city}`);
      return data.city;
    } else {
      console.log('Could not determine city from IP.');
      return 'too many requests';
    }
  } catch (error) {
    console.error('Error fetching IP-based location:', error);
    return 'too many requests';
  }
}
