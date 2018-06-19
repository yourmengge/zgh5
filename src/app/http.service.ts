import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { $WebSocket } from 'angular2-websocket/angular2-websocket';
import { over } from '@stomp/stompjs';
import { HttpClient } from '@angular/common/http';
// tslint:disable-next-line:import-spacing
import *  as SockJS from 'sockjs-client';
import { DataService } from './data.service';

@Injectable()
export class HttpService {
  stompClient: any;
  // public host = 'http://192.168.88.148:8080';
  public host = 'http://218.85.23.217:8082/tnproxy/';
  public ws = this.host + 'webSocket';
  public stockHQ: any;

  constructor(public http: HttpClient, public data: DataService) {
  }

  POST(data) {
    return this.http.post(this.host, data);
  }

  /**
   * 请求股票行情
   */
  getGPHQ(type, code) {
    return this.http.post(this.host + 'push/subsMarket/' + type + '/' + code, {}, this.data.getHeader());
  }

  /**
   * 断开连接
   */
  disconnect() {
    this.stompClient.disconnect((() => {
      console.log('断开链接');
    }));
  }

  /**
   * 登录接口
   */
  login(data) {
    return this.http.post(this.host + 'login', data);
  }

  /**
   * 模糊查询股票
   */
  searchStock(code) {
    return this.http.post(this.host + 'stock?input=' + code, {}, this.data.getHeader());
  }

  /**
   * 下单 参数 买入：BUY 卖出：SELL
   */
  order(type, data) {
    return this.http.post(this.host + 'appoint/' + type, data, this.data.getHeader());
  }

  /**
   * 取消订阅
   */
  cancelSubscribe() {
    return this.http.post(this.host + 'push/unsubsMarket', {}, this.data.getHeader());
  }

  /**
   * 查询持仓
   */
  getHold() {
    return this.http.post(this.host + 'hold', {}, this.data.getHeader());
  }

  /**
   * 查询委托
   */
  getAppoint(time) {
    return this.http.post(this.host + 'appointHis?' + time, {}, this.data.getHeader());
  }

  /**
   * 个人中心
   */
  userCenter() {
    return this.http.post(this.host + 'capital', {}, this.data.getHeader());
  }

  /**
   * 确认撤单
   */
  chedan(code) {
    return this.http.post(this.host + 'cancel/' + code, {}, this.data.getHeader());
  }

  /**
   * 自选股订阅
   */
  zixuanSubscribe(string) {
    return this.http.post(this.host + 'push/subscribe/' + string, {}, this.data.getHeader());
  }

  /**
   * 获取自选股行情
   */
  zixuanDetail(string) {
    return this.http.post(this.host + 'push/self/' + string, {}, this.data.getHeader());
  }
}
