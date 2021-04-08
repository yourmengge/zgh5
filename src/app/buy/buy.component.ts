import { Component, DoCheck } from '@angular/core';
import { DataService, StockList } from '../data.service';
import { HttpService } from '../http.service';
import { Response } from '@angular/http';
import { trigger, state, style, animate, transition } from '@angular/animations';
declare var EmchartsMobileTime: any;
declare var EmchartsMobileK: any;
import * as SockJS from 'sockjs-client';
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

    showChart = false; // 展示分时图
    showLine = false;

    chartTypeList = [{
        name: '分时',
        type: 'T1'
    }, {
        name: '五日',
        type: 'T5'
    }, {
        name: '日K',
        type: 'DK'
    }, {
        name: '周K',
        type: 'WK'
    }, {
        name: '月K',
        type: 'MK'
    }];
    chartType = 'T1';
    constructor(public data: DataService, public http: HttpService) {
        this.fullcount = '--';
        this.maxPrice = 10;
        this.minPrice = 5;
        this.stockHQ = this.data.stockHQ;
        this.appointPrice = '';
        this.connectStatus = false;
        this.submitAlert = this.data.hide;
        this.userName = this.data.getOpUserCode();
        this.connect();
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
        if (this.data.searchStockCode !== '' && this.data.searchStockCode.length === 6 && this.data.searchStockCode !== this.stockCode) {
            this.stockCode = this.data.searchStockCode;
            this.getGPHQ();
        }
    }
    getGPHQ() {
        this.showChart = true;
        this.show = 'inactive';
        this.data.Loading(this.data.show);
        window.clearTimeout(this.data.timeoutFenshi);
        this.http.getGPHQ(this.classType, this.stockCode).subscribe((res) => {
            if (this.stockCode.length === 6) {
                this.getFenshituList();
            }
            if (!this.data.isNull(res['resultInfo']['quotation'])) {
                this.stockHQ = res['resultInfo']['quotation'];
                this.stockName = this.stockHQ.stockName;
                this.stockHQ.upRatio = res['resultInfo']['upRatio'];
                // if (this.stockName.includes('ST')) {
                //     this.stockHQ.lowPrice = Math.round(this.stockHQ.preClosePrice * 95) / 100;
                //     this.stockHQ.highPrice = Math.round(this.stockHQ.preClosePrice * 105) / 100;
                // } else {
                //     this.stockHQ.lowPrice = Math.round(this.stockHQ.preClosePrice * 90) / 100;
                //     this.stockHQ.highPrice = Math.round(this.stockHQ.preClosePrice * 110) / 100;
                // }
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

    // tslint:disable-next-line:use-life-cycle-interface
    ngOnDestroy() {
        console.log('destroy');
        this.cancelSubscribe();
        this.disconnect();
    }

    /**
     * 获取股票列表
     */
    getQuotation() {
        this.data.searchStockCode = '';
        this.stockHQ.lastPrice = '';
        this.stockHQ.upRatio = '';
        this.stockName = '';
        this.show = 'active';
        window.clearTimeout(this.data.timeoutFenshi);
        this.cancelSubscribe();
        this.http.searchStock(this.stockCode).subscribe((res) => {
            this.list = res;
            // if (this.stockCode.length === 6 && !this.data.isNull(this.list[0])) {
            //     this.selectGP(this.list[0]);
            // }
        }, (err) => {
            this.data.error = err.error;
            this.data.isError();
        });
        if (!this.connectStatus) {

        }

        if (this.stockCode.length === 0) {
            this.show = 'inactive';
            this.showChart = false;
            this.clear();
        }
    }

    /**
     * 买入
     */
    buy() {
        if (this.data.isNull(this.stockCode)) {
            this.data.ErrorMsg('股票代码不能为空');
        } else if (this.data.Decimal(this.appointPrice) > 2) {
            this.data.ErrorMsg('委托价格不能超过两位小数');
        } else if (this.data.isNull(this.appointPrice)) {
            this.data.ErrorMsg('委托价格不能为空');
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
        window.clearTimeout(this.data.timeoutFenshi);
        this.showChart = false;
        this.stockCode = '';
        this.appointPrice = '';
        this.appointCnt = '';
        this.ccount = '';
        this.stockName = '';
        this.fullcount = '--';
        this.data.resetStockHQ();
        this.data.searchStockCode = '';
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
        this.stockCode = data.stockCode;
        this.appointPrice = '';
        this.getGPHQ();
    }
    /**
     * 取消订阅
     */
    cancelSubscribe() {
        window.clearInterval(this.socketInterval);
        this.http.cancelSubscribe().subscribe((res) => {
            console.log('取消订阅');
        });
    }

    /**
     * 断开连接
     */
    disconnect() {
        if (this.connectStatus) {
            this.stompClient.disconnect((() => {
                console.log('断开链接');
                window.clearInterval(this.socketInterval);
            }));
        }
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
                that.stockName = that.stockHQ.stockName;
                // if (that.stockName.includes('ST')) {
                //     that.stockHQ.lowPrice = Math.round(that.stockHQ.preClosePrice * 95) / 100;
                //     that.stockHQ.highPrice = Math.round(that.stockHQ.preClosePrice * 105) / 100;
                // } else {
                //     that.stockHQ.lowPrice = Math.round(that.stockHQ.preClosePrice * 90) / 100;
                //     that.stockHQ.highPrice = Math.round(that.stockHQ.preClosePrice * 110) / 100;
                // }
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

    KLine() {
        const marketType = (this.stockCode.substr(0, 1) === '5' || this.stockCode.substr(0, 1) === '6') ? '1' : '2';
        const chart = new EmchartsMobileK({
            container: 'chart',
            type: this.chartType,
            code: `${this.stockCode}${marketType}`,
            width: document.body.clientWidth,
            height: 200,
            dpr: 2,
            showVMark: true
        });
        // 调用绘图方法
        chart.draw();

        this.data.timeoutFenshi = setTimeout(() => {
            this.KLine();
        }, 30000);
    }

    getFenshituList() {
        const marketType = (this.stockCode.substr(0, 1) === '5' || this.stockCode.substr(0, 1) === '6') ? '1' : '2';
        const chart = new EmchartsMobileTime({
            container: 'chart',
            type: this.chartType,
            code: `${this.stockCode}${marketType}`,
            width: document.body.clientWidth,
            height: 180,
            dpr: 2
        });
        // 调用绘图方法
        chart.draw();

        this.data.timeoutFenshi = setTimeout(() => {
            this.getFenshituList();
        }, 30000);
    }

    changeType(type) {
        window.clearTimeout(this.data.timeoutFenshi);
        this.chartType = type;
        if (this.chartType === 'T1' || this.chartType === 'T5') {
            this.getFenshituList();
        } else {
            this.KLine();
        }
    }

    color(string) {

        if (!this.data.isNull(string)) {
            string = string.toString();
            if (string.indexOf('-') >= 0) {
                return 'greenFont';
            } else {
                return 'redFont';
            }
        }
    }
}
