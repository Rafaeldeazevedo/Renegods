import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JogadoresComunidadeComponent } from './jogadores-comunidade.component';

describe('JogadoresComunidadeComponent', () => {
  let component: JogadoresComunidadeComponent;
  let fixture: ComponentFixture<JogadoresComunidadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JogadoresComunidadeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JogadoresComunidadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
