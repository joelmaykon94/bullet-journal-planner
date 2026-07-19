import { Injectable } from '@angular/core';
import { CityCoordinates, CityWeatherData, HourlyForecast, DailyForecast } from '../models/weather.model';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private readonly baseUrl = 'https://api.open-meteo.com/v1/forecast';

  async getCityWeatherData(city: CityCoordinates): Promise<CityWeatherData> {
    const url = `${this.baseUrl}?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,precipitation,rain,weather_code,is_day&hourly=temperature_2m,precipitation,rain,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,weather_code&timezone=America/Fortaleza&past_days=2`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data for ${city.name}`);
    }

    const data = await response.json();
    
    // Parse current weather
    const current = {
      time: data.current.time,
      temperature: data.current.temperature_2m,
      precipitation: data.current.precipitation,
      rain: data.current.rain,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day
    };

    // Find the hourly index that matches current time (or is closest to it)
    const currentHourStr = data.current.time.substring(0, 13) + ':00';
    let currentIndex = data.hourly.time.findIndex((t: string) => t.startsWith(currentHourStr));
    if (currentIndex === -1) {
      // Fallback: use current time comparison
      const nowMs = new Date(data.current.time).getTime();
      currentIndex = data.hourly.time.reduce((closestIdx: number, timeStr: string, idx: number) => {
        const diff = Math.abs(new Date(timeStr).getTime() - nowMs);
        const closestDiff = Math.abs(new Date(data.hourly.time[closestIdx]).getTime() - nowMs);
        return diff < closestDiff ? idx : closestIdx;
      }, 0);
    }

    // Extract past hourly forecasts (last 12 hours before current)
    const pastHourly: HourlyForecast[] = [];
    const startPastIdx = Math.max(0, currentIndex - 12);
    for (let i = startPastIdx; i < currentIndex; i++) {
      pastHourly.push({
        time: data.hourly.time[i],
        temperature: data.hourly.temperature_2m[i],
        precipitation: data.hourly.precipitation[i],
        rain: data.hourly.rain[i]
      });
    }

    // Extract future hourly forecasts (next 12 hours after current)
    const futureHourly: HourlyForecast[] = [];
    const endFutureIdx = Math.min(data.hourly.time.length, currentIndex + 13);
    for (let i = currentIndex + 1; i < endFutureIdx; i++) {
      futureHourly.push({
        time: data.hourly.time[i],
        temperature: data.hourly.temperature_2m[i],
        precipitation: data.hourly.precipitation[i],
        rain: data.hourly.rain[i]
      });
    }

    // Extract daily forecast (next 5 days, starting from today/tomorrow)
    const dailyForecasts: DailyForecast[] = [];
    // We only take the next 5 days
    const dailyCount = Math.min(5, data.daily.time.length);
    for (let i = 0; i < dailyCount; i++) {
      dailyForecasts.push({
        date: data.daily.time[i],
        tempMax: data.daily.temperature_2m_max[i],
        tempMin: data.daily.temperature_2m_min[i],
        precipitationSum: data.daily.precipitation_sum[i],
        rainSum: data.daily.rain_sum[i],
        weatherCode: data.daily.weather_code[i]
      });
    }

    return {
      cityName: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      current,
      pastHourly,
      futureHourly,
      dailyForecasts
    };
  }
}
