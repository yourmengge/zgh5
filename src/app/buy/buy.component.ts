import { Component, DoCheck } from '@angular/core';
import { DataService, StockList } from '../data.service';
import { HttpService } from '../http.service';
import { Response } from '@angular/http';
import { trigger, state, style, animate, transition } from '@angular/animations';
// tslint:disable-next-line:import-spacing
import *  as SockJS from 'sockjs-client';
import { over } from '@stomp/stompjs';

@Component({
    selector: 'app-buy',
    templateUrl: './buy.component.html',
    styleUrls: ['./buy.component.css'],
    animations: [
        trigger('showDelete', [
            state('inactive', style({
                height: 0,
                opacity: 0
            })),
            state('active', style({
                height: '400px',
                opacity: 1
            })),
            transition('inactive => active', animate('100ms ease-in')),
            transition('active => inactive', animate('100ms ease-out'))
        ])
    ]
})
export class BuyComponent implements DoCheck {
    text: string;
    text2: string;
    classType: string;
    show = 'inactive';
    stockCode = '';
    appointPrice: any;
    appointCnt: any;
    stompClient: any;
    ccount: any;
    fullcount: any;
    minPrice: number;
    maxPrice: number;
    stockHQ: any;
    list: any;
    stockName: string;
    connectStatus: boolean;
    market = 'market';
    submitAlert: boolean;
    userName: string;
    socketInterval: any;
    constructor(public data: DataService, public http: HttpService) {
        this.fullcount = '--';
        this.maxPrice = 10;
        this.minPrice = 5;
        this.stockHQ = this.data.stockHQ;
        this.appointPrice = '';
        this.connectStatus = false;
        this.submitAlert = this.data.hide;
        this.userName = this.data.getOpUserCode();
    }

    ngDoCheck() {
        if (this.data.getUrl(3) === 'buy') {
            this.text = '买入';
            this.classType = 'BUY';
            this.text2 = '买';
        } else if (this.data.getUrl(3) === 'sell') {
            this.text = '卖出';
            this.classType = 'SELL';
            this.text2 = '卖';
        }
    }

    // tslint:disable-next-line:use-life-cycle-interface
    ngOnDestroy() {
        console.log('destroy');
        this.cancelSubscribe();
    }

    /**
     * 获取行情快照
     */
    getQuotation() {
        this.stockName = '';
        this.show = 'active';
        const content = null;
        this.http.searchStock(this.stockCode).subscribe((res) => {
            this.list = res;
        }, (err) => {
            this.data.error = err.error;
            this.data.isError();
        });
        if (!this.connectStatus) {
            this.connect();
        }
        if (this.stockCode.length === 0) {
            this.show = 'inactive';
            this.clear();
        }
    }

    /**
     * 买入
     */
    buy() {
        if (this.data.isNull(this.stockCode)) {
            this.data.ErrorMsg('股票代码不能为空');
        } else if (!Number.isInteger(this.appointPrice * 100)) {
            this.data.ErrorMsg('委托价格不能超过两位小数');
        } else if (this.data.isNull(this.appointPrice)) {
            this.data.ErrorMsg('委托价格不能为空');
        } else if (this.appointPrice < parseFloat(this.stockHQ.lowPrice).toFixed(2)) {
            this.data.ErrorMsg('委托价格不能低于跌停价');
        } else if (this.appointPrice > parseFloat(this.stockHQ.highPrice).toFixed(2)) {
            this.data.ErrorMsg('委托价格不能高于涨停价');
        } else if (typeof (this.appointCnt) !== 'number') {
            this.appointCnt = 0;
            this.data.ErrorMsg(this.text + '数量必须是数字');
        } else if (this.appointCnt % 100 !== 0) {
            if (this.classType === 'SELL' && this.appointCnt === this.fullcount) {
                this.submitAlert = this.data.show;
            } else {
                this.data.ErrorMsg(this.text + '数量必须是100的整数倍');
            }

        } else if (this.appointCnt > this.fullcount) {
            this.data.ErrorMsg(this.text + '数量必须小于可' + this.text2 + '股数');
        } else if (this.appointCnt <= 0) {
            this.data.ErrorMsg(this.text + '数量必须大于0');
        } else {
            this.submitAlert = this.data.show;
        }

    }

    /**
     * 买入确认
     */
    submintBuy() {
        this.data.Loading(this.data.show);
        const content = {
            'stockCode': this.stockCode,
            'appointCnt': this.appointCnt,
            'appointPrice': this.appointPrice
        };
        this.http.order(this.classType, content).subscribe((res: Response) => {
            if (res['success']) {
                this.data.ErrorMsg('委托已提交');
                this.closeAlert();
                this.clear();
            }
        }, (err) => {
            this.data.error = err.error;
            this.data.isError();
            this.closeAlert();
        }, () => {
            this.data.Loading(this.data.hide);
            this.closeAlert();
            this.clear();
        });
    }

    /**
     * 关闭弹窗
     */
    closeAlert() {
        this.submitAlert = this.data.hide;
    }

    /**
     * 增加减少买入价
     */
    count(type) {
        if (!this.data.isNull(this.appointPrice)) {
            if (type === -1 && this.appointPrice > 0 && this.appointPrice > this.stockHQ.lowPrice) {
                this.appointPrice = this.appointPrice - 0.01;
            } else if (type === 1 && this.appointPrice < this.stockHQ.highPrice) {
                this.appointPrice = this.appointPrice + 0.01;
            }
            this.appointPrice = parseFloat(this.appointPrice.toFixed(2));
        }
    }

