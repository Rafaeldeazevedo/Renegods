import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const url = req.url.toLowerCase();

    const rotaSemToken =
      url.includes('/auth/login') ||
      url.includes('/auth/registrar') ||
      url.includes('/auth/register') ||
      url.includes('/auth/esqueci-senha') ||
      url.includes('/auth/trocar-senha');

    if (rotaSemToken) {
      return next.handle(req);
    }

    const token = localStorage.getItem('token');

    if (!token) {
      return next.handle(req);
    }

    const reqComToken = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next.handle(reqComToken);
  }
}