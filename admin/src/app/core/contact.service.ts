import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactInquiry {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'Pending' | 'In Progress' | 'Contacted' | 'Resolved' | 'Closed';
  adminRemark?: string;
  contactedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactApiResponse {
  success: boolean;
  count: number;
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    contacted: number;
    resolved: number;
  };
  data: ContactInquiry[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminContactService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api/contact';

  getInquiries(status?: string, search?: string): Observable<ContactApiResponse> {
    let params = new HttpParams();
    if (status && status !== 'All') {
      params = params.set('status', status);
    }
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<ContactApiResponse>(this.baseUrl, { params });
  }

  getInquiryById(id: string): Observable<{ success: boolean; data: ContactInquiry }> {
    return this.http.get<{ success: boolean; data: ContactInquiry }>(`${this.baseUrl}/${id}`);
  }

  updateInquiry(id: string, status: string, adminRemark: string): Observable<{ success: boolean; message: string; data: ContactInquiry }> {
    return this.http.put<{ success: boolean; message: string; data: ContactInquiry }>(`${this.baseUrl}/${id}`, {
      status,
      adminRemark
    });
  }

  deleteInquiry(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }
}
