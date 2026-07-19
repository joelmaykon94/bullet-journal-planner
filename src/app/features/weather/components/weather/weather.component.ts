import { Component, OnInit, signal, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherService } from '../../services/weather.service';
import { CITIES, CityWeatherData, CityCoordinates } from '../../models/weather.model';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.css'
})
export class WeatherComponent implements OnInit {
  protected readonly Math = Math;
  private readonly weatherService = inject(WeatherService);

  readonly cities = CITIES;
  readonly selectedCity = signal<CityCoordinates>(CITIES[0]);
  readonly weatherData = signal<Record<string, CityWeatherData>>({});
  readonly isLoading = signal<boolean>(true);
  readonly error = signal<string | null>(null);
  readonly showDetailModal = signal<boolean>(false);

  readonly activeData = computed(() => {
    const city = this.selectedCity();
    return this.weatherData()[city.name] || null;
  });

  readonly theme = computed(() => {
    const data = this.activeData();
    return data ? this.getThemeConfig(data.current.weatherCode, data.current.isDay) : this.getThemeConfig(0, 1);
  });

  async ngOnInit(): Promise<void> {
    await this.fetchAllWeatherData(true);
    setInterval(() => this.fetchAllWeatherData(false), 180000);
  }

  @HostListener('window:keydown.Escape')
  onEsc() {
    this.showDetailModal.set(false);
  }

  async fetchAllWeatherData(showLoader = false): Promise<void> {
    if (showLoader) this.isLoading.set(true);
    this.error.set(null);
    try {
      const dataMap: Record<string, CityWeatherData> = {};
      for (const city of this.cities) {
        dataMap[city.name] = await this.weatherService.getCityWeatherData(city);
      }
      this.weatherData.set(dataMap);
    } catch (err: any) {
      this.error.set(err.message || 'Erro ao carregar dados meteorológicos.');
    } finally {
      this.isLoading.set(false);
    }
  }

  selectCity(city: CityCoordinates): void {
    this.selectedCity.set(city);
  }

  formatHour(timeStr: string): string {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  }

  formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr + 'T00:00:00');
      const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' });
      const dayMonth = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      return `${weekday.toUpperCase()}, ${dayMonth}`;
    } catch {
      return dateStr;
    }
  }

  getWeatherLabel(code: number) {
    if (code === 0) return 'Céu Limpo';
    if ([1, 2, 3].includes(code)) return 'Nublado';
    if ([45, 48].includes(code)) return 'Nevoeiro';
    if ([51, 53, 55, 56, 57].includes(code)) return 'Garoa';
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Chuva';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Neve';
    if ([95, 96, 99].includes(code)) return 'Tempestade';
    return 'Instável';
  }

  getThemeConfig(code: number, isDay: number) {
    // Retorna classes tailwind focadas na estética de papel
    return { 
      cardBg: 'bg-stone-50', 
      borderColor: 'border-stone-200', 
      textTheme: 'text-stone-800'
    };
  }

  getWeatherIconTemplate(code: number): string {
    if (code === 0) return 'sun';
    if ([1, 2, 3].includes(code)) return 'cloud';
    if ([45, 48].includes(code)) return 'cloud-fog';
    if ([51, 53, 55, 56, 57].includes(code)) return 'cloud-drizzle';
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'cloud-rain';
    if ([71, 73, 75, 77, 85, 86].includes(code)) return 'cloud-snow';
    if ([95, 96, 99].includes(code)) return 'cloud-lightning';
    return 'thermometer';
  }
}
