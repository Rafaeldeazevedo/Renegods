import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { PersonagemService } from '../services/personagem.service';
import { JogadorComunidadeService } from '../services/jogadorComunidade.service';
import { UsuarioLogado } from '../model/auth.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  carregando = false;

  personagens: any[] = [];
  jogadores: any[] = [];

  totalPersonagens = 0;
  totalFavoritos = 0;
  totalJogadores = 0;
  totalPlayerStyles = 0;

  personagensDestaque: any[] = [];
  jogadoresRecentes: any[] = [];

  usuarioLogado: UsuarioLogado | null = null;

  private requisicoesFinalizadas = 0;
  private totalRequisicoes = 3;

  constructor(
    private router: Router,
    private personagemService: PersonagemService,
    private jogadorComunidadeService: JogadorComunidadeService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarioLogado();

    if (!this.usuarioLogado) {
      this.router.navigate(['/login']);
      return;
    }

    this.carregarDadosHome();
  }

  carregarUsuarioLogado(): void {
    const usuarioStorage = localStorage.getItem('usuarioLogado');

    if (!usuarioStorage) {
      this.usuarioLogado = null;
      return;
    }

    this.usuarioLogado = JSON.parse(usuarioStorage);
  }

  carregarDadosHome(): void {
    this.carregando = true;
    this.requisicoesFinalizadas = 0;

    this.carregarPersonagens();
    this.carregarJogadoresComunidade();
    this.carregarTotalPlayerStyles();
  }

  carregarPersonagens(): void {
    if (!this.usuarioLogado) {
      this.finalizarRequisicao();
      return;
    }

    this.personagemService.listarPorUsuario(this.usuarioLogado.id).subscribe({
      next: (personagens) => {
        this.personagens = personagens || [];

        this.totalPersonagens = this.personagens.length;

        this.totalFavoritos = this.personagens.filter(
          personagem => personagem.favorito === true
        ).length;

        this.personagensDestaque = this.personagens
          .slice(0, 4)
          .map(personagem => ({
            ...personagem,
            imagemTratada: this.getImagemPersonagem(personagem)
          }));

        this.finalizarRequisicao();
      },
      error: (erro) => {
        console.error('Erro ao carregar personagens:', erro);

        this.personagens = [];
        this.totalPersonagens = 0;
        this.totalFavoritos = 0;
        this.personagensDestaque = [];

        this.finalizarRequisicao();
      }
    });
  }

  carregarJogadoresComunidade(): void {
    this.jogadorComunidadeService.listar().subscribe({
      next: (jogadores) => {
        this.jogadores = jogadores || [];

        this.totalJogadores = this.jogadores.length;

        this.jogadoresRecentes = this.jogadores
          .slice(-3)
          .reverse()
          .map(jogador => ({
            ...jogador,
            fotoTratada: jogador.foto || 'assets/Alisa.png',
            personagensTratados: (jogador.personagens || [])
              .slice(0, 3)
              .map((personagem: any) => ({
                ...personagem,
                imagemTratada: this.getImagemProfilePersonagem(personagem)
              }))
          }));

        this.finalizarRequisicao();
      },
      error: (erro) => {
        console.error('Erro ao carregar jogadores da comunidade:', erro);

        this.jogadores = [];
        this.totalJogadores = 0;
        this.jogadoresRecentes = [];

        this.finalizarRequisicao();
      }
    });
  }

  carregarTotalPlayerStyles(): void {
    const serviceAny = this.jogadorComunidadeService as any;

    if (!serviceAny.contarPlayerStyles) {
      this.totalPlayerStyles = 0;
      this.finalizarRequisicao();
      return;
    }

    serviceAny.contarPlayerStyles().subscribe({
      next: (dados: any) => {
        this.totalPlayerStyles = dados?.total || 0;
        this.finalizarRequisicao();
      },
      error: (erro: any) => {
        console.error('Erro ao carregar total de player styles:', erro);
        this.totalPlayerStyles = 0;
        this.finalizarRequisicao();
      }
    });
  }

  finalizarRequisicao(): void {
    this.requisicoesFinalizadas++;

    if (this.requisicoesFinalizadas >= this.totalRequisicoes) {
      this.carregando = false;
    }
  }

  irPara(rota: string): void {
    this.router.navigate([rota]);
  }

  getInicialUsuario(): string {
    if (!this.usuarioLogado) {
      return '?';
    }

    const nomeParaAvatar = this.usuarioLogado.nickname || this.usuarioLogado.nome;
    return nomeParaAvatar.charAt(0).toUpperCase();
  }

  getNomeUsuario(): string {
    if (!this.usuarioLogado) {
      return 'Usuário';
    }

    return this.usuarioLogado.nickname || this.usuarioLogado.nome;
  }

  getImagemPersonagem(personagem: any): string {
    if (personagem?.imagem) {
      return personagem.imagem;
    }

    if (!personagem?.nome) {
      return 'assets/Alisa.png';
    }

    const slug = this.gerarSlug(personagem.nome);
    return `assets/${slug}.png`;
  }

  getImagemProfilePersonagem(personagem: any): string {
    if (personagem?.imagem) {
      return personagem.imagem;
    }

    if (!personagem?.nome) {
      return 'assets/Alisa.png';
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

  usarImagemPadrao(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/Alisa.png';
  }
}