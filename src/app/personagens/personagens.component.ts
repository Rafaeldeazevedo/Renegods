import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {PersonagemService } from '../services/personagem.service';
import { Personagem } from '../model/personagem.model';
import { UsuarioLogado } from '../model/auth.model';


@Component({
  selector: 'app-personagens',
  templateUrl: './personagens.component.html',
  styleUrls: ['./personagens.component.css']
})
export class PersonagensComponent implements OnInit {
  personagens: Personagem[] = [];

  termoBusca = '';
  filtroAtual: 'todos' | 'favoritos' = 'todos';
  carregando = false;
  menuConfiguracoesAberto = false;

  usuarioLogado: UsuarioLogado | null = null;

  constructor(
    private personagemService: PersonagemService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarUsuarioLogado();

    if (!this.usuarioLogado) {
      this.router.navigate(['/login']);
      return;
    }

    this.carregarPersonagens();
  }

  carregarUsuarioLogado(): void {
    const usuarioStorage = localStorage.getItem('usuarioLogado');

    if (!usuarioStorage) {
      this.usuarioLogado = null;
      return;
    }

    this.usuarioLogado = JSON.parse(usuarioStorage);
  }

  carregarPersonagens(): void {
    if (!this.usuarioLogado) {
      return;
    }

    this.carregando = true;

    this.personagemService.listarPorUsuario(this.usuarioLogado.id).subscribe({
      next: (personagens) => {
        this.personagens = personagens;
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar personagens:', erro);
        this.carregando = false;
      }
    });
  }

get personagensFiltrados(): Personagem[] {
  return this.personagens.filter(personagem => {
    const bateBusca = personagem.nome
      .toLowerCase()
      .includes(this.termoBusca.toLowerCase());

    const bateFiltro =
      this.filtroAtual === 'todos' ||
      personagem.favorito === true;

    return bateBusca && bateFiltro;
  });
}

getInicialUsuario(): string {
  if (!this.usuarioLogado) {
    return '?';
  }
  const nomeParaAvatar = this.usuarioLogado.nickname || this.usuarioLogado.nome;
  return nomeParaAvatar.charAt(0).toUpperCase();
}

  get totalFavoritos(): number {
    return this.personagens.filter(p => p.favorito).length;
  }

  favoritar(personagem: Personagem): void {
    if (!this.usuarioLogado) {
      this.router.navigate(['/login']);
      return;
    }

    if (personagem.favorito) {
      this.personagemService
        .removerFavorito(personagem.id, this.usuarioLogado.id)
        .subscribe({
          next: () => {
            personagem.favorito = false;
          },
          error: (erro) => {
            console.error('Erro ao remover favorito:', erro);
          }
        });

      return;
    }

    this.personagemService
      .favoritar(personagem.id, this.usuarioLogado.id)
      .subscribe({
        next: () => {
          personagem.favorito = true;
        },
        error: (erro) => {
          console.error('Erro ao favoritar:', erro);
        }
      });
  }

  selecionarFiltro(filtro: 'todos' | 'favoritos'): void {
    this.filtroAtual = filtro;
  }
  alternarConfiguracoes(): void {
  this.menuConfiguracoesAberto = !this.menuConfiguracoesAberto;
}

sair(): void {
  localStorage.removeItem('usuarioLogado');
  localStorage.removeItem('token');

  this.menuConfiguracoesAberto = false;
  this.router.navigate(['/login']);
}
}