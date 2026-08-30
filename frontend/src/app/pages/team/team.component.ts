import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface TeamMember {
  name: string;
  hindiName: string;
  role: string;
  roleHindi: string;
  department: string;
  badge: string;
  avatarIcon: string;
  email: string;
  quote: string;
  bio: string[];
  responsibilities: string[];
  skills: string[];
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss'
})
export class TeamComponent {
  readonly teamMembers: TeamMember[] = [
    {
      name: 'Rajesh Kumar Chaudhary',
      hindiName: 'राजेश कुमार चौधरी',
      role: 'Founder & Managing Director',
      roleHindi: 'संस्थापक एवं प्रबंध निदेशक',
      department: 'Executive Leadership & Strategy',
      badge: 'Founder & Visionary 🌾',
      avatarIcon: 'bi-person-badge-fill',
      email: 'founder@krisimarg.com',
      quote: 'हमारा संकल्प है कि भारत के हर किसान को उसकी फसल का उचित दाम मिले और बिना किसी बिचौलिये के खरीदार सीधे खेत से जुड़ें।',
      bio: [
        'Rajesh Kumar Chaudhary is the Founder and guiding visionary behind KrisiMarg. Driven by a deep-rooted commitment to rural empowerment and digital agricultural transformation, he established KrisiMarg to bridge the long-standing gap between Indian farmers and institutional bulk buyers.',
        'With extensive on-ground understanding of agricultural supply chains, APMC mandi dynamics, and rural logistics across Uttar Pradesh and Bihar, Rajesh leads the company’s core strategy, technology vision, farmer welfare initiatives, and national market expansion.',
        'Under his leadership, KrisiMarg is pioneering direct farm gate procurement, live transparent APMC mandi price dissemination, and cold-chain enabled transport solutions for thousands of farming families.'
      ],
      responsibilities: [
        'Overall Company Vision, Mission & Strategic Expansion',
        'Farmer Community Welfare & Village Outreach Programs',
        'AgriTech Product Innovation & Marketplace Operations',
        'APMC Mandi Partnerships & Institutional Buyer Alliances'
      ],
      skills: ['Agri-Business Strategy', 'Rural Supply Chain', 'Farmer Community Leadership', 'Marketplace Innovation']
    },
    {
      name: 'Atul Kumar',
      hindiName: 'अतुल कुमार',
      role: 'Head of Finance & Accounts',
      roleHindi: 'प्रमुख - वित्त एवं लेखा विभाग',
      department: 'Finance, Banking & Audit',
      badge: 'Head of Accounts 📊',
      avatarIcon: 'bi-calculator-fill',
      email: 'accounts@krisimarg.com',
      quote: 'पारदर्शी वित्तीय व्यवस्था और सुरक्षित भुगतान ही किसान और खरीदार के अटूट भरोसे की सबसे मजबूत नींव है।',
      bio: [
        'Atul Kumar leads the Accounts, Finance, and Treasury management at KrisiMarg (krisimarg.com). He brings rigorous financial discipline, tax governance, and strategic capital management to the platform’s high-volume agricultural marketplace operations.',
        'Atul oversees the platform’s secure Escrow payment settlements, ensuring that farmers receive 100% verified, immediate bank credits with zero hidden commissions, while buyers experience transparent billing, GST compliance, and trade security.',
        'He also manages corporate financial auditing, working capital optimization, compliance with agricultural fiscal regulations, and long-term financial modeling to ensure robust, sustainable business growth.'
      ],
      responsibilities: [
        'Direct Farmer Payment Disbursements & Instant Bank Settlements',
        'Buyer Escrow Wallet & Digital Payment Gateway Security',
        'Corporate Accounting, GST Compliance & Financial Auditing',
        'Fiscal Planning, Budgeting & Working Capital Optimization'
      ],
      skills: ['Financial Management', 'Escrow & Payment Systems', 'Tax Compliance & GST', 'Agri-Trade Accounting']
    }
  ];

  readonly corePillars = [
    {
      icon: 'bi-shield-check',
      title: '100% Price Transparency',
      hindi: 'मूल्य पारदर्शिता',
      description: 'Zero hidden commissions and live APMC rates directly accessible to all farmers.'
    },
    {
      icon: 'bi-bank',
      title: 'Direct Bank Settlement',
      hindi: 'सीधा बैंक भुगतान',
      description: 'Guaranteed instant escrow settlements directly into farmers’ verified bank accounts.'
    },
    {
      icon: 'bi-truck',
      title: 'Express Rural Logistics',
      hindi: 'सुगम परिवहन',
      description: 'Connecting farm gates with wholesale markets through temperature-controlled logistics.'
    },
    {
      icon: 'bi-people-fill',
      title: 'Farmer-First Approach',
      hindi: 'किसान हित सर्वोपरि',
      description: 'Every decision and technological advancement is centered around farmer prosperity.'
    }
  ];
}
