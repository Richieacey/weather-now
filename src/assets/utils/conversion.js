// src/utils/conversions.js

export function convertTemperature(value, unit) {
  if (value == null) return null;
  if (unit === "fahrenheit") return (value * 9) / 5 + 32;
  return value; // default: Celsius
}

export function convertWindSpeed(value, unit) {
  if (value == null) return null;
  if (unit === "mph") return value / 1.609;
  return value; // default: km/h
}

export function convertPrecipitation(value, unit) {
  if (value == null) return null;
  if (unit === "in") return value / 25.4;
  return value; // default: mm
}

export const round = (val) => Math.round(val);
