import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetPlanner } from './budget-planner.component';

describe('BudgetPlanner', () => {
  let component: BudgetPlanner;
  let fixture: ComponentFixture<BudgetPlanner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetPlanner],
    }).compileComponents();

    fixture = TestBed.createComponent(BudgetPlanner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
