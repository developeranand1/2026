import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CenterWorker {
  _id?: string;
  name: string;
  role: string;
  contactNumber?: string;
  email?: string;
  status: 'active' | 'inactive';
  joiningDate?: string;
}

export interface CenterDirector {
  name: string;
  contactNumber?: string;
  email?: string;
  designation?: string;
}

export interface CenterHelpingStaff {
  name: string;
  contactNumber?: string;
  role?: string;
}

export interface Center {
  _id: string;
  centerName: string;
  image?: string;
  address: string;
  pinCode: string;
  openingTime: string;
  helplineNumber: string;
  director: CenterDirector;
  helpingStaff?: CenterHelpingStaff;
  workers?: CenterWorker[];
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CentersResponse {
  success: boolean;
  total: number;
  page?: number;
  pages?: number;
  data: Center[];
}

export interface SingleCenterResponse {
  success: boolean;
  data: Center;
}

@Injectable({
  providedIn: 'root'
})
export class CenterService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/centers`;

  /**
   * Fetch all active/public centers with optional search and pincode filter
   */
  getCenters(search?: string, pinCode?: string, status: string = 'active'): Observable<CentersResponse> {
    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (pinCode && pinCode.trim()) {
      params = params.set('pinCode', pinCode.trim());
    }
    if (status && status !== 'all') {
      params = params.set('status', status);
    }
    return this.http.get<CentersResponse>(this.apiUrl, { params });
  }

  /**
   * Fetch single center by ID
   */
  getCenterById(id: string): Observable<SingleCenterResponse> {
    return this.http.get<SingleCenterResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Generates Google Maps Directions / Search link for a center
   */
  getGoogleMapsUrl(center: Center): string {
    const query = `${center.centerName}, ${center.address}, ${center.pinCode}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  /**
   * Generates direct WhatsApp helpline URL
   */
  getWhatsAppUrl(center: Center): string {
    const rawNumber = (center.helplineNumber || '').replace(/\D/g, '');
    const phone = rawNumber.length === 10 ? `91${rawNumber}` : rawNumber;
    const msg = `नमस्ते! मुझे ${center.centerName} (${center.address}) के बारे में जानकारी और फसल खरीद टोकन की सहायता चाहिए।`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }

  /**
   * Generates tel: call link
   */
  getTelLink(phone?: string): string {
    if (!phone) return '#';
    const clean = phone.replace(/[^\d+]/g, '');
    return `tel:${clean}`;
  }
}
