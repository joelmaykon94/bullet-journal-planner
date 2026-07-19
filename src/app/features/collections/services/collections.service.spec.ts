import { TestBed } from '@angular/core/testing';

import { Collections } from './collections.service';

describe('Collections', () => {
  let service: Collections;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Collections);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
