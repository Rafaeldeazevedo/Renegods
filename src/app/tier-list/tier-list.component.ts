import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';

import { PersonagemService } from '../services/personagem.service';
import {TierListService } from '../services/tier-list.service';

import { Personagem } from '../model/personagem.model';
import { UsuarioLogado } from '../model/auth.model';
import { TierListRequest } from '../model/tierList.model';
type TierKey = 'S' | 'A' | 'B' | 'C' | 'D';

@Component({
  selector: 'app-tier-list',
  templateUrl: './tier-list.component.html',
  styleUrls: ['./tier-list.component.css']
})
export class TierListComponent implements OnInit {
  usuarioLogado: UsuarioLogado | null = null;

  carregando = false;
  salvando = false;

  nomeTierList = '';
  seasonSelecionada = 'Season 3';

  mensagemErro = '';
  mensagemSucesso = '';

  personagensDisponiveis: Personagem[] = [];

  tierKeys: TierKey[] = ['S', 'A', 'B', 'C', 'D'];

  tiers: Record<TierKey, Personagem[]> = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: []
  };

  constructor(
    private personagemService: PersonagemService,
    private tierListService: TierListService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarUsuarioLogado();

    if (!this.usuarioLogado) {
      this.router.navigate(['/login']);
      return;
    }

    this.nomeTierList = `Tier List ${this.usuarioLogado.nickname || this.usuarioLogado.nome}`;

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
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    this.personagemService.listarPorUsuario(this.usuarioLogado.id).subscribe({
      next: (personagens) => {
        this.personagensDisponiveis = personagens || [];

        this.tiers = {
          S: [],
          A: [],
          B: [],
          C: [],
          D: []
        };

        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar personagens:', erro);

        this.personagensDisponiveis = [];

        this.tiers = {
          S: [],
          A: [],
          B: [],
          C: [],
          D: []
        };

        this.mensagemErro = 'Erro ao carregar personagens.';
        this.carregando = false;
      }
    });
  }

  dropPersonagem(event: CdkDragDrop<Personagem[]>): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
  }

  resetarTierList(): void {
    const todosPersonagens: Personagem[] = [
      ...this.personagensDisponiveis,
      ...this.tiers.S,
      ...this.tiers.A,
      ...this.tiers.B,
      ...this.tiers.C,
      ...this.tiers.D
    ];

    this.personagensDisponiveis = todosPersonagens;

    this.tiers = {
      S: [],
      A: [],
      B: [],
      C: [],
      D: []
    };

    this.mensagemErro = '';
    this.mensagemSucesso = '';
  }

  salvarTierList(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (!this.usuarioLogado) {
      this.router.navigate(['/login']);
      return;
    }

    const itens = this.montarItensPayload();

    if (itens.length === 0) {
      this.mensagemErro = 'Coloque pelo menos um personagem em alguma tier antes de salvar.';
      return;
    }

    if (!this.nomeTierList || !this.nomeTierList.trim()) {
      this.mensagemErro = 'Informe um nome para a Tier List.';
      return;
    }

    if (!this.seasonSelecionada || !this.seasonSelecionada.trim()) {
      this.mensagemErro = 'Selecione uma season.';
      return;
    }

    const payload: TierListRequest = {
      usuarioId: this.usuarioLogado.id,
      nome: this.nomeTierList.trim(),
      season: this.seasonSelecionada,
      itens
    };

    this.salvando = true;

    this.tierListService.criar(payload).subscribe({
      next: () => {
        this.salvando = false;
        this.mensagemSucesso = 'Tier List salva com sucesso.';

        setTimeout(() => {
          this.router.navigate(['/tier-lists']);
        }, 600);
      },
      error: (erro) => {
        console.error('Erro ao salvar Tier List:', erro);

        this.salvando = false;

        if (erro?.status === 409) {
          this.mensagemErro = 'Você já criou uma Tier List para esta season.';
          return;
        }

        if (typeof erro?.error === 'string') {
          this.mensagemErro = erro.error;
          return;
        }

        this.mensagemErro = 'Erro ao salvar Tier List.';
      }
    });
  }

  montarItensPayload(): { personagemId: number; tier: TierKey; posicao: number }[] {
    const itens: { personagemId: number; tier: TierKey; posicao: number }[] = [];

    this.tierKeys.forEach(tier => {
      this.tiers[tier].forEach((personagem, index) => {
        itens.push({
          personagemId: personagem.id,
          tier,
          posicao: index + 1
        });
      });
    });

    return itens;
  }

  getTotalNaTier(tier: TierKey): number {
    return this.tiers[tier].length;
  }

  getTotalOrganizados(): number {
    return (
      this.tiers.S.length +
      this.tiers.A.length +
      this.tiers.B.length +
      this.tiers.C.length +
      this.tiers.D.length
    );
  }

  getTotalPersonagens(): number {
    return this.personagensDisponiveis.length + this.getTotalOrganizados();
  }

  getImagemPerfil(personagem: any): string {
    if (!personagem?.nome) {
      return 'assets/profile/alisa-bosconovitch.png';
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

    if (img.src.includes('alisa-bosconovitch.png')) {
      return;
    }

    img.src = 'assets/profile/alisa-bosconovitch.png';
  }
}