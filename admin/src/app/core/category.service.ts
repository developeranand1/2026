import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Subcategory {
  _id?: string;
  name: string;
  slug?: string;
  category?: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface Category {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive?: boolean;
  displayOrder?: number;
  subcategories?: Subcategory[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  // private baseUrl = 'http://localhost:5000/api/categories';
   private baseUrl = ' https://api.krisimarg.com/api/categories';

 

  // Preset Cloudinary and Unsplash agricultural images (No emojis)
  readonly PRESET_IMAGES = [
    {
      label: 'Wheat & Grains',
      url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: 'Pulses & Legumes',
      url: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e3?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: 'Mustard & Oilseeds',
      url: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: 'Fresh Vegetables',
      url: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: 'Fresh Fruits',
      url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: 'Spices & Herbs',
      url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: 'Dairy & Farm Produce',
      url: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=800&q=80'
    },
    {
      label: 'Farm Equipment',
      url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19655?auto=format&fit=crop&w=800&q=80'
    }
  ];

  private getAuthHeaders() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // Upload image to Cloudinary via backend
  uploadCloudinaryImage(imageStr: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/upload-image`, { imageStr });
  }

  // Get all categories
  getCategories(): Observable<{ success: boolean; data: Category[]; count: number }> {
    return this.http.get<{ success: boolean; data: Category[]; count: number }>(this.baseUrl);
  }

  // Seed default categories
  seedCategories(): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/seed`, {}, this.getAuthHeaders());
  }

  // Create Category
  createCategory(category: Category): Observable<any> {
    return this.http.post<any>(this.baseUrl, category, this.getAuthHeaders());
  }

  // Update Category
  updateCategory(id: string, category: Partial<Category>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, category, this.getAuthHeaders());
  }

  // Delete Category
  deleteCategory(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`, this.getAuthHeaders());
  }

  // Create Subcategory
  createSubcategory(subcategory: { name: string; categoryId: string; description?: string; image?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/subcategory`, subcategory, this.getAuthHeaders());
  }

  // Update Subcategory
  updateSubcategory(id: string, subcategory: Partial<Subcategory>): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/subcategory/${id}`, subcategory, this.getAuthHeaders());
  }

  // Delete Subcategory
  deleteSubcategory(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/subcategory/${id}`, this.getAuthHeaders());
  }
}
