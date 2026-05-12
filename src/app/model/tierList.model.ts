export interface TierListRequest {
  nome: string;
  season: string;
  visibilidade: string;
  usuarioId: number;
  itens: TierListItemRequest[];
}

export interface TierListItemRequest {
  personagemId: number;
  tier: string;
  posicao: number;
}