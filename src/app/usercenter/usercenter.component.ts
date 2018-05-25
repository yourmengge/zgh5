import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-usercenter',
  templateUrl: './usercenter.component.html',
  styleUrls: ['./usercenter.component.css']
})
export class UsercenterComponent implements OnInit {
  public menuList: any;
  constructor(public data: DataService) {
    this.menuList = this.data.getCenterMenuList();
  }

  ngOnInit() {
    console.log(this.data.userInfo);
  }

  goto(url) {
    this.data.goto('main/jiaoyi/' + url);
  }

}
