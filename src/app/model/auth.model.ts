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
  fotoPerfil?: string;
}

export interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
  nickname: string;
  nivel: number;
  xp: number;
  token?: string;
  fotoPerfil?: string;
  deveTrocarSenha?: boolean;
}

export interface TrocarSenhaRequest {
  usuarioId: number;
  senhaAtual: string;
  novaSenha: string;
  confirmarSenha: string;
}

export interface ValidarTokenResponse {
  valido: boolean;
}
