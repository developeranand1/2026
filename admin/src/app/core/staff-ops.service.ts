import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class StaffOpsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private baseUrl = environment.apiUrl;

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ==================== OFFICE FUNDS & INVESTORS ====================
  getFundOverview(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/office-fund/overview`, { headers: this.getHeaders() });
  }

  getFundTransactions(filterParams: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.keys(filterParams).forEach(key => {
      if (filterParams[key]) params = params.set(key, filterParams[key]);
    });
    return this.http.get<any>(`${this.baseUrl}/office-fund/transactions`, { headers: this.getHeaders(), params });
  }

  recordFundTransaction(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/office-fund/transactions`, payload, { headers: this.getHeaders() });
  }

  // ==================== STAFF & HR MANAGEMENT ====================
  getAllStaff(filterParams: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.keys(filterParams).forEach(key => {
      if (filterParams[key]) params = params.set(key, filterParams[key]);
    });
    return this.http.get<any>(`${this.baseUrl}/staff`, { headers: this.getHeaders(), params });
  }

  createStaff(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/staff`, payload, { headers: this.getHeaders() });
  }

  updateStaff(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/staff/${id}`, payload, { headers: this.getHeaders() });
  }

  toggleStaffStatus(id: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/staff/${id}/toggle-status`, {}, { headers: this.getHeaders() });
  }

  // ==================== FIELD WORK & GPS TRACKING ====================
  getAllFieldWork(filterParams: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.keys(filterParams).forEach(key => {
      if (filterParams[key]) params = params.set(key, filterParams[key]);
    });
    return this.http.get<any>(`${this.baseUrl}/field-work/all`, { headers: this.getHeaders(), params });
  }

  verifyFieldWork(id: string, remarks: string = ''): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/field-work/${id}/verify`, { remarks }, { headers: this.getHeaders() });
  }

  // ==================== EXPENSE CLAIMS & DISBURSEMENTS ====================
  getAllExpenses(filterParams: any = {}): Observable<any> {
    let params = new HttpParams();
    Object.keys(filterParams).forEach(key => {
      if (filterParams[key]) params = params.set(key, filterParams[key]);
    });
    return this.http.get<any>(`${this.baseUrl}/expenses/all`, { headers: this.getHeaders(), params });
  }

  reviewExpenseByHr(id: string, action: 'APPROVE' | 'REJECT', remarks: string = ''): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/expenses/${id}/hr-review`, { action, remarks }, { headers: this.getHeaders() });
  }

  reimburseExpense(id: string, payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/expenses/${id}/reimburse`, payload, { headers: this.getHeaders() });
  }
}
