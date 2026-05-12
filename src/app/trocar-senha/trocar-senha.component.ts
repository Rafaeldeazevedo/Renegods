import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { TrocarSenhaRequest, UsuarioLogado } from '../model/auth.model';

@Component({
  selector: 'app-trocar-senha',
  templateUrl: './trocar-senha.component.html',
  styleUrls: ['./trocar-senha.component.css']
})
export class TrocarSenhaComponent implements OnInit {
  usuarioLogado: UsuarioLogado | null = null;

  form: TrocarSenhaRequest = {
    usuarioId: 0,
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  };

  carregando = false;
  validandoToken = false;

  mensagemErro = '';
  mensagemSucesso = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioLogado = this.authService.getUsuarioLogado();

    if (!this.usuarioLogado) {
      this.router.navigate(['/login']);
      return;
    }

    const token = this.authService.getToken();

    if (!token) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    this.form.usuarioId = this.usuarioLogado.id;

    this.validarTokenInicial();
  }

  validarTokenInicial(): void {
    this.validandoToken = true;
    this.mensagemErro = '';

    this.authService.validarToken().subscribe({
      next: (tokenValido) => {
        this.validandoToken = false;

        if (!tokenValido) {
          this.authService.logout();
          this.router.navigate(['/login']);
          return;
        }
      },
      error: (erro) => {
        console.error('Erro ao validar token:', erro);

        this.validandoToken = false;

        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  trocarSenha(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

    if (!this.usuarioLogado) {
      this.router.navigate(['/login']);
      return;
    }

    const token = this.authService.getToken();

    if (!token) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    if (!this.form.senhaAtual.trim()) {
      this.mensagemErro = 'Informe a senha atual.';
      return;
    }

    if (!this.form.novaSenha.trim()) {
      this.mensagemErro = 'Informe a nova senha.';
      return;
    }

    if (this.form.novaSenha.length < 6) {
      this.mensagemErro = 'A nova senha deve ter pelo menos 6 caracteres.';
      return;
    }

    if (this.form.novaSenha !== this.form.confirmarSenha) {
      this.mensagemErro = 'A confirmação da senha não confere.';
      return;
    }

    this.carregando = true;

    this.authService.validarToken().subscribe({
      next: (tokenValido) => {
        if (!tokenValido) {
          this.carregando = false;

          this.authService.logout();
          this.router.navigate(['/login']);
          return;
        }

        this.enviarTrocaSenha();
      },
      error: (erro) => {
        console.error('Erro ao validar token antes de trocar senha:', erro);

        this.carregando = false;

        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  enviarTrocaSenha(): void {
    this.authService.trocarSenha(this.form).subscribe({
      next: () => {
        this.carregando = false;
        this.mensagemSucesso = 'Senha alterada com sucesso.';

        if (this.usuarioLogado) {
          this.usuarioLogado.deveTrocarSenha = false;
          this.authService.atualizarUsuarioLogado(this.usuarioLogado);
        }

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 700);
      },
      error: (erro) => {
        console.error('Erro ao trocar senha:', erro);

        this.carregando = false;

        if (typeof erro?.error === 'string') {
          this.mensagemErro = erro.error;
          return;
        }

        if (erro?.error?.mensagem) {
          this.mensagemErro = erro.error.mensagem;
          return;
        }

        if (erro?.error?.message) {
          this.mensagemErro = erro.error.message;
          return;
        }

        this.mensagemErro = 'Erro ao trocar senha.';
      }
    });
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}