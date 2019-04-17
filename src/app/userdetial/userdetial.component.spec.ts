import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserdetialComponent } from './userdetial.component';

describe('UserdetialComponent', () => {
  let component: UserdetialComponent;
  let fixture: ComponentFixture<UserdetialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserdetialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserdetialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
