import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminNewsService, NewsArticle, NewsType } from '../../core/news.service';
import { RichTextEditorComponent } from '../../shared/rich-text-editor/rich-text-editor.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-news-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, RouterModule, RichTextEditorComponent],
  templateUrl: './news-management.component.html',
  styleUrl: './news-management.component.scss'
})
export class NewsManagementComponent implements OnInit {
  private newsService = inject(AdminNewsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // View state: 'list' for table dashboard, 'form' for full page create/edit
  viewMode: 'list' | 'form' = 'list';

  newsList: NewsArticle[] = [];
  newsTypes: NewsType[] = [];

  stats = {
    total: 0,
    published: 0,
    draft: 0,
    featured: 0
  };

  selectedTypeFilter = 'All';
  selectedStatusFilter = 'All';
  searchTerm = '';
  isLoading = false;
  isSaving = false;

  // Article Form State
  isEditing = false;
  currentArticleId = '';

  // Form Fields
  formTitle = '';
  formSlug = '';
  formNewsType = '';
  formShortDescription = '';
  formDescription = '';
  formImage = '';
  formStatus: 'Draft' | 'Published' | 'Archived' = 'Published';
  formIsFeatured = false;
  formAuthor = 'GaonBazar News Desk';

  // SEO Meta Fields
  formMetaTitle = '';
  formMetaDescription = '';
  formMetaKeywords = '';

  // Image Upload Preview State
  imagePreview: string | null = null;
  imageUploadError = '';

  // NewsType Manager Modal State
  newsTypeModalOpen = false;
  editingTypeId = '';
  typeFormTitle = '';
  typeFormDescription = '';

  // Notification Toast
  toastMessage = '';
  toastType: 'success' | 'danger' = 'success';

  ngOnInit(): void {
    this.loadNewsTypes();

    this.route.url.subscribe(() => {
      const path = this.route.snapshot.url.map(u => u.path).join('/');
      const params = this.route.snapshot.params;

      if (path === 'create' || this.router.url.includes('/news/create')) {
        this.viewMode = 'form';
        this.initCreateForm();
      } else if (params['id'] || this.router.url.includes('/news/edit/')) {
        const id = params['id'] || this.router.url.split('/news/edit/')[1];
        this.viewMode = 'form';
        if (id) {
          this.loadArticleForEdit(id);
        }
      } else {
        this.viewMode = 'list';
        this.loadNews();
      }
    });
  }

  loadNewsTypes(): void {
    this.newsService.getNewsTypes().subscribe({
      next: (res) => {
        if (res.success) {
          this.newsTypes = res.data;
          if (!this.formNewsType && this.newsTypes.length > 0) {
            this.formNewsType = this.newsTypes[0]._id;
          }
        }
      },
      error: (err) => {
        this.showToast('Failed to load news categories', 'danger');
      }
    });
  }

  loadNews(): void {
    this.isLoading = true;
    this.newsService.getNews(this.selectedTypeFilter, this.selectedStatusFilter, this.searchTerm).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.newsList = res.data;
          this.stats = res.stats;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.showToast('Failed to load news articles', 'danger');
      }
    });
  }

  filterByType(typeId: string): void {
    this.selectedTypeFilter = typeId;
    this.loadNews();
  }

  filterByStatus(status: string): void {
    this.selectedStatusFilter = status;
    this.loadNews();
  }

  onSearch(): void {
    this.loadNews();
  }

  onTitleChange(): void {
    if (!this.isEditing || !this.formSlug) {
      this.formSlug = this.slugify(this.formTitle);
    }
    if (!this.formMetaTitle) {
      this.formMetaTitle = this.formTitle;
    }
  }

  slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  // Navigation handlers
  openCreateArticlePage(): void {
    this.router.navigate(['/admin/news/create']);
  }

  openEditArticlePage(article: NewsArticle, event?: Event): void {
    if (event) event.stopPropagation();
    this.router.navigate(['/admin/news/edit', article._id]);
  }

  goToList(): void {
    this.router.navigate(['/admin/news']);
  }

  initCreateForm(): void {
    this.isEditing = false;
    this.currentArticleId = '';
    this.formTitle = '';
    this.formSlug = '';
    this.formNewsType = this.newsTypes.length > 0 ? this.newsTypes[0]._id : '';
    this.formShortDescription = '';
    this.formDescription = '';
    this.formImage = '';
    this.formStatus = 'Published';
    this.formIsFeatured = false;
    this.formAuthor = 'GaonBazar News Desk';
    this.formMetaTitle = '';
    this.formMetaDescription = '';
    this.formMetaKeywords = '';
    this.imagePreview = null;
    this.imageUploadError = '';
  }

  loadArticleForEdit(id: string): void {
    this.isLoading = true;
    this.newsService.getNewsById(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          const article = res.data;
          this.isEditing = true;
          this.currentArticleId = article._id;
          this.formTitle = article.title;
          this.formSlug = article.slug;
          this.formNewsType = typeof article.newsType === 'object' ? article.newsType._id : article.newsType;
          this.formShortDescription = article.shortDescription || '';
          this.formDescription = article.description;
          this.formImage = article.image || '';
          this.formStatus = article.status;
          this.formIsFeatured = article.isFeatured;
          this.formAuthor = article.author || 'GaonBazar News Desk';
          this.formMetaTitle = article.metaTitle || article.title;
          this.formMetaDescription = article.metaDescription || article.shortDescription || '';
          this.formMetaKeywords = article.metaKeywords || '';
          this.imagePreview = article.image || null;
          this.imageUploadError = '';
        }
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to fetch article details', 'error');
        this.goToList();
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.imageUploadError = '';

    // Validate size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      this.imageUploadError = 'Selected image size is too large (max 2MB allowed)';
      Swal.fire('File Too Large', 'Selected image size exceeds 2MB limit.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.formImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imagePreview = null;
    this.formImage = '';
  }

  saveArticle(): void {
    if (!this.formTitle || !this.formDescription || !this.formNewsType) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill in article title, select a category, and enter content.',
        confirmButtonColor: '#198754'
      });
      return;
    }

    this.isSaving = true;

    const payload = {
      title: this.formTitle,
      slug: this.formSlug || this.slugify(this.formTitle),
      newsType: this.formNewsType,
      shortDescription: this.formShortDescription,
      description: this.formDescription,
      image: this.formImage,
      status: this.formStatus,
      isFeatured: this.formIsFeatured,
      author: this.formAuthor,
      metaTitle: this.formMetaTitle || this.formTitle,
      metaDescription: this.formMetaDescription || this.formShortDescription,
      metaKeywords: this.formMetaKeywords
    };

    if (this.isEditing) {
      this.newsService.updateNews(this.currentArticleId, payload).subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res.success) {
            Swal.fire({
              icon: 'success',
              title: 'Article Updated!',
              text: 'News article updated successfully.',
              timer: 2000,
              showConfirmButton: false
            });
            this.goToList();
          }
        },
        error: (err) => {
          this.isSaving = false;
          Swal.fire('Error', err.error?.message || 'Failed to update article', 'error');
        }
      });
    } else {
      this.newsService.createNews(payload).subscribe({
        next: (res) => {
          this.isSaving = false;
          if (res.success) {
            Swal.fire({
              icon: 'success',
              title: 'Article Published!',
              text: 'News article created and saved successfully.',
              timer: 2000,
              showConfirmButton: false
            });
            this.goToList();
          }
        },
        error: (err) => {
          this.isSaving = false;
          Swal.fire('Error', err.error?.message || 'Failed to create article', 'error');
        }
      });
    }
  }

  deleteArticle(article: NewsArticle, event: Event): void {
    event.stopPropagation();
    Swal.fire({
      title: 'Delete News Article?',
      text: `Are you sure you want to delete "${article.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.newsService.deleteNews(article._id).subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Article deleted successfully.',
              timer: 2000,
              showConfirmButton: false
            });
            if (this.viewMode === 'form') {
              this.goToList();
            } else {
              this.loadNews();
            }
          },
          error: (err) => {
            Swal.fire('Error', 'Failed to delete article', 'error');
          }
        });
      }
    });
  }

  // NewsType Management Modal
  openNewsTypeManager(): void {
    this.editingTypeId = '';
    this.typeFormTitle = '';
    this.typeFormDescription = '';
    this.newsTypeModalOpen = true;
  }

  closeNewsTypeManager(): void {
    this.newsTypeModalOpen = false;
  }

  editNewsType(type: NewsType): void {
    this.editingTypeId = type._id;
    this.typeFormTitle = type.title;
    this.typeFormDescription = type.description || '';
  }

  resetTypeForm(): void {
    this.editingTypeId = '';
    this.typeFormTitle = '';
    this.typeFormDescription = '';
  }

  saveNewsType(): void {
    if (!this.typeFormTitle) {
      Swal.fire('Warning', 'Please enter category title', 'warning');
      return;
    }

    const payload = {
      title: this.typeFormTitle,
      description: this.typeFormDescription
    };

    if (this.editingTypeId) {
      this.newsService.updateNewsType(this.editingTypeId, payload).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Category Updated!',
            text: 'News category updated successfully.',
            timer: 2000,
            showConfirmButton: false
          });
          this.resetTypeForm();
          this.loadNewsTypes();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.message || 'Failed to update category', 'error');
        }
      });
    } else {
      this.newsService.createNewsType(payload).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Category Created!',
            text: 'News category created successfully.',
            timer: 2000,
            showConfirmButton: false
          });
          this.resetTypeForm();
          this.loadNewsTypes();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.message || 'Failed to create category', 'error');
        }
      });
    }
  }

  deleteNewsType(type: NewsType): void {
    Swal.fire({
      title: 'Delete Category?',
      text: `Delete news category "${type.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete category'
    }).then((result) => {
      if (result.isConfirmed) {
        this.newsService.deleteNewsType(type._id).subscribe({
          next: (res) => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Category deleted successfully.',
              timer: 2000,
              showConfirmButton: false
            });
            this.loadNewsTypes();
          },
          error: (err) => {
            Swal.fire('Error', 'Failed to delete category', 'error');
          }
        });
      }
    });
  }

  getNewsTypeName(newsTypeObj: NewsType | string): string {
    if (typeof newsTypeObj === 'object' && newsTypeObj !== null) {
      return newsTypeObj.title;
    }
    const found = this.newsTypes.find(t => t._id === newsTypeObj);
    return found ? found.title : 'General';
  }

  private showToast(msg: string, type: 'success' | 'danger' = 'success'): void {
    Swal.fire({
      icon: type === 'success' ? 'success' : 'error',
      title: type === 'success' ? 'Success' : 'Notice',
      text: msg,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    });
  }
}
