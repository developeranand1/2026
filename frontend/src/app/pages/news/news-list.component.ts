import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FrontendNewsService, NewsArticle, NewsType } from './news.service';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.scss'
})
export class NewsListComponent implements OnInit {
  private newsService = inject(FrontendNewsService);
  private seoService = inject(SeoService);

  articles: NewsArticle[] = [];
  newsTypes: NewsType[] = [];
  featuredArticle: NewsArticle | null = null;

  selectedType = 'All';
  searchTerm = '';
  isLoading = false;

  ngOnInit(): void {
    this.seoService.updateSeo({
      title: 'कृषि समाचार व मंडी अपडेट (Agriculture News & Market Updates) | KrisiMarg',
      description: 'कृषि जगत की ताज़ा खबरें, सरकारी योजनाएं, मंडी भाव विश्लेषण, मौसम रिपोर्ट एवं उन्नत खेती के टिप्स पढ़ें।',
      keywords: 'Krishi Samachar, Agri News India, Mandi News, Farming Updates, Kisan Yojana, KrisiMarg News',
      url: '/news'
    });
    this.loadNewsTypes();
    this.loadNews();
  }

  loadNewsTypes(): void {
    this.newsService.getNewsTypes().subscribe({
      next: (res) => {
        if (res.success) {
          this.newsTypes = res.data;
        }
      }
    });
  }

  loadNews(): void {
    this.isLoading = true;
    this.newsService.getNewsList(this.selectedType, this.searchTerm).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.articles = res.data;
          
          // Separate featured article if first item is featured
          const featured = this.articles.find(a => a.isFeatured);
          if (featured) {
            this.featuredArticle = featured;
          } else if (this.articles.length > 0) {
            this.featuredArticle = this.articles[0];
          } else {
            this.featuredArticle = null;
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  selectType(typeId: string): void {
    this.selectedType = typeId;
    this.loadNews();
  }

  onSearch(): void {
    this.loadNews();
  }

  getNewsTypeName(newsTypeObj: NewsType | string): string {
    if (typeof newsTypeObj === 'object' && newsTypeObj !== null) {
      return newsTypeObj.title;
    }
    const found = this.newsTypes.find(t => t._id === newsTypeObj);
    return found ? found.title : 'Agriculture';
  }
}
