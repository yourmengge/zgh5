import { Component, DoCheck } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-jiaoyi',
  templateUrl: './jiaoyi.component.html',
  styleUrls: ['./jiaoyi.component.css']
})
export class JiaoyiComponent implements DoCheck {
  public url: string;
  public menuList: any;
  constructor(public data: DataService) {
    this.menuList = this.data.getCenterMenuList();
  }

  ngDoCheck() {
    this.url = window.location.pathname.split('/')[3];
  }

  goto(url) {
    this.url = url;
    this.data.goto('main/jiaoyi/' + url);
  }

}
