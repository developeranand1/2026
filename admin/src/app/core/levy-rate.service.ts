import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LevyRate {
  _id?: string;
  state: string;
  city?: string;
  district: string;
  municipality?: string;
  zone?: string;
  mandiName?: string;
  commodity: string;
  hindiName?: string;
  cropName?: string;
  variety?: string;
  category?: string;
  propertyType?: string;
  propertySubType?: string;
  pricePerQuintal?: number;
  minPrice?: number;
  maxPrice?: number;
  modalPrice?: number;
  rate: number;
  rateUnit?: string;
  unit?: string;
  levyRate?: number;
  levyUnit?: string;
  calculationMethod?: string;
  assessmentYear?: string;
  effectiveFrom?: string | Date;
  effectiveTo?: string | Date;
  status: 'active' | 'inactive' | 'pending';
  source?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LevyRateApiResponse {
  success: boolean;
  count?: number;
  data: LevyRate[];
  message?: string;
}

export interface SingleLevyRateApiResponse {
  success: boolean;
  data: LevyRate;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LevyRateService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/levy-rates`;

  getLevyRates(filters?: { state?: string; district?: string; city?: string; commodity?: string; status?: string; search?: string }): Observable<LevyRateApiResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.state) params = params.set('state', filters.state);
      if (filters.district) params = params.set('district', filters.district);
      if (filters.city) params = params.set('city', filters.city);
      if (filters.commodity) params = params.set('commodity', filters.commodity);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.search) params = params.set('search', filters.search);
    }
    return this.http.get<LevyRateApiResponse>(this.apiUrl, { params });
  }

  getLevyRateById(id: string): Observable<SingleLevyRateApiResponse> {
    return this.http.get<SingleLevyRateApiResponse>(`${this.apiUrl}/${id}`);
  }

  createLevyRate(data: Partial<LevyRate>): Observable<SingleLevyRateApiResponse> {
    return this.http.post<SingleLevyRateApiResponse>(this.apiUrl, data);
  }

  updateLevyRate(id: string, data: Partial<LevyRate>): Observable<SingleLevyRateApiResponse> {
    return this.http.put<SingleLevyRateApiResponse>(`${this.apiUrl}/${id}`, data);
  }

  deleteLevyRate(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: string, status: 'active' | 'inactive' | 'pending'): Observable<SingleLevyRateApiResponse> {
    return this.http.patch<SingleLevyRateApiResponse>(`${this.apiUrl}/${id}/status`, { status });
  }
}
