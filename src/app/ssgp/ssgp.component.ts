import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ssgp',
  templateUrl: './ssgp.component.html',
  styleUrls: ['./ssgp.component.css']
})
export class SsgpComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  close() {
    history.go(-1);
  }

}
