import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LocationInfo {
  village?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
}

export interface BankDetailsInfo {
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
}

export interface FarmerProfileInfo {
  _id: string;
  user: string;
  location?: LocationInfo;
  bankDetails?: BankDetailsInfo;
  totalCropsListed?: number;
  totalEarnings?: number;
  createdAt?: string;
}

export interface BuyerProfileInfo {
  _id: string;
  user: string;
  companyName?: string;
  gstNumber?: string;
  address?: LocationInfo;
  createdAt?: string;
}

export interface UserAccount {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  role: 'farmer' | 'buyer' | 'admin';
  isVerified: boolean;
  status: 'active' | 'blocked';
  createdAt: string;
  farmerProfile?: FarmerProfileInfo | null;
  buyerProfile?: BuyerProfileInfo | null;
}

export interface UserStats {
  totalUsers: number;
  farmersCount: number;
  buyersCount: number;
  blockedCount: number;
  verifiedCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminUserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/users';

  getUsers(role?: string, status?: string, search?: string): Observable<{ success: boolean; count: number; stats: UserStats; data: UserAccount[] }> {
    let params = new HttpParams();
    if (role && role !== 'all') {
      params = params.set('role', role);
    }
    if (status && status !== 'all') {
      params = params.set('status', status);
    }
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<{ success: boolean; count: number; stats: UserStats; data: UserAccount[] }>(this.apiUrl, { params });
  }

  getUserById(id: string): Observable<{ success: boolean; data: UserAccount }> {
    return this.http.get<{ success: boolean; data: UserAccount }>(`${this.apiUrl}/${id}`);
  }

  updateUserStatus(id: string, status: 'active' | 'blocked'): Observable<{ success: boolean; message: string; data: UserAccount }> {
    return this.http.patch<{ success: boolean; message: string; data: UserAccount }>(`${this.apiUrl}/${id}/status`, { status });
  }

  updateUserVerification(id: string, isVerified: boolean): Observable<{ success: boolean; message: string; data: UserAccount }> {
    return this.http.patch<{ success: boolean; message: string; data: UserAccount }>(`${this.apiUrl}/${id}/verification`, { isVerified });
  }

  deleteUser(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
