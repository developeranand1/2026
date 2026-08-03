import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { MandiRateService } from '../../pages/home/mandi-rate.service';

@Component({
  selector: 'app-farmer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './farmer-dashboard.component.html',
  styleUrl: './farmer-dashboard.component.scss'
})
export class FarmerDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private mandiRateService = inject(MandiRateService);

  isLoggedIn = false;
  farmerUser: any = null;
  isLoadingRates = false;

  mandiRates: Array<{ crop: string; rate: number; unit: string; icon: string }> = [
    { crop: 'Wheat (गेहूं)', rate: 2120, unit: 'Quintal', icon: '🌾' },
    { crop: 'Paddy (धान)', rate: 1850, unit: 'Quintal', icon: '🍚' },
    { crop: 'Mustard (सरसों)', rate: 5120, unit: 'Quintal', icon: '🌱' },
    { crop: 'Maize (मक्का)', rate: 1750, unit: 'Quintal', icon: '🌽' }
  ];

  recentOrders: Array<any> = [];

  ngOnInit(): void {
    this.checkUser();
    this.fetchLiveMandiRates();
  }

  checkUser(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.farmerUser = this.authService.getUser();
    }
  }

  fetchLiveMandiRates(): void {
    this.isLoadingRates = true;
    const currentState = this.farmerUser?.state || 'Bihar';
    this.mandiRateService.getLiveRates(currentState, this.farmerUser?.district).subscribe({
      next: (res) => {
        this.isLoadingRates = false;
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          this.mandiRates = res.data.map((item: any) => ({
            crop: item.commodity || item.crop || 'Crop',
            rate: item.modalPrice || item.modal_price || item.rate || 2000,
            unit: item.unit || 'Quintal',
            icon: this.getCropIcon(item.commodity || item.crop || '')
          }));
        }
      },
      error: (err) => {
        this.isLoadingRates = false;
        console.error('Error fetching mandi rates:', err);
      }
    });
  }

  private getCropIcon(cropName: string): string {
    const name = cropName.toLowerCase();
    if (name.includes('wheat') || name.includes('gehun')) return '🌾';
    if (name.includes('paddy') || name.includes('dhan') || name.includes('rice')) return '🍚';
    if (name.includes('mustard') || name.includes('sarson')) return '🌱';
    if (name.includes('maize') || name.includes('makka')) return '🌽';
    if (name.includes('potato') || name.includes('aalu')) return '🥔';
    if (name.includes('onion') || name.includes('pyaz')) return '🧅';
    return '🌾';
  }
}
