import { 
  Component, 
  ElementRef, 
  EventEmitter, 
  Input, 
  OnChanges, 
  Output, 
  SimpleChanges, 
  ViewChild, 
  forwardRef 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ]
})
export class RichTextEditorComponent implements ControlValueAccessor, OnChanges {
  @Input() value: string = '';
  @Input() placeholder: string = 'Write full article content here...';
  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('editorRef') editorRef!: ElementRef<HTMLDivElement>;

  isHtmlMode: boolean = false;
  textColor: string = '#212529';
  selectedFormat: string = 'p';

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && this.editorRef && this.editorRef.nativeElement) {
      if (this.editorRef.nativeElement.innerHTML !== this.value) {
        this.editorRef.nativeElement.innerHTML = this.value || '';
      }
    }
  }

  // ControlValueAccessor methods
  writeValue(val: any): void {
    this.value = val || '';
    if (this.editorRef && this.editorRef.nativeElement) {
      this.editorRef.nativeElement.innerHTML = this.value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onEditorInput(): void {
    if (this.editorRef && this.editorRef.nativeElement) {
      this.value = this.editorRef.nativeElement.innerHTML;
      this.onChange(this.value);
      this.valueChange.emit(this.value);
    }
  }

  onHtmlTextareaChange(): void {
    if (this.editorRef && this.editorRef.nativeElement) {
      this.editorRef.nativeElement.innerHTML = this.value || '';
    }
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  execCmd(command: string, value: string = ''): void {
    document.execCommand(command, false, value);
    this.onEditorInput();
  }

  applyFormatBlock(format: string): void {
    this.selectedFormat = format;
    document.execCommand('formatBlock', false, format);
    this.onEditorInput();
  }

  changeTextColor(event: any): void {
    const color = event.target.value;
    this.textColor = color;
    document.execCommand('foreColor', false, color);
    this.onEditorInput();
  }

  insertLink(): void {
    Swal.fire({
      title: 'Insert Link',
      input: 'url',
      inputLabel: 'Enter Web URL (e.g. https://gaonbazar.com)',
      inputPlaceholder: 'https://example.com',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      confirmButtonText: 'Insert'
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        document.execCommand('createLink', false, result.value);
        this.onEditorInput();
      }
    });
  }

  insertImage(): void {
    Swal.fire({
      title: 'Insert Image URL',
      input: 'url',
      inputLabel: 'Enter Image URL (Unsplash, Cloudinary, etc.)',
      inputPlaceholder: 'https://images.unsplash.com/...',
      showCancelButton: true,
      confirmButtonColor: '#198754',
      confirmButtonText: 'Insert Image'
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        document.execCommand('insertImage', false, result.value);
        this.onEditorInput();
      }
    });
  }

  toggleHtmlMode(): void {
    if (this.isHtmlMode) {
      // Switching back from HTML source to visual mode
      if (this.editorRef && this.editorRef.nativeElement) {
        this.editorRef.nativeElement.innerHTML = this.value || '';
      }
    }
    this.isHtmlMode = !this.isHtmlMode;
  }
}
