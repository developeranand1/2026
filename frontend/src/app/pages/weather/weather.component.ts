import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WeatherService, WeatherResponse, WeatherHourlyItem, WeatherDailyItem, WeatherAdvisoryItem } from '../../core/weather.service';
import { 
  getAllIndianStates, 
  getDistrictsForState, 
  INDIA_STATES_DISTRICTS 
} from '../../core/india-locations.data';

@Component({
  selector: 'app-weather-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.scss'
})
export class WeatherPageComponent implements OnInit {
  private weatherService = inject(WeatherService);

  isLoading = true;
  isLocating = false;
  errorMessage = '';

  selectedState = 'Uttar Pradesh';
  selectedDistrict = 'Gorakhpur';
  searchQuery = '';

  readonly statesList: string[] = getAllIndianStates();
  districtsList: string[] = [];
  readonly locationDb = INDIA_STATES_DISTRICTS;

  weatherData: WeatherResponse | null = null;
  activeHourlyGraphTab: 'rain' | 'temp' | 'wind' = 'rain';
  selectedHourlyItem: WeatherHourlyItem | null = null;

  ngOnInit(): void {
    this.updateDistricts();
    this.autoDetectOrFetch();
  }

  updateDistricts(): void {
    this.districtsList = getDistrictsForState(this.selectedState);
    if (!this.districtsList.includes(this.selectedDistrict) && this.districtsList.length > 0) {
      this.selectedDistrict = this.districtsList[0];
    }
  }

  onStateChange(): void {
    this.updateDistricts();
    this.fetchWeather();
  }

  onDistrictChange(): void {
    this.fetchWeather();
  }

  getStateHindi(stateName: string): string {
    return this.locationDb[stateName]?.hindiName || stateName;
  }

  autoDetectOrFetch(): void {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      this.isLocating = true;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          this.weatherService.reverseGeocode(lat, lon).subscribe({
            next: (geo) => {
              this.isLocating = false;
              if (geo && geo.address) {
                const state = geo.address.state;
                const district = geo.address.state_district || geo.address.county || geo.address.city;
                if (state) {
                  const matched = this.statesList.find(s => s.toLowerCase() === state.toLowerCase());
                  if (matched) {
                    this.selectedState = matched;
                    this.updateDistricts();
                  }
                }
                if (district) {
                  const cleanDistrict = district.replace(/District/i, '').trim();
                  const matchedDistrict = this.districtsList.find(d => d.toLowerCase().includes(cleanDistrict.toLowerCase()));
                  if (matchedDistrict) this.selectedDistrict = matchedDistrict;
                }
              }
              this.fetchWeather(lat, lon);
            },
            error: () => {
              this.isLocating = false;
              this.fetchWeather();
            }
          });
        },
        (err) => {
          this.isLocating = false;
          this.fetchWeather();
        },
        { timeout: 6000 }
      );
    } else {
      this.fetchWeather();
    }
  }

  fetchWeather(lat?: number, lon?: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.weatherService.getLiveWeather(this.selectedDistrict, this.selectedState, lat, lon).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.success) {
          this.weatherData = res;
          if (res.hourlyForecast && res.hourlyForecast.length > 0) {
            this.selectedHourlyItem = res.hourlyForecast[0];
          }
        } else {
          this.errorMessage = 'Failed to load meteorological forecast data.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Weather load error:', err);
        this.errorMessage = 'Unable to connect to live meteorological server. Please check your network connection.';
      }
    });
  }

  selectHour(item: WeatherHourlyItem): void {
    this.selectedHourlyItem = item;
  }

  getRainBarHeight(prob: number): string {
    return `${Math.max(10, prob)}%`;
  }

  getTempBarHeight(temp: number): string {
    const minT = 15;
    const maxT = 45;
    const pct = Math.min(100, Math.max(15, ((temp - minT) / (maxT - minT)) * 100));
    return `${pct}%`;
  }

  getWindBarHeight(speed: number): string {
    const pct = Math.min(100, Math.max(15, (speed / 40) * 100));
    return `${pct}%`;
  }
}
