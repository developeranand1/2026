import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PaymentTransaction {
  _id?: string;
  farmer?: any;
  farmerName?: string;
  farmerMobile?: string;
  buyer?: any;
  order?: any;
  crop?: any;
  amount: number;
  currency?: string;
  purpose: 'crop_listing_fee' | 'order_payment' | 'subscription';
  commissionPercent?: number;
  commissionAmount?: number;
  farmerSettlementAmount?: number;
  paymentMode?: string;
  status: 'processing' | 'received' | 'failed' | 'completed';
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentSummary {
  totalVolume: number;
  totalListingFees: number;
  totalCommission: number;
  totalTransactions: number;
}

export interface PaymentApiResponse {
  success: boolean;
  count?: number;
  summary?: PaymentSummary;
  data: PaymentTransaction[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payment`;

  getAllPayments(filters?: { status?: string; purpose?: string; search?: string }): Observable<PaymentApiResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.status) params = params.set('status', filters.status);
      if (filters.purpose) params = params.set('purpose', filters.purpose);
      if (filters.search) params = params.set('search', filters.search);
    }
    return this.http.get<PaymentApiResponse>(`${this.apiUrl}/admin/all`, { params });
  }

  recordManualPayment(data: Partial<PaymentTransaction>): Observable<{ success: boolean; message: string; data: PaymentTransaction }> {
    return this.http.post<{ success: boolean; message: string; data: PaymentTransaction }>(`${this.apiUrl}/admin/record-manual`, data);
  }

  deletePayment(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/admin/${id}`);
  }
}
