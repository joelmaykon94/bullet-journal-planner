export interface CityCoordinates {
  name: string;
  latitude: number;
  longitude: number;
}

export const CITIES: CityCoordinates[] = [
  { name: 'Natal', latitude: -5.7944, longitude: -35.211 },
  { name: 'Parnamirim', latitude: -5.9156, longitude: -35.2628 },
  { name: 'Macaíba', latitude: -5.8583, longitude: -35.3528 }
];

export interface CurrentWeather {
  time: string;
  temperature: number;
  precipitation: number;
  rain: number;
  weatherCode: number;
  isDay: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  precipitation: number;
  rain: number;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
  rainSum: number;
  weatherCode: number;
}

export interface CityWeatherData {
  cityName: string;
  latitude: number;
  longitude: number;
  current: CurrentWeather;
  pastHourly: HourlyForecast[];
  futureHourly: HourlyForecast[];
  dailyForecasts: DailyForecast[];
}
