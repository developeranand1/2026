import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CenterService, Center } from '../../core/center.service';

@Component({
  selector: 'app-our-centers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './our-centers.component.html',
  styleUrls: ['./our-centers.component.scss']
})
export class OurCentersComponent implements OnInit {
  private centerService = inject(CenterService);
  private route = inject(ActivatedRoute);

  centers: Center[] = [];
  filteredCenters: Center[] = [];
  isLoading = true;
  errorMessage = '';

  searchQuery = '';
  pinCodeFilter = '';

  selectedCenterForModal: Center | null = null;
  highlightedCenterId: string | null = null;

  defaultImage = 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80';

  ngOnInit(): void {
    // Check for query param ?centerId=...
    this.route.queryParams.subscribe(params => {
      if (params['centerId']) {
        this.highlightedCenterId = params['centerId'];
      }
    });

    this.loadCenters();
  }

  loadCenters(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.centerService.getCenters(this.searchQuery, this.pinCodeFilter, 'all').subscribe({
      next: (res) => {
        this.centers = res.data || [];
        this.applyFilter();
        this.isLoading = false;

        // If a center was requested in queryParams, open its detail modal
        if (this.highlightedCenterId) {
          const match = this.centers.find(c => c._id === this.highlightedCenterId);
          if (match) {
            this.openDetailModal(match);
          }
        }
      },
      error: (err) => {
        console.error('Error loading centers:', err);
        this.errorMessage = 'केंद्रों की जानकारी लोड करने में समस्या हुई। कृपया पुनः प्रयास करें।';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    const q = (this.searchQuery || '').trim().toLowerCase();
    const pin = (this.pinCodeFilter || '').trim();

    this.filteredCenters = this.centers.filter(center => {
      const matchQuery = !q || 
        center.centerName.toLowerCase().includes(q) ||
        center.address.toLowerCase().includes(q) ||
        center.pinCode.includes(q) ||
        (center.director?.name && center.director.name.toLowerCase().includes(q)) ||
        (center.helpingStaff?.name && center.helpingStaff.name.toLowerCase().includes(q));

      const matchPin = !pin || center.pinCode.includes(pin);

      return matchQuery && matchPin;
    });
  }

  clearFilter(): void {
    this.searchQuery = '';
    this.pinCodeFilter = '';
    this.applyFilter();
  }

  openDetailModal(center: Center): void {
    this.selectedCenterForModal = center;
  }

  closeDetailModal(): void {
    this.selectedCenterForModal = null;
  }

  getGoogleMapsUrl(center: Center): string {
    return this.centerService.getGoogleMapsUrl(center);
  }

  getWhatsAppUrl(center: Center): string {
    return this.centerService.getWhatsAppUrl(center);
  }

  getTelLink(phone?: string): string {
    return this.centerService.getTelLink(phone);
  }
}
