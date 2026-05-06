import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { JogadorComunidadeService } from '../../services/jogadorComunidade.service';
import { PersonagemService } from '../../services/personagem.service';

@Component({
  selector: 'app-jogador-comunidade-cadastro',
  templateUrl: './jogador-comunidade-cadastro.component.html',
  styleUrls: ['./jogador-comunidade-cadastro.component.css']
})
export class JogadorComunidadeCadastroComponent implements OnInit {

  nome = '';
  tekkenId = '';
  foto = '';
  nomeFotoSelecionada = '';

  filtroPersonagem = '';

  salvando = false;

  personagens: any[] = [];
  personagensSelecionados: number[] = [];

  constructor(
    private router: Router,
    private jogadorComunidadeService: JogadorComunidadeService,
    private personagemService: PersonagemService
  ) {}

  ngOnInit(): void {
    this.carregarPersonagens();
  }

  carregarPersonagens(): void {
    this.personagemService.listar().subscribe({
      next: (dados) => {
        this.personagens = dados || [];
      },
      error: (erro) => {
        console.error('Erro ao carregar personagens:', erro);
        this.personagens = [];
      }
    });
  }

  get personagensFiltrados(): any[] {
    const filtro = this.filtroPersonagem.trim().toLowerCase();

    if (!filtro) {
      return this.personagens;
    }

    return this.personagens.filter(personagem =>
      personagem.nome?.toLowerCase().includes(filtro)
    );
  }

  get personagensPreview(): any[] {
    return this.personagens
      .filter(personagem => this.personagensSelecionados.includes(personagem.id))
      .slice(0, 6);
  }

  selecionarFotoPeloValor(foto: string): void {
    this.foto = foto;

    const personagemEncontrado = this.personagens.find(
      personagem => this.getImagemProfilePersonagem(personagem) === foto
    );

    this.nomeFotoSelecionada = personagemEncontrado?.nome || '';
  }

  getImagemProfilePersonagem(personagem: any): string {
    if (!personagem?.nome) {
      return personagem?.imagem || '';
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

  togglePersonagem(personagemId: number): void {
    const jaSelecionado = this.personagensSelecionados.includes(personagemId);

    if (jaSelecionado) {
      this.personagensSelecionados = this.personagensSelecionados.filter(
        id => id !== personagemId
      );
      return;
    }

    this.personagensSelecionados = [
      ...this.personagensSelecionados,
      personagemId
    ];
  }

  estaSelecionado(personagemId: number): boolean {
    return this.personagensSelecionados.includes(personagemId);
  }

  obterNomeCurto(nome: string): string {
    if (!nome) {
      return '';
    }

    return nome.trim().split(/\s+/)[0];
  }

  usarImagemPadraoPersonagem(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/Alisa.png';
  }

  usarImagemPadraoFotoPerfil(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/Alisa.png';
  }

 salvar(): void {
  if (!this.formularioValido()) {
    alert('Preencha nome, Tekken ID, foto de perfil e selecione pelo menos um personagem.');
    return;
  }

  const payload = {
    nome: this.nome.trim(),
    tekkenId: this.tekkenId.trim(),
    foto: this.foto,
    personagensIds: this.personagensSelecionados
  };

  console.log('Payload jogador comunidade:', payload);

  this.salvando = true;

  this.jogadorComunidadeService.cadastrar(payload).subscribe({
    next: () => {
      this.salvando = false;
      this.router.navigate(['/jogadores-comunidade']);
    },
    error: (erro) => {
      console.error('Erro ao cadastrar jogador:', erro);
      this.salvando = false;
      alert('Erro ao cadastrar jogador.');
    }
  });
}

formularioValido(): boolean {
  return !!(
    this.nome.trim() &&
    this.tekkenId.trim() &&
    this.foto &&
    this.personagensSelecionados.length > 0
  );
}
  voltar(): void {
    this.router.navigate(['/jogadores-comunidade']);
  }
}