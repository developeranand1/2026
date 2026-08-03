import { Component } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';

interface Product {
  name: string;
  icon: string;
  price: number;
  oldPrice: number;
  unit: string;
  location: string;
  rating: number;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {
  products: Product[] = [
    {
      name: 'Fresh Tomatoes',
      icon: '🍅',
      price: 32,
      oldPrice: 40,
      unit: 'kg',
      location: 'Nashik, Maharashtra',
      rating: 4.8
    },
    {
      name: 'Organic Wheat',
      icon: '🌾',
      price: 42,
      oldPrice: 48,
      unit: 'kg',
      location: 'Sehore, Madhya Pradesh',
      rating: 4.7
    },
    {
      name: 'Red Onions',
      icon: '🧅',
      price: 28,
      oldPrice: 35,
      unit: 'kg',
      location: 'Indore, Madhya Pradesh',
      rating: 4.6
    },
    {
      name: 'Basmati Rice',
      icon: '🍚',
      price: 92,
      oldPrice: 110,
      unit: 'kg',
      location: 'Karnal, Haryana',
      rating: 4.9
    }
  ];
}
