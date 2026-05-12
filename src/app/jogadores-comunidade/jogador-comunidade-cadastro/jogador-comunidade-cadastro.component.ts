import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { JogadorComunidadeService } from '../../services/jogadorComunidade.service';
import { PersonagemService } from '../../services/personagem.service';
import { UsuarioLogado } from '../../model/auth.model';

@Component({
  selector: 'app-jogador-comunidade-cadastro',
  templateUrl: './jogador-comunidade-cadastro.component.html',
  styleUrls: ['./jogador-comunidade-cadastro.component.css']
})
export class JogadorComunidadeCadastroComponent implements OnInit {

  jogadorId: number | null = null;
  modoEdicao = false;

  jogador: any = null;

  nome = '';
  tekkenId = '';
  fotoSelecionada = '';

  personagens: any[] = [];
  personagensFiltrados: any[] = [];
  personagensSelecionados: any[] = [];

  fotosPerfil: any[] = [];

  termoBuscaPersonagem = '';

  usuarioLogado: UsuarioLogado | null = null;

  carregando = false;
  salvando = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private jogadorComunidadeService: JogadorComunidadeService,
    private personagemService: PersonagemService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarioLogado();

    if (!this.usuarioLogado) {
      this.router.navigate(['/login']);
      return;
    }

    this.carregarPersonagens();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.jogadorId = Number(id);
      this.modoEdicao = true;
      this.carregarJogadorParaEdicao(this.jogadorId);
    }
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

    this.personagemService.listarPorUsuario(this.usuarioLogado.id).subscribe({
      next: (personagens: any[]) => {
        this.personagens = (personagens || []).sort((a, b) =>
          (a.nome || '').localeCompare(b.nome || '', 'pt-BR', {
            sensitivity: 'base'
          })
        );

        this.personagensFiltrados = [...this.personagens];

        this.fotosPerfil = this.personagens.map(personagem => ({
          nome: personagem.nome,
          valor: this.getImagemProfilePersonagem(personagem)
        }));
      },
      error: (erro) => {
        console.error('Erro ao carregar personagens:', erro);

        this.personagens = [];
        this.personagensFiltrados = [];
        this.fotosPerfil = [];

        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao carregar',
          detail: 'Não foi possível carregar a lista de personagens.',
          life: 3500
        });
      }
    });
  }

  carregarJogadorParaEdicao(id: number): void {
    this.carregando = true;

    this.jogadorComunidadeService.buscarPorId(id).subscribe({
      next: (jogador) => {
        this.jogador = jogador;

        this.nome = jogador.nome || '';
        this.tekkenId = jogador.tekkenId || '';
        this.fotoSelecionada = this.normalizarFotoSalva(jogador.foto || '');

        this.personagensSelecionados = jogador.personagens || [];

        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar jogador para edição:', erro);

        this.carregando = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao carregar',
          detail: 'Não foi possível carregar os dados do jogador.',
          life: 3500
        });
      }
    });
  }

  salvar(): void {
    if (!this.nome.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nome obrigatório',
        detail: 'Informe o nome do jogador antes de continuar.',
        life: 3500
      });

      return;
    }

    if (!this.tekkenId.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Tekken ID obrigatório',
        detail: 'Informe o Tekken ID do jogador antes de continuar.',
        life: 3500
      });

      return;
    }

    if (!this.personagensSelecionados.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nenhum personagem selecionado',
        detail: 'Selecione pelo menos um personagem antes de cadastrar o jogador.',
        life: 3500
      });

      return;
    }

    const usuarioStorage = localStorage.getItem('usuarioLogado');
    const usuarioLogado = usuarioStorage ? JSON.parse(usuarioStorage) : null;

    const payload = {
      nome: this.nome.trim(),
      tekkenId: this.tekkenId.trim(),
      foto: this.fotoSelecionada || null,
      personagensIds: this.personagensSelecionados.map(personagem => personagem.id),
      criadoPorNickname:
        this.jogador?.criadoPorNickname ||
        usuarioLogado?.nickname ||
        usuarioLogado?.nickName ||
        usuarioLogado?.nome ||
        usuarioLogado?.login ||
        'Jogador Renegado'
    };

    this.salvando = true;

    if (this.modoEdicao && this.jogadorId) {
      this.jogadorComunidadeService.atualizar(this.jogadorId, payload).subscribe({
        next: () => {
          this.salvando = false;

          this.messageService.add({
            severity: 'success',
            summary: 'Jogador atualizado',
            detail: 'As alterações foram salvas com sucesso.',
            life: 2500
          });

          setTimeout(() => {
            this.router.navigate(['/jogadores-comunidade']);
          }, 700);
        },
        error: (erro) => {
          console.error('Erro ao atualizar jogador:', erro);

          this.salvando = false;

          this.messageService.add({
            severity: 'error',
            summary: 'Erro ao atualizar',
            detail: 'Não foi possível salvar as alterações do jogador.',
            life: 3500
          });
        }
      });

      return;
    }

    this.jogadorComunidadeService.cadastrar(payload).subscribe({
      next: () => {
        this.salvando = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Jogador cadastrado',
          detail: 'Jogador cadastrado com sucesso na comunidade.',
          life: 2500
        });

        setTimeout(() => {
          this.router.navigate(['/jogadores-comunidade']);
        }, 700);
      },
      error: (erro) => {
        console.error('Erro ao cadastrar jogador:', erro);

        this.salvando = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao cadastrar',
          detail: 'Não foi possível cadastrar o jogador.',
          life: 3500
        });
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/jogadores-comunidade']);
  }

  filtrarPersonagens(): void {
    const termo = this.termoBuscaPersonagem.trim().toLowerCase();

    if (!termo) {
      this.personagensFiltrados = [...this.personagens];
      return;
    }

    this.personagensFiltrados = this.personagens.filter(personagem =>
      (personagem.nome || '').toLowerCase().includes(termo)
    );
  }

  alternarPersonagem(personagem: any): void {
    if (this.personagemEstaSelecionado(personagem)) {
      this.personagensSelecionados = this.personagensSelecionados.filter(
        item => item.id !== personagem.id
      );
      return;
    }

    this.personagensSelecionados.push(personagem);
  }

  personagemEstaSelecionado(personagem: any): boolean {
    return this.personagensSelecionados.some(item => item.id === personagem.id);
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

  getImagemProfilePersonagem(personagem: any): string {
    if (!personagem?.nome) {
      return '';
    }

    const slug = this.gerarSlug(personagem.nome);

    return `assets/profile/${slug}.png`;
  }

  normalizarFotoSalva(foto: string): string {
    if (!foto) {
      return '';
    }

    return foto.toLowerCase();
  }

  usarImagemPadrao(event: Event): void {
    const img = event.target as HTMLImageElement;

    img.onerror = null;
    img.src = 'assets/personagens/alisa-bosconovitch.png';
  }

  usarImagemPadraoProfile(event: Event): void {
    const img = event.target as HTMLImageElement;

    img.onerror = null;
    img.style.display = 'none';
  }

  gerarSlug(nome: string): string {
    return nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  obterNomeCurto(nome: string): string {
    if (!nome) {
      return '';
    }

    return nome.trim().split(/\s+/)[0];
  }

  get tituloTela(): string {
    return this.modoEdicao ? 'Editar jogador' : 'Cadastrar jogador';
  }

  get textoBotaoSalvar(): string {
    return this.modoEdicao ? 'Salvar alterações' : 'Cadastrar jogador';
  }

  get quantidadeSelecionados(): number {
    return this.personagensSelecionados.length;
  }
}