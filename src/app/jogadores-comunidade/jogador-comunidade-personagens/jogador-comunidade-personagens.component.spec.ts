import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JogadorComunidadePersonagensComponent } from './jogador-comunidade-personagens.component';

describe('JogadorComunidadePersonagensComponent', () => {
  let component: JogadorComunidadePersonagensComponent;
  let fixture: ComponentFixture<JogadorComunidadePersonagensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JogadorComunidadePersonagensComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JogadorComunidadePersonagensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
