import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyLog } from './monthly-log.component';

describe('MonthlyLog', () => {
  let component: MonthlyLog;
  let fixture: ComponentFixture<MonthlyLog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyLog],
    }).compileComponents();

    fixture = TestBed.createComponent(MonthlyLog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
