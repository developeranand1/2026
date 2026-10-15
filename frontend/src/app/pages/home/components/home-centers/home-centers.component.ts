import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CenterService, Center } from '../../../../core/center.service';

@Component({
  selector: 'app-home-centers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-centers.component.html',
  styleUrls: ['./home-centers.component.scss']
})
export class HomeCentersComponent implements OnInit {
  private centerService = inject(CenterService);

  centers: Center[] = [];
  isLoading = true;
  errorMessage = '';

  defaultImage = 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80';

  ngOnInit(): void {
    this.loadCenters();
  }

  loadCenters(): void {
    this.isLoading = true;
    this.centerService.getCenters('', '', 'active').subscribe({
      next: (res) => {
        this.centers = (res.data || []).slice(0, 3); // Display top 3 featured centers on Home
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading centers:', err);
        this.errorMessage = 'केंद्रों की जानकारी लोड करने में समस्या हुई';
        this.isLoading = false;
      }
    });
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
