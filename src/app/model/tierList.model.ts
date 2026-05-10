export interface TierListItemRequest {
  personagemId: number;
  tier: 'S' | 'A' | 'B' | 'C';
  posicao: number;
}

export interface TierListRequest {
  usuarioId: number;
  nome: string;
  season: string;
  itens: TierListItemRequest[];
}