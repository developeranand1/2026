import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ValueItem {
  icon: string;
  title: string;
  description: string;
}

interface StatItem {
  value: string;
  label: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  readonly values: ValueItem[] = [
    {
      icon: 'bi-people',
      title: 'Farmer First',
      description:
        'We create better opportunities for farmers to reach more customers and earn fair prices.'
    },
    {
      icon: 'bi-eye',
      title: 'Transparency',
      description:
        'We promote transparent pricing, verified sellers, and clear marketplace processes.'
    },
    {
      icon: 'bi-shield-check',
      title: 'Trust and Safety',
      description:
        'We work to provide a secure and reliable platform for buyers, farmers, and sellers.'
    },
    {
      icon: 'bi-lightbulb',
      title: 'Innovation',
      description:
        'We use technology to make agricultural commerce simple, accessible, and efficient.'
    }
  ];

  readonly stats: StatItem[] = [
    {
      value: '2,500+',
      label: 'Verified Farmers'
    },
    {
      value: '8,000+',
      label: 'Listed Products'
    },
    {
      value: '50+',
      label: 'Service Cities'
    },
    {
      value: '25,000+',
      label: 'Happy Customers'
    }
  ];
}