import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { MandiRateService } from '../../pages/home/mandi-rate.service';
import { TrainingService, Training } from '../../core/training.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-farmer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, FormsModule],
  templateUrl: './farmer-dashboard.component.html',
  styleUrl: './farmer-dashboard.component.scss'
})
export class FarmerDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private mandiRateService = inject(MandiRateService);
  private trainingService = inject(TrainingService);
  private router = inject(Router);

  isLoggedIn = false;
  farmerUser: any = null;
  isLoadingRates = false;
  isLoadingCrops = false;
  isLoadingTrainings = false;

  myCropsList: any[] = [];
  dbCategories: any[] = [];
  availableSubcategories: any[] = [];
  upcomingTrainings: Training[] = [];

  mandiRates: Array<{ crop: string; rate: number; unit: string; icon: string }> = [
    { crop: 'Wheat (गेहूं)', rate: 2120, unit: 'Quintal', icon: '🌾' },
    { crop: 'Paddy (धान)', rate: 1850, unit: 'Quintal', icon: '🍚' },
    { crop: 'Mustard (सरसों)', rate: 5120, unit: 'Quintal', icon: '🌱' },
    { crop: 'Maize (मक्का)', rate: 1750, unit: 'Quintal', icon: '🌽' }
  ];

  selectedTrendCrop: 'Wheat' | 'Paddy' | 'Mustard' = 'Wheat';
  selectedTimeframe: '1M' | '3M' | '6M' | '1Y' = '6M';

  trendPoints = [
    { month: 'May', wheat: 2050, paddy: 1780, mustard: 4950, x: 5, y: 65, rate: '₹2,050' },
    { month: 'Jun', wheat: 2110, paddy: 1820, mustard: 5020, x: 23, y: 55, rate: '₹2,110' },
    { month: 'Jul', wheat: 2180, paddy: 1840, mustard: 5150, x: 41, y: 42, rate: '₹2,180' },
    { month: 'Aug', wheat: 2150, paddy: 1860, mustard: 5100, x: 59, y: 48, rate: '₹2,150' },
    { month: 'Sep', wheat: 2240, paddy: 1890, mustard: 5240, x: 77, y: 30, rate: '₹2,240' },
    { month: 'Oct', wheat: 2290, paddy: 1940, mustard: 5320, x: 95, y: 20, rate: '₹2,290' },
  ];

  paymentSettlements = [
    { id: 'TXN-9021', buyer: 'AgroBulk Trading Corp', crop: 'Wheat (गेहूं) - 50 Qtl', amount: 114500, date: '28 Sep 2026', status: 'Completed', statusText: 'खाते में जमा (Credited)' },
    { id: 'TXN-8842', buyer: 'Kisan Mandi Traders', crop: 'Mustard (सरसों) - 25 Qtl', amount: 131250, date: '15 Sep 2026', status: 'Completed', statusText: 'खाते में जमा (Credited)' },
    { id: 'TXN-7913', buyer: 'Patanjali Agro Supply', crop: 'Paddy (धान) - 80 Qtl', amount: 153600, date: '02 Sep 2026', status: 'Escrow', statusText: 'एस्क्रो सुरक्षित (In Escrow)' },
  ];

  get totalEstimatedRevenue(): number {
    if (!this.myCropsList || this.myCropsList.length === 0) {
      return 399350;
    }
    const total = this.myCropsList.reduce((acc, c) => {
      const price = Number(c.expectedPrice) || 0;
      const qty = Number(c.quantity) || 1;
      return acc + (price * qty);
    }, 0);
    return total > 0 ? total : 399350;
  }

  setTrendCrop(crop: 'Wheat' | 'Paddy' | 'Mustard'): void {
    this.selectedTrendCrop = crop;
  }

  setTimeframe(tf: '1M' | '3M' | '6M' | '1Y'): void {
    this.selectedTimeframe = tf;
  }

  ngOnInit(): void {
    this.checkUser();
    this.fetchLiveMandiRates();
    this.loadDbCategories();
    this.loadMyFarmerCrops();
    this.loadUpcomingTrainings();
  }

  loadUpcomingTrainings(): void {
    this.isLoadingTrainings = true;
    this.trainingService.getUpcomingTrainings(4).subscribe({
      next: (res) => {
        this.isLoadingTrainings = false;
        if (res.success) {
          this.upcomingTrainings = res.data || [];
        }
      },
      error: () => {
        this.isLoadingTrainings = false;
      }
    });
  }

  quickEnrollTraining(training: Training): void {
    const farmerName = this.farmerUser?.name || 'Kisan Brother';
    const farmerPhone = this.farmerUser?.mobile || '';
    const farmerVillage = this.farmerUser?.village || this.farmerUser?.district || '';

    if (!farmerPhone) {
      this.router.navigate(['/trainings']);
      return;
    }

    if (!training._id) return;

    this.trainingService.registerFarmer(training._id, {
      name: farmerName,
      phone: farmerPhone,
      village: farmerVillage
    }).subscribe({
      next: (res) => {
        if (res.success) {
          Swal.fire({
            title: '🎉 पंजीकरण सफल!',
            text: `बधाई हो! ${training.title} के लिए आपकी सीट सुरक्षित कर ली गई है।`,
            icon: 'success',
            confirmButtonColor: '#2E7D32'
          });
          this.loadUpcomingTrainings();
        }
      },
      error: (err) => {
        Swal.fire('सूचना', err.error?.message || 'पंजीकरण पूरा नहीं हो सका', 'info');
      }
    });
  }

  checkUser(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.farmerUser = this.authService.getUser();
    }
  }

  loadDbCategories(): void {
    this.mandiRateService.getCategories().subscribe({
      next: (res: any) => {
        if (res && res.success && res.data) {
          this.dbCategories = res.data;
        }
      }
    });
  }

  loadMyFarmerCrops(): void {
    const userId = this.farmerUser?._id || this.farmerUser?.id;
    const mobile = this.farmerUser?.mobile;
    const name = this.farmerUser?.name;

    if (!userId && !mobile && !name) {
      this.myCropsList = [];
      this.isLoadingCrops = false;
      return;
    }

    this.isLoadingCrops = true;
    this.mandiRateService.getCropsByUser(userId, mobile, name, 'farmer', 'sell').subscribe({
      next: (res: any) => {
        this.isLoadingCrops = false;
        if (res && res.success && Array.isArray(res.data)) {
          this.myCropsList = res.data;
        } else {
          this.myCropsList = [];
        }
      },
      error: (err) => {
        this.isLoadingCrops = false;
        this.myCropsList = [];
        console.error('Error loading farmer crops:', err);
      }
    });
  }

  get activeCropsCount(): number {
    return this.myCropsList.filter(c => c.approvalStatus === 'approved' || c.isApproved).length;
  }

  get pendingCropsCount(): number {
    return this.myCropsList.filter(c => c.approvalStatus === 'pending' && !c.isApproved).length;
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

  viewCropDetails(crop: any): void {
    if (crop) {
      const targetId = crop.slug || crop._id;
      if (targetId) {
        this.router.navigate(['/farmer/product', targetId]);
      }
    }
  }

  deleteCropListing(crop: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const cropId = crop._id || crop.id;
    if (!cropId) return;

    Swal.fire({
      title: 'Delete Crop Listing?',
      text: `Are you sure you want to delete "${crop.cropName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Delete'
    }).then((result) => {
      if (result.isConfirmed) {
        this.mandiRateService.deleteCrop(cropId).subscribe({
          next: (res: any) => {
            if (res.success) {
              Swal.fire('Deleted!', 'Your crop listing has been removed.', 'success');
              this.loadMyFarmerCrops();
            }
          },
          error: (err: any) => {
            Swal.fire('Error', err.error?.message || 'Failed to delete crop listing', 'error');
          }
        });
      }
    });
  }

  openCreateModal(): void {
    this.router.navigate(['/farmer/product']);
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
