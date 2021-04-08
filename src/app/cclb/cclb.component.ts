import { Component, OnInit } from "@angular/core";
import { DataService } from "../data.service";
import { HttpService } from "../http.service";

@Component({
  selector: "app-cclb",
  templateUrl: "./cclb.component.html",
  styleUrls: ["./cclb.component.css"],
})
export class CclbComponent implements OnInit {
  list: any;
  isSort: boolean;
  sortType: boolean;
  sortName: any;
  sortData: any;
  titleText: string;
  titleFlag: boolean;
  constructor(public data: DataService, public http: HttpService) { }

  ngOnInit() {
    this.titleText = '参考盈亏/盈亏比例';
    this.titleFlag = true;
    this.cxtgcc();
  }

  changeTitle() {
    this.titleFlag = !this.titleFlag;
    if (this.titleFlag) {
      this.titleText = '参考盈亏/盈亏比例';
    } else {
      this.titleText = '参考盈亏/持仓市值';
    }
  }

  /**
   * 查询投顾持仓
   */
  cxtgcc() {
    this.http.getHold().subscribe(
      (res) => {
        this.list = res;
        if (this.isSort) {
          this.sort(this.sortData, this.sortName);
        }
        this.data.intervalHold = setTimeout(() => {
          this.cxtgcc();
        }, 3000);
      },
      (err) => {
        this.data.error = err.error;
        this.data.isError();
      },
      () => {
        this.data.Loading(this.data.hide);
      }
    );
  }

  select(a) {
    this.data.searchStockCode = a.stockCode;
    this.data.sellCnt = a.stockCntAble;
    if (
      location.href.indexOf("chicang") > 0 ||
      location.href.indexOf("zixuan") > 0
    ) {
      this.data.goto("main/jiaoyi/sell");
    }
  }

  sortList(data, type) {
    this.sortType = !this.sortType;
    this.sortData = data;
    this.sortName = type;
    this.sort(this.sortData, this.sortName);
  }

  sort(data, type) {
    this.isSort = true;
    this.list.sort((a, b) => {
      if (type === "num") {
        if (this.sortType) {
          return b[data] - a[data];
        } else {
          return a[data] - b[data];
        }
      } else {
        if (this.sortType) {
          return a[data].localeCompare(b[data]);
        } else {
          return b[data].localeCompare(a[data]);
        }
      }
    });
  }
}
