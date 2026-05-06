import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JogadorComunidadeService } from '../services/jogadorComunidade.service';

@Component({
  selector: 'app-jogadores-comunidade',
  templateUrl: './jogadores-comunidade.component.html',
  styleUrls: ['./jogadores-comunidade.component.css']
})
export class JogadoresComunidadeComponent implements OnInit {

  jogadores: any[] = [];
  jogadorSelecionado: any = null;
  personagemSelecionado: any = null;
  carregando = false;

  constructor(
    private router: Router,
    private jogadorComunidadeService: JogadorComunidadeService
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.carregando = true;

    this.jogadorComunidadeService.listar().subscribe({
      next: (dados) => {
        this.jogadores = dados || [];
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao listar jogadores:', erro);
        this.carregando = false;
      }
    });
  }

  novoJogador(): void {
    this.router.navigate(['/jogadores-comunidade/novo']);
  }

  visualizarPersonagens(jogador: any): void {
    this.router.navigate(['/jogadores-comunidade', jogador.id, 'personagens']);
  }
  getImagemProfilePersonagem(personagem: any): string {
  if (!personagem?.nome) {
    return personagem?.imagem || '';
  }

  const slug = this.gerarSlug(personagem.nome);

  return `assets/profile/${slug}.png`;
}

gerarSlug(nome: string): string {
  return nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

usarImagemPadrao(event: Event, personagem: any): void {
  const img = event.target as HTMLImageElement;
  img.src = personagem?.imagem || 'assets/Alisa.png';
}

obterNomeCurto(nome: string): string {
  if (!nome) {
    return '';
  }

  const partes = nome.trim().split(/\s+/);

  return partes[0];
}
selecionarPersonagemDoJogador(jogador: any, personagem: any): void {
  this.jogadorSelecionado = jogador;
  this.personagemSelecionado = personagem;

  console.log('Jogador selecionado:', jogador);
  console.log('Personagem selecionado:', personagem);
}

visualizarPlayerStyle(jogador: any): void {
  if (!this.personagemSelecionado || this.jogadorSelecionado?.id !== jogador.id) {
    alert('Selecione um personagem desse jogador primeiro.');
    return;
  }

  this.router.navigate([
    '/jogadores-comunidade',
    jogador.id,
    'personagens',
    this.personagemSelecionado.id,
    'player-style'
  ], {
    state: {
      jogador,
      personagem: this.personagemSelecionado
    }
  });
}
}