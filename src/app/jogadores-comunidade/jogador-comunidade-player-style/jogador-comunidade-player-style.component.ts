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
  criandoMania = false;

  estiloJogo = '';
  salvandoEstilo = false;
  editandoEstilo = false;
estiloJogoEditando = '';

  manias: any[] = [];
  carregando = false;

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

    this.buscarPlayerStyle();
    this.buscarManias();
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

 salvarPlayerStyle(): void {
  this.salvandoEstilo = true;

  this.jogadorComunidadeService
    .salvarPlayerStyle(this.jogadorId, this.personagemId, this.estiloJogoEditando)
    .subscribe({
      next: (dados) => {
        this.estiloJogo = dados?.estiloJogo || this.estiloJogoEditando;
        this.salvandoEstilo = false;
        this.editandoEstilo = false;
        this.estiloJogoEditando = '';
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
          this.carregando = false;
        },
        error: (erro) => {
          console.error('Erro ao buscar manias:', erro);
          this.manias = [];
          this.carregando = false;
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

criarMania(): void {
  const descricao = this.novaMania.trim();

  if (!descricao) {
    alert('Digite a mania/player style.');
    return;
  }

  this.jogadorComunidadeService
    .criarMania(this.jogadorId, this.personagemId, descricao)
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

  iniciarEdicao(mania: any): void {
    this.maniaEditandoId = mania.id;
    this.descricaoEditando = mania.descricao;
  }

  cancelarEdicao(): void {
    this.maniaEditandoId = null;
    this.descricaoEditando = '';
  }

  abrirCriacaoMania(): void {
  this.novaMania = '';
  this.criandoMania = true;
}

cancelarCriacaoMania(): void {
  this.novaMania = '';
  this.criandoMania = false;
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
}