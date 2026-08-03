import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-farmer-cta',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './farmer-cta.component.html',
  styleUrl: './farmer-cta.component.scss'
})
export class FarmerCtaComponent {}
