import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NewsType {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsArticle {
  _id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  newsType: NewsType | string;
  image?: string;
  status: 'Draft' | 'Published' | 'Archived';
  isFeatured: boolean;
  author: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  views: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsApiResponse {
  success: boolean;
  count: number;
  stats: {
    total: number;
    published: number;
    draft: number;
    featured: number;
  };
  data: NewsArticle[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminNewsService {
  private http = inject(HttpClient);
  private newsTypeUrl = 'http://localhost:5000/api/news-types';
  private newsUrl = 'http://localhost:5000/api/news';

  // NewsType APIs
  getNewsTypes(activeOnly: boolean = false): Observable<{ success: boolean; count: number; data: NewsType[] }> {
    let params = new HttpParams();
    if (activeOnly) {
      params = params.set('activeOnly', 'true');
    }
    return this.http.get<{ success: boolean; count: number; data: NewsType[] }>(this.newsTypeUrl, { params });
  }

  createNewsType(payload: Partial<NewsType>): Observable<{ success: boolean; message: string; data: NewsType }> {
    return this.http.post<{ success: boolean; message: string; data: NewsType }>(this.newsTypeUrl, payload);
  }

  updateNewsType(id: string, payload: Partial<NewsType>): Observable<{ success: boolean; message: string; data: NewsType }> {
    return this.http.put<{ success: boolean; message: string; data: NewsType }>(`${this.newsTypeUrl}/${id}`, payload);
  }

  deleteNewsType(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.newsTypeUrl}/${id}`);
  }

  // News Article APIs
  getNews(newsType?: string, status?: string, search?: string, featured?: boolean): Observable<NewsApiResponse> {
    let params = new HttpParams();
    if (newsType && newsType !== 'All') {
      params = params.set('newsType', newsType);
    }
    if (status && status !== 'All') {
      params = params.set('status', status);
    }
    if (search) {
      params = params.set('search', search);
    }
    if (featured) {
      params = params.set('featured', 'true');
    }
    return this.http.get<NewsApiResponse>(this.newsUrl, { params });
  }

  getNewsById(id: string): Observable<{ success: boolean; data: NewsArticle }> {
    return this.http.get<{ success: boolean; data: NewsArticle }>(`${this.newsUrl}/${id}`);
  }

  createNews(payload: any): Observable<{ success: boolean; message: string; data: NewsArticle }> {
    return this.http.post<{ success: boolean; message: string; data: NewsArticle }>(this.newsUrl, payload);
  }

  updateNews(id: string, payload: any): Observable<{ success: boolean; message: string; data: NewsArticle }> {
    return this.http.put<{ success: boolean; message: string; data: NewsArticle }>(`${this.newsUrl}/${id}`, payload);
  }

  deleteNews(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.newsUrl}/${id}`);
  }
}
