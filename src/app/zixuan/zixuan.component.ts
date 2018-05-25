import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-zixuan',
  templateUrl: './zixuan.component.html',
  styleUrls: ['./zixuan.component.css']
})
export class ZixuanComponent implements OnInit {

  constructor(public data: DataService) { }

  ngOnInit() {
  }

  goto(url) {
    this.data.goto('main/ssgp');
  }

}
