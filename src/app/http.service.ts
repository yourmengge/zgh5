import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

@Injectable()
export class HttpService {

  public host = 'http://218.85.23.217:8082/fcgi-bin/ITG_SFC';

  constructor(public http: Http) { }

  Login(data) {
    return this.http.post(this.host, data);
  }

}
