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

    if (!this.loginRequest.email || !this.loginRequest.email.trim()) {
      this.erroLogin = 'Informe o email.';
      return;
    }

    if (!this.loginRequest.senha || !this.loginRequest.senha.trim()) {
      this.erroLogin = 'Informe a senha.';
      return;
    }

    this.carregando = true;

    this.authService.login(this.loginRequest).subscribe({
      next: (usuario) => {
        this.carregando = false;

        if (usuario.deveTrocarSenha === true) {
          this.router.navigate(['/trocar-senha']);
          return;
        }

        this.router.navigate(['/home']);
      },
      error: (erro) => {
        console.error('Erro ao fazer login:', erro);

        this.carregando = false;

        if (typeof erro?.error === 'string') {
          this.erroLogin = erro.error;
          return;
        }

        if (erro?.error?.mensagem) {
          this.erroLogin = erro.error.mensagem;
          return;
        }

        this.erroLogin = 'Email ou senha inválidos.';
      }
    });
  }
}