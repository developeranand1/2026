import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ContactService, ContactPayload } from './contact.service';
import Swal from 'sweetalert2';

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
  private contactService = inject(ContactService);

  contactForm: ContactForm = {
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  isSubmitted = false;
  isSubmitting = false;
  errorMessage = '';

  submitContactForm(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill in all required fields properly.',
        confirmButtonColor: '#198754'
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.isSubmitted = false;

    const payload: ContactPayload = {
      fullName: this.contactForm.fullName,
      email: this.contactForm.email,
      phone: this.contactForm.phone,
      subject: this.contactForm.subject,
      message: this.contactForm.message
    };

    this.contactService.submitContactForm(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isSubmitted = true;
        
        Swal.fire({
          icon: 'success',
          title: 'Message Submitted!',
          text: 'Your message has been submitted successfully. Our support team will get back to you shortly.',
          confirmButtonColor: '#198754'
        });

        form.resetForm({
          fullName: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        const msg = err.error?.message || 'Failed to submit message. Please try again later.';
        this.errorMessage = msg;

        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: msg,
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }
}