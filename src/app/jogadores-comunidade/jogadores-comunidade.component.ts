import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
    private jogadorComunidadeService: JogadorComunidadeService
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
      alert('Selecione um personagem desse jogador antes de ver o Player Style.');
      return;
    }

    this.router.navigate([
      '/jogadores-comunidade',
      jogador.id,
      'personagens',
      this.personagemSelecionado.id,
      'player-style'
    ]);
  }

  getImagemProfilePersonagem(personagem: any): string {
    if (personagem?.imagemProfile) {
      return personagem.imagemProfile;
    }

    if (personagem?.foto) {
      return personagem.foto;
    }

    if (personagem?.imagem) {
      return personagem.imagem;
    }

    return 'assets/personagens/alisa-bosconovitch.png';
  }

  usarImagemPadrao(event: Event, personagem?: any): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/personagens/alisa-bosconovitch.png';
  }

  obterNomeCurto(nome: string): string {
    if (!nome) {
      return '';
    }

    return nome.trim().split(' ')[0];
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
}