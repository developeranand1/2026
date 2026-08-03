import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MandiRateService {
  private http = inject(HttpClient);
  private backendUrl = 'http://localhost:5000/api/mandi-rates';

  /**
   * Performs reverse geocoding via OpenStreetMap Nominatim
   */
  reverseGeocode(lat: number, lon: number): Observable<any> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
    return this.http.get<any>(url);
  }

  /**
   * Fetches live market prices and matching crop listings from backend
   */
  getLiveRates(state: string, district?: string, commodity?: string): Observable<any> {
    let url = `${this.backendUrl}/live?state=${encodeURIComponent(state)}`;
    if (district) {
      url += `&district=${encodeURIComponent(district)}`;
    }
    if (commodity) {
      url += `&commodity=${encodeURIComponent(commodity)}`;
    }
    return this.http.get<any>(url);
  }
}
