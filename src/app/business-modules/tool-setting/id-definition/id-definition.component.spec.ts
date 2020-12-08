import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IDDefinitionComponent } from './id-definition.component';

describe('IDDefinitionComponent', () => {
  let component: IDDefinitionComponent;
  let fixture: ComponentFixture<IDDefinitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IDDefinitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IDDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
