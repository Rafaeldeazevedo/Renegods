import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { JogadorComunidadeService } from '../../services/jogadorComunidade.service';

@Component({
  selector: 'app-jogador-comunidade-player-style',
  templateUrl: './jogador-comunidade-player-style.component.html',
  styleUrls: ['./jogador-comunidade-player-style.component.css']
})
export class JogadorComunidadePlayerStyleComponent implements OnInit {

  jogadorId!: number;
  personagemId!: number;

  jogador: any = null;
  personagem: any = null;
  paginaAtualManias = 1;
  itensPorPaginaManias = 5;
  estiloJogo = '';
  estiloJogoEditando = '';

  salvandoEstilo = false;
  editandoEstilo = false;

  manias: any[] = [];
  carregando = false;

  criandoMania = false;
  novaMania = '';

  maniaEditandoId: number | null = null;
  descricaoEditando = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jogadorComunidadeService: JogadorComunidadeService
  ) {}

  ngOnInit(): void {
    this.jogadorId = Number(this.route.snapshot.paramMap.get('jogadorId'));
    this.personagemId = Number(this.route.snapshot.paramMap.get('personagemId'));

    const state = history.state;

    if (state?.jogador) {
      this.jogador = state.jogador;
    }

    if (state?.personagem) {
      this.personagem = state.personagem;
    }

    this.carregarJogador();
    this.carregarPersonagemDoJogador();
    this.buscarPlayerStyle();
    this.buscarManias();
  }

  carregarJogador(): void {
    this.jogadorComunidadeService.buscarPorId(this.jogadorId).subscribe({
      next: (jogador) => {
        this.jogador = jogador;

        if (!this.personagem && jogador?.personagens?.length) {
          this.personagem = jogador.personagens.find(
            (p: any) => Number(p.id) === Number(this.personagemId)
          ) || null;
        }
      },
      error: (erro) => {
        console.error('Erro ao carregar jogador:', erro);
      }
    });
  }

  carregarPersonagemDoJogador(): void {
    this.jogadorComunidadeService.listarPersonagensDoJogador(this.jogadorId).subscribe({
      next: (personagens) => {
        const lista = personagens || [];

        this.personagem = lista.find(
          (p: any) => Number(p.id) === Number(this.personagemId)
        ) || this.personagem;
      },
      error: (erro) => {
        console.error('Erro ao carregar personagem do jogador:', erro);
      }
    });
  }

  buscarPlayerStyle(): void {
    this.jogadorComunidadeService
      .buscarPlayerStyle(this.jogadorId, this.personagemId)
      .subscribe({
        next: (dados) => {
          this.estiloJogo = dados?.estiloJogo || '';
        },
        error: (erro) => {
          console.error('Erro ao buscar estilo de jogo:', erro);
          this.estiloJogo = '';
        }
      });
  }

  abrirEdicaoEstilo(): void {
    this.estiloJogoEditando = this.estiloJogo || '';
    this.editandoEstilo = true;
  }

  cancelarEdicaoEstilo(): void {
    this.estiloJogoEditando = '';
    this.editandoEstilo = false;
  }

  salvarPlayerStyle(): void {
    this.salvandoEstilo = true;

    this.jogadorComunidadeService
      .salvarPlayerStyle(this.jogadorId, this.personagemId, this.estiloJogoEditando)
      .subscribe({
        next: (dados) => {
          this.estiloJogo = dados?.estiloJogo || this.estiloJogoEditando;
          this.estiloJogoEditando = '';
          this.salvandoEstilo = false;
          this.editandoEstilo = false;
        },
        error: (erro) => {
          console.error('Erro ao salvar estilo de jogo:', erro);
          this.salvandoEstilo = false;
          alert('Erro ao salvar estilo de jogo.');
        }
      });
  }

 buscarManias(): void {
  this.carregando = true;

  this.jogadorComunidadeService
    .listarManias(this.jogadorId, this.personagemId)
    .subscribe({
      next: (dados) => {
        this.manias = dados || [];
        this.paginaAtualManias = 1;
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao buscar manias:', erro);
        this.manias = [];
        this.paginaAtualManias = 1;
        this.carregando = false;
      }
    });
}

  abrirCriacaoMania(): void {
    this.novaMania = '';
    this.criandoMania = true;
  }

  cancelarCriacaoMania(): void {
    this.novaMania = '';
    this.criandoMania = false;
  }

  criarMania(): void {
  const descricao = this.novaMania.trim();

  if (!descricao) {
    alert('Digite a mania.');
    return;
  }

  const criadoPorNickname = this.getNicknameUsuarioLogado();

  this.jogadorComunidadeService
    .criarMania(this.jogadorId, this.personagemId, descricao, criadoPorNickname)
    .subscribe({
      next: () => {
        this.novaMania = '';
        this.criandoMania = false;
        this.buscarManias();
      },
      error: (erro) => {
        console.error('Erro ao criar mania:', erro);
        alert('Erro ao criar mania.');
      }
    });
}

