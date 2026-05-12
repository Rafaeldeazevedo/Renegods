import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../model/auth.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginRequest: LoginRequest = {
    email: '',
    senha: ''
  };

  carregando = false;
  erroLogin = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  entrar(): void {
    this.erroLogin = '';

    /*
      IMPORTANTE:
      Remove token antigo antes do login.
      Isso evita mandar Authorization: Bearer antigo no /auth/login.
    */
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioLogado');

    if (!this.loginRequest.email || !this.loginRequest.email.trim()) {
      this.erroLogin = 'Informe o email.';
      return;
    }

    if (!this.loginRequest.senha || !this.loginRequest.senha.trim()) {
      this.erroLogin = 'Informe a senha.';
      return;
    }

    this.carregando = true;

    const request: LoginRequest = {
      email: this.loginRequest.email.trim(),
      senha: this.loginRequest.senha.trim()
    };
    debugger;
    this.authService.login(request).subscribe({
      next: (usuario) => {
        if (!usuario) {
          this.carregando = false;
          this.erroLogin = 'Erro ao realizar login.';
          return;
        }

        if (!usuario.token || !usuario.token.trim()) {
          this.carregando = false;
          this.erroLogin = 'Login realizado, mas o token não foi retornado pelo servidor.';
          return;
        }

        localStorage.setItem('token', usuario.token);
        localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

        this.authService.validarToken().subscribe({
          next: (tokenValido) => {
            this.carregando = false;

            if (!tokenValido) {
              localStorage.removeItem('token');
              localStorage.removeItem('usuarioLogado');

              this.erroLogin = 'Token inválido. Faça login novamente.';
              return;
            }

            if (usuario.deveTrocarSenha === true) {
              this.router.navigate(['/trocar-senha']);
              return;
            }

            this.router.navigate(['/home']);
          },
          error: (erro) => {
            console.error('Erro ao validar token:', erro);

            this.carregando = false;

            localStorage.removeItem('token');
            localStorage.removeItem('usuarioLogado');

            this.erroLogin = 'Não foi possível validar o token.';
          }
        });
      },
      error: (erro) => {
        console.error('Erro ao fazer login:', erro);

        this.carregando = false;

        localStorage.removeItem('token');
        localStorage.removeItem('usuarioLogado');

        if (typeof erro?.error === 'string') {
          this.erroLogin = erro.error;
          return;
        }

        if (erro?.error?.mensagem) {
          this.erroLogin = erro.error.mensagem;
          return;
        }

        if (erro?.error?.message) {
          this.erroLogin = erro.error.message;
          return;
        }

        this.erroLogin = 'Email ou senha inválidos.';
      }
    });
  }
}