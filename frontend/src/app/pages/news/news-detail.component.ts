import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FrontendNewsService, NewsArticle, NewsType } from './news.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.scss'
})
export class NewsDetailComponent implements OnInit {
  private newsService = inject(FrontendNewsService);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private sanitizer = inject(DomSanitizer);

  article: NewsArticle | null = null;
  relatedArticles: NewsArticle[] = [];
  safeContent: SafeHtml = '';
  isLoading = true;
  errorMessage = '';

  readingTimeMinutes: number = 3;
  copiedSuccess = false;

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const slug = params['slug'];
      if (slug) {
        this.loadArticle(slug);
      }
    });
  }

  loadArticle(slug: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.newsService.getNewsBySlugOrId(slug).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.article = res.data;
          
          // Calculate reading time (avg 200 words/min)
          const words = (this.article.description || '').replace(/<[^>]*>/g, '').split(/\s+/).length;
          this.readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

          // Sanitize HTML description for safe rendering
          this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.article.description);

          // Update Meta Tags dynamically
          const metaTitle = this.article.metaTitle || `${this.article.title} | GaonBazar`;
          const metaDesc = this.article.metaDescription || this.article.shortDescription || this.article.title;
          const metaKeys = this.article.metaKeywords || 'gaonbazar, mandi rates, agriculture news, farming updates';

          this.titleService.setTitle(metaTitle);
          this.metaService.updateTag({ name: 'description', content: metaDesc });
          this.metaService.updateTag({ name: 'keywords', content: metaKeys });
          this.metaService.updateTag({ property: 'og:title', content: metaTitle });
          this.metaService.updateTag({ property: 'og:description', content: metaDesc });
          if (this.article.image) {
            this.metaService.updateTag({ property: 'og:image', content: this.article.image });
          }

          // Load related articles
          this.loadRelatedArticles();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'News article not found or has been removed.';
      }
    });
  }

  loadRelatedArticles(): void {
    this.newsService.getNewsList().subscribe({
      next: (res) => {
        if (res.success) {
          this.relatedArticles = res.data
            .filter(a => this.article && a._id !== this.article._id)
            .slice(0, 3);
        }
      }
    });
  }

  shareOn(platform: string): void {
    if (!this.article) return;
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(this.article.title);
    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${title}%20${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=500,scrollbars=yes');
    }
  }

  copyLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.copiedSuccess = true;
      Swal.fire({
        icon: 'success',
        title: 'Link Copied!',
        text: 'Article link copied to clipboard.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      setTimeout(() => {
        this.copiedSuccess = false;
      }, 3000);
    });
  }

  getNewsTypeName(newsTypeObj: NewsType | string): string {
    if (typeof newsTypeObj === 'object' && newsTypeObj !== null) {
      return newsTypeObj.title;
    }
    return 'Agriculture';
  }
}
