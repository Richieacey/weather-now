

export function convertTemperature(value, unit) {
  if (value == null) return null;
  if (unit === "fahrenheit") return (value * 9) / 5 + 32;
  return value;
}

export function convertWindSpeed(value, unit) {
  if (value == null) return null;
  if (unit === "mph") return value / 1.609;
  return value; 
}

export function convertPrecipitation(value, unit) {
  if (value == null) return null;
  if (unit === "in") return value / 25.4;
  return value; 
}

export const round = (val) => Math.round(val);
