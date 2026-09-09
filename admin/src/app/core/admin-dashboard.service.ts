import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getAdminStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/admin`);
  }

  seedAdminUser(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/seed-admin`, {});
  }

  getAllCrops(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/crops`);
  }

  getAllMandiRates(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/mandi-rates`);
  }
}
