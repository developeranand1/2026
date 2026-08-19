import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CropListing {
  _id?: string;
  postedBy?: string;
  postedByRole: 'farmer' | 'buyer' | 'admin';
  postedByName: string;
  postedByMobile?: string;
  type: 'sell' | 'buy';
  cropName: string;
  category: string;
  subcategory?: string;
  variety?: string;
  grade?: string;
  quantity: number;
  unit: 'Qtl' | 'Kg' | 'Ton';
  originalPrice?: number;
  expectedPrice: number;
  discountPercentage?: number;
  priceUnit: string;
  location: string;
  description?: string;
  image?: string;
  images?: string[];
  status: 'active' | 'sold' | 'inactive';
  isApproved?: boolean;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminCropService {
  private http = inject(HttpClient);
  // private apiUrl = 'http://localhost:5000/api/crops';

    private apiUrl = 'https://api.krisimarg.com/api/crops';



  // Upload Cloudinary image for crop listing
  uploadCropImage(imageStr: string): Observable<any> {
    return this.http.post<any>('https://api.krisimarg.com/api/categories/upload-image', { imageStr });
  }

  // Get All Crop Listings
  getCrops(role?: string, type?: string, status?: string, category?: string, approvalStatus?: string, search?: string): Observable<{ success: boolean; count: number; data: CropListing[] }> {
    let params = new HttpParams();
    if (role && role !== 'all') params = params.set('role', role);
    if (type && type !== 'all') params = params.set('type', type);
    if (status && status !== 'all') params = params.set('status', status);
    if (category && category !== 'all') params = params.set('category', category);
    if (approvalStatus && approvalStatus !== 'all') params = params.set('approvalStatus', approvalStatus);
    if (search) params = params.set('search', search);

    return this.http.get<{ success: boolean; count: number; data: CropListing[] }>(this.apiUrl, { params });
  }

  // Get Crop By ID
  getCropById(id: string): Observable<{ success: boolean; data: CropListing }> {
    return this.http.get<{ success: boolean; data: CropListing }>(`${this.apiUrl}/${id}`);
  }

  // Create Crop / Product Listing or Buyer Demand
  createCrop(crop: Partial<CropListing>): Observable<{ success: boolean; message: string; data: CropListing }> {
    return this.http.post<{ success: boolean; message: string; data: CropListing }>(this.apiUrl, crop);
  }

  // Toggle Approval Status (Admin)
  updateCropApproval(id: string, approvalStatus: 'approved' | 'pending' | 'rejected'): Observable<{ success: boolean; message: string; data: CropListing }> {
    return this.http.patch<{ success: boolean; message: string; data: CropListing }>(`${this.apiUrl}/${id}/approval`, { approvalStatus });
  }

  // Update Crop Listing
  updateCrop(id: string, crop: Partial<CropListing>): Observable<{ success: boolean; message: string; data: CropListing }> {
    return this.http.put<{ success: boolean; message: string; data: CropListing }>(`${this.apiUrl}/${id}`, crop);
  }

  // Delete Crop Listing
  deleteCrop(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${id}`);
  }
}
