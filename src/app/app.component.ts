import { Component } from '@angular/core';
import Link from './Link';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  title = 'Ien Sen Питомник';
  links: Link[] = [
    new Link('', 'Новости'),
    new Link('', 'Породы'),
    new Link('', 'Собаки'),
    new Link('/aboutus', 'О нас'),
  ];
}
