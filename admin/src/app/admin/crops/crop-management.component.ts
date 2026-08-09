import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminCropService, CropListing } from '../../core/crop.service';
import { CategoryService, Category, Subcategory } from '../../core/category.service';
import { RichTextEditorComponent } from '../../shared/rich-text-editor/rich-text-editor.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crop-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RichTextEditorComponent],
  templateUrl: './crop-management.component.html',
  styleUrls: ['./crop-management.component.scss']
})
export class CropManagementComponent implements OnInit {
  private cropService = inject(AdminCropService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // View state: 'list' for dashboard table, 'create' for full create page, 'edit' for full edit page
  viewMode: 'list' | 'create' | 'edit' = 'list';

  cropsList: CropListing[] = [];
  get filteredCrops(): CropListing[] { return this.cropsList; }
  categoriesList: Category[] = [];
  availableSubcategories: Subcategory[] = [];

  get cropDescription(): string {
    return this.cropForm.description || '';
  }
  set cropDescription(val: string) {
    this.cropForm.description = val;
  }

  get cropImagesList(): string[] {
    if (this.cropForm.images && this.cropForm.images.length > 0) {
      return this.cropForm.images;
    }
    return this.cropForm.image ? [this.cropForm.image] : [];
  }

  isLoading = false;
  isUploading = false;

  // Filter States
  selectedRoleFilter = 'all';
  selectedTypeFilter = 'all';
  selectedStatusFilter = 'all';
  selectedApprovalFilter = 'all';
  selectedCategoryFilter = 'all';
  searchQuery = '';

  cropForm: CropListing = {
    postedByRole: 'admin',
    postedByName: 'GaonBazar Admin',
    postedByMobile: '9999999999',
    type: 'sell',
    cropName: '',
    category: '',
    subcategory: '',
    variety: '',
    grade: 'Grade A',
    quantity: 10,
    unit: 'Qtl',
    originalPrice: 2450,
    expectedPrice: 2200,
    discountPercentage: 10,
    priceUnit: 'Quintal',
    location: 'Uttar Pradesh',
    description: '',
    image: '',
    images: [],
    status: 'active',
    isApproved: true,
    approvalStatus: 'approved'
  };

  ngOnInit(): void {
    this.loadCategories();

    this.route.params.subscribe((params) => {
      const id = params['id'];
      const currentUrl = this.router.url;

      if (currentUrl.includes('/crops/create')) {
        this.viewMode = 'create';
        this.resetCropForm();
      } else if (id || currentUrl.includes('/crops/edit/')) {
        this.viewMode = 'edit';
        const cropId = id || currentUrl.split('/crops/edit/')[1];
        if (cropId) {
          this.loadCropForEdit(cropId);
        }
      } else {
        this.viewMode = 'list';
        this.loadCrops();
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.categoriesList = res.data;
          if (this.viewMode === 'create' && this.categoriesList.length > 0) {
            if (!this.cropForm.category) {
              this.cropForm.category = this.categoriesList[0].name;
            }
            this.onCategoryChange(this.cropForm.category);
          }
        }
      }
    });
  }

  onCategoryChange(categoryName: string): void {
    const matchedCat = this.categoriesList.find(c => c.name === categoryName);
    if (matchedCat && matchedCat.subcategories) {
      this.availableSubcategories = matchedCat.subcategories;
      if (this.availableSubcategories.length > 0) {
        this.cropForm.subcategory = this.availableSubcategories[0].name;
      } else {
        this.cropForm.subcategory = '';
      }
    } else {
      this.availableSubcategories = [];
      this.cropForm.subcategory = '';
    }
  }

  // Calculate discount percentage automatically
  calculateDiscount(): void {
    const orig = this.cropForm.originalPrice || 0;
    const sale = this.cropForm.expectedPrice || 0;
    if (orig > 0 && sale > 0 && orig > sale) {
      this.cropForm.discountPercentage = Math.round(((orig - sale) / orig) * 100);
    } else if (orig === sale || orig === 0) {
      this.cropForm.discountPercentage = 0;
    }
  }

