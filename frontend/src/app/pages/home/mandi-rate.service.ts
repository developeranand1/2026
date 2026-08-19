import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MandiRateService {
  private http = inject(HttpClient);


  // private backendUrl = 'http://localhost:5000/api/mandi-rates';
  // private cropUrl = 'http://localhost:5000/api/crops';
  // private categoryUrl = 'http://localhost:5000/api/categories';

    private backendUrl = 'https://api.krisimarg.com/api/mandi-rates';
  private cropUrl = 'https://api.krisimarg.com/api/crops';
  private categoryUrl = 'https://api.krisimarg.com/api/categories';

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
}
