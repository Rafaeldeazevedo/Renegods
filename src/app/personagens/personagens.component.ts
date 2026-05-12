import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { PersonagemService } from '../services/personagem.service';
import { Personagem } from '../model/personagem.model';
import { UsuarioLogado } from '../model/auth.model';

@Component({
  selector: 'app-personagens',
  templateUrl: './personagens.component.html',
  styleUrls: ['./personagens.component.css']
})
export class PersonagensComponent implements OnInit {
  personagens: Personagem[] = [];
  personagensHero: Personagem[] = [];

  termoBusca = '';
  filtroAtual: 'todos' | 'favoritos' = 'todos';
  carregando = false;

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

    try {
      this.usuarioLogado = JSON.parse(usuarioStorage);
    } catch (erro) {
      console.error('Erro ao ler usuário logado:', erro);
      this.usuarioLogado = null;
    }
  }

  carregarPersonagens(): void {
    if (!this.usuarioLogado) {
      return;
    }

    this.carregando = true;

    this.personagemService.listarPorUsuario(this.usuarioLogado.id).subscribe({
      next: (personagens) => {
        this.personagens = (personagens || []).sort((a, b) =>
          (a.nome || '').localeCompare(b.nome || '', 'pt-BR', {
            sensitivity: 'base'
          })
        );

        this.personagensHero = this.pegarAleatorios(this.personagens, 3);

        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar personagens:', erro);

        this.personagens = [];
        this.personagensHero = [];

        this.carregando = false;
      }
    });
  }

  abrirFrameData(personagem: Personagem): void {
    sessionStorage.setItem('personagemFrameData', JSON.stringify(personagem));

    this.router.navigate(
      ['/personagens', personagem.id, 'frame-data'],
      {
        state: {
          personagem: personagem
        }
      }
    );
  }

  get personagensFiltrados(): Personagem[] {
    const termo = this.termoBusca.trim().toLowerCase();

    return this.personagens.filter(personagem => {
      const nome = personagem.nome || '';

      const bateBusca = nome.toLowerCase().includes(termo);

      const bateFiltro =
        this.filtroAtual === 'todos' ||
        personagem.favorito === true;

      return bateBusca && bateFiltro;
    });
  }

  get totalFavoritos(): number {
    return this.personagens.filter(p => p.favorito === true).length;
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

  pegarAleatorios(lista: Personagem[], quantidade: number): Personagem[] {
    if (!lista || lista.length === 0) {
      return [];
    }

    return [...lista]
      .sort(() => Math.random() - 0.5)
      .slice(0, quantidade);
  }

  getImagemPersonagem(personagem: any): string {
    if (personagem?.imagem) {
      return personagem.imagem;
    }

    if (!personagem?.nome) {
      return 'assets/personagens/alisa-bosconovitch.png';
    }

    const slug = this.gerarSlug(personagem.nome);

    return `assets/personagens/${slug}.png`;
  }

  gerarSlug(nome: string): string {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  usarImagemPadrao(event: Event): void {
    const img = event.target as HTMLImageElement;

    if (img.src.includes('alisa-bosconovitch.png')) {
      return;
    }

    img.src = 'assets/personagens/alisa-bosconovitch.png';
  }

  sair(): void {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('token');

    this.router.navigate(['/login']);
  }
}