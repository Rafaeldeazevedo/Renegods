import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { TierListService } from '../services/tier-list.service';
import { UsuarioLogado } from '../model/auth.model';

@Component({
  selector: 'app-tier-lists',
  templateUrl: './tier-lists.component.html',
  styleUrls: ['./tier-lists.component.css']
})
export class TierListsComponent implements OnInit {
  usuarioLogado: UsuarioLogado | null = null;

  tierLists: any[] = [];
  carregando = false;
  mensagemErro = '';

  paginaAtual = 1;
  itensPorPagina = 6;
  filtroSeason = 'Season 3';

  minhaTierListDaSeason: any = null;

  constructor(
    private tierListService: TierListService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarUsuarioLogado();

    if (!this.usuarioLogado) {
      this.router.navigate(['/login']);
      return;
    }

    this.carregarTierLists();
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

  carregarTierLists(): void {
    this.carregando = true;
    this.mensagemErro = '';
    this.minhaTierListDaSeason = null;

    this.tierListService.listarPorSeason(this.filtroSeason).subscribe({
      next: (res) => {
        this.tierLists = res || [];
        this.paginaAtual = 1;

        if (this.usuarioLogado) {
          this.minhaTierListDaSeason = this.tierLists.find(
            tierList => tierList.usuarioId === this.usuarioLogado?.id
          ) || null;
        }

        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar Tier Lists:', erro);

        this.tierLists = [];
        this.minhaTierListDaSeason = null;
        this.mensagemErro = 'Erro ao carregar Tier Lists.';
        this.carregando = false;
      }
    });
  }

  selecionarSeason(season: string): void {
    this.filtroSeason = season;
    this.carregarTierLists();
  }

  criarNovaTierList(): void {
    if (this.minhaTierListDaSeason) {
      this.router.navigate(['/tier-lists', this.minhaTierListDaSeason.id]);
      return;
    }

    this.router.navigate(['/tier-list']);
  }

  abrirTierList(tierList: any): void {
    this.router.navigate(['/tier-lists', tierList.id]);
  }

  compararTierList(tierList: any): void {
    this.mensagemErro = '';

    if (!this.minhaTierListDaSeason) {
      this.mensagemErro = 'Você precisa criar sua Tier List desta season antes de comparar.';
      return;
    }

    if (this.minhaTierListDaSeason.id === tierList.id) {
      this.mensagemErro = 'Escolha a Tier List de outro usuário para comparar.';
      return;
    }

    this.router.navigate([
      '/tier-lists/comparar',
      this.minhaTierListDaSeason.id,
      tierList.id
    ]);
  }

  isMinhaTierList(tierList: any): boolean {
    return tierList?.usuarioId === this.usuarioLogado?.id;
  }

  getNomeCriador(tierList: any): string {
    if (tierList?.nickname) {
      return tierList.nickname;
    }

    if (tierList?.usuario?.nickname) {
      return tierList.usuario.nickname;
    }

    if (tierList?.usuario?.nome) {
      return tierList.usuario.nome;
    }

    if (tierList?.usuarioId === this.usuarioLogado?.id) {
      return this.usuarioLogado?.nickname || this.usuarioLogado?.nome || 'Você';
    }

    return 'Jogador Renegado';
  }

  getFotoCriador(tierList: any): string | null {
    if (tierList?.fotoPerfil) {
      return tierList.fotoPerfil;
    }

    if (tierList?.usuario?.fotoPerfil) {
      return tierList.usuario.fotoPerfil;
    }

    if (tierList?.usuarioId === this.usuarioLogado?.id && this.usuarioLogado?.fotoPerfil) {
      return this.usuarioLogado.fotoPerfil;
    }

    return null;
  }

  getInicialCriador(tierList: any): string {
    const nome = this.getNomeCriador(tierList);

    if (!nome) {
      return '?';
    }

    return nome.charAt(0).toUpperCase();
  }

  getTotalItens(tierList: any): number {
    if (tierList?.totalItens !== undefined && tierList?.totalItens !== null) {
      return tierList.totalItens;
    }

    if (tierList?.totalPersonagens !== undefined && tierList?.totalPersonagens !== null) {
      return tierList.totalPersonagens;
    }

    if (tierList?.itens) {
      return tierList.itens.length;
    }

    return 0;
  }

  get totalPaginas(): number {
  return Math.ceil(this.tierLists.length / this.itensPorPagina) || 1;
}

get tierListsPaginadas(): any[] {
  const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
  const fim = inicio + this.itensPorPagina;

  return this.tierLists.slice(inicio, fim);
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
}