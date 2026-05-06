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

    if (this.personagensSelecionados.length === 0) {
      alert('Selecione pelo menos um personagem.');
      return;
    }

    const payload = {
      nome: this.nome,
      tekkenId: this.tekkenId,
      personagensIds: this.personagensSelecionados
    };

    this.salvando = true;

    this.jogadorComunidadeService.cadastrar(payload).subscribe({
      next: () => {
        this.salvando = false;
        this.router.navigate(['/jogadores-comunidade']);
      },
      error: (erro) => {
        console.error('Erro ao cadastrar jogador:', erro);
        this.salvando = false;
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/jogadores-comunidade']);
  }
}