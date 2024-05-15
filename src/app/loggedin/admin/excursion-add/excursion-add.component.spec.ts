import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcursionAddComponent } from './excursion-add.component';

describe('ExcursionAddComponent', () => {
  let component: ExcursionAddComponent;
  let fixture: ComponentFixture<ExcursionAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExcursionAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExcursionAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
