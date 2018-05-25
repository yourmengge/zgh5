import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class DataService {

  constructor(public router: Router) { }
  /**
   * 用户信息
   */
  userInfo = {
    allottedScale: '', // 初期规模
    ableScale: '',  // 可用资金
    cashScale: '', // 保证金
    accountCommission: '', // 交易佣金
    accountName: '' // 中文名
  };
  /**
   * 页面跳转
   */
  goto(url) {
    return this.router.navigate([url]);
  }

  /**
   * 底部菜单栏
   */
  getFooterMenu() {
    return [{
      id: 'hangqing',
      name: '行情',
      title: '行情',
      class: ''
    }, {
      id: 'zixuan',
      name: '自选',
      title: '自选',
      class: 'zixuan'
    }, {
      id: 'jiaoyi',
      name: '交易',
      title: '交易',
      class: 'jiaoyi'
    }, {
      id: 'usercenter',
      name: '个人',
      title: '个人中心',
      class: 'geren'
    }];
  }

  /**
   * 获取个人中心菜单列表
   */
  getCenterMenuList() {
    return [{
      id: 'buy',
      name: '买入',
      class: ''
    }, {
      id: 'sell',
      name: '卖出',
      class: 'sell'
    }, {
      id: 'chedan',
      name: '撤单',
      class: 'chedan'
    }, {
      id: 'chicang',
      name: '持仓',
      class: 'chicang'
    }, {
      id: 'search',
      name: '查询',
      class: 'search'
    }];
  }

  /**
   * 生成请求body
   */
  reqBody(data, apiCode, opUserCode) {
    const req = {
      itg: {
        content: data,
        infCode: apiCode,
        msgTime: this.getTime(),
        msgType: 0,
        opUserCode: opUserCode,
        opUserType: 6,
        reqNo: this.getTime(),
        reqSource: 'human_channel'
      }
    };
    return req;

  }

  /**
   * 获取当前时间：毫秒
   */
  getTime() {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    const hour = new Date().getHours();
    const minutes = new Date().getMinutes();
    const seconds = new Date().getSeconds();
    const millseconds = new Date().getMilliseconds();
    return year + this.add0(month) + this.add0(day) + this.add0(hour) + this.add0(minutes) + this.add0(seconds) + this.add0(millseconds);
  }

  /**
   * 个位数补充0
   */
  add0(num) {
    return num < 10 ? '0' + num : num;
  }
}
