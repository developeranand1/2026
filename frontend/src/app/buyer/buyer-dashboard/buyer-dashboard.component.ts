import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './buyer-dashboard.component.html',
  styleUrl: './buyer-dashboard.component.scss'
})
export class BuyerDashboardComponent implements OnInit {
  private authService = inject(AuthService);

  isLoggedIn = false;
  buyerUser: any = null;

  cropsList = [
    { name: 'Wheat (Lokwan)', farmer: 'Ram Kumar', location: 'Sitapur, UP', qty: '100 Quintal', price: 2120, rating: 4.5, icon: '🌾' },
    { name: 'Paddy (Basmati)', farmer: 'Mahesh Yadav', location: 'Barabanki, UP', qty: '80 Quintal', price: 1850, rating: 4.3, icon: '🍚' },
    { name: 'Mustard Seeds', farmer: 'Suresh Patel', location: 'Haridwar, UK', qty: '120 Quintal', price: 5120, rating: 4.4, icon: '🌱' },
    { name: 'Yellow Maize', farmer: 'Rajendra Prasad', location: 'Gonda, UP', qty: '150 Quintal', price: 1750, rating: 4.2, icon: '🌽' }
  ];

  recentOrders = [
    { id: 'ORD12345', crop: 'Wheat (Lokwan)', qty: '50 Quintal', price: 106000, date: '12 May 2026', status: 'Delivered', icon: '🌾' },
    { id: 'ORD12300', crop: 'Paddy (Basmati)', qty: '80 Quintal', price: 148000, date: '15 April 2026', status: 'Delivered', icon: '🍚' },
    { id: 'ORD12250', crop: 'Yellow Maize', qty: '60 Quintal', price: 105000, date: '10 March 2026', status: 'Delivered', icon: '🌽' }
  ];

  ngOnInit(): void {
    this.checkUser();
  }

  checkUser(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.buyerUser = this.authService.getUser();
    }
  }

  buyCropProduce(crop: any): void {
    Swal.fire({
      title: `Buy ${crop.name}?`,
      html: `Farmer: <strong>${crop.farmer}</strong> (${crop.location})<br>Price: <strong>₹${crop.price}/Quintal</strong>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1a365d',
      confirmButtonText: 'Proceed to Payment'
    }).then((res) => {
      if (res.isConfirmed) {
        Swal.fire('Order Initiated!', `Wholesale purchase for ${crop.name} has been initiated.`, 'success');
      }
    });
  }
}
