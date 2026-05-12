import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { PersonagemService } from '../services/personagem.service';
import { JogadorComunidadeService } from '../services/jogadorComunidade.service';

import { UsuarioLogado } from '../model/auth.model';
import { Personagem } from '../model/personagem.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  usuarioLogado: UsuarioLogado | null = null;

  personagens: Personagem[] = [];
  personagensHero: Personagem[] = [];
  personagensDestaque: Personagem[] = [];

  jogadoresComunidade: any[] = [];
  ultimosJogadores: any[] = [];

  totalPersonagens = 0;
  totalFavoritos = 0;
  totalJogadoresComunidade = 0;
  totalPlayerStyles = 0;

  carregando = true;
  carregandoPersonagens = false;
  carregandoJogadores = false;

  menuPerfilAberto = false;
  editorPerfilAberto = false;

  nicknameEditado = '';
  fotoPerfilPreview = '';
  fotoPerfilArquivo: File | null = null;

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

    this.carregarDashboard();
  }

  carregarDashboard(): void {
    this.carregando = true;

    this.carregarPersonagens();
    this.carregarJogadoresComunidade();
    this.carregarTotalPlayerStyles();

    setTimeout(() => {
      this.carregando = false;
    }, 500);
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

    this.carregandoPersonagens = true;

    this.personagemService.listarPorUsuario(this.usuarioLogado.id).subscribe({
      next: (personagens: Personagem[]) => {
        this.personagens = personagens || [];

        this.personagens.sort((a: any, b: any) =>
          (a.nome || '').localeCompare(b.nome || '', 'pt-BR', {
            sensitivity: 'base'
          })
        );

        this.totalPersonagens = this.personagens.length;
        this.totalFavoritos = this.personagens.filter((p: any) => p.favorito === true).length;

        this.personagensHero = this.pegarAleatorios(this.personagens, 3);
        this.personagensDestaque = this.montarPersonagensDestaque(this.personagens);

        this.carregandoPersonagens = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar personagens:', erro);

        this.personagens = [];
        this.personagensHero = [];
        this.personagensDestaque = [];
        this.totalPersonagens = 0;
        this.totalFavoritos = 0;

        this.carregandoPersonagens = false;
      }
    });
  }

  carregarJogadoresComunidade(): void {
    this.carregandoJogadores = true;

    this.jogadorComunidadeService.listar().subscribe({
      next: (jogadores: any[]) => {
        this.jogadoresComunidade = jogadores || [];
        this.totalJogadoresComunidade = this.jogadoresComunidade.length;

        this.ultimosJogadores = this.montarUltimosJogadores(this.jogadoresComunidade);

        this.carregandoJogadores = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar jogadores da comunidade:', erro);

        this.jogadoresComunidade = [];
        this.ultimosJogadores = [];
        this.totalJogadoresComunidade = 0;

        this.carregandoJogadores = false;
      }
    });
  }

  carregarTotalPlayerStyles(): void {
    this.jogadorComunidadeService.contarPlayerStyles().subscribe({
      next: (resposta: any) => {
        this.totalPlayerStyles =
          resposta?.total ??
          resposta?.quantidade ??
          resposta?.count ??
          0;
      },
      error: (erro) => {
        console.error('Erro ao contar player styles:', erro);
        this.totalPlayerStyles = 0;
      }
    });
  }

  montarPersonagensDestaque(personagens: Personagem[]): Personagem[] {
    if (!personagens || personagens.length === 0) {
      return [];
    }

    const favoritos = personagens.filter((personagem: any) => personagem.favorito === true);

    if (favoritos.length >= 4) {
      return favoritos.slice(0, 4);
    }

    const restantes = personagens.filter((personagem: any) => personagem.favorito !== true);

    return [...favoritos, ...restantes].slice(0, 4);
  }

  montarUltimosJogadores(jogadores: any[]): any[] {
    if (!jogadores || jogadores.length === 0) {
      return [];
    }

    return [...jogadores]
      .sort((a, b) => {
        const dataA = a?.criadoEm ? new Date(a.criadoEm).getTime() : 0;
        const dataB = b?.criadoEm ? new Date(b.criadoEm).getTime() : 0;

        if (dataA === dataB) {
          return Number(b?.id || 0) - Number(a?.id || 0);
        }

        return dataB - dataA;
      })
      .slice(0, 2);
  }

  pegarAleatorios(lista: Personagem[], quantidade: number): Personagem[] {
    if (!lista || lista.length === 0) {
      return [];
    }

    return [...lista]
      .sort(() => Math.random() - 0.5)
      .slice(0, quantidade);
  }

  alternarMenuPerfil(): void {
    this.menuPerfilAberto = !this.menuPerfilAberto;
  }

  abrirEditorPerfil(): void {
    this.menuPerfilAberto = false;
    this.editorPerfilAberto = true;

    const usuario: any = this.usuarioLogado;

    this.nicknameEditado =
      usuario?.nickname ||
      usuario?.nome ||
      '';

    this.fotoPerfilPreview = this.getFotoPerfilUsuario();
  }

  fecharEditorPerfil(): void {
    this.editorPerfilAberto = false;
    this.fotoPerfilArquivo = null;
  }

  selecionarFotoPerfil(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const arquivo = input.files[0];

    this.fotoPerfilArquivo = arquivo;

    const reader = new FileReader();

    reader.onload = () => {
      this.fotoPerfilPreview = String(reader.result || '');
    };

    reader.readAsDataURL(arquivo);
  }

  salvarPerfil(): void {
    if (!this.usuarioLogado) {
      return;
    }

    const usuarioAtual: any = this.usuarioLogado;

    const usuarioAtualizado: any = {
      ...usuarioAtual,
      nickname: this.nicknameEditado?.trim() || usuarioAtual.nickname || usuarioAtual.nome,
      fotoPerfil: this.fotoPerfilPreview || this.getFotoPerfilUsuario()
    };

    this.usuarioLogado = usuarioAtualizado;

    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtualizado));

    this.fecharEditorPerfil();
  }

  irParaHome(): void {
    this.router.navigate(['/home']);
  }

  irParaPersonagens(): void {
    this.router.navigate(['/personagens']);
  }

  irParaTierList(): void {
    this.router.navigate(['/tier-lists']);
  }

  irParaJogadoresComunidade(): void {
    this.router.navigate(['/jogadores-comunidade']);
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

  usarImagemPadrao(event: Event): void {
    const img = event.target as HTMLImageElement;

    img.onerror = null;
    img.src = 'assets/personagens/alisa-bosconovitch.png';
  }

  usarImagemPadraoJogador(event: Event): void {
    const img = event.target as HTMLImageElement;

    img.onerror = null;
    img.style.display = 'none';
  }

  usarImagemPadraoUsuario(event: Event): void {
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

  isDlc(personagem: any): boolean {
    const nome = String(personagem?.nome || '').toLowerCase();

    const personagensDlc = [
      'eddy',
      'lidia',
      'heihachi',
      'clive',
      'anna',
      'fahkumram',
      'armor king',
      'miary zo'
    ];

    return personagensDlc.some(dlc => nome.includes(dlc));
  }

  getFotoPerfilUsuario(): string {
    const usuario: any = this.usuarioLogado;

    return (
      usuario?.fotoPerfil ||
      usuario?.foto ||
      usuario?.imagem ||
      usuario?.avatar ||
      ''
    );
  }

  getInicialUsuario(): string {
    const usuario: any = this.usuarioLogado;

    const nome =
      usuario?.nickname ||
      usuario?.nome ||
      'R';

    return nome.charAt(0).toUpperCase();
  }

  getNomeUsuarioLogado(): string {
    const usuario: any = this.usuarioLogado;

    return (
      usuario?.nickname ||
      usuario?.nome ||
      'RNG | R4F'
    );
  }

  getNomePreviewPerfil(): string {
    const usuario: any = this.usuarioLogado;

    return (
      this.nicknameEditado ||
      usuario?.nickname ||
      usuario?.nome ||
      'RNG | R4F'
    );
  }

  isAdmin(): boolean {
    const usuario: any = this.usuarioLogado;

    return String(usuario?.perfil || '').toUpperCase() === 'ADMIN';
  }

  getNomeCriadorJogador(jogador: any): string {
    return (
      jogador?.criadoPorNickname ||
      jogador?.nicknameCriador ||
      jogador?.usuario?.nickname ||
      jogador?.usuario?.nome ||
      'Jogador Renegado'
    );
  }

  getTotalPersonagensJogador(jogador: any): number {
    if (typeof jogador?.totalPersonagens === 'number') {
      return jogador.totalPersonagens;
    }

    if (Array.isArray(jogador?.personagens)) {
      return jogador.personagens.length;
    }

    return 0;
  }

  formatarDataCriacao(data: string): string {
    if (!data) {
      return 'Data não informada';
    }

    const dataObj = new Date(data);

    if (isNaN(dataObj.getTime())) {
      return 'Data inválida';
    }

    return dataObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  sair(): void {
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('token');

    this.router.navigate(['/login']);
  }
}