import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LevyRateService, LevyRate } from '../../../../core/levy-rate.service';

@Component({
  selector: 'app-home-levy-card',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './home-levy-card.component.html',
  styleUrl: './home-levy-card.component.scss'
})
export class HomeLevyCardComponent implements OnInit {
  private levyService = inject(LevyRateService);

  levyRates: LevyRate[] = [];
  filteredRates: LevyRate[] = [];
  isLoading = true;
  selectedDistrict = 'All';

  districts = ['All', 'Sant Kabir Nagar', 'Basti', 'Gorakhpur'];

  ngOnInit(): void {
    this.fetchRates();
  }

  fetchRates(): void {
    this.isLoading = true;
    this.levyService.getLevyRates().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.success && res.data) {
          this.levyRates = res.data;
          this.applyFilter();
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Failed to fetch levy rates for home card', err);
      }
    });
  }

  setDistrict(district: string): void {
    this.selectedDistrict = district;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedDistrict === 'All') {
      this.filteredRates = this.levyRates.slice(0, 6);
    } else {
      this.filteredRates = this.levyRates.filter(
        (r) => r.district.toLowerCase() === this.selectedDistrict.toLowerCase()
      ).slice(0, 6);
    }
  }

  getCropIcon(commodity: string): string {
    const c = (commodity || '').toLowerCase();
    if (c.includes('wheat') || c.includes('gehu')) return 'bi-flower1 text-warning';
    if (c.includes('paddy') || c.includes('dhan') || c.includes('rice')) return 'bi-tree text-success';
    if (c.includes('mustard') || c.includes('sarson')) return 'bi-sun-fill text-warning';
    if (c.includes('chana') || c.includes('gram')) return 'bi-egg-fill text-warning-emphasis';
    if (c.includes('potato') || c.includes('aloo')) return 'bi-circle-fill text-secondary';
    if (c.includes('onion') || c.includes('pyaz')) return 'bi-record-circle text-danger';
    if (c.includes('sugar') || c.includes('ganna')) return 'bi-slash-circle text-success';
    return 'bi-bag-check-fill text-success';
  }
}
