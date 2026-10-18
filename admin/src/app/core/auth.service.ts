import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private backendUrl = `${environment.apiUrl}/auth`;
  private staffUrl = `${environment.apiUrl}/staff`;

  /**
   * Logs in staff/admin or user
   */
  login(payload: any): Observable<any> {
    // Try staff login first (for CEO, Admin, HR, Accountant)
    return this.http.post<any>(`${this.staffUrl}/login`, payload).pipe(
      tap(response => {
        if (response && response.success) {
          this.saveToken(response.token);
          this.saveUser(response.data);
        }
      })
    );
  }

  /**
   * Fallback login directly to general auth
   */
  loginGeneral(payload: any): Observable<any> {
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

  /**
   * Returns current user's role
   */
  getUserRole(): string {
    const user = this.getUser();
    return (user?.role || '').toLowerCase();
  }

  /**
   * Checks if current staff has one of the allowed roles
   */
  hasRole(...allowedRoles: string[]): boolean {
    const role = this.getUserRole();
    if (role === 'superadmin') return true;
    return allowedRoles.map(r => r.toLowerCase()).includes(role);
  }
}
