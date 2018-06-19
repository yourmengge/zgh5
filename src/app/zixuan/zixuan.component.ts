import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-zixuan',
  templateUrl: './zixuan.component.html',
  styleUrls: ['./zixuan.component.css'],
  animations: [
    trigger('showDelete', [
      state('inactive', style({
        transform: 'translateX(0)',
      })),
      state('active', style({
        transform: 'translateX(45px)'
      })),
      transition('inactive => active', animate('300ms ease-in')),
      transition('active => inactive', animate('500ms ease-out'))
    ])
  ]
})
export class ZixuanComponent implements OnInit {
  hasZixuan = this.data.hide;
  show = 'inactive';
  zixuanList: any;
  zixuanArray = [];
  list: any;
  constructor(public data: DataService, public http: HttpService) { }

  ngOnInit() {
    this.zixuanList = this.data.getLocalStorage('zixuan');
    this.zixuanList = this.zixuanList.substr(0, this.zixuanList.length - 1);
    if (!this.data.isNull(this.zixuanList)) {
      this.hasZixuan = this.data.show;
      this.subscribe();
    }

    console.log(this.zixuanList);
  }

  edit() {
    this.show = this.show === 'active' ? 'inactive' : 'active';
  }

  goto() {
    this.data.goto('main/ssgp');
  }

  subscribe() {
    this.http.zixuanSubscribe(this.zixuanList).subscribe((res) => {
      console.log(res);
      this.getDetail();
    }, (err) => {
      this.data.error = err.error;
      this.data.isError();
    }, () => {
      this.data.Loading(this.data.hide);
    });
  }

  getDetail() {
    this.http.zixuanDetail(this.zixuanList).subscribe((res) => {
      this.list = res;
    }, (err) => {
      this.data.error = err.error;
      this.data.isError();
    }, () => {
      this.data.Loading(this.data.hide);
    });
  }

  del(code) {
    this.zixuanArray = this.zixuanList.split(',');
    console.log(this.zixuanArray);
    for (const i in this.zixuanArray) {
      if (this.zixuanArray[i] === code) {

      }
    }

  }

}
