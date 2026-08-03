import { Component } from '@angular/core';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqCategory {
  icon: string;
  title: string;
  description: string;
  items: FaqItem[];
}

@Component({
  selector: 'app-faq',
  standalone: true,
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  searchText = '';

  readonly categories: FaqCategory[] = [
    {
      icon: 'bi-person-circle',
      title: 'Account and Registration',
      description: 'Questions about creating and managing your account.',
      items: [
        {
          id: 'account-1',
          question: 'How do I create a GaonBazar account?',
          answer:
            'Select Register, choose your user role, enter the required details, and complete mobile or email verification.'
        },
        {
          id: 'account-2',
          question: 'Can one account have multiple roles?',
          answer:
            'The platform may allow multiple approved roles, such as buyer and farmer, depending on account verification and system configuration.'
        },
        {
          id: 'account-3',
          question: 'How can I reset my password?',
          answer:
            'Select Forgot Password on the login page and complete OTP or email verification to create a new password.'
        }
      ]
    },
    {
      icon: 'bi-cart-check',
      title: 'Orders and Shopping',
      description: 'Questions about products, cart, checkout, and orders.',
      items: [
        {
          id: 'order-1',
          question: 'How do I place an order?',
          answer:
            'Search for a product, select the required quantity, add it to your cart, enter your delivery address, and complete payment.'
        },
        {
          id: 'order-2',
          question: 'Can I modify an order after placing it?',
          answer:
            'An order may only be modified before the seller starts processing it. Contact support or cancel and place a new order where available.'
        },
        {
          id: 'order-3',
          question: 'How can I track my order?',
          answer:
            'Open My Orders, select the relevant order, and choose Track Order to see its latest delivery status.'
        }
      ]
    },
    {
      icon: 'bi-credit-card',
      title: 'Payments and Refunds',
      description: 'Questions about payments, failed transactions, and refunds.',
      items: [
        {
          id: 'payment-1',
          question: 'Which payment methods are supported?',
          answer:
            'GaonBazar can support UPI, debit cards, credit cards, net banking, and wallets through Razorpay.'
        },
        {
          id: 'payment-2',
          question: 'What should I do if payment is deducted but the order fails?',
          answer:
            'Wait for the payment status to update. If the issue remains, contact support with the payment reference and order details.'
        },
        {
          id: 'payment-3',
          question: 'How long does a refund take?',
          answer:
            'Approved refunds generally take 5–10 business days, depending on the bank and payment provider.'
        }
      ]
    },
    {
      icon: 'bi-flower1',
      title: 'Farmers and Sellers',
      description: 'Questions about registration, listings, and earnings.',
      items: [
        {
          id: 'seller-1',
          question: 'How can I register as a farmer?',
          answer:
            'Open Farmer Registration, provide your personal and farm information, upload required documents, and submit the profile for approval.'
        },
        {
          id: 'seller-2',
          question: 'How can I add a product?',
          answer:
            'After approval, open your dashboard, select Add Product, enter product details, upload images, and submit the listing.'
        },
        {
          id: 'seller-3',
          question: 'When will sellers receive payment?',
          answer:
            'Settlements are processed according to the configured settlement cycle after successful order delivery and applicable deductions.'
        }
      ]
    },
    {
      icon: 'bi-truck',
      title: 'Delivery',
      description: 'Questions about delivery, service areas, and order status.',
      items: [
        {
          id: 'delivery-1',
          question: 'Which locations are serviceable?',
          answer:
            'Service availability depends on the product, seller location, transport coverage, and delivery PIN code.'
        },
        {
          id: 'delivery-2',
          question: 'What happens if delivery is delayed?',
          answer:
            'Track the order for updates. Weather, traffic, distance, and product handling requirements may affect delivery time.'
        },
        {
          id: 'delivery-3',
          question: 'Can I change my delivery address?',
          answer:
            'The address may be changed before dispatch when supported. Contact support if the order is already being processed.'
        }
      ]
    }
  ];
  $parent: any;

  get filteredCategories(): FaqCategory[] {
    const query = this.searchText.trim().toLowerCase();

    if (!query) {
      return this.categories;
    }

    return this.categories
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            item.question.toLowerCase().includes(query) ||
            item.answer.toLowerCase().includes(query)
        )
      }))
      .filter((category) => category.items.length > 0);
  }
}