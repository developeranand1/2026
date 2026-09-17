import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TrainingService, Training } from '../../core/training.service';

@Component({
  selector: 'app-trainings-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './trainings-page.component.html',
  styleUrl: './trainings-page.component.scss'
})
export class TrainingsPageComponent implements OnInit {
  private trainingService = inject(TrainingService);
  private router = inject(Router);

  activeTab: 'upcoming' | 'completed' = 'upcoming';
  isLoading = true;
  trainings: Training[] = [];

  selectedCategory = 'All';
  searchQuery = '';

  stats = {
    totalTrainings: 0,
    upcomingCount: 0,
    completedCount: 0,
    farmersTrained: 0
  };

  categories = [
    'Organic Farming',
    'Crop Protection & Pest Management',
    'Drip Irrigation & Water Tech',
    'Dairy & Animal Husbandry',
    'Govt Schemes & Subsidies',
    'Mandi Trading & Digital Literacy',
    'Soil Health & Fertilizer',
    'Horticulture & Fruits',
    'General Training'
  ];

  get upcomingCount(): number {
    return this.stats.upcomingCount || (this.activeTab === 'upcoming' ? this.trainings.length : 0);
  }

  get completedCount(): number {
    return this.stats.completedCount || (this.activeTab === 'completed' ? this.trainings.length : 0);
  }

  ngOnInit(): void {
    this.loadTrainings();
    this.loadStats();
  }

  setTab(tab: 'upcoming' | 'completed'): void {
    this.activeTab = tab;
    this.loadTrainings();
  }

  loadStats(): void {
    this.trainingService.getTrainingStats().subscribe({
      next: (res) => {
        if (res && res.success && res.data) {
          this.stats = {
            totalTrainings: res.data.total || 0,
            upcomingCount: res.data.upcoming || 0,
            completedCount: res.data.completed || 0,
            farmersTrained: res.data.totalCertified ? res.data.totalCertified * 25 : (res.data.totalFarmersTrained || 0)
          };
        }
      },
      error: (err) => {
        console.error('Error fetching training stats:', err);
      }
    });
  }

  loadTrainings(): void {
    this.isLoading = true;
    const statusQuery = this.activeTab === 'upcoming' ? 'Upcoming' : 'Completed';

    this.trainingService.getAllTrainings(
      statusQuery,
      this.selectedCategory,
      this.searchQuery
    ).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res && res.success) {
          this.trainings = res.data || [];
        } else {
          this.trainings = [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.trainings = [];
        console.error('Error fetching trainings:', err);
      }
    });
  }

  onFilterChange(): void {
    this.loadTrainings();
  }

  goToDetail(training: Training): void {
    const targetId = training.slug || training._id;
    if (targetId) {
      this.router.navigate(['/trainings', targetId]);
    }
  }
}
