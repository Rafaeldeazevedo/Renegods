export interface PersonagemFrameData {
  id: number;
  personagemId: number;
  comando: string;
  hitLevel: string | null;
  dano: string | null;
  startup: string | null;
  blockFrame: string | null;
  hitFrame: string | null;
  counterHitFrame: string | null;
  observacao: string | null;
}