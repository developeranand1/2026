import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MandiRateService } from '../../mandi-rate.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  private mandiRateService = inject(MandiRateService);
  private router = inject(Router);

  approvedCrops: any[] = [];
  isLoading = true;
  activeFilter = 'all';

  @Input() set selectedCategory(cat: string) {
    if (cat) {
      this.activeFilter = cat;
    }
  }

  ngOnInit(): void {
    this.fetchLiveProducts();
  }

  fetchLiveProducts(): void {
    this.isLoading = true;
    this.mandiRateService.getApprovedCrops().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success && Array.isArray(res.data)) {
          this.approvedCrops = res.data;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get filteredProducts(): any[] {
    if (this.activeFilter === 'sell') {
      return this.approvedCrops.filter(c => c.type === 'sell' || c.postedByRole === 'farmer');
    }
    if (this.activeFilter === 'buy') {
      return this.approvedCrops.filter(c => c.type === 'buy' || c.postedByRole === 'buyer');
    }
    if (this.activeFilter !== 'all') {
      return this.approvedCrops.filter(c => c.category === this.activeFilter);
    }
    return this.approvedCrops;
  }

  viewProductDetails(crop: any): void {
    if (crop) {
      const targetId = crop.slug || crop._id;
      if (targetId) {
        this.router.navigate(['/product', targetId]);
      }
    }
  }
}
