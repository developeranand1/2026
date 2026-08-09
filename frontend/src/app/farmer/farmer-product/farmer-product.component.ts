import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { MandiRateService } from '../../pages/home/mandi-rate.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-farmer-product',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, FormsModule],
  templateUrl: './farmer-product.component.html',
  styleUrl: './farmer-product.component.scss'
})
export class FarmerProductComponent implements OnInit {
  private authService = inject(AuthService);
  private mandiRateService = inject(MandiRateService);

  isLoggedIn = false;
  farmerUser: any = null;
  isLoading = false;

  myCropsList: any[] = [];
  selectedFilter: 'all' | 'approved' | 'pending' | 'rejected' = 'all';

  dbCategories: any[] = [];
  availableSubcategories: any[] = [];

  // Product Details Modal State
  selectedCropForDetails: any = null;
  showDetailsModal = false;
  activeImageIndex = 0;

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
  formOriginalPrice = 2400;
  formSellingPrice = 2160;
  formDiscount = 10;
  formLocation = '';
  formDescription = '';
  formImages: string[] = [];

  ngOnInit(): void {
    this.checkUser();
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
        if (res.success && res.data) {
          this.dbCategories = res.data;
          if (this.dbCategories.length > 0) {
            this.formCategory = this.dbCategories[0].name;
            this.onCategoryChange(this.formCategory);
          }
        }
      }
    });
  }

  loadMyFarmerCrops(): void {
    this.isLoading = true;
    this.mandiRateService.getApprovedCrops('farmer').subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.myCropsList = res.data;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get filteredCrops(): any[] {
    if (this.selectedFilter === 'approved') {
      return this.myCropsList.filter(c => c.approvalStatus === 'approved' || c.isApproved);
    }
    if (this.selectedFilter === 'pending') {
      return this.myCropsList.filter(c => c.approvalStatus === 'pending' && !c.isApproved);
    }
    if (this.selectedFilter === 'rejected') {
      return this.myCropsList.filter(c => c.approvalStatus === 'rejected');
    }
    return this.myCropsList;
  }

  private router = inject(Router);

  viewCropDetails(crop: any): void {
    if (crop) {
      const targetId = crop.slug || crop._id;
      if (targetId) {
        this.router.navigate(['/farmer/product', targetId]);
      }
    }
  }

  setActiveImage(idx: number): void {
    this.activeImageIndex = idx;
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

  // Rich Text Editor Toolbar Helpers
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
    this.formOriginalPrice = 2400;
    this.formSellingPrice = 2160;
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

  calculateDiscount(): void {
    const orig = this.formOriginalPrice || 0;
    const sale = this.formSellingPrice || 0;
    if (orig > 0 && sale > 0 && orig > sale) {
      this.formDiscount = Math.round(((orig - sale) / orig) * 100);
    }
  }

  onDiscountChange(): void {
    const orig = this.formOriginalPrice || 0;
    const disc = this.formDiscount || 0;
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
                  Admin team will review and approve your listing. Once approved by Admin, it will be published live on GaonBazar marketplace!
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
}
