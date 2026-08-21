import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { MandiRateService } from '../../pages/home/mandi-rate.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-buyer-product',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, FormsModule],
  templateUrl: './buyer-product.component.html',
  styleUrl: './buyer-product.component.scss'
})
export class BuyerProductComponent implements OnInit {
  private authService = inject(AuthService);
  private mandiRateService = inject(MandiRateService);

  isLoggedIn = false;
  buyerUser: any = null;
  isLoading = false;

  myDemandsList: any[] = [];
  selectedFilter: 'all' | 'approved' | 'pending' | 'rejected' = 'all';

  dbCategories: any[] = [];
  availableSubcategories: any[] = [];

  // Requirement Details Modal State
  selectedDemandForDetails: any = null;
  showDetailsModal = false;
  activeImageIndex = 0;

  // Buyer Create Purchasing Demand Modal State
  showCreateModal = false;
  isSubmitting = false;
  isUploading = false;
  isCustomCategory = false;
  isCustomSubcategory = false;

  formRole: 'farmer' | 'buyer' = 'buyer';
  formType: 'sell' | 'buy' = 'buy';
  formName = '';
  formMobile = '';
  formTitle = '';
  formCategory = '';
  formSubcategory = '';
  formVariety = '';
  formQuantity = 0;
  formUnit = 'Qtl';
  formOriginalPrice = 0;
  formSellingPrice = 0;
  formDiscount = 10;
  formLocation = '';
  formDescription = '';
  formImages: string[] = [];

  ngOnInit(): void {
    this.checkUser();
    this.loadDbCategories();
    this.loadMyBuyerDemands();
  }

  checkUser(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.buyerUser = this.authService.getUser();
      if (this.buyerUser) {
        this.formName = this.buyerUser.name || '';
        this.formMobile = this.buyerUser.mobile || '';
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

  loadMyBuyerDemands(): void {
    this.isLoading = true;
    this.mandiRateService.getApprovedCrops('buyer').subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.myDemandsList = res.data;
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get filteredDemands(): any[] {
    if (this.selectedFilter === 'approved') {
      return this.myDemandsList.filter(c => c.approvalStatus === 'approved' || c.isApproved);
    }
    if (this.selectedFilter === 'pending') {
      return this.myDemandsList.filter(c => c.approvalStatus === 'pending' && !c.isApproved);
    }
    if (this.selectedFilter === 'rejected') {
      return this.myDemandsList.filter(c => c.approvalStatus === 'rejected');
    }
    return this.myDemandsList;
  }

  private router = inject(Router);

  viewDemandDetails(item: any): void {
    if (item) {
      const targetId = item.slug || item._id;
      if (targetId) {
        this.router.navigate(['/buyer/product', targetId]);
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

  // Rich Text Formatting Helper
  applyTextFormat(tag: string): void {
    if (!this.formDescription) this.formDescription = '';
    if (tag === 'b') {
      this.formDescription += ' <b>Bold Text</b> ';
    } else if (tag === 'i') {
      this.formDescription += ' <i>Italic Text</i> ';
    } else if (tag === 'ul') {
      this.formDescription += '\n• Requirement spec 1\n• Requirement spec 2\n';
    } else if (tag === 'h') {
      this.formDescription += '\n<b><u>PROCUREMENT TERMS:</u></b>\n';
    } else if (tag === 'moisture') {
      this.formDescription += ' [Acceptable Moisture: <12%, Payment: Instant RTGS] ';
    }
  }

  openCreateModal(): void {
    this.formRole = 'buyer';
    this.formType = 'buy';
    if (this.buyerUser) {
      this.formName = this.buyerUser.name || '';
      this.formMobile = this.buyerUser.mobile || '';
    }
    this.formTitle = '';
    this.formVariety = '';
    this.formQuantity = 0;
    this.formUnit = 'Qtl';
    this.formOriginalPrice = 0;
    this.formSellingPrice = 0;
    this.formDiscount = 10;
    this.formLocation = 'Uttar Pradesh';
    this.formDescription = '<b>Bulk Purchase Specs</b>\n• Grade A Quality required\n• Moisture below 12%\n• Direct farm pickup with instant RTGS payment.';
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
      Swal.fire('Required', 'Please enter Crop / Requirement Name.', 'warning');
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
      postedByRole: 'buyer',
      postedByName: this.formName,
      postedByMobile: this.formMobile,
      type: 'buy',
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
      location: this.formLocation || 'Uttar Pradesh',
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
          this.loadMyBuyerDemands();
          Swal.fire({
            icon: 'success',
            title: 'Submitted for Admin Approval! ⏳',
            html: `
              <div class="text-start">
                <p class="mb-2">Your purchasing requirement for <strong>"${this.formTitle}"</strong> has been submitted successfully!</p>
                <div class="alert alert-warning p-2.5 rounded-3 fs-7 mb-0">
                  <i class="bi bi-clock-history me-1"></i>
                  <strong>Status: Pending Admin Verification</strong><br>
                  Admin team will review and approve your requirement. Once approved by Admin, it will be published live on KrisiMarg marketplace!
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
        Swal.fire('Error', err.error?.message || 'Failed to submit buyer demand', 'error');
      }
    });
  }
}
