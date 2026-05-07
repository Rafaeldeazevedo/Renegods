import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  esconderHeader = false;
  esconderFooter = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;

        this.esconderHeader =
          url.startsWith('/home') ||
          url.startsWith('/login') ||
          url.startsWith('/personagens');

        this.esconderFooter =
          url.startsWith('/home') ||
          url.startsWith('/login')||
          url.startsWith('/personagens');
      });
  }
}