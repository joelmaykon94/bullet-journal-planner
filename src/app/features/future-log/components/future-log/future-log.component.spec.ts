import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FutureLog } from './future-log.component';

describe('FutureLog', () => {
  let component: FutureLog;
  let fixture: ComponentFixture<FutureLog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FutureLog],
    }).compileComponents();

    fixture = TestBed.createComponent(FutureLog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
