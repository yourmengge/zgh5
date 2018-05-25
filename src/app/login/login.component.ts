import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { HttpService } from '../http.service';
import { Response, RequestOptions, Headers } from '@angular/http';
import { Md5 } from 'ts-md5/dist/md5';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public phone: string;
  public password: string;

  constructor(public data: DataService, public http: HttpService) {
  }

  ngOnInit() {
  }

  login() {
    const content = {
      'accountPwd': Md5.hashStr(this.password),
      'loginDiskSn': '0000000000',
      'loginIp': '0.0.0.0',
      'loginMac': '00-00-00-00-00'
    };
    this.http.Login(this.data.reqBody(content, 'ITG_LOGIN_TNACCOUNT', this.phone)).subscribe((res: Response) => {
      console.log(res);
      const response = res.json()['itg']['content'];
      console.log(response);
      this.data.userInfo = {
        allottedScale: response['allottedScale'], // 初期规模
        ableScale: response['ableScale'],  // 可用资金
        cashScale: response['cashScale'], // 保证金
        accountCommission: response['accountCommission'], // 交易佣金
        accountName: response['accountName'] // 中文名
      };
      this.data.goto('main');
    });
  }

}
