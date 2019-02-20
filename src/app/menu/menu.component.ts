import { Component, OnInit, Input } from '@angular/core';
import Link from '../Link';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: [ './menu.component.less' ],
})
export class MenuComponent implements OnInit {
    @Input() links: Link[];
    constructor() {}

    ngOnInit() {}
}
