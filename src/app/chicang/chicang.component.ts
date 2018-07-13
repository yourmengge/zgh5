import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';
import { DataService } from '../data.service';

@Component({
  selector: 'app-chicang',
  templateUrl: './chicang.component.html',
  styleUrls: ['./chicang.component.css']
})
export class ChicangComponent implements OnInit {
  public userInfo: DataService['userInfo'];
  constructor(public data: DataService, public http: HttpService) { }

  ngOnInit() {
    this.userInfo = this.data.userInfo;
    this.usercenter();

  }

  usercenter() {
    this.http.userCenter().subscribe((res: DataService['userInfo']) => {
      this.userInfo = res;
      this.data.intervalCapital = setTimeout(() => {
        this.usercenter();
      }, 3000);
    }, (err) => {
      this.data.error = err.error;
      this.data.isError();
    }, () => {
      this.data.Loading(this.data.hide);
    });
  }
}
