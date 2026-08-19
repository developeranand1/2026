import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactPayload {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private http = inject(HttpClient);
  // private apiUrl = 'http://localhost:5000/api/contact';
  private apiUrl = 'https://api.krisimarg.com/api/contact';
  

  submitContactForm(payload: ContactPayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }
}
