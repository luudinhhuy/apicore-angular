import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalemanPopupComponent } from './saleman-popup.component';

describe('SalemanPopupComponent', () => {
  let component: SalemanPopupComponent;
  let fixture: ComponentFixture<SalemanPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalemanPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalemanPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
