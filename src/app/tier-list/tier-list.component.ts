import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { PersonagemService } from '../services/personagem.service';

interface TierItem {
  key: string;
  nome: string;
  personagens: any[];
}

@Component({
  selector: 'app-tier-list',
  templateUrl: './tier-list.component.html',
  styleUrls: ['./tier-list.component.css']
})
export class TierListComponent implements OnInit {

  carregando = false;
  salvando = false;

  mensagemSucesso = '';
  mensagemErro = '';

  nomeTierList = '';
  visibilidade = 'PUBLICA';

  personagensDisponiveis: any[] = [];

  tiers: TierItem[] = [
    {
      key: 'S',
      nome: 'S',
      personagens: []
    },
    {
      key: 'A',
      nome: 'A',
      personagens: []
    },
    {
      key: 'B',
      nome: 'B',
      personagens: []
    },
    {
      key: 'C',
      nome: 'C',
      personagens: []
    },
    {
      key: 'D',
      nome: 'D',
      personagens: []
    }
  ];

  dropListsIds: string[] = [
    'tier-S',
    'tier-A',
    'tier-B',
    'tier-C',
    'tier-D',
    'disponiveis'
  ];

  constructor(
    private router: Router,
    private personagemService: PersonagemService
  ) {}

  ngOnInit(): void {
    this.carregarPersonagens();
  }

  carregarPersonagens(): void {
    this.carregando = true;
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    const usuarioLogado = this.getUsuarioLogado();

    if (!usuarioLogado?.id) {
      this.carregando = false;
      this.mensagemErro = 'Usuário não encontrado.';
      return;
    }

    this.personagemService.listarPorUsuario(usuarioLogado.id).subscribe({
      next: (dados: any[]) => {
        const personagens = dados || [];

        this.personagensDisponiveis = personagens
          .map(personagem => ({
            ...personagem
          }))
          .sort((a, b) =>
            String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR', {
              sensitivity: 'base'
            })
          );

        this.limparTiers();

        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar personagens:', erro);
        this.mensagemErro = 'Erro ao carregar personagens.';
        this.carregando = false;
      }
    });
  }

  drop(event: CdkDragDrop<any[]>): void {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    const personagemArrastado = event.item.data;

    if (!personagemArrastado || personagemArrastado.id == null) {
      return;
    }

    if (event.previousContainer === event.container) {
      this.moverDentroDaMesmaLista(event, personagemArrastado);
      return;
    }

    this.moverEntreListas(event, personagemArrastado);
  }

  moverDentroDaMesmaLista(event: CdkDragDrop<any[]>, personagemArrastado: any): void {
    const lista = event.container.data;

    if (!Array.isArray(lista)) {
      return;
    }

    const personagemId = Number(personagemArrastado.id);

    const indexAtual = lista.findIndex(
      personagem => Number(personagem.id) === personagemId
    );

    if (indexAtual === -1) {
      return;
    }

    let indexDestino = event.currentIndex;

    if (indexDestino < 0) {
      indexDestino = 0;
    }

    if (indexDestino >= lista.length) {
      indexDestino = lista.length - 1;
    }

    moveItemInArray(lista, indexAtual, indexDestino);
  }

  moverEntreListas(event: CdkDragDrop<any[]>, personagemArrastado: any): void {
    const listaOrigem = event.previousContainer.data;
    const listaDestino = event.container.data;

    if (!Array.isArray(listaOrigem) || !Array.isArray(listaDestino)) {
      return;
    }

    const personagemId = Number(personagemArrastado.id);

    const indexOrigem = listaOrigem.findIndex(
      personagem => Number(personagem.id) === personagemId
    );

    if (indexOrigem === -1) {
      return;
    }

    const [personagemRemovido] = listaOrigem.splice(indexOrigem, 1);

    if (!personagemRemovido) {
      return;
    }

    let indexDestino = event.currentIndex;

    if (indexDestino < 0) {
      indexDestino = 0;
    }

    if (indexDestino > listaDestino.length) {
      indexDestino = listaDestino.length;
    }

    listaDestino.splice(indexDestino, 0, personagemRemovido);
  }

  limparTiers(): void {
    this.tiers.forEach(tier => {
      tier.personagens = [];
    });
  }

  resetarTierList(): void {
    const todosPersonagens = [
      ...this.personagensDisponiveis,
      ...this.tiers.flatMap(tier => tier.personagens)
    ];

    this.tiers.forEach(tier => {
      tier.personagens = [];
    });

    this.personagensDisponiveis = todosPersonagens
      .filter((personagem, index, array) =>
        array.findIndex(p => Number(p.id) === Number(personagem.id)) === index
      )
      .sort((a, b) =>
        String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR', {
          sensitivity: 'base'
        })
      );

    this.mensagemSucesso = '';
    this.mensagemErro = '';
  }

  salvarTierList(): void {
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    if (!this.nomeTierList || !this.nomeTierList.trim()) {
      this.mensagemErro = 'Informe o nome da tier list.';
      return;
    }

    const itens = this.tiers.flatMap(tier =>
      tier.personagens.map((personagem, index) => ({
        personagemId: personagem.id,
        tier: tier.key,
        posicao: index + 1
      }))
    );

    if (itens.length === 0) {
      this.mensagemErro = 'Adicione pelo menos um personagem na tier list.';
      return;
    }

    const usuarioLogado = this.getUsuarioLogado();

    const request = {
      nome: this.nomeTierList.trim(),
      visibilidade: this.visibilidade,
      usuarioId: usuarioLogado?.id,
      itens
    };

    console.log('Payload salvar tier list:', request);

    /*
      Se você já tiver TierListService, liga aqui:

      this.salvando = true;

      this.tierListService.salvar(request).subscribe({
        next: () => {
          this.mensagemSucesso = 'Tier list salva com sucesso.';
          this.salvando = false;
        },
        error: (erro) => {
          console.error('Erro ao salvar tier list:', erro);
          this.mensagemErro = 'Erro ao salvar tier list.';
          this.salvando = false;
        }
      });
    */

    this.mensagemSucesso = 'Tier list montada. Confira o payload no console.';
  }

  voltarParaHome(): void {
    this.router.navigate(['/home']);
  }

  getTotalSelecionados(): number {
    return this.tiers.reduce(
      (total, tier) => total + tier.personagens.length,
      0
    );
  }

  getTotalDisponiveis(): number {
    return this.personagensDisponiveis.length;
  }

  getTotalPersonagens(): number {
    return this.getTotalSelecionados() + this.getTotalDisponiveis();
  }

getImagemPersonagem(personagem: any): string {
  if (!personagem?.nome) {
    return 'assets/profile/alisa-bosconovitch.png';
  }

  const slug = this.gerarSlug(personagem.nome);

  return `assets/profile/${slug}.png`;
}

usarImagemPadrao(event: Event): void {
  const img = event.target as HTMLImageElement;

  img.onerror = null;
  img.src = 'assets/profile/alisa-bosconovitch.png';
}

  gerarSlug(nome: string): string {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  trackByPersonagemId(index: number, personagem: any): number {
    return Number(personagem.id);
  }

  trackByTierKey(index: number, tier: TierItem): string {
    return tier.key;
  }

  private getUsuarioLogado(): any {
    const usuarioStorage = localStorage.getItem('usuarioLogado');

    if (!usuarioStorage) {
      return null;
    }

    try {
      return JSON.parse(usuarioStorage);
    } catch (erro) {
      console.error('Erro ao ler usuário logado:', erro);
      return null;
    }
  }
}