  // Calculate sale price from discount percentage
  onDiscountPercentageChange(): void {
    const orig = this.cropForm.originalPrice || 0;
    const disc = this.cropForm.discountPercentage || 0;
    if (orig > 0 && disc > 0 && disc < 100) {
      this.cropForm.expectedPrice = Math.round(orig * (1 - disc / 100));
    }
  }

  loadCrops(): void {
    this.isLoading = true;
    this.cropService.getCrops(
      this.selectedRoleFilter,
      this.selectedTypeFilter,
      this.selectedStatusFilter,
      this.selectedCategoryFilter,
      this.selectedApprovalFilter,
      this.searchQuery
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.cropsList = res.data;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching crops:', err);
      }
    });
  }

  loadCropForEdit(id: string): void {
    this.isLoading = true;
    this.cropService.getCropById(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          const imgs = res.data.images && res.data.images.length > 0 ? res.data.images : (res.data.image ? [res.data.image] : []);
          this.cropForm = {
            ...res.data,
            originalPrice: res.data.originalPrice || res.data.expectedPrice || 0,
            discountPercentage: res.data.discountPercentage || 0,
            description: res.data.description || '',
            subcategory: res.data.subcategory || '',
            variety: res.data.variety || '',
            image: imgs.length > 0 ? imgs[0] : '',
            images: imgs,
            approvalStatus: res.data.approvalStatus || 'approved'
          };
          if (this.cropForm.category) {
            const matchedCat = this.categoriesList.find(c => c.name === this.cropForm.category);
            if (matchedCat && matchedCat.subcategories) {
              this.availableSubcategories = matchedCat.subcategories;
            }
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to load crop details for editing.', 'error');
        this.goToList();
      }
    });
  }

  filterByRole(role: string): void {
    this.selectedRoleFilter = role;
    this.loadCrops();
  }

  filterByType(type: string): void {
    this.selectedTypeFilter = type;
    this.loadCrops();
  }

  filterByApproval(status: string): void {
    this.selectedApprovalFilter = status;
    this.loadCrops();
  }

  onSearch(): void {
    this.loadCrops();
  }

  // Cloudinary Multi-File Upload Event with 1MB Limit Check per File
  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    if (!this.cropForm.images) {
      this.cropForm.images = [];
    }

    const fileArray = Array.from(files);
    let uploadedCount = 0;

    fileArray.forEach((file) => {
      if (file.size > 1 * 1024 * 1024) {
        Swal.fire({
          icon: 'warning',
          title: 'File Too Large',
          text: `Image "${file.name}" exceeds 1MB limit. Please select files smaller than 1MB.`,
          confirmButtonColor: '#198754'
        });
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Str = reader.result as string;
        this.isUploading = true;
        this.cropService.uploadCropImage(base64Str).subscribe({
          next: (res) => {
            this.isUploading = false;
            if (res.success && res.url) {
              this.cropForm.images!.push(res.url);
              this.cropForm.image = this.cropForm.images![0];
              uploadedCount++;
              if (uploadedCount === fileArray.length) {
                Swal.fire({
                  icon: 'success',
                  title: 'Photos Uploaded!',
                  text: 'Crop photos uploaded to Cloudinary gallery.',
                  timer: 2000,
                  showConfirmButton: false
                });
              }
            }
          },
          error: (err) => {
            this.isUploading = false;
            Swal.fire('Upload Error', err.error?.message || 'Failed to upload photo', 'error');
          }
        });
      };
    });
  }

  removeImageAtIndex(index: number): void {
    if (this.cropForm.images && index >= 0 && index < this.cropForm.images.length) {
      this.cropForm.images.splice(index, 1);
      this.cropForm.image = this.cropForm.images.length > 0 ? this.cropForm.images[0] : '';
    }
  }

  toggleCropApproval(crop: CropListing, targetStatus: 'approved' | 'pending' | 'rejected', event?: Event): void {
    if (event) event.stopPropagation();
    if (!crop._id) return;

    const actionText = targetStatus === 'approved' ? 'Approve' : (targetStatus === 'rejected' ? 'Reject' : 'Hold');

    Swal.fire({
      title: `${actionText} Crop Listing?`,
      text: `Mark listing '${crop.cropName}' as ${targetStatus.toUpperCase()}?`,
      icon: targetStatus === 'approved' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: targetStatus === 'approved' ? '#198754' : '#dc3545',
      confirmButtonText: `Yes, ${actionText}`
    }).then((result) => {
      if (result.isConfirmed) {
        this.cropService.updateCropApproval(crop._id!, targetStatus).subscribe({
          next: (res) => {
            if (res.success) {
              crop.approvalStatus = targetStatus;
              crop.isApproved = targetStatus === 'approved';
              Swal.fire({
                icon: 'success',
                title: 'Approval Updated!',
                text: `Listing is now ${targetStatus.toUpperCase()}.`,
                timer: 2000,
                showConfirmButton: false
              });
            }
          },
          error: (err) => {
            Swal.fire('Error', 'Failed to update approval status', 'error');
          }
        });
      }
    });
  }

  // NAVIGATION & FORM HANDLERS
  openCreatePage(): void {
    this.router.navigate(['/admin/crops/create']);
  }

  openEditPage(crop: CropListing): void {
    this.router.navigate(['/admin/crops/edit', crop._id]);
  }

  goToList(): void {
    this.router.navigate(['/admin/crops']);
  }

  resetCropForm(): void {
    const defaultCategory = this.categoriesList.length > 0 ? this.categoriesList[0].name : '';
    this.cropForm = {
      postedByRole: 'admin',
      postedByName: 'GaonBazar Admin',
      postedByMobile: '9999999999',
      type: 'sell',
      cropName: '',
      category: defaultCategory,
      subcategory: '',
      variety: '',
      grade: 'Grade A',
      quantity: 10,
      unit: 'Qtl',
      originalPrice: 2450,
      expectedPrice: 2200,
      discountPercentage: 10,
      priceUnit: 'Quintal',
      location: 'Uttar Pradesh',
      description: '',
      image: '',
      images: [],
      status: 'active',
      isApproved: true,
      approvalStatus: 'approved'
    };
    if (defaultCategory) {
      this.onCategoryChange(defaultCategory);
    }
  }

  saveCrop(): void {
    if (!this.cropForm.cropName || !this.cropForm.cropName.trim()) {
      Swal.fire('Validation Error', 'Crop/Product Name is required.', 'warning');
      return;
    }

    if (!this.cropForm.category || !this.cropForm.category.trim()) {
      Swal.fire('Validation Error', 'Please select a Category from the database.', 'warning');
      return;
    }

    if (!this.cropForm.expectedPrice || this.cropForm.expectedPrice <= 0) {
      Swal.fire('Validation Error', 'Expected Price must be greater than 0.', 'warning');
      return;
    }

    this.calculateDiscount();

    if (this.viewMode === 'edit' && this.cropForm._id) {
      this.cropService.updateCrop(this.cropForm._id, this.cropForm).subscribe({
        next: (res) => {
          if (res.success) {
            Swal.fire('Updated!', 'Crop product listing updated successfully.', 'success');
            this.goToList();
          }
        },
        error: (err) => {
          Swal.fire('Error', err.error?.message || 'Failed to update crop', 'error');
        }
      });
    } else {
      this.cropService.createCrop(this.cropForm).subscribe({
        next: (res) => {
          if (res.success) {
            Swal.fire('Created!', 'New crop product listing created successfully.', 'success');
            this.goToList();
          }
        },
        error: (err) => {
          Swal.fire('Error', err.error?.message || 'Failed to create crop', 'error');
        }
      });
    }
  }

  deleteCrop(crop: CropListing): void {
    if (!crop._id) return;
    Swal.fire({
      title: `Delete '${crop.cropName}'?`,
      text: `Are you sure you want to permanently delete this ${crop.type === 'sell' ? 'Crop Listing' : 'Buyer Purchase Request'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Delete Listing'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cropService.deleteCrop(crop._id!).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire('Deleted!', 'Listing removed from database.', 'success');
              if (this.viewMode === 'list') {
                this.loadCrops();
              } else {
                this.goToList();
              }
            }
          }
        });
      }
    });
  }
}
