import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserProfileResponse {
  success: boolean;
  message?: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  private get usersUrl(): string {
    return `${environment.apiUrl}/users`;
  }

  /**
   * Fetches user details along with farmerProfile or buyerProfile
   * @param id User ID or Mobile
   */
  getUserProfile(id: string): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.usersUrl}/${id}`);
  }

  /**
   * Updates user personal and role-specific profile details via PUT request
   * @param id User ID or Mobile
   * @param profileData Updated profile payload
   */
  updateUserProfile(id: string, profileData: any): Observable<UserProfileResponse> {
    return this.http.put<UserProfileResponse>(`${this.usersUrl}/${id}`, profileData);
  }
}
