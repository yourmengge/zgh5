import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { HttpService } from '../http.service';
import { Response, RequestOptions, Headers } from '@angular/http';

@Component({
  selector: 'app-cclb',
  templateUrl: './cclb.component.html',
  styleUrls: ['./cclb.component.css']
})
export class CclbComponent implements OnInit {
  list: any;
  constructor(public data: DataService, public http: HttpService) { }

  ngOnInit() {
    this.cxtgcc();
    // if (this.data.isPerfectTime()) {

    // }
    this.data.intervalHold = setInterval(() => {
      this.cxtgcc();
    }, 3000);

  }

  /**
   * 查询投顾持仓
   */
  cxtgcc() {
    const content = null;
    this.http.getHold().subscribe((res) => {
      this.list = res;
    }, (err) => {
      this.data.error = err.error;
      this.data.isError();
    }, () => {
      this.data.Loading(this.data.hide);
    });
  }

}
