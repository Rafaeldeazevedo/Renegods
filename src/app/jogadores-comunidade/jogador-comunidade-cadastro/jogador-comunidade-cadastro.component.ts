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
  personagens: any[] = [];
  personagensSelecionados: number[] = [];

  salvando = false;

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
      }
    });
  }

  selecionarFotoPerfil(foto: string): void {
  this.foto = foto;
}

fotoSelecionada(foto: string): boolean {
  return this.foto === foto;
}

  togglePersonagem(personagemId: number): void {
    const existe = this.personagensSelecionados.includes(personagemId);

    if (existe) {
      this.personagensSelecionados = this.personagensSelecionados.filter(id => id !== personagemId);
    } else {
      this.personagensSelecionados.push(personagemId);
    }
  }

  estaSelecionado(personagemId: number): boolean {
    return this.personagensSelecionados.includes(personagemId);
  }

salvar(): void {
  if (!this.nome.trim() || !this.tekkenId.trim()) {
    alert('Informe o nome e o Tekken ID.');
    return;
  }

  if (!this.foto) {
    alert('Selecione uma foto de perfil.');
    return;
  }

  if (this.personagensSelecionados.length === 0) {
    alert('Selecione pelo menos um personagem.');
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
      alert('Jogador cadastrado com sucesso.');
      this.router.navigate(['/jogadores-comunidade']);
    },
    error: (erro) => {
      console.error('Erro ao cadastrar jogador:', erro);
      this.salvando = false;

      const mensagem =
        erro?.error?.message ||
        erro?.error?.mensagem ||
        'Erro ao cadastrar jogador.';

      alert(mensagem);
    }
  });
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

usarImagemPadrao(event: Event, personagem: any): void {
  const img = event.target as HTMLImageElement;
  img.src = personagem?.imagem || 'assets/Alisa.png';
}

selecionarFotoPorPersonagem(personagem: any): void {
  this.foto = this.getImagemProfilePersonagem(personagem);
  this.nomeFotoSelecionada = personagem.nome;
}
selecionarFotoPeloValor(foto: string): void {
  this.foto = foto;

  const personagemEncontrado = this.personagens.find(
    personagem => this.getImagemProfilePersonagem(personagem) === foto
  );

  this.nomeFotoSelecionada = personagemEncontrado?.nome || '';
}

  voltar(): void {
    this.router.navigate(['/jogadores-comunidade']);
  }
}