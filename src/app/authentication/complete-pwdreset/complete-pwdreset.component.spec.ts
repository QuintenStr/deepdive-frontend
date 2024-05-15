import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletePwdresetComponent } from './complete-pwdreset.component';

describe('CompletePwdresetComponent', () => {
  let component: CompletePwdresetComponent;
  let fixture: ComponentFixture<CompletePwdresetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompletePwdresetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CompletePwdresetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
