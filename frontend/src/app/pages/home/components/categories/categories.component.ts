import { Component } from '@angular/core';

interface Category {
  name: string;
  icon: string;
  totalProducts: number;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent {
  categories: Category[] = [
    {
      name: 'Fresh Vegetables',
      icon: '🥬',
      totalProducts: 120
    },
    {
      name: 'Seasonal Fruits',
      icon: '🍎',
      totalProducts: 85
    },
    {
      name: 'Grains',
      icon: '🌾',
      totalProducts: 64
    },
    {
      name: 'Pulses',
      icon: '🫘',
      totalProducts: 42
    },
    {
      name: 'Spices',
      icon: '🌶️',
      totalProducts: 38
    },
    {
      name: 'Dairy Products',
      icon: '🥛',
      totalProducts: 25
    }
  ];
}
