import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulletItem } from './bullet-item.component';

describe('BulletItem', () => {
  let component: BulletItem;
  let fixture: ComponentFixture<BulletItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulletItem],
    }).compileComponents();

    fixture = TestBed.createComponent(BulletItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