get isAdmin(): boolean {
  const usuarioStorage = localStorage.getItem('usuarioLogado');

  if (!usuarioStorage) {
    return false;
  }

  try {
    const usuario = JSON.parse(usuarioStorage);
    return String(usuario?.perfil || '').toUpperCase() === 'ADMIN';
  } catch {
    return false;
  }
}



  iniciarEdicao(mania: any): void {
    this.maniaEditandoId = mania.id;
    this.descricaoEditando = mania.descricao;
  }

  cancelarEdicao(): void {
    this.maniaEditandoId = null;
    this.descricaoEditando = '';
  }

  salvarEdicao(mania: any): void {
    const descricao = this.descricaoEditando.trim();

    if (!descricao) {
      alert('Descrição não pode ficar vazia.');
      return;
    }

    this.jogadorComunidadeService
      .alterarMania(mania.id, descricao)
      .subscribe({
        next: () => {
          this.cancelarEdicao();
          this.buscarManias();
        },
        error: (erro) => {
          console.error('Erro ao alterar mania:', erro);
          alert('Erro ao alterar mania.');
        }
      });
  }

  excluirMania(mania: any): void {
    const confirmar = confirm('Deseja excluir essa mania?');

    if (!confirmar) {
      return;
    }

    this.jogadorComunidadeService
      .excluirMania(mania.id)
      .subscribe({
        next: () => {
          this.buscarManias();
        },
        error: (erro) => {
          console.error('Erro ao excluir mania:', erro);
          alert('Erro ao excluir mania.');
        }
      });
  }

  voltar(): void {
    this.router.navigate(['/jogadores-comunidade']);
  }

  getNomeCriador(): string {
    if (this.jogador?.criadoPorNickname) {
      return this.jogador.criadoPorNickname;
    }

    if (this.jogador?.nicknameCriador) {
      return this.jogador.nicknameCriador;
    }

    if (this.jogador?.usuario?.nickname) {
      return this.jogador.usuario.nickname;
    }

    if (this.jogador?.usuario?.nome) {
      return this.jogador.usuario.nome;
    }

    return '';
  }

  

  getImagemProfilePersonagem(personagem: any): string {
    if (!personagem?.nome) {
      return personagem?.imagem || 'assets/personagens/alisa-bosconovitch.png';
    }

    const slug = this.gerarSlug(personagem.nome);

    return `assets/profile/${slug}.png`;
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

  usarImagemPadrao(event: Event, personagem?: any): void {
    const img = event.target as HTMLImageElement;

    img.onerror = null;
    img.src = personagem?.imagem || 'assets/personagens/alisa-bosconovitch.png';
  }

  usarImagemPadraoJogador(event: Event): void {
    const img = event.target as HTMLImageElement;

    img.onerror = null;
    img.style.display = 'none';
  }

  get totalManias(): number {
    return this.manias.length;
  }

  get possuiEstilo(): boolean {
    return !!this.estiloJogo?.trim();
  }
  get totalPaginasManias(): number {
  return Math.ceil(this.manias.length / this.itensPorPaginaManias) || 1;
}

get maniasPaginadas(): any[] {
  const inicio = (this.paginaAtualManias - 1) * this.itensPorPaginaManias;
  const fim = inicio + this.itensPorPaginaManias;

  return this.manias.slice(inicio, fim);
}

get paginasManias(): number[] {
  return Array.from(
    { length: this.totalPaginasManias },
    (_, index) => index + 1
  );
}

irParaPaginaManias(pagina: number): void {
  if (pagina < 1 || pagina > this.totalPaginasManias) {
    return;
  }

  this.paginaAtualManias = pagina;
}

getNicknameUsuarioLogado(): string {
  const usuarioStorage = localStorage.getItem('usuarioLogado');

  if (!usuarioStorage) {
    return 'Jogador Renegado';
  }

  try {
    const usuario = JSON.parse(usuarioStorage);

    return (
      usuario?.nickname ||
      usuario?.nickName ||
      usuario?.nome ||
      usuario?.login ||
      'Jogador Renegado'
    );
  } catch (erro) {
    console.error('Erro ao ler usuário logado:', erro);
    return 'Jogador Renegado';
  }
}

paginaAnteriorManias(): void {
  this.irParaPaginaManias(this.paginaAtualManias - 1);
}

proximaPaginaManias(): void {
  this.irParaPaginaManias(this.paginaAtualManias + 1);
}
}