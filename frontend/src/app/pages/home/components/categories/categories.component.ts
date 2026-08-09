import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MandiRateService } from '../../mandi-rate.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  private mandiRateService = inject(MandiRateService);

  @Output() categorySelected = new EventEmitter<string>();

  categories: any[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.fetchDbCategories();
  }

  fetchDbCategories(): void {
    this.isLoading = true;
    this.mandiRateService.getCategories().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          this.categories = res.data.map((cat: any) => ({
            name: cat.name,
            image: cat.image || 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80',
            icon: cat.icon || this.getCategoryIcon(cat.name),
            count: (cat.subcategories && cat.subcategories.length) ? cat.subcategories.length * 5 + 3 : 10
          }));
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  selectCategory(catName: string): void {
    this.categorySelected.emit(catName);
  }

  private getCategoryIcon(catName: string): string {
    const name = catName.toLowerCase();
    if (name.includes('grain') || name.includes('cereal') || name.includes('wheat')) return '🌾';
    if (name.includes('veg') || name.includes('subzi')) return '🥬';
    if (name.includes('fruit') || name.includes('apple')) return '🍎';
    if (name.includes('oil') || name.includes('mustard')) return '🌱';
    if (name.includes('pulse') || name.includes('spice') || name.includes('dal')) return '🫘';
    if (name.includes('commercial') || name.includes('cane') || name.includes('cotton')) return '🎋';
    return '🌱';
  }
}
