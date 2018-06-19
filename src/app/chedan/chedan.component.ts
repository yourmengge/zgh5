import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';
import { DataService } from '../data.service';

@Component({
  selector: 'app-chedan',
  templateUrl: './chedan.component.html',
  styleUrls: ['./chedan.component.css']
})
export class ChedanComponent implements OnInit {

  public userInfo: DataService['userInfo'];
  list: any;
  type: any;
  orderData = {
    stockName: '',
    stockCode: '',
    appointCnt: '',
    appointPrice: '',
    appointTypeDesc: '',
    appointOrderCode: ''
  };
  clickTime: any;
  submitAlert: boolean;
  constructor(public data: DataService, public http: HttpService) {
    this.submitAlert = this.data.hide;
  }

  ngOnInit() {
    this.userInfo = this.data.userInfo;
    this.usercenter();
    this.data.intervalCapital = setInterval(() => {
      this.usercenter();
    }, 3000);
    this.getOrder();
    this.data.intervalAppoint = setInterval(() => {
      this.getOrder();
    }, 3000);
    this.clickTime = new Date().getTime();
  }

  usercenter() {
    this.http.userCenter().subscribe((res: DataService['userInfo']) => {
      this.userInfo = res;
    }, (err) => {
      this.data.error = err.error;
      this.data.isError();
    }, () => {
      this.data.Loading(this.data.hide);
    });
  }

  chedan(orderdata) {
    if (new Date().getTime() - this.clickTime < 500) {
      console.log('双击');
      console.log(orderdata);
      this.submitAlert = this.data.show;
      this.orderData.appointCnt = orderdata.appointCnt;
      this.orderData.appointPrice = orderdata.appointPrice;
      this.orderData.stockCode = orderdata.stockCode;
      this.orderData.stockName = orderdata.stockName;
      this.type = orderdata.appointTypeDesc;
      this.orderData.appointOrderCode = orderdata.appointOrderCode;
    } else {
      this.clickTime = new Date().getTime();
    }


  }

  getOrder() {
    this.http.getAppoint('ing=true').subscribe((res) => {
      this.list = res;
      // tslint:disable-next-line:forin
      for (const i in this.list) {
        this.list[i].appointTime = this.toTime(this.list[i].appointTime);
      }
    }, (err) => {
      this.data.error = err.error;
      this.data.isError();
    }, () => {
      this.data.Loading(this.data.hide);
    });
  }

  toTime(time) {
    return time.substr(0, 2) + ':' + time.substr(2, 2) + ':' + time.substr(4, 2);
  }

  /**
 * 关闭弹窗
 */
  closeAlert() {
    this.submitAlert = this.data.hide;
  }

  /**
   * 确认撤单
   */
  submitChedan() {
    this.http.chedan(this.orderData.appointOrderCode).subscribe((res) => {
      console.log(res);
      this.data.ErrorMsg('提交成功');
      this.closeAlert();
    }, (err) => {
      this.data.error = err.error;
      this.data.isError();
    }, () => {
      this.data.Loading(this.data.hide);
    });
  }

}

