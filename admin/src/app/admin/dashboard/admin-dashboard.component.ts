import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminDashboardService } from '../../core/admin-dashboard.service';
import { CategoryService } from '../../core/category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private adminDashboardService = inject(AdminDashboardService);
  private categoryService = inject(CategoryService);

  isLoading = true;
  stats: any = {
    totalFarmers: 0,
    totalBuyers: 0,
    totalCrops: 0,
    activeCrops: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalCategories: 0,
    totalSubcategories: 0,
    totalRevenue: 125000
  };

  recentCrops: any[] = [];
  recentOrders: any[] = [];
  mandiRates: any[] = [];

  ngOnInit(): void {
    this.loadAdminStats();
  }

  loadAdminStats(): void {
    this.isLoading = true;
    this.adminDashboardService.getAdminStats().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.stats = res.data.stats;
          this.recentCrops = res.data.recentCrops || [];
          this.recentOrders = res.data.recentOrders || [];
          this.mandiRates = res.data.mandiRates || [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading admin stats:', err);
      }
    });
  }

  seedCategories(): void {
    Swal.fire({
      title: 'Seed Default Categories?',
      text: 'This will seed standard agricultural categories (Grains, Pulses, Oilseeds, Vegetables, Fruits, Spices, Dairy) into database.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2E7D32',
      confirmButtonText: 'Yes, Seed Categories'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoryService.seedCategories().subscribe({
          next: () => {
            Swal.fire('Success!', 'Default categories seeded into database.', 'success');
            this.loadAdminStats();
          },
          error: (err) => {
            Swal.fire('Error', err.error?.message || 'Failed to seed categories', 'error');
          }
        });
      }
    });
  }
}
