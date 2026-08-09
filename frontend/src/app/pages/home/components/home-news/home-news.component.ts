import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FrontendNewsService, NewsArticle, NewsType } from '../../../news/news.service';

@Component({
  selector: 'app-home-news',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './home-news.component.html',
  styleUrl: './home-news.component.scss'
})
export class HomeNewsComponent implements OnInit {
  private newsService = inject(FrontendNewsService);

  newsList: NewsArticle[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.loadHomeNews();
  }

  loadHomeNews(): void {
    this.isLoading = true;
    this.newsService.getNewsList().subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.newsList = res.data.slice(0, 3); // Top 3 articles for landing page
        }
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  getNewsTypeName(newsTypeObj: NewsType | string): string {
    if (typeof newsTypeObj === 'object' && newsTypeObj !== null) {
      return newsTypeObj.title;
    }
    return 'Agri Update';
  }
}
