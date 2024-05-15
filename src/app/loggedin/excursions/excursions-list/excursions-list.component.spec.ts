import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcursionsListComponent } from './excursions-list.component';

describe('ExcursionsListComponent', () => {
  let component: ExcursionsListComponent;
  let fixture: ComponentFixture<ExcursionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExcursionsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExcursionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
