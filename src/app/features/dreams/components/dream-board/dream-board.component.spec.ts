import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DreamBoard } from './dream-board.component';

describe('DreamBoard', () => {
  let component: DreamBoard;
  let fixture: ComponentFixture<DreamBoard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DreamBoard],
    }).compileComponents();

    fixture = TestBed.createComponent(DreamBoard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
