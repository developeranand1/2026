import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category, Subcategory } from '../../core/category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-management.component.html',
  styleUrl: './category-management.component.scss'
})
export class CategoryManagementComponent implements OnInit {
  private categoryService = inject(CategoryService);

  categories: Category[] = [];
  filteredCategories: Category[] = [];
  searchQuery = '';
  isLoading = true;
  isUploading = false;

  selectedCategoryForSub: Category | null = null;
  presetImages = this.categoryService.PRESET_IMAGES;

  // Modal State for Category
  showCategoryModal = false;
  isEditCategory = false;
  categoryForm: Category = {
    name: '',
    description: '',
    image: '',
    icon: 'bi-tag-fill',
    isActive: true,
    displayOrder: 0
  };

  // Modal State for Subcategory
  showSubcategoryModal = false;
  isEditSubcategory = false;
  subcategoryForm: { id?: string; name: string; categoryId: string; description: string; image: string } = {
    name: '',
    categoryId: '',
    description: '',
    image: ''
  };

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.categories = res.data;
          this.filterCategories();
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching categories:', err);
      }
    });
  }

  filterCategories(): void {
    if (!this.searchQuery.trim()) {
      this.filteredCategories = [...this.categories];
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredCategories = this.categories.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  }

  // Cloudinary File Upload Event
  onFileSelected(event: any, target: 'category' | 'subcategory'): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Str = reader.result as string;
      this.isUploading = true;
      this.categoryService.uploadCloudinaryImage(base64Str).subscribe({
        next: (res) => {
          this.isUploading = false;
          if (res.success && res.url) {
            if (target === 'category') {
              this.categoryForm.image = res.url;
            } else {
              this.subcategoryForm.image = res.url;
            }
            Swal.fire('Cloudinary Upload Success', 'Image uploaded to Cloudinary!', 'success');
          }
        },
        error: (err) => {
          this.isUploading = false;
          Swal.fire('Upload Error', err.error?.message || 'Failed to upload to Cloudinary', 'error');
        }
      });
    };
  }

  selectPresetImage(url: string, target: 'category' | 'subcategory'): void {
    if (target === 'category') {
      this.categoryForm.image = url;
    } else {
      this.subcategoryForm.image = url;
    }
  }

  // CATEGORY CRUD
  openAddCategoryModal(): void {
    this.isEditCategory = false;
    this.categoryForm = {
      name: '',
      description: '',
      image: this.presetImages[0].url,
      icon: 'bi-tag-fill',
      isActive: true,
      displayOrder: this.categories.length + 1
    };
    this.showCategoryModal = true;
  }

  openEditCategoryModal(cat: Category): void {
    this.isEditCategory = true;
    this.categoryForm = { ...cat };
    this.showCategoryModal = true;
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
  }

  saveCategory(): void {
    if (!this.categoryForm.name.trim()) {
      Swal.fire('Validation Error', 'Category Name is required.', 'warning');
      return;
    }

    if (this.isEditCategory && this.categoryForm._id) {
      this.categoryService.updateCategory(this.categoryForm._id, this.categoryForm).subscribe({
        next: () => {
          Swal.fire('Updated!', 'Category updated successfully.', 'success');
          this.closeCategoryModal();
          this.loadCategories();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.message || 'Failed to update category', 'error');
        }
      });
    } else {
      this.categoryService.createCategory(this.categoryForm).subscribe({
        next: () => {
          Swal.fire('Created!', 'Category created successfully.', 'success');
          this.closeCategoryModal();
          this.loadCategories();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.message || 'Failed to create category', 'error');
        }
      });
    }
  }

  toggleCategoryStatus(cat: Category): void {
    if (!cat._id) return;
    const newStatus = !cat.isActive;
    this.categoryService.updateCategory(cat._id, { isActive: newStatus }).subscribe({
      next: () => {
        cat.isActive = newStatus;
        Swal.fire('Status Updated', `Category is now ${newStatus ? 'Active' : 'Disabled'}`, 'success');
      }
    });
  }

  deleteCategory(cat: Category): void {
    if (!cat._id) return;
    Swal.fire({
      title: `Delete '${cat.name}'?`,
      text: 'This will delete the category and all associated subcategories.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, Delete'
    }).then((res) => {
      if (res.isConfirmed) {
        this.categoryService.deleteCategory(cat._id!).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Category deleted.', 'success');
            this.loadCategories();
          }
        });
      }
    });
  }

  // SUBCATEGORY CRUD
  openAddSubcategoryModal(cat: Category): void {
    this.selectedCategoryForSub = cat;
    this.isEditSubcategory = false;
    this.subcategoryForm = {
      name: '',
      categoryId: cat._id!,
      description: '',
      image: cat.image || this.presetImages[0].url
    };
    this.showSubcategoryModal = true;
  }

  openEditSubcategoryModal(sub: Subcategory, cat: Category): void {
    this.selectedCategoryForSub = cat;
    this.isEditSubcategory = true;
    this.subcategoryForm = {
      id: sub._id,
      name: sub.name,
      categoryId: cat._id!,
      description: sub.description || '',
      image: sub.image || ''
    };
    this.showSubcategoryModal = true;
  }

  closeSubcategoryModal(): void {
    this.showSubcategoryModal = false;
  }

  saveSubcategory(): void {
    if (!this.subcategoryForm.name.trim()) {
      Swal.fire('Validation Error', 'Subcategory Name is required.', 'warning');
      return;
    }

    if (this.isEditSubcategory && this.subcategoryForm.id) {
      this.categoryService.updateSubcategory(this.subcategoryForm.id, {
        name: this.subcategoryForm.name,
        description: this.subcategoryForm.description,
        image: this.subcategoryForm.image
      }).subscribe({
        next: () => {
          Swal.fire('Updated!', 'Subcategory updated.', 'success');
          this.closeSubcategoryModal();
          this.loadCategories();
        }
      });
    } else {
      this.categoryService.createSubcategory({
        name: this.subcategoryForm.name,
        categoryId: this.subcategoryForm.categoryId,
        description: this.subcategoryForm.description,
        image: this.subcategoryForm.image
      }).subscribe({
        next: () => {
          Swal.fire('Created!', 'Subcategory added.', 'success');
          this.closeSubcategoryModal();
          this.loadCategories();
        }
      });
    }
  }

  deleteSubcategory(subId: string): void {
    Swal.fire({
      title: 'Delete Subcategory?',
      text: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545'
    }).then((res) => {
      if (res.isConfirmed) {
        this.categoryService.deleteSubcategory(subId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Subcategory deleted.', 'success');
            this.loadCategories();
          }
        });
      }
    });
  }

  seedDefaultCategories(): void {
    this.categoryService.seedCategories().subscribe({
      next: () => {
        Swal.fire('Success', 'Default categories seeded!', 'success');
        this.loadCategories();
      }
    });
  }
}
