import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcursionEditComponent } from './excursion-edit.component';

describe('ExcursionEditComponent', () => {
  let component: ExcursionEditComponent;
  let fixture: ComponentFixture<ExcursionEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExcursionEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExcursionEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
