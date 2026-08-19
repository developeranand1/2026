import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NewsType {
  _id: string;
  title: string;
  slug: string;
  description?: string;
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
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class FrontendNewsService {
  private http = inject(HttpClient);
  // private newsUrl = 'http://localhost:5000/api/news';
  // private newsTypeUrl = 'http://localhost:5000/api/news-types';

  private newsUrl = 'https://api.krisimarg.com/api/news';
  private newsTypeUrl = 'https://api.krisimarg.com/api/news-types';

  getNewsList(newsType?: string, search?: string, featured?: boolean): Observable<{ success: boolean; count: number; data: NewsArticle[] }> {
    let params = new HttpParams().set('status', 'Published');
    if (newsType && newsType !== 'All') {
      params = params.set('newsType', newsType);
    }
    if (search) {
      params = params.set('search', search);
    }
    if (featured) {
      params = params.set('featured', 'true');
    }
    return this.http.get<{ success: boolean; count: number; data: NewsArticle[] }>(this.newsUrl, { params });
  }

  getNewsBySlugOrId(idOrSlug: string): Observable<{ success: boolean; data: NewsArticle }> {
    return this.http.get<{ success: boolean; data: NewsArticle }>(`${this.newsUrl}/${idOrSlug}`);
  }

  getNewsTypes(): Observable<{ success: boolean; count: number; data: NewsType[] }> {
    return this.http.get<{ success: boolean; count: number; data: NewsType[] }>(`${this.newsTypeUrl}?activeOnly=true`);
  }
}
