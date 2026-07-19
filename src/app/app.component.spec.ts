import { TestBed } from '@angular/core/testing';
import { App } from './app.component';
import { WeatherService } from './features/weather/services/weather.service';
import { vi } from 'vitest';

describe('App', () => {
  let mockWeatherService: any;

  beforeEach(async () => {
    mockWeatherService = {
      getCityWeatherData: vi.fn().mockResolvedValue({
        cityName: 'Natal',
        latitude: -5.7944,
        longitude: -35.211,
        current: {
          time: '2026-07-11T12:00',
          temperature: 26.5,
          precipitation: 0.2,
          rain: 0.1,
          weatherCode: 1
        },
        pastHourly: [],
        futureHourly: [],
        dailyForecasts: []
      })
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        { provide: WeatherService, useValue: mockWeatherService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Painel Meteorológico Metropolitano');
  });
});
