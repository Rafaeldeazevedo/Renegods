
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PersonagensComponent } from './personagens/personagens.component';
import { LoginComponent } from './login/login.component';
import { PersonagemFrameDataComponent } from './personagens/personagem-frame-data/personagem-frame-data.component';
import { JogadoresComunidadeComponent } from './jogadores-comunidade/jogadores-comunidade.component';
import { JogadorComunidadeCadastroComponent } from './jogadores-comunidade/jogador-comunidade-cadastro/jogador-comunidade-cadastro.component';
import { JogadorComunidadePersonagensComponent } from './jogadores-comunidade/jogador-comunidade-personagens/jogador-comunidade-personagens.component';
import { JogadorComunidadePlayerStyleComponent } from './jogadores-comunidade/jogador-comunidade-player-style/jogador-comunidade-player-style.component';
import { HomeComponent } from './home/home.component';
const routes: Routes = [
  { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent },
  { path: 'personagens', component: PersonagensComponent },
   { path: 'jogadores-comunidade', component: JogadoresComunidadeComponent },
  { path: 'jogadores-comunidade/novo', component: JogadorComunidadeCadastroComponent },
  {
  path: 'jogadores-comunidade/:jogadorId/personagens/:personagemId/player-style',
  component: JogadorComunidadePlayerStyleComponent
},
  { path: 'jogadores-comunidade/:id/personagens', component: JogadorComunidadePersonagensComponent },
  { path: 'personagens/:id/frame-data', component: PersonagemFrameDataComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
