
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PersonagensComponent } from './personagens/personagens.component';
import { LoginComponent } from './login/login.component';
import { PersonagemFrameDataComponent } from './personagens/personagem-frame-data/personagem-frame-data.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'personagens', component: PersonagensComponent },
  { path: 'personagens/:id/frame-data', component: PersonagemFrameDataComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
