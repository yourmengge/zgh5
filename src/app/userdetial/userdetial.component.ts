import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-userdetial',
  templateUrl: './userdetial.component.html',
  styleUrls: ['./userdetial.component.css']
})
export class UserdetialComponent implements OnInit {
  detail = {
    allottedScale: 0,
    totalScale: 0,
    stockScale: 0,
    cordonLine: 0,
    flatLine: 0,
    mainSingleVote: 0,
    growthSingleVote: 0,
    ableScale: 0,
    lockScale: '',
    profit: 0
  };
  constructor(public data: DataService, public http: HttpService) { }

  ngOnInit() {
    this.http.userCenter().subscribe(res => {
      Object.assign(this.detail, res);
    }, (err) => {
      this.data.error = err.error;
      this.data.isError();
    });
  }

  back() {
    this.data.back();
  }

}
