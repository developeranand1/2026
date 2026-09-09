import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  private apiUrl = `${environment.apiUrl}/contact`;
  

  submitContactForm(payload: ContactPayload): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }
}
