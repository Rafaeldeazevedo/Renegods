import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { PersonagensComponent } from './personagens/personagens.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ToastModule } from 'primeng/toast';

import { MessageService } from 'primeng/api';
import { LoginComponent } from './login/login.component';
import { PersonagemFrameDataComponent } from './personagens/personagem-frame-data/personagem-frame-data.component';
import { JogadoresComunidadeComponent } from './jogadores-comunidade/jogadores-comunidade.component';
import { JogadorComunidadeCadastroComponent } from './jogadores-comunidade/jogador-comunidade-cadastro/jogador-comunidade-cadastro.component';
import { JogadorComunidadePersonagensComponent } from './jogadores-comunidade/jogador-comunidade-personagens/jogador-comunidade-personagens.component';
import { JogadorComunidadePlayerStyleComponent } from './jogadores-comunidade/jogador-comunidade-player-style/jogador-comunidade-player-style.component';
import { TierListComponent } from './tier-list/tier-list.component';
import { DragDropModule } from '@angular/cdk/drag-drop';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    FooterComponent,
    PersonagensComponent,
    LoginComponent,
    PersonagemFrameDataComponent,
    JogadoresComunidadeComponent,
    JogadorComunidadeCadastroComponent,
    JogadorComunidadePersonagensComponent,
    JogadorComunidadePlayerStyleComponent,
    TierListComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ToastModule,
    DragDropModule
  
  ],
  providers: [
    MessageService,

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
