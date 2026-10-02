import { Component, OnInit, inject } from '@angular/core';
import { HeroComponent } from './components/hero/hero.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { ProductsComponent } from './components/products/products.component';
import { MandiRatesComponent } from './components/mandi-rates/mandi-rates.component';
import { KisanLoanCalculatorComponent } from './components/kisan-loan-calculator/kisan-loan-calculator.component';
import { BenefitsComponent } from './components/benefits/benefits.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { FarmerCtaComponent } from './components/farmer-cta/farmer-cta.component';
import { NewsletterComponent } from './components/newsletter/newsletter.component';
import { HomeNewsComponent } from './components/home-news/home-news.component';
import { HomeLevyCardComponent } from './components/home-levy-card/home-levy-card.component';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    CategoriesComponent,
    ProductsComponent,
    MandiRatesComponent,
    HomeLevyCardComponent,
    KisanLoanCalculatorComponent,
    HomeNewsComponent,
    BenefitsComponent,
    TestimonialsComponent,
    FarmerCtaComponent,
    NewsletterComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private seoService = inject(SeoService);
  selectedCategoryName = 'all';

  ngOnInit(): void {
    this.seoService.resetToDefault();
  }

  onCategorySelect(catName: string): void {
    this.selectedCategoryName = catName;
    const el = document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}