import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private http = inject(HttpClient);
  // private baseUrl = 'http://localhost:5000/api';
private baseUrl = 'https://api.krisimarg.com/api';

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
