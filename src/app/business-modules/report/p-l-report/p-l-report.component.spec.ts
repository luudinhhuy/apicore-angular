import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PLReportComponent } from './p-l-report.component';

describe('PLReportComponent', () => {
  let component: PLReportComponent;
  let fixture: ComponentFixture<PLReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PLReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PLReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
