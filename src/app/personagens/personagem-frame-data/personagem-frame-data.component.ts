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

  getFrameClass(valor: string | null): string {
    if (!valor) {
      return '';
    }

    const valorLimpo = valor.trim();

    if (valorLimpo.startsWith('+')) {
      return 'positivo';
    }

    if (valorLimpo.startsWith('-')) {
      return 'negativo';
    }

    return '';
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