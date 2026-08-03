import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private backendUrl = 'http://localhost:5000/api/auth';

  /**
   * Logs in a user (farmer, buyer, or admin)
   */
  login(payload: any): Observable<any> {
    return this.http.post<any>(`${this.backendUrl}/login`, payload).pipe(
      tap(response => {
        if (response && response.success) {
          this.saveToken(response.token);
          this.saveUser(response.data);
        }
      })
    );
  }

  /**
   * Registers a new user
   */
  register(payload: any): Observable<any> {
    return this.http.post<any>(`${this.backendUrl}/register`, payload).pipe(
      tap(response => {
        if (response && response.success) {
          this.saveToken(response.token);
          this.saveUser(response.data);
        }
      })
    );
  }

  /**
   * Saves the auth token in localStorage
   */
  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Saves the user profile in localStorage
   */
  saveUser(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Gets the stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Gets the stored user profile
   */
  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Logs out the user by clearing local storage
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Checks if user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
