import { Component } from '@angular/core';
import { HeroComponent } from './components/hero/hero.component';
import { CategoriesComponent } from './components/categories/categories.component';
import { ProductsComponent } from './components/products/products.component';
import { MandiRatesComponent } from './components/mandi-rates/mandi-rates.component';
import { BenefitsComponent } from './components/benefits/benefits.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { FarmerCtaComponent } from './components/farmer-cta/farmer-cta.component';
import { NewsletterComponent } from './components/newsletter/newsletter.component';
import { HomeNewsComponent } from './components/home-news/home-news.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    CategoriesComponent,
    ProductsComponent,
    MandiRatesComponent,
    HomeNewsComponent,
    BenefitsComponent,
    TestimonialsComponent,
    FarmerCtaComponent,
    NewsletterComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {}