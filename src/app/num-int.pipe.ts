import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numInt'
})
export class NumIntPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value !== '--') {
      return parseInt((value / 100).toString(), 0);
    } else {
      return value;
    }
  }
}
