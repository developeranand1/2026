import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  searchProduct(value: string): void {
    const searchValue = value.trim();
    if (!searchValue) return;
    console.log('Searching for:', searchValue);
  }
}
