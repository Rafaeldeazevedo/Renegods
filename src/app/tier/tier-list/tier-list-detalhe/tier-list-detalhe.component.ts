import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TierListService } from '../services/tier-list.service';
import { PersonagemService } from '../services/personagem.service';

import { Personagem } from '../model/personagem.model';
import { UsuarioLogado } from '../model/auth.model';

type TierKey = 'S' | 'A' | 'B' | 'C';

@Component({
  selector: 'app-tier-list-detalhe',
  templateUrl: './tier-list-detalhe.component.html',
  styleUrls: ['./tier-list-detalhe.component.css']
})
export class TierListDetalheComponent implements OnInit {
  usuarioLogado: UsuarioLogado | null = null;

  tierListId!: number;
  tierList: any = null;

  personagens: Personagem[] = [];

  carregando = false;
  redefinindo = false;

  mensagemErro = '';
  mensagemSucesso = '';

  tierKeys: TierKey[] = ['S', 'A', 'B', 'C'];

  tiers: Record<TierKey, Personagem[]> = {
    S: [],
    A: [],
    B: [],
    C: []
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tierListService: TierListService,
    private personagemService: PersonagemService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarioLogado();

    if (!this.usuarioLogado) {
      this.router.navigate(['/login']);
      return;
    }

    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      this.router.navigate(['/tier-lists']);
      return;
    }

    this.tierListId = Number(idParam);

    this.carregarDados();
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

  carregarDados(): void {
    if (!this.usuarioLogado) {
      return;
    }

    this.carregando = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    this.tierListService.buscarPorId(this.tierListId).subscribe({
      next: (tierListSalva) => {
        this.tierList = tierListSalva;

        this.personagemService.listarPorUsuario(this.usuarioLogado!.id).subscribe({
          next: (personagens) => {
            this.personagens = personagens || [];
            this.montarTiers();
            this.carregando = false;
          },
          error: (erro) => {
            console.error('Erro ao carregar personagens:', erro);
            this.mensagemErro = 'Erro ao carregar personagens.';
            this.carregando = false;
          }
        });
      },
      error: (erro) => {
        console.error('Erro ao carregar Tier List:', erro);
        this.mensagemErro = 'Erro ao carregar Tier List.';
        this.carregando = false;
      }
    });
  }

  montarTiers(): void {
    this.tiers = {
      S: [],
      A: [],
      B: [],
      C: []
    };

    if (!this.tierList?.itens) {
      return;
    }

    const itensOrdenados = [...this.tierList.itens].sort((a, b) => {
      if (a.tier === b.tier) {
        return a.posicao - b.posicao;
      }

      return this.tierKeys.indexOf(a.tier) - this.tierKeys.indexOf(b.tier);
    });

    itensOrdenados.forEach((item: any) => {
      const personagem = this.personagens.find(p => p.id === item.personagemId);

      if (!personagem) {
        return;
      }

      const tier = item.tier as TierKey;

      if (this.tiers[tier]) {
        this.tiers[tier].push(personagem);
      }
    });
  }

  isMinhaTierList(): boolean {
    return this.tierList?.usuarioId === this.usuarioLogado?.id;
  }

  redefinirTierList(): void {
    if (!this.tierList?.id) {
      return;
    }

    const confirmar = confirm(
      'Tem certeza que deseja redefinir esta Tier List? Ela será apagada e você poderá montar novamente.'
    );

    if (!confirmar) {
      return;
    }

    this.redefinindo = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    this.tierListService.excluir(this.tierList.id).subscribe({
      next: () => {
        this.redefinindo = false;
        this.mensagemSucesso = 'Tier List redefinida com sucesso.';

        this.router.navigate(['/tier-list']);
      },
      error: (erro) => {
        console.error('Erro ao redefinir Tier List:', erro);

        this.redefinindo = false;
        this.mensagemErro = 'Erro ao redefinir Tier List.';
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/tier-lists']);
  }

  getNomeCriador(): string {
    if (this.tierList?.nickname) {
      return this.tierList.nickname;
    }

    if (this.tierList?.usuario?.nickname) {
      return this.tierList.usuario.nickname;
    }

    if (this.tierList?.usuario?.nome) {
      return this.tierList.usuario.nome;
    }

    if (this.tierList?.usuarioId === this.usuarioLogado?.id) {
      return this.usuarioLogado?.nickname || this.usuarioLogado?.nome || 'Você';
    }

    if (this.tierList?.usuarioId) {
      return `Usuário #${this.tierList.usuarioId}`;
    }

    return 'Usuário';
  }

  getTotalOrganizados(): number {
    return (
      this.tiers.S.length +
      this.tiers.A.length +
      this.tiers.B.length +
      this.tiers.C.length
    );
  }

  getTotalNaTier(tier: TierKey): number {
    return this.tiers[tier].length;
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