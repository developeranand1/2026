import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

interface ContactForm {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  contactForm: ContactForm = {
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  isSubmitted = false;

  submitContactForm(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    console.log('Contact form data:', this.contactForm);

    this.isSubmitted = true;

    form.resetForm({
      fullName: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  }
}