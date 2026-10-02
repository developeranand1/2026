import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from "./shared/header/header.component";
import { FooterComponent } from "./shared/footer/footer.component";
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SeoService } from './core/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private seoService = inject(SeoService);
  private router = inject(Router);

  showFooter = true;

  ngOnInit(): void {
    this.seoService.initRouteListener();

    this.checkFooterVisibility(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkFooterVisibility(event.urlAfterRedirects || event.url);
    });
  }

  private checkFooterVisibility(url: string): void {
    // Hide footer on farmer and buyer dashboard portals
    if (url && (url.startsWith('/farmer') || url.startsWith('/buyer'))) {
      this.showFooter = false;
    } else {
      this.showFooter = true;
    }
  }
}
