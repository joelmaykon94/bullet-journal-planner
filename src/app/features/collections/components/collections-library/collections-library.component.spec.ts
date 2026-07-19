import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionsLibrary } from './collections-library.component';

describe('CollectionsLibrary', () => {
  let component: CollectionsLibrary;
  let fixture: ComponentFixture<CollectionsLibrary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionsLibrary],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionsLibrary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
