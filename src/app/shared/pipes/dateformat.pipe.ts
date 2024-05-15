import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateformat',
})
export class DateformatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value || value.trim() === '' || value === 'NaN') {
      return '<unknown>';
    }

    const parts = value.split('-');
    if (parts.length !== 3) return value;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
}
