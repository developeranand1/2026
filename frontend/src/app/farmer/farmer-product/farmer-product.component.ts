import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { MandiRateService } from '../../pages/home/mandi-rate.service';
import { PaymentService } from '../../core/payment.service';
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
  private paymentService = inject(PaymentService);

  isLoggedIn = false;
  farmerUser: any = null;
  isLoading = false;

  hasPaidListingFee = false;
  showActivationModal = false;
  isActivatingFee = false;

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
  formOriginalPrice = 0;
  formSellingPrice = 0;
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
        if (this.farmerUser.hasPaidListingFee || this.farmerUser.role === 'admin') {
          this.hasPaidListingFee = true;
        }
      }
    }

    // Sync active listing access status from backend
    const uid = this.farmerUser?._id || this.farmerUser?.id;
    const mob = this.farmerUser?.mobile;
    if (uid || mob) {
      this.paymentService.checkListingStatus(uid, mob).subscribe({
        next: (res) => {
          if (res && res.hasPaidListingFee) {
            this.hasPaidListingFee = true;
            if (this.farmerUser && !this.farmerUser.hasPaidListingFee) {
              this.farmerUser.hasPaidListingFee = true;
              this.authService.saveUser(this.farmerUser);
            }
          }
        },
        error: () => {}
      });
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
    const userId = this.farmerUser?._id || this.farmerUser?.id;
    const mobile = this.farmerUser?.mobile;
    const name = this.farmerUser?.name;

    if (!userId && !mobile && !name) {
      this.myCropsList = [];
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    this.mandiRateService.getCropsByUser(userId, mobile, name, 'farmer', 'sell').subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.success && Array.isArray(res.data)) {
          this.myCropsList = res.data;
        } else {
          this.myCropsList = [];
        }
      },
      error: () => {
        this.isLoading = false;
        this.myCropsList = [];
      }
    });
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
    if (!this.hasPaidListingFee && this.farmerUser?.role !== 'admin') {
      this.showActivationModal = true;
      return;
    }

    this.formRole = 'farmer';
    this.formType = 'sell';
    if (this.farmerUser) {
      this.formName = this.farmerUser.name || '';
      this.formMobile = this.farmerUser.mobile || '';
    }
    this.formTitle = '';
    this.formVariety = '';
    this.formQuantity = 0;
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
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  closeActivationModal(): void {
    this.showActivationModal = false;
  }

  payActivationFee(): void {
    const name = this.farmerUser?.name || this.formName || 'Farmer';
    const mobile = this.farmerUser?.mobile || this.formMobile || '';

    this.isActivatingFee = true;

    // 1. Create Razorpay order for ₹99 Unlimited Listing Activation
    this.paymentService.createListingOrder('Unlimited Produce Listing Activation', name, mobile).subscribe({
      next: async (res) => {
        if (!res || !res.success || !res.order) {
          this.isActivatingFee = false;
          Swal.fire('Payment Gateway Error', 'Unable to initiate payment gateway. Please try again.', 'error');
          return;
        }

        try {
          // 2. Open Razorpay Checkout popup (UPI / QR / Cards / NetBanking)
          const checkoutRes = await this.paymentService.openRazorpayCheckout(
            res.order,
            res.keyId,
            this.farmerUser || { name, mobile },
            'Unlimited Produce Listing Access'
          );

          // 3. Verify Payment & Activate Lifetime Unlimited Listings
          const userId = this.farmerUser?._id || this.farmerUser?.id;
          this.paymentService.activateUnlimitedListing({
            razorpay_order_id: checkoutRes.razorpay_order_id,
            razorpay_payment_id: checkoutRes.razorpay_payment_id,
            razorpay_signature: checkoutRes.razorpay_signature,
            userId,
            mobile,
            name
          }).subscribe({
            next: (verifyRes: any) => {
              this.isActivatingFee = false;
              if (verifyRes.success) {
                this.hasPaidListingFee = true;
                if (this.farmerUser) {
                  this.farmerUser.hasPaidListingFee = true;
                  this.authService.saveUser(this.farmerUser);
                }
                this.closeActivationModal();

                Swal.fire({
                  icon: 'success',
                  title: '₹99 Payment Successful! 🎉',
                  html: `
                    <div class="text-start">
                      <div class="alert alert-success d-flex align-items-center gap-2 p-3 mb-3 rounded-3">
                        <i class="bi bi-patch-check-fill fs-4 text-success"></i>
                        <div>
                          <strong>Unlimited Listings Unlocked!</strong><br>
                          <small class="text-muted">Payment ID: <code>${checkoutRes.razorpay_payment_id}</code></small>
                        </div>
                      </div>
                      <p class="mb-0 text-secondary">Aapka seller access activate ho chuka hai! Ab aap <strong>Unlimited Crop Produce</strong> add aur sell kar sakte hain bina kisi extra charge ke.</p>
                    </div>
                  `,
                  confirmButtonText: 'Add First Crop Produce 🚀',
                  confirmButtonColor: '#198754'
                }).then(() => {
                  // Automatically open the Add Product modal immediately!
                  this.openCreateModal();
                });
              } else {
                Swal.fire('Payment Verification Failed', verifyRes.message || 'Signature verification failed', 'error');
              }
            },
            error: (verifyErr: any) => {
              this.isActivatingFee = false;
              Swal.fire('Error', verifyErr.error?.message || 'Payment verification failed on server', 'error');
            }
          });
        } catch (checkoutErr: any) {
          this.isActivatingFee = false;
          if (checkoutErr.message === 'PAYMENT_DISMISSED') {
            Swal.fire({
              icon: 'info',
              title: 'Payment Incomplete',
              text: 'Product add karne ke liye ₹99 one-time activation fee jaruri hai.',
              confirmButtonColor: '#198754'
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Payment Failed',
              text: checkoutErr.message || 'Could not complete payment process.',
              confirmButtonColor: '#d33'
            });
          }
        }
      },
      error: (orderErr: any) => {
        this.isActivatingFee = false;
        Swal.fire('Error', orderErr.error?.message || 'Could not initialize payment order', 'error');
      }
    });
  }

  calculateDiscount(): void {
    const orig = this.formOriginalPrice ;
    const sale = this.formSellingPrice ;
    if (orig > 0 && sale > 0 && orig > sale) {
      this.formDiscount = Math.round(((orig - sale) / orig) * 100);
    }
  }

  onDiscountChange(): void {
    const orig = this.formOriginalPrice ;
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

  submitCropListing(): void {
    if (!this.hasPaidListingFee && this.farmerUser?.role !== 'admin') {
      this.closeCreateModal();
      this.showActivationModal = true;
      return;
    }

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
      isApproved: false,
      isPaid: true,
      paymentStatus: 'paid'
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
                <div class="alert alert-warning p-3 rounded-3 fs-7 mb-0">
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
}
