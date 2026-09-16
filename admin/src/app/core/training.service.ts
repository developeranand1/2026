import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Participant {
  _id?: string;
  name: string;
  village?: string;
  phone: string;
  cropsGrown?: string;
  status: 'Registered' | 'Attended' | 'Certified';
  registeredAt?: string;
}

export interface Training {
  _id?: string;
  title: string;
  slug?: string;
  category: string;
  trainerName: string;
  trainerDesignation?: string;
  organizer?: string;
  village: string;
  district: string;
  state?: string;
  fullAddress: string;
  startDate: string;
  endDate?: string;
  time: string;
  duration?: string;
  description: string;
  topics?: string[];
  coverImage?: string;
  galleryImages?: string[];
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  maxCapacity?: number;
  registeredCount?: number;
  fee?: string;
  contactPerson?: string;
  contactPhone?: string;
  successSummary?: string;
  keyAchievements?: string[];
  participants?: Participant[];
  isFeatured?: boolean;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainingApiResponse {
  success: boolean;
  count: number;
  total: number;
  stats: {
    total: number;
    upcoming: number;
    ongoing: number;
    completed: number;
    cancelled: number;
    totalFarmersTrained: number;
  };
  data: Training[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminTrainingService {
  private http = inject(HttpClient);
  private trainingUrl = `${environment.apiUrl}/trainings`;

  getTrainings(
    status?: string,
    category?: string,
    search?: string,
    village?: string,
    district?: string
  ): Observable<TrainingApiResponse> {
    let params = new HttpParams();
    if (status && status !== 'All') {
      params = params.set('status', status);
    }
    if (category && category !== 'All') {
      params = params.set('category', category);
    }
    if (search) {
      params = params.set('search', search);
    }
    if (village) {
      params = params.set('village', village);
    }
    if (district) {
      params = params.set('district', district);
    }
    return this.http.get<TrainingApiResponse>(this.trainingUrl, { params });
  }

  getTrainingById(id: string): Observable<{ success: boolean; data: Training }> {
    return this.http.get<{ success: boolean; data: Training }>(`${this.trainingUrl}/${id}`);
  }

  createTraining(payload: Partial<Training>): Observable<{ success: boolean; message: string; data: Training }> {
    return this.http.post<{ success: boolean; message: string; data: Training }>(this.trainingUrl, payload);
  }

  updateTraining(id: string, payload: Partial<Training>): Observable<{ success: boolean; message: string; data: Training }> {
    return this.http.put<{ success: boolean; message: string; data: Training }>(`${this.trainingUrl}/${id}`, payload);
  }

  deleteTraining(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.trainingUrl}/${id}`);
  }

  addParticipant(id: string, participant: Partial<Participant>): Observable<{ success: boolean; message: string; data: Participant[] }> {
    return this.http.post<{ success: boolean; message: string; data: Participant[] }>(`${this.trainingUrl}/${id}/participants`, participant);
  }

  deleteParticipant(trainingId: string, participantId: string): Observable<{ success: boolean; message: string; data: Participant[] }> {
    return this.http.delete<{ success: boolean; message: string; data: Participant[] }>(`${this.trainingUrl}/${trainingId}/participants/${participantId}`);
  }

  seedDemoTrainings(): Observable<any> {
    return this.http.post(`${this.trainingUrl}/seed`, {});
  }
}
