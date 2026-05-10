import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PersonagemService } from '../services/personagem.service';
import { JogadorComunidadeService } from '../services/jogadorComunidade.service';
import { Personagem } from '../model/personagem.model';
import { UsuarioLogado } from '../model/auth.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  termoBusca = '';

  carregando = false;

  menuConfiguracoesAberto = false;
  menuPerfilAberto = false;
  editorPerfilAberto = false;

  nicknameEditado = '';
  fotoPerfilPreview = '';

  usuarioLogado: UsuarioLogado | null = null;

  personagens: Personagem[] = [];
  personagensHero: Personagem[] = [];
  personagensDestaque: Personagem[] = [];

  jogadoresComunidade: any[] = [];
  ultimosJogadoresComunidade: any[] = [];

  totalPersonagens = 0;
  totalFavoritos = 0;
  totalJogadoresComunidade = 0;
  totalPlayerStyles = 0;

  private requisicoesFinalizadas = 0;
  private totalRequisicoes = 3;

  constructor(
    private router: Router,
    private personagemService: PersonagemService,
    private jogadorComunidadeService: JogadorComunidadeService,
    private authService: AuthService
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

    try {
      this.usuarioLogado = JSON.parse(usuarioStorage);
    } catch (erro) {
      console.error('Erro ao ler usuário logado:', erro);
      this.usuarioLogado = null;
    }
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
        this.totalFavoritos = this.personagens.filter(p => p.favorito === true).length;

        this.definirPersonagensHero();
        this.definirPersonagensDestaque();

        this.finalizarRequisicao();
      },
      error: (erro) => {
        console.error('Erro ao carregar personagens:', erro);

        this.personagens = [];
        this.personagensHero = [];
        this.personagensDestaque = [];

        this.totalPersonagens = 0;
        this.totalFavoritos = 0;

        this.finalizarRequisicao();
      }
    });
  }

  definirPersonagensHero(): void {
    this.personagensHero = this.pegarAleatorios(this.personagens, 3);
  }

  definirPersonagensDestaque(): void {
    this.personagensDestaque = this.pegarAleatorios(this.personagens, 4);
  }

  pegarAleatorios(lista: Personagem[], quantidade: number): Personagem[] {
    if (!lista || lista.length === 0) {
      return [];
    }

    return [...lista]
      .sort(() => Math.random() - 0.5)
      .slice(0, quantidade);
  }

  carregarJogadoresComunidade(): void {
    this.jogadorComunidadeService.listar().subscribe({
      next: (jogadores) => {
        this.jogadoresComunidade = jogadores || [];

        this.totalJogadoresComunidade = this.jogadoresComunidade.length;

        this.ultimosJogadoresComunidade = [...this.jogadoresComunidade]
          .slice(-3)
          .reverse()
          .map(jogador => ({
            ...jogador,
            foto: jogador.foto || '',
            personagens: jogador.personagens || []
          }));

        this.finalizarRequisicao();
      },
      error: (erro) => {
        console.error('Erro ao carregar jogadores da comunidade:', erro);

        this.jogadoresComunidade = [];
        this.ultimosJogadoresComunidade = [];
        this.totalJogadoresComunidade = 0;

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

  abrirFrameData(personagem: any): void {
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
            this.atualizarTotalFavoritos();
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
          this.atualizarTotalFavoritos();
        },
        error: (erro) => {
          console.error('Erro ao favoritar:', erro);
        }
      });
  }

  atualizarTotalFavoritos(): void {
    this.totalFavoritos = this.personagens.filter(p => p.favorito === true).length;
  }

  getInicialUsuario(): string {
    if (!this.usuarioLogado) {
      return '?';
    }

    const nome = this.usuarioLogado.nickname || this.usuarioLogado.nome || '?';
    return nome.charAt(0).toUpperCase();
  }

  getNomeUsuario(): string {
    if (!this.usuarioLogado) {
      return 'Usuário';
    }

    return this.usuarioLogado.nickname || this.usuarioLogado.nome;
  }

  getFotoPerfilUsuario(): string {
    if (!this.usuarioLogado) {
      return '';
    }

    return (this.usuarioLogado as any).fotoPerfil || '';
  }

  alternarMenuPerfil(): void {
    this.menuPerfilAberto = !this.menuPerfilAberto;
  }

  abrirEditorPerfil(): void {
    if (!this.usuarioLogado) {
      return;
    }

    this.menuPerfilAberto = false;
    this.editorPerfilAberto = true;

    this.nicknameEditado = this.usuarioLogado.nickname || this.usuarioLogado.nome || '';
    this.fotoPerfilPreview = this.getFotoPerfilUsuario() || '';
  }

  fecharEditorPerfil(): void {
    this.editorPerfilAberto = false;
  }

  selecionarFotoPerfil(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const arquivo = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.fotoPerfilPreview = String(reader.result);
    };

    reader.readAsDataURL(arquivo);
  }

salvarPerfil(): void {
  if (!this.usuarioLogado) {
    return;
  }

  const payload = {
    nickname: this.nicknameEditado.trim() || this.usuarioLogado.nickname || this.usuarioLogado.nome,
    fotoPerfil: this.fotoPerfilPreview
  };

  this.authService.atualizarPerfil(this.usuarioLogado.id, payload).subscribe({
    next: (usuarioAtualizado) => {

      this.usuarioLogado = usuarioAtualizado;

      this.editorPerfilAberto = false;
      this.menuPerfilAberto = false;
    },
    error: (erro) => {
      console.error('ERRO AO ATUALIZAR PERFIL:', erro);
      alert('Erro ao atualizar perfil.');
    }
  });
}

  alternarConfiguracoes(): void {
    this.menuConfiguracoesAberto = !this.menuConfiguracoesAberto;
  }

  sair(): void {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('token');

    this.menuConfiguracoesAberto = false;
    this.menuPerfilAberto = false;
    this.editorPerfilAberto = false;

    this.router.navigate(['/login']);
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
}