import { Injectable } from '@angular/core';
import {
  NgbDateParserFormatter,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class NgbDateCustomParserFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    if (value) {
      const dateParts = value.trim().split('/');
      if (dateParts.length === 1 && isNumber(dateParts[0])) {
        return { day: toInteger(dateParts[0]), month: NaN, year: NaN };
      } else if (
        dateParts.length === 2 &&
        isNumber(dateParts[0]) &&
        isNumber(dateParts[1])
      ) {
        return {
          day: toInteger(dateParts[0]),
          month: toInteger(dateParts[1]),
          year: NaN,
        };
      } else if (
        dateParts.length === 3 &&
        isNumber(dateParts[0]) &&
        isNumber(dateParts[1]) &&
        isNumber(dateParts[2])
      ) {
        return {
          day: toInteger(dateParts[0]),
          month: toInteger(dateParts[1]),
          year: toInteger(dateParts[2]),
        };
      }
    }
    return null;
  }

  format(date: NgbDateStruct): string {
    return date
      ? `${isNumber(date.day) ? padNumber(date.day) : ''}/${
          isNumber(date.month) ? padNumber(date.month) : ''
        }/${date.year}`
      : '';
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toInteger(value: any): number {
  return parseInt(`${value}`, 10);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isNumber(value: any): value is number {
  return !isNaN(toInteger(value));
}

export function padNumber(value: number) {
  if (isNumber(value)) {
    return `0${value}`.slice(-2);
  } else {
    return '';
  }
}
