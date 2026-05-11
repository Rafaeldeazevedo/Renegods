import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';

import { Observable, catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {

    const usuario = this.authService.getUsuarioLogado();
    const token = this.authService.getToken();

    if (!usuario || !token) {
      this.authService.logout();
      return of(this.router.createUrlTree(['/login']));
    }

    return this.authService.validarToken().pipe(
      map((tokenValido) => {
        if (!tokenValido) {
          this.authService.logout();
          return this.router.createUrlTree(['/login']);
        }

        if (usuario.deveTrocarSenha === true && state.url !== '/trocar-senha') {
          return this.router.createUrlTree(['/trocar-senha']);
        }

        return true;
      }),
      catchError((erro) => {
        console.error('Erro ao validar token:', erro);

        this.authService.logout();
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}