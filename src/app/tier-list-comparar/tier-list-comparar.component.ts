import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TierListService } from '../services/tier-list.service';
import { PersonagemService } from '../services/personagem.service';

import { Personagem } from '../model/personagem.model';
import { UsuarioLogado } from '../model/auth.model';

type TierKey = 'S' | 'A' | 'B' | 'C' | 'D';

interface LinhaComparacao {
  personagem: Personagem;
  tierA: TierKey | '-';
  tierB: TierKey | '-';
  igual: boolean;
}

@Component({
  selector: 'app-tier-list-comparar',
  templateUrl: './tier-list-comparar.component.html',
  styleUrls: ['./tier-list-comparar.component.css']
})
export class TierListCompararComponent implements OnInit {
  usuarioLogado: UsuarioLogado | null = null;

  idA!: number;
  idB!: number;

  tierListA: any = null;
  tierListB: any = null;

  personagens: Personagem[] = [];

  carregando = false;
  mensagemErro = '';

  tierKeys: TierKey[] = ['S', 'A', 'B', 'C', 'D'];

  tiersA: Record<TierKey, Personagem[]> = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
  };

  tiersB: Record<TierKey, Personagem[]> = {
     S: [],
    A: [],
    B: [],
    C: [],
    D: [],
  };

  comparacao: LinhaComparacao[] = [];

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

    const idAParam = this.route.snapshot.paramMap.get('idA');
    const idBParam = this.route.snapshot.paramMap.get('idB');

    if (!idAParam || !idBParam) {
      this.router.navigate(['/tier-lists']);
      return;
    }

    this.idA = Number(idAParam);
    this.idB = Number(idBParam);

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

    this.tierListService.buscarPorId(this.idA).subscribe({
      next: (listaA) => {
        this.tierListA = listaA;

        this.tierListService.buscarPorId(this.idB).subscribe({
          next: (listaB) => {
            this.tierListB = listaB;

            this.personagemService.listarPorUsuario(this.usuarioLogado!.id).subscribe({
              next: (personagens) => {
                this.personagens = personagens || [];

                this.montarTiers();
                this.montarComparacao();

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
            console.error('Erro ao carregar segunda Tier List:', erro);
            this.mensagemErro = 'Erro ao carregar Tier List para comparação.';
            this.carregando = false;
          }
        });
      },
      error: (erro) => {
        console.error('Erro ao carregar primeira Tier List:', erro);
        this.mensagemErro = 'Erro ao carregar sua Tier List.';
        this.carregando = false;
      }
    });
  }

  montarTiers(): void {
    this.tiersA = {
     S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    };

    this.tiersB = {
  S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    };

    this.preencherTiers(this.tierListA, this.tiersA);
    this.preencherTiers(this.tierListB, this.tiersB);
  }

  preencherTiers(tierList: any, destino: Record<TierKey, Personagem[]>): void {
    if (!tierList?.itens) {
      return;
    }

    const itensOrdenados = [...tierList.itens].sort((a, b) => {
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

      if (destino[tier]) {
        destino[tier].push(personagem);
      }
    });
  }

  montarComparacao(): void {
    const mapaA = this.criarMapaTier(this.tierListA);
    const mapaB = this.criarMapaTier(this.tierListB);

    const idsPersonagens = new Set<number>();

    Object.keys(mapaA).forEach(id => idsPersonagens.add(Number(id)));
    Object.keys(mapaB).forEach(id => idsPersonagens.add(Number(id)));

    this.comparacao = Array.from(idsPersonagens)
      .map(id => {
        const personagem = this.personagens.find(p => p.id === id);

        if (!personagem) {
          return null;
        }

        const tierA = mapaA[id] || '-';
        const tierB = mapaB[id] || '-';

        return {
          personagem,
          tierA,
          tierB,
          igual: tierA === tierB
        } as LinhaComparacao;
      })
      .filter((linha): linha is LinhaComparacao => linha !== null)
      .sort((a, b) => a.personagem.nome.localeCompare(b.personagem.nome));
  }

  criarMapaTier(tierList: any): Record<number, TierKey> {
    const mapa: Record<number, TierKey> = {};

    if (!tierList?.itens) {
      return mapa;
    }

    tierList.itens.forEach((item: any) => {
      mapa[item.personagemId] = item.tier as TierKey;
    });

    return mapa;
  }

  voltar(): void {
    this.router.navigate(['/tier-lists']);
  }

  abrirTierList(id: number): void {
    this.router.navigate(['/tier-lists', id]);
  }

  getNomeCriador(tierList: any): string {
    if (tierList?.usuario?.nickname) {
      return tierList.usuario.nickname;
    }

    if (tierList?.usuario?.nome) {
      return tierList.usuario.nome;
    }

    if (tierList?.usuarioId) {
      return `Usuário #${tierList.usuarioId}`;
    }

    return 'Usuário';
  }

  getTotalOrganizados(tierList: any): number {
    return tierList?.itens?.length || 0;
  }

  getTotalIguais(): number {
    return this.comparacao.filter(linha => linha.igual).length;
  }

  getTotalDiferentes(): number {
    return this.comparacao.filter(linha => !linha.igual).length;
  }

  getClasseTier(tier: string): string {
    if (tier === '-') {
      return 'tier-none';
    }

    return `tier-${tier.toLowerCase()}`;
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
}