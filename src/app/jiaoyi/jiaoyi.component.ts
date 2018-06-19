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
    if (this.data.nowUrl !== this.data.getUrl(3)) {
      this.data.nowUrl = this.data.getUrl(3);
      this.url = this.data.getUrl(3);
      this.data.clearInterval();
    }

  }

  // tslint:disable-next-line:use-life-cycle-interface
  ngOnDestroy() {
    console.log('destroy');
    this.data.clearInterval();
  }

  goto(url) {
    this.url = url;
    this.data.goto('main/jiaoyi/' + url);
  }

}
