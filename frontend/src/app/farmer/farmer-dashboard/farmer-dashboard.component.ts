import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { MandiRateService } from '../../pages/home/mandi-rate.service';
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
  private router = inject(Router);

  isLoggedIn = false;
  farmerUser: any = null;
  isLoadingRates = false;
  isLoadingCrops = false;

  myCropsList: any[] = [];
  dbCategories: any[] = [];
  availableSubcategories: any[] = [];

  mandiRates: Array<{ crop: string; rate: number; unit: string; icon: string }> = [
    { crop: 'Wheat (गेहूं)', rate: 2120, unit: 'Quintal', icon: '🌾' },
    { crop: 'Paddy (धान)', rate: 1850, unit: 'Quintal', icon: '🍚' },
    { crop: 'Mustard (सरसों)', rate: 5120, unit: 'Quintal', icon: '🌱' },
    { crop: 'Maize (मक्का)', rate: 1750, unit: 'Quintal', icon: '🌽' }
  ];

  recentOrders: Array<any> = [];

  // Farmer Create Listing Modal State
  showCreateModal = false;
  isSubmitting = false;
  isUploading = false;
  isCustomCategory = false;
  isCustomSubcategory = false;

  formRole: 'farmer' | 'buyer' = 'farmer';
  formType: 'sell' | 'buy' = 'sell';
  formName = '';
  formMobile = '';
  formTitle = '';
  formCategory = '';
  formSubcategory = '';
  formVariety = '';
  formQuantity = 10;
  formUnit = 'Qtl';
  formOriginalPrice = 0;
  formSellingPrice = 0;
  formDiscount = 10;
  formLocation = '';
  formDescription = '';
  formImages: string[] = [];

  ngOnInit(): void {
    this.checkUser();
    this.fetchLiveMandiRates();
    this.loadDbCategories();
    this.loadMyFarmerCrops();
  }

  checkUser(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.farmerUser = this.authService.getUser();
      if (this.farmerUser) {
        this.formName = this.farmerUser.name || '';
        this.formMobile = this.farmerUser.mobile || '';
      }
    }
  }

  loadDbCategories(): void {
    this.mandiRateService.getCategories().subscribe({
      next: (res: any) => {
        if (res && res.success && res.data) {
          this.dbCategories = res.data;
          if (this.dbCategories.length > 0 && !this.formCategory) {
            this.formCategory = this.dbCategories[0].name;
            this.onCategoryChange(this.formCategory);
          }
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
    this.formRole = 'farmer';
    this.formType = 'sell';
    if (this.farmerUser) {
      this.formName = this.farmerUser.name || '';
      this.formMobile = this.farmerUser.mobile || '';
    }
    this.formTitle = '';
    this.formVariety = '';
    this.formQuantity = 10;
    this.formUnit = 'Qtl';
    this.formOriginalPrice = 0;
    this.formSellingPrice = 0;
    this.formDiscount = 10;
    this.formLocation = this.farmerUser?.district ? `${this.farmerUser.district}, ${this.farmerUser.state || 'Bihar'}` : 'Bihar';
    this.formDescription = '<b>Grade A Farm Harvest</b>\n• Moisture: Below 12%\n• Direct farm loading & immediate dispatch available.';
    this.formImages = [];

    if (this.dbCategories.length > 0) {
      this.formCategory = this.dbCategories[0].name;
      this.onCategoryChange(this.formCategory);
    }
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  onCategoryChange(categoryName: string): void {
    if (categoryName === 'NEW_CUSTOM_CATEGORY') {
      this.isCustomCategory = true;
      this.isCustomSubcategory = true;
      this.formCategory = '';
      this.formSubcategory = '';
      this.availableSubcategories = [];
      return;
    }

    this.isCustomCategory = false;
    this.formCategory = categoryName;

    const matched = this.dbCategories.find(c => c.name === categoryName);
    if (matched && matched.subcategories) {
      this.availableSubcategories = matched.subcategories;
      if (this.availableSubcategories.length > 0) {
        this.formSubcategory = this.availableSubcategories[0].name;
        this.isCustomSubcategory = false;
      } else {
        this.formSubcategory = '';
        this.isCustomSubcategory = true;
      }
    } else {
      this.availableSubcategories = [];
      this.formSubcategory = '';
      this.isCustomSubcategory = true;
    }
  }

  onSubcategoryChange(subName: string): void {
    if (subName === 'NEW_CUSTOM_SUBCATEGORY') {
      this.isCustomSubcategory = true;
      this.formSubcategory = '';
    } else {
      this.isCustomSubcategory = false;
      this.formSubcategory = subName;
    }
  }

  calculateDiscount(): void {
    const orig = this.formOriginalPrice;
    const sale = this.formSellingPrice;
    if (orig > 0 && sale > 0 && orig > sale) {
      this.formDiscount = Math.round(((orig - sale) / orig) * 100);
    }
  }

  onDiscountChange(): void {
    const orig = this.formOriginalPrice;
    const disc = this.formDiscount;
    if (orig > 0 && disc > 0 && disc < 100) {
      this.formSellingPrice = Math.round(orig * (1 - disc / 100));
    }
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      if (file.size > 1 * 1024 * 1024) {
        Swal.fire({
          icon: 'warning',
          title: 'File Exceeds 1MB',
          text: `Photo "${file.name}" exceeds 1MB. Please select smaller images.`,
          confirmButtonColor: '#198754'
        });
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Str = reader.result as string;
        this.isUploading = true;
        this.mandiRateService.uploadCropImage(base64Str).subscribe({
          next: (res: any) => {
            this.isUploading = false;
            if (res.success && res.url) {
              this.formImages.push(res.url);
            }
          },
          error: () => {
            this.isUploading = false;
            Swal.fire('Upload Failed', 'Could not upload photo', 'error');
          }
        });
      };
    });
  }

  removeImageAtIndex(index: number): void {
    if (index >= 0 && index < this.formImages.length) {
      this.formImages.splice(index, 1);
    }
  }

  applyTextFormat(tag: string): void {
    if (!this.formDescription) this.formDescription = '';
    if (tag === 'b') {
      this.formDescription += ' <b>Bold Text</b> ';
    } else if (tag === 'i') {
      this.formDescription += ' <i>Italic Text</i> ';
    } else if (tag === 'ul') {
      this.formDescription += '\n• Spec item 1\n• Spec item 2\n';
    } else if (tag === 'h') {
      this.formDescription += '\n<b><u>QUALITY SPECIFICATIONS:</u></b>\n';
    } else if (tag === 'moisture') {
      this.formDescription += ' [Moisture: <12%, Packaging: 50kg Bags] ';
    }
  }

  submitCropListing(): void {
    if (!this.formName || !this.formName.trim()) {
      Swal.fire('Required', 'Please enter your Name.', 'warning');
      return;
    }

    if (!this.formMobile || this.formMobile.trim().length < 10) {
      Swal.fire('Required', 'Please enter a valid Mobile Number.', 'warning');
      return;
    }

    if (!this.formTitle || !this.formTitle.trim()) {
      Swal.fire('Required', 'Please enter Crop / Product Name.', 'warning');
      return;
    }

    if (!this.formCategory) {
      Swal.fire('Required', 'Please select a Category.', 'warning');
      return;
    }

    if (!this.formSellingPrice || this.formSellingPrice <= 0) {
      Swal.fire('Required', 'Please enter Price.', 'warning');
      return;
    }

    this.calculateDiscount();

    const cropData = {
      postedBy: this.farmerUser?._id || this.farmerUser?.id || undefined,
      postedByRole: 'farmer',
      postedByName: this.formName,
      postedByMobile: this.formMobile,
      type: 'sell',
      cropName: this.formTitle,
      category: this.formCategory,
      subcategory: this.formSubcategory,
      variety: this.formVariety,
      quantity: this.formQuantity,
      unit: this.formUnit,
      originalPrice: this.formOriginalPrice,
      expectedPrice: this.formSellingPrice,
      discountPercentage: this.formDiscount,
      priceUnit: 'Quintal',
      location: this.formLocation || 'Bihar',
      description: this.formDescription,
      images: this.formImages,
      status: 'active',
      approvalStatus: 'pending',
      isApproved: false
    };

    this.isSubmitting = true;
    this.mandiRateService.createCropListing(cropData).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        if (res.success) {
          this.closeCreateModal();
          this.loadMyFarmerCrops();
          Swal.fire({
            icon: 'success',
            title: 'Submitted for Admin Approval! ⏳',
            html: `
              <div class="text-start">
                <p class="mb-2">Your listing for <strong>"${this.formTitle}"</strong> has been submitted successfully!</p>
                <div class="alert alert-warning p-2.5 rounded-3 fs-7 mb-0">
                  <i class="bi bi-clock-history me-1"></i>
                  <strong>Status: Pending Admin Verification</strong><br>
                  Admin team will review and approve your listing. Once approved by Admin, it will be published live on KrisiMarg marketplace!
                </div>
              </div>
            `,
            confirmButtonText: 'Understood!',
            confirmButtonColor: '#198754'
          });
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        Swal.fire('Error', err.error?.message || 'Failed to submit crop listing', 'error');
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
