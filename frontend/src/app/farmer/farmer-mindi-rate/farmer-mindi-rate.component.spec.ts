import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmerMindiRateComponent } from './farmer-mindi-rate.component';

describe('FarmerMindiRateComponent', () => {
  let component: FarmerMindiRateComponent;
  let fixture: ComponentFixture<FarmerMindiRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmerMindiRateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FarmerMindiRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
