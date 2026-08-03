import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent implements OnInit {
  activeTab: 'farmers' | 'buyers' = 'farmers';

  demoFarmers = [
    { name: 'Rajesh Kumar', mobile: '9876543210', location: 'Khalilabad, Sant Kabir Nagar', cropsCount: 5, status: 'Verified' },
    { name: 'Ramesh Singh', mobile: '9876543211', location: 'Basti, Uttar Pradesh', cropsCount: 3, status: 'Verified' },
    { name: 'Suresh Verma', mobile: '9876543212', location: 'Gorakhpur, Uttar Pradesh', cropsCount: 8, status: 'Pending' }
  ];

  demoBuyers = [
    { name: 'ABC Agro Traders', contactPerson: 'Vikram Mehta', mobile: '9123456789', gst: '09AAAAA0000A1Z5', location: 'Kanpur', status: 'Verified' },
    { name: 'Shree Ram Rice Mill', contactPerson: 'Anil Gupta', mobile: '9123456790', gst: '09BBBBB1111B1Z2', location: 'Gorakhpur', status: 'Verified' }
  ];

  ngOnInit(): void {}
}
