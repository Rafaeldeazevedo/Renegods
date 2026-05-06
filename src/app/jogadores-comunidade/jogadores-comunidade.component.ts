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

  constructor(
    private router: Router,
    private jogadorComunidadeService: JogadorComunidadeService
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.carregando = true;

    this.jogadorComunidadeService.listar().subscribe({
      next: (dados) => {
        this.jogadores = dados || [];
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao listar jogadores:', erro);
        this.carregando = false;
      }
    });
  }

  novoJogador(): void {
    this.router.navigate(['/jogadores-comunidade/novo']);
  }

  visualizarPersonagens(jogador: any): void {
    this.router.navigate(['/jogadores-comunidade', jogador.id, 'personagens']);
  }
}