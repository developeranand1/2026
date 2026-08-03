import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDashboardService } from '../../core/admin-dashboard.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crop-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crop-management.component.html'
})
export class CropManagementComponent implements OnInit {
  private adminDashboardService = inject(AdminDashboardService);

  crops: any[] = [];
  filteredCrops: any[] = [];
  searchQuery = '';
  isLoading = true;

  ngOnInit(): void {
    this.loadCrops();
  }

  loadCrops(): void {
    this.isLoading = true;
    this.adminDashboardService.getAllCrops().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.crops = res.data || [];
          this.filteredCrops = [...this.crops];
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  filterCrops(): void {
    if (!this.searchQuery.trim()) {
      this.filteredCrops = [...this.crops];
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredCrops = this.crops.filter(c =>
      (c.cropName && c.cropName.toLowerCase().includes(q)) ||
      (c.location && c.location.toLowerCase().includes(q)) ||
      (c.farmer && c.farmer.name && c.farmer.name.toLowerCase().includes(q))
    );
  }
}
