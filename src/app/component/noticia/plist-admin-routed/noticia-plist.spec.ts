import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticiaPlistAdminRouted } from './noticia-plist';

describe('NoticiaPlist', () => {
  let component: NoticiaPlistAdminRouted;
  let fixture: ComponentFixture<NoticiaPlistAdminRouted>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoticiaPlistAdminRouted]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NoticiaPlistAdminRouted);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
