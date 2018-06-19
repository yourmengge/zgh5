import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toFixed'
})
export class ToFixedPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value !== '--' && value !== '') {
      return parseFloat(value).toFixed(2);
    } else {
      return value;
    }
  }

}
