import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { JogadorComunidadeService } from '../services/jogadorComunidade.service';

@Component({
  selector: 'app-jogadores-comunidade',
  templateUrl: './jogadores-comunidade.component.html',
  styleUrls: ['./jogadores-comunidade.component.css']
})
export class JogadoresComunidadeComponent implements OnInit {

  jogadores: any[] = [];
  carregando = false;

  jogadorSelecionado: any = null;
  personagemSelecionado: any = null;

  paginaAtual = 1;
  itensPorPagina = 9;

  constructor(
    private router: Router,
    private jogadorComunidadeService: JogadorComunidadeService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.buscarJogadores();
  }

  buscarJogadores(): void {
    this.carregando = true;

    this.jogadorComunidadeService.listar().subscribe({
      next: (dados: any[]) => {
        this.jogadores = dados || [];
        this.paginaAtual = 1;
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao buscar jogadores:', erro);

        this.jogadores = [];
        this.carregando = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao carregar',
          detail: 'Não foi possível carregar os jogadores da comunidade.',
          life: 3500
        });
      }
    });
  }

  novoJogador(): void {
    this.router.navigate(['/jogadores-comunidade/novo']);
  }

  voltarHome(): void {
    this.router.navigate(['/home']);
  }

  editarJogador(jogador: any): void {
    this.router.navigate([
      '/jogadores-comunidade',
      jogador.id,
      'editar'
    ]);
  }

  selecionarPersonagemDoJogador(jogador: any, personagem: any): void {
    this.jogadorSelecionado = jogador;
    this.personagemSelecionado = personagem;
  }

  visualizarPlayerStyle(jogador: any): void {
    if (!this.personagemSelecionado || this.jogadorSelecionado?.id !== jogador.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Escolha um personagem',
        detail: `Selecione primeiro um personagem do jogador ${jogador.nome} para abrir o Player Style.`,
        life: 3500
      });

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

  excluirJogador(jogador: any): void {
    const confirmar = confirm(`Deseja excluir o jogador "${jogador.nome}"?`);

    if (!confirmar) {
      return;
    }

    this.jogadorComunidadeService.excluirJogador(jogador.id).subscribe({
      next: () => {
        this.jogadores = this.jogadores.filter(item => item.id !== jogador.id);

        if (this.paginaAtual > this.totalPaginas) {
          this.paginaAtual = this.totalPaginas;
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Jogador excluído',
          detail: 'Jogador removido com sucesso.',
          life: 3000
        });
      },
      error: (erro) => {
        console.error('Erro ao excluir jogador:', erro);

        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao excluir',
          detail: 'Não foi possível excluir o jogador.',
          life: 3500
        });
      }
    });
  }

  get isAdmin(): boolean {
    const usuarioStorage = localStorage.getItem('usuarioLogado');

    if (!usuarioStorage) {
      return false;
    }

    try {
      const usuario = JSON.parse(usuarioStorage);
      return String(usuario?.perfil || '').toUpperCase() === 'ADMIN';
    } catch {
      return false;
    }
  }

  getImagemProfilePersonagem(personagem: any): string {
    if (!personagem?.nome) {
      return personagem?.imagem || 'assets/personagens/alisa-bosconovitch.png';
    }

    const slug = this.gerarSlug(personagem.nome);

    return `assets/profile/${slug}.png`;
  }

  usarImagemPadrao(event: Event, personagem?: any): void {
    const img = event.target as HTMLImageElement;

    img.onerror = null;
    img.src = personagem?.imagem || 'assets/personagens/alisa-bosconovitch.png';
  }

  obterNomeCurto(nome: string): string {
    if (!nome) {
      return '';
    }

    return nome.trim().split(/\s+/)[0];
  }

  gerarSlug(nome: string): string {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  get totalPaginas(): number {
    return Math.ceil(this.jogadores.length / this.itensPorPagina) || 1;
  }

  get jogadoresPaginados(): any[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;

    return this.jogadores.slice(inicio, fim);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, index) => index + 1);
  }

  irParaPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas) {
      return;
    }

    this.paginaAtual = pagina;
  }

  paginaAnterior(): void {
    this.irParaPagina(this.paginaAtual - 1);
  }

  proximaPagina(): void {
    this.irParaPagina(this.paginaAtual + 1);
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
}