import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KPIComponent } from './kpi.component';

describe('KPIComponent', () => {
  let component: KPIComponent;
  let fixture: ComponentFixture<KPIComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KPIComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KPIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