    /**
     * 清空
     */
    clear() {
        this.stockCode = '';
        this.appointPrice = '';
        this.appointCnt = '';
        this.ccount = '';
        this.stockName = '';
        this.fullcount = '--';
        this.stockHQ = this.data.stockHQ;
        this.cancelSubscribe();
    }

    /**
     * 选择买入量
     */
    selectCount(text) {
        if (this.fullcount !== '--') {
            this.ccount = text;
            switch (text) {
                case 'full':
                    // 选择全仓的时候，判断是否是买入，买入的话，全仓数量按照正常规则。卖出的话，全仓数量为可卖数量
                    if (this.classType === 'BUY') {
                        this.appointCnt = this.data.roundDown(this.fullcount);
                    } else {
                        this.appointCnt = this.fullcount;
                    }

                    break;
                case 'half':
                    this.appointCnt = this.data.roundDown(this.fullcount / 2);
                    break;
                case '1/3full':
                    this.appointCnt = this.data.roundDown(this.fullcount / 3);
                    break;
                case '1/4full':
                    this.appointCnt = this.data.roundDown(this.fullcount / 4);
                    break;
            }
        }

    }

    /**
     * 选取价格
     */
    selectPrice(price) {
        if (typeof (price) === 'string') {
            this.appointPrice = parseFloat(parseFloat(price).toFixed(2));
        } else {
            this.appointPrice = price;
        }
    }

    /**
     * 模糊查询选择股票
     */
    selectGP(data: StockList) {
        this.ccount = '';
        this.appointCnt = '';
        this.show = 'inactive';
        this.stockCode = data.stockCode;
        this.stockName = data.stockName;
        this.appointPrice = '';
        this.data.Loading(this.data.show);
        this.http.getGPHQ(this.classType, this.stockCode).subscribe((res) => {
            if (!this.data.isNull(res['resultInfo']['quotation'])) {
                this.stockHQ = res['resultInfo']['quotation'];
                if (this.stockName.includes('ST')) {
                    this.stockHQ.lowPrice = Math.round(this.stockHQ.preClosePrice * 95) / 100;
                    this.stockHQ.highPrice = Math.round(this.stockHQ.preClosePrice * 105) / 100;
                } else {
                    this.stockHQ.lowPrice = Math.round(this.stockHQ.preClosePrice * 90) / 100;
                    this.stockHQ.highPrice = Math.round(this.stockHQ.preClosePrice * 110) / 100;
                }
                this.fullcount = res['resultInfo']['maxAppointCnt'];
                this.appointPrice = Math.round(parseFloat(this.stockHQ.lastPrice) * 100) / 100;
            } else {
                this.stockHQ = this.data.stockHQ;
            }

        }, (err) => {
            this.data.error = err.error;
            this.data.isError();
        }, () => {
            this.data.Loading(this.data.hide);
        });
    }
    /**
     * 取消订阅
     */
    cancelSubscribe() {
        window.clearInterval(this.socketInterval);
        this.http.cancelSubscribe().subscribe((res) => {
        });
    }
    /**
     * 连接ws
     */
    connect() {
        console.log('发起ws请求');
        const that = this;
        this.cancelSubscribe();
        const socket = new SockJS(this.http.ws);
        const headers = { token: this.data.getToken() };
        this.stompClient = over(socket);
        this.connectStatus = true;
        this.stompClient.connect(headers, function (frame) {
            // console.log('Connected: ' + frame);
            that.stompClient.subscribe('/user/' + that.data.getToken() + '/topic/market', function (res) {
                that.stockHQ = JSON.parse(res.body);
                if (that.stockName.includes('ST')) {
                    that.stockHQ.lowPrice = Math.round(that.stockHQ.preClosePrice * 95) / 100;
                    that.stockHQ.highPrice = Math.round(that.stockHQ.preClosePrice * 105) / 100;
                } else {
                    that.stockHQ.lowPrice = Math.round(that.stockHQ.preClosePrice * 90) / 100;
                    that.stockHQ.highPrice = Math.round(that.stockHQ.preClosePrice * 110) / 100;
                }
                // if (that.appointPrice !== '') {
                //     // tslint:disable-next-line:max-line-length
                // tslint:disable-next-line:max-line-length
                //     that.appointPrice = (that.appointPrice === that.stockHQ.lastPrice) ? parseFloat(that.stockHQ.lastPrice) : that.appointPrice;
                // } else {
                //     that.appointPrice = that.stockHQ.lastPrice;
                // }
                // that.appointPrice = parseFloat(that.appointPrice);

            });
            this.socketInterval = setInterval(() => {
                that.stompClient.send(' ');
            }, 60000);
        }, function (err) {
            console.log('err', err);
        });
    }

    /**
     * 返回行情加个颜色
     */
    HQColor(price) {
        if (price !== '--') {
            if (price > this.stockHQ.preClosePrice) {
                return 'red';
            } else if (price < this.stockHQ.preClosePrice) {
                return 'green';
            } else {
                return '';
            }
        }

    }

    /**
     * 输入买入量
     */
    inputCnt() {
        this.ccount = '';
    }
}
