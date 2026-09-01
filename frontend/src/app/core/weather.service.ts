import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment.prod';


export interface WeatherHourlyItem {
  time: string;
  hourLabel: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  rainProb: number;
  rainVol: number;
  windSpeed: number;
  uvIndex: number;
  condition: string;
  icon: string;
  isRain: boolean;
}

export interface WeatherDailyItem {
  date: string;
  dayLabel: string;
  dateFormatted: string;
  maxTemp: number;
  minTemp: number;
  rainProbMax: number;
  rainSum: number;
  condition: string;
  icon: string;
  sunrise: string;
  sunset: string;
  uvMax: number;
  windMax: number;
}

export interface WeatherAdvisoryItem {
  title: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  icon: string;
  advice: string;
}

export interface WeatherResponse {
  success: boolean;
  source: string;
  location: {
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    elevation: number;
    timezone: string;
  };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    condition: string;
    icon: string;
    isRain: boolean;
    precipitation: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
    cloudCover: number;
    time: string;
  };
  rainAlert: {
    hasRain: boolean;
    message: string;
    timing: string;
    probability: number;
  };
  hourlyForecast: WeatherHourlyItem[];
  dailyForecast: WeatherDailyItem[];
  advisories: WeatherAdvisoryItem[];
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/weather`;

  getLiveWeather(city?: string, state?: string, lat?: number, lon?: number): Observable<WeatherResponse> {
    let params = new HttpParams();
    if (city) params = params.set('city', city);
    if (state) params = params.set('state', state);
    if (lat !== undefined && lon !== undefined) {
      params = params.set('lat', lat.toString()).set('lon', lon.toString());
    }

    return this.http.get<WeatherResponse>(this.apiUrl, { params }).pipe(
      catchError(err => {
        console.error('WeatherService HTTP Error:', err);
        throw err;
      })
    );
  }

  reverseGeocode(lat: number, lon: number): Observable<any> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
    return this.http.get(url).pipe(
      catchError(() => of(null))
    );
  }
}
