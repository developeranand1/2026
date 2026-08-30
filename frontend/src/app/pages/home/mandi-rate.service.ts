import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MandiRateService {
  private http = inject(HttpClient);


  private getBaseUrl(): string {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:5000/api';
    }
    return 'https://api.krisimarg.com/api';
  }

  private get backendUrl(): string { return `${this.getBaseUrl()}/mandi-rates`; }
  private get cropUrl(): string { return `${this.getBaseUrl()}/crops`; }
  private get categoryUrl(): string { return `${this.getBaseUrl()}/categories`; }

  /**
   * Performs reverse geocoding via OpenStreetMap Nominatim
   */
  reverseGeocode(lat: number, lon: number): Observable<any> {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
    return this.http.get<any>(url);
  }

  /**
   * Fetches live market prices and matching crop listings from backend
   */
  getLiveRates(state: string, district?: string, commodity?: string): Observable<any> {
    let url = `${this.backendUrl}/live?state=${encodeURIComponent(state)}`;
    if (district) {
      url += `&district=${encodeURIComponent(district)}`;
    }
    if (commodity) {
      url += `&commodity=${encodeURIComponent(commodity)}`;
    }
    return this.http.get<any>(url);
  }

  /**
   * Fetch Database Categories for Dynamic Selection
   */
  getCategories(): Observable<any> {
    return this.http.get<any>(this.categoryUrl);
  }

  /**
   * Upload Crop Image to Cloudinary (1MB limit check)
   */
  uploadCropImage(imageStr: string): Observable<any> {
    return this.http.post<any>(`${this.categoryUrl}/upload-image`, { imageStr });
  }

  /**
   * Submit New Crop Listing / Buyer Requirement (Sent to Admin for Pending Review)
   */
  createCropListing(cropData: any): Observable<any> {
    return this.http.post<any>(this.cropUrl, cropData);
  }

  /**
   * Fetch Single Crop Details by ID
   */
  getCropById(id: string): Observable<any> {
    return this.http.get<any>(`${this.cropUrl}/${id}`);
  }

  /**
   * Fetch Admin Approved Crops & Purchasing Demands for Marketplace
   */
  getApprovedCrops(role?: string, type?: string): Observable<any> {
    let url = `${this.cropUrl}?approvalStatus=approved&status=active`;
    if (role) url += `&role=${role}`;
    if (type) url += `&type=${type}`;
    return this.http.get<any>(url);
  }

  /**
   * Fetch All Crops/Demands posted specifically by a User (by User ID, Mobile, or Name)
   */
  getCropsByUser(userId?: string, mobile?: string, name?: string, role?: string, type?: string): Observable<any> {
    const params: string[] = [];
    if (userId) params.push(`userId=${encodeURIComponent(userId)}`);
    if (mobile) params.push(`mobile=${encodeURIComponent(mobile)}`);
    if (name) params.push(`name=${encodeURIComponent(name)}`);
    if (role) params.push(`role=${encodeURIComponent(role)}`);
    if (type) params.push(`type=${encodeURIComponent(type)}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.http.get<any>(`${this.cropUrl}${query}`);
  }

  /**
   * Delete a Crop Listing by ID
   */
  deleteCrop(id: string): Observable<any> {
    return this.http.delete<any>(`${this.cropUrl}/${id}`);
  }

  /**
   * Update a Crop Listing by ID
   */
  updateCrop(id: string, cropData: any): Observable<any> {
    return this.http.put<any>(`${this.cropUrl}/${id}`, cropData);
  }
}
