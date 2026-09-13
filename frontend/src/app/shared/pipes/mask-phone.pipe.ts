import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskPhone',
  standalone: true
})
export class MaskPhonePipe implements PipeTransform {
  transform(value: string | number | null | undefined, maskLength: number = 5, maskChar: string = 'X'): string {
    if (!value) {
      return '';
    }

    const phone = String(value).trim();
    if (!phone) {
      return '';
    }

    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length <= maskLength) {
      return phone.replace(/\d/g, maskChar);
    }

    // Replace the last `maskLength` occurrences of digits with `maskChar`
    let digitsSeen = 0;
    const chars = phone.split('');

    for (let i = chars.length - 1; i >= 0; i--) {
      if (/\d/.test(chars[i])) {
        if (digitsSeen < maskLength) {
          chars[i] = maskChar;
          digitsSeen++;
        }
      }
    }

    // Format with clean spacing if standard 10 digit number
    const result = chars.join('');
    return result;
  }
}
