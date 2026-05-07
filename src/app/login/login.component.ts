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

    if (!this.loginRequest.email || !this.loginRequest.senha) {
      this.erroLogin = 'Informe email e senha.';
      return;
    }

    this.carregando = true;

    this.authService.login(this.loginRequest).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigate(['/home']);
      },
      error: (erro) => {
        console.error('Erro ao fazer login:', erro);
        this.carregando = false;
        this.erroLogin = 'Email ou senha inválidos.';
      }
    });
  }
}