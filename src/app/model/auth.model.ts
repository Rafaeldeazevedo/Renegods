export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  id: number;
  nome: string;
  email: string;
  nickname: string;
  nivel: number;
  xp: number;
  token?: string;
}

export interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
  nickname: string;
  nivel: number;
  xp: number;
}
