import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PersonagemFrameDataService } from '../../services/personagemFrameData.service';

@Component({
  selector: 'app-personagem-frame-data',
  templateUrl: './personagem-frame-data.component.html',
  styleUrls: ['./personagem-frame-data.component.css']
})
export class PersonagemFrameDataComponent implements OnInit {

  personagemId!: number;

  personagem: any = null;
  imagemPersonagem: string = '';

  frameData: any[] = [];
  frameDataFiltrado: any[] = [];

  filtro: string = '';
  carregando: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private personagemFrameDataService: PersonagemFrameDataService
  ) {}

  ngOnInit(): void {
    this.personagemId = Number(this.route.snapshot.paramMap.get('id'));

    const state = history.state;
    const personagemStorage = sessionStorage.getItem('personagemFrameData');

    if (state?.personagem) {
      this.personagem = state.personagem;
    } else if (personagemStorage) {
      this.personagem = JSON.parse(personagemStorage);
    }

    if (this.personagem) {
      this.imagemPersonagem = this.personagem.imagem || '';
    } else {
      this.personagem = null;
      this.imagemPersonagem = '';
    }

    this.buscarFrameData();
  }

  buscarFrameData(): void {
    this.carregando = true;

    this.personagemFrameDataService.buscarFrameData(this.personagemId).subscribe({
      next: (dados) => {
        this.frameData = dados || [];
        this.frameDataFiltrado = dados || [];
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao buscar frame data:', erro);
        this.frameData = [];
        this.frameDataFiltrado = [];
        this.carregando = false;
      }
    });
  }

  filtrar(): void {
    const termo = this.filtro.toLowerCase().trim();

    if (!termo) {
      this.frameDataFiltrado = this.frameData;
      return;
    }

    this.frameDataFiltrado = this.frameData.filter(item =>
      item.comando?.toLowerCase().includes(termo) ||
      item.hitLevel?.toLowerCase().includes(termo) ||
      item.dano?.toLowerCase().includes(termo) ||
      item.startup?.toLowerCase().includes(termo) ||
      item.blockFrame?.toLowerCase().includes(termo) ||
      item.hitFrame?.toLowerCase().includes(termo) ||
      item.counterHitFrame?.toLowerCase().includes(termo) ||
      item.observacao?.toLowerCase().includes(termo)
    );
  }

 getFrameColor(valor: any): string {
  if (valor === null || valor === undefined) {
    return '#e8e8ef';
  }

  const texto = String(valor).trim();

  if (!texto) {
    return '#e8e8ef';
  }

  // pega o primeiro número com sinal que aparecer
  // exemplos:
  // "+8" -> +8
  // "-11" -> -11
  // "+0d" -> +0
  // "-9~+6" -> -9
  // "+21a (+6)" -> +21
  const match = texto.match(/[+-]?\d+/);

  if (!match) {
    return '#e8e8ef';
  }

  const numero = Number(match[0]);

  if (numero === 0) {
    return '#e8e8ef';
  }

  if (numero > 0) {
    return '#7dff9b'; // verde
  }

  if (numero >= -9) {
    return '#ffd166'; // amarelo
  }

  return '#ff5f6d'; // vermelho (-10 ou menor)
}

  obterPrimeiroNome(): string {
    if (!this.personagem?.nome) {
      return '';
    }

    return this.personagem.nome.split(' ')[0].toUpperCase();
  }

  voltar(): void {
    this.router.navigate(['/personagens']); 
  }
}