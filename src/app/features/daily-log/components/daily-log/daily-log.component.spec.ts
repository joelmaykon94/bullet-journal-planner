import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyLog } from './daily-log.component';

describe('DailyLog', () => {
  let component: DailyLog;
  let fixture: ComponentFixture<DailyLog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyLog],
    }).compileComponents();

    fixture = TestBed.createComponent(DailyLog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
