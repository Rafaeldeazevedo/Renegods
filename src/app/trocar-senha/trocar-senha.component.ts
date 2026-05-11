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

    this.form.usuarioId = this.usuarioLogado.id;
  }

  trocarSenha(): void {
    this.mensagemErro = '';
    this.mensagemSucesso = '';

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

        this.mensagemErro = 'Erro ao trocar senha.';
      }
    });
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}