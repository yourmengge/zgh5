import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { HttpService } from '../http.service';

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
  }

  /**
   * 查询投顾持仓
   */
  cxtgcc() {
    this.http.getHold().subscribe((res) => {
      this.list = res;
      this.data.intervalHold = setTimeout(() => {
        this.cxtgcc();
      }, 3000);
    }, (err) => {
      this.data.error = err.error;
      this.data.isError();
    }, () => {
      this.data.Loading(this.data.hide);
    });
  }

}
