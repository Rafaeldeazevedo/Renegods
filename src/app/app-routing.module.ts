import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';

import { PersonagensComponent } from './personagens/personagens.component';
import { PersonagemFrameDataComponent } from './personagens/personagem-frame-data/personagem-frame-data.component';

import { JogadoresComunidadeComponent } from './jogadores-comunidade/jogadores-comunidade.component';
import { JogadorComunidadeCadastroComponent } from './jogadores-comunidade/jogador-comunidade-cadastro/jogador-comunidade-cadastro.component';
import { JogadorComunidadePersonagensComponent } from './jogadores-comunidade/jogador-comunidade-personagens/jogador-comunidade-personagens.component';
import { JogadorComunidadePlayerStyleComponent } from './jogadores-comunidade/jogador-comunidade-player-style/jogador-comunidade-player-style.component';

import { TierListComponent } from './tier-list/tier-list.component';
import { TierListsComponent } from './tier-lists/tier-lists.component';
import { TierListDetalheComponent } from './tier-list-detalhe/tier-list-detalhe.component';
import { TierListCompararComponent } from './tier-list-comparar/tier-list-comparar.component';

import { TrocarSenhaComponent } from './trocar-senha/trocar-senha.component';

import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'trocar-senha',
    component: TrocarSenhaComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'personagens',
    component: PersonagensComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'personagens/:id/frame-data',
    component: PersonagemFrameDataComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'tier-list',
    component: TierListComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'tier-lists',
    component: TierListsComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'tier-lists/comparar/:idA/:idB',
    component: TierListCompararComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'tier-lists/:id',
    component: TierListDetalheComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'jogadores-comunidade',
    component: JogadoresComunidadeComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'jogadores-comunidade/novo',
    component: JogadorComunidadeCadastroComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'jogadores-comunidade/:id/personagens',
    component: JogadorComunidadePersonagensComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'jogadores-comunidade/:jogadorId/personagens/:personagemId/player-style',
    component: JogadorComunidadePlayerStyleComponent,
    canActivate: [AuthGuard]
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: 'login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }