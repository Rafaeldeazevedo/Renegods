import { Component } from '@angular/core';

@Component({
  selector: 'app-personagens',
  templateUrl: './personagens.component.html',
  styleUrls: ['./personagens.component.css']
})
export class PersonagensComponent {
  personagens = [
    { nome: 'Alisa Bosconovitch', src: 'assets/Alisa.png' },
    { nome: 'Asuka Kazama', src: 'assets/asuka.png' },
    { nome: 'Azucena', src: 'assets/Azucena.png' },
    { nome: 'Bryan Fury', src: 'assets/bryan.png' },
    { nome: 'Claudio Serafino', src: 'assets/claudio.png' },
    { nome: 'Devil Jin', src: 'assets/deviljin.png' },
    { nome: 'Dragunov', src: 'assets/dragunov.png' },
    { nome: 'Feng Wei', src: 'assets/feng.png' },
    { nome: 'Hwoarang', src: 'assets/hwo.png' },
    { nome: 'Jack-8', src: 'assets/jack.png' },
    { nome: 'Jin Kazama', src: 'assets/Jin.png' },
    { nome: 'Jun Kazama', src: 'assets/jun.png' },
    { nome: 'Kazuya Mishima', src: 'assets/kazuya.png'},
    { nome: 'King', src: 'assets/king.png'},
    { nome: 'Kuma', src: 'assets/kuma.png'},
    { nome: 'Lars Alexandersson', src: 'assets/lars.png'},
    { nome: 'Marshall Law', src: 'assets/law.png' },
    { nome: 'Lee Chaolan', src: 'assets/lee.png' },
    { nome: 'Leo', src: 'assets/Leo.png' },
    { nome: 'Leroy Smith', src: 'assets/leroy.png' },
    { nome: 'Lili', src: 'assets/lili.png' },
    { nome: 'Panda', src: 'assets/Panda.png' },
    { nome: 'Paul Phoenix', src: 'assets/Paul.png' },
    { nome: 'Reina', src: 'assets/Reina.png' },
    { nome: 'Shaheen', src: 'assets/shaheen.png' },
    { nome: 'Steve', src: 'assets/steve.png' },
    { nome: 'Victor Chevalier', src: 'assets/victor.png' },
    { nome: 'Ling Xiaoyu', src: 'assets/ling.png' },
    { nome: 'Yoshimitsu', src: 'assets/Yoshimitsu.png' },
    { nome: 'Zafina', src: 'assets/Zafina.png' },
    { nome: 'Eddy', src: 'assets/eddy.png' },
    { nome: 'Lidia Sobieska', src: 'assets/lidia.png' },





  ];
paginatedPersonagens: any;
}


