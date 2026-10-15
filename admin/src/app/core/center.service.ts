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
  joiningDate?: string | Date;
}

export interface CenterDirector {
  name: string;
  contactNumber?: string;
  email?: string;
  designation?: string;
}

export interface CenterHelpingStaff {
  name?: string;
  contactNumber?: string;
  role?: string;
}

export interface Center {
  _id?: string;
  centerName: string;
  image?: string;
  address: string;
  pinCode: string;
  openingTime: string;
  helplineNumber: string;
  director: CenterDirector;
  helpingStaff?: CenterHelpingStaff;
  workers: CenterWorker[];
  status: 'active' | 'inactive';
  createdBy?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface CenterApiResponse {
  success: boolean;
  total?: number;
  page?: number;
  pages?: number;
  data: Center[];
  message?: string;
}

export interface SingleCenterApiResponse {
  success: boolean;
  data: Center;
  message?: string;
}

export interface CenterSellerPayment {
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
  paymentStatus: 'Paid' | 'Pending' | 'Partial';
  paidAmount: number;
  dueAmount: number;
  transactionId?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
}

export interface CenterSellerEntry {
  _id?: string;
  center: string | Center;
  tokenNumber: string;
  farmer?: any;
  farmerName: string;
  farmerMobile: string;
  village?: string;
  cropName: string;
  variety?: string;
  quantity: number;
  expectedQuantity?: number;
  unit: string;
  pricePerQuintal: number;
  totalAmount: number;
  sellingDate?: string | Date;
  paymentDetails: CenterSellerPayment;
  status: 'Token Issued' | 'Weighed & Verified' | 'Payment Completed' | 'Cancelled';
  weighedBy?: string;
  notes?: string;
  entryDate?: string | Date;
  createdAt?: string;
}

export interface CenterSellerSummary {
  totalSellers: number;
  totalQuantityQuintal: number;
  totalPayout: number;
  totalPaid: number;
  totalDue: number;
}

export interface CenterSellersApiResponse {
  success: boolean;
  summary: CenterSellerSummary;
  data: CenterSellerEntry[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CenterService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/centers`;

  getCenters(filters?: { search?: string; pinCode?: string; status?: string; page?: number; limit?: number }): Observable<CenterApiResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.pinCode) params = params.set('pinCode', filters.pinCode);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }
    return this.http.get<CenterApiResponse>(this.apiUrl, { params });
  }

  getCenterById(id: string): Observable<SingleCenterApiResponse> {
    return this.http.get<SingleCenterApiResponse>(`${this.apiUrl}/${id}`);
  }

  createCenter(data: Partial<Center>): Observable<SingleCenterApiResponse> {
    return this.http.post<SingleCenterApiResponse>(this.apiUrl, data);
  }

  updateCenter(id: string, data: Partial<Center>): Observable<SingleCenterApiResponse> {
    return this.http.put<SingleCenterApiResponse>(`${this.apiUrl}/${id}`, data);
  }

  deleteCenter(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }

  uploadImage(image: string): Observable<{ success: boolean; imageUrl: string }> {
    return this.http.post<{ success: boolean; imageUrl: string }>(`${this.apiUrl}/upload-image`, { image });
  }

  addWorker(centerId: string, worker: Partial<CenterWorker>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${centerId}/workers`, worker);
  }

  updateWorker(centerId: string, workerId: string, worker: Partial<CenterWorker>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${centerId}/workers/${workerId}`, worker);
  }

  removeWorker(centerId: string, workerId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${centerId}/workers/${workerId}`);
  }

  // Farmer / Seller Procurement Methods
  getCenterSellers(centerId: string, filters?: { search?: string; cropName?: string; paymentStatus?: string }): Observable<CenterSellersApiResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.cropName) params = params.set('cropName', filters.cropName);
      if (filters.paymentStatus) params = params.set('paymentStatus', filters.paymentStatus);
    }
    return this.http.get<CenterSellersApiResponse>(`${this.apiUrl}/${centerId}/sellers`, { params });
  }

  addCenterSeller(centerId: string, entryData: Partial<CenterSellerEntry>): Observable<{ success: boolean; message: string; data: CenterSellerEntry }> {
    return this.http.post<{ success: boolean; message: string; data: CenterSellerEntry }>(`${this.apiUrl}/${centerId}/sellers`, entryData);
  }

  // Farmer Search & Quick Registration
  searchFarmers(query?: string): Observable<{ success: boolean; count: number; data: FarmerSearchResult[] }> {
    let params = new HttpParams();
    if (query) params = params.set('q', query);
    return this.http.get<{ success: boolean; count: number; data: FarmerSearchResult[] }>(`${this.apiUrl}/farmers/search`, { params });
  }

  quickRegisterFarmer(data: { name: string; mobile: string; village?: string; password?: string; bankDetails?: any }): Observable<{ success: boolean; message: string; data: FarmerSearchResult }> {
    return this.http.post<{ success: boolean; message: string; data: FarmerSearchResult }>(`${this.apiUrl}/farmers/quick-register`, data);
  }

  completeCenterSale(entryId: string, data: any): Observable<{ success: boolean; message: string; data: CenterSellerEntry }> {
    return this.http.put<{ success: boolean; message: string; data: CenterSellerEntry }>(`${this.apiUrl}/sellers/${entryId}/complete-sale`, data);
  }

  deleteCenterSeller(entryId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/sellers/${entryId}`);
  }
}

export interface FarmerSearchResult {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  village?: string;
  district?: string;
  state?: string;
  bankDetails?: any;
  isVerified?: boolean;
  status?: string;
}
