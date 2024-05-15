import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembershipDemandsComponent } from './membership-demands.component';

describe('MembershipDemandsComponent', () => {
  let component: MembershipDemandsComponent;
  let fixture: ComponentFixture<MembershipDemandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MembershipDemandsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MembershipDemandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
