import { Directive, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appMaskPhone]',
  standalone: true
})
export class MaskPhoneDirective implements OnInit, OnChanges {
  @Input('appMaskPhone') rawPhone: string | number | null | undefined = '';
  @Input() maskLength: number = 5;
  @Input() maskChar: string = 'X';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.applyMask();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rawPhone'] || changes['maskLength'] || changes['maskChar']) {
      this.applyMask();
    }
  }

  private applyMask(): void {
    let value = this.rawPhone !== undefined && this.rawPhone !== null && this.rawPhone !== ''
      ? String(this.rawPhone).trim()
      : (this.el.nativeElement.textContent || '').trim();

    if (!value) {
      return;
    }

    const masked = this.maskLastDigits(value, this.maskLength, this.maskChar);
    this.renderer.setProperty(this.el.nativeElement, 'textContent', masked);
  }

  private maskLastDigits(phone: string, count: number, char: string): string {
    // Extract only digits to calculate masking
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length <= count) {
      return phone.replace(/\d/g, char);
    }

    // Identify the last 'count' digits and replace them with 'char'
    let digitsSeenFromEnd = 0;
    const chars = phone.split('');

    for (let i = chars.length - 1; i >= 0; i--) {
      if (/\d/.test(chars[i])) {
        if (digitsSeenFromEnd < count) {
          chars[i] = char;
          digitsSeenFromEnd++;
        }
      }
    }

    return chars.join('');
  }
}
