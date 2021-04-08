import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toFixed'
})
export class ToFixedPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if (value !== '--' && value !== '' && value !== '-') {
      let data = Math.round(parseFloat(value) * 1000) / 1000;
      if (data === 0 || data === 9999) {
        return data;
      }
      const s = data.toString().split(".");
      if (s.length === 1) {
        return data.toString() + ".000";
      } else if (s[1].length < 3) {
        let result = data.toString();
        for (let i = s[1].length; i < 3; i++) {
          result = result + '0';
          console.log(result);
        }
        return result;
      }
      return data;
    } else {
      return value;
    }
  }

}
