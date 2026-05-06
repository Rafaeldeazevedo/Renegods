import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JogadorComunidadeService } from '../../services/jogadorComunidade.service';

@Component({
  selector: 'app-jogador-comunidade-personagens',
  templateUrl: './jogador-comunidade-personagens.component.html',
  styleUrls: ['./jogador-comunidade-personagens.component.css']
})
export class JogadorComunidadePersonagensComponent implements OnInit {

  jogadorId!: number;
  jogador: any = null;
  personagens: any[] = [];

  carregando = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jogadorComunidadeService: JogadorComunidadeService
  ) {}

  ngOnInit(): void {
    this.jogadorId = Number(this.route.snapshot.paramMap.get('id'));
    this.buscarJogador();
    this.buscarPersonagens();
  }

  buscarJogador(): void {
    this.jogadorComunidadeService.buscarPorId(this.jogadorId).subscribe({
      next: (dados) => {
        this.jogador = dados;
      },
      error: (erro) => {
        console.error('Erro ao buscar jogador:', erro);
      }
    });
  }

  buscarPersonagens(): void {
    this.carregando = true;

    this.jogadorComunidadeService.listarPersonagensDoJogador(this.jogadorId).subscribe({
      next: (dados) => {
        this.personagens = dados || [];
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao buscar personagens do jogador:', erro);
        this.carregando = false;
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/jogadores-comunidade']);
  }
}