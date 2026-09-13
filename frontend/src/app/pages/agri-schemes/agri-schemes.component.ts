import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo.service';

export interface AgriScheme {
  id: string;
  nameHi: string;
  nameEn: string;
  category: 'income-pension' | 'loans-insurance' | 'solar-irrigation' | 'machinery' | 'organic-horticulture' | 'dairy-animal';
  categoryLabelHi: string;
  categoryLabelEn: string;
  tagline: string;
  badge: string;
  badgeColor: 'success' | 'primary' | 'warning' | 'info' | 'danger';
  icon: string;
  benefitAmount: string;
  description: string;
  eligibility: string[];
  documentsRequired: string[];
  applicationProcess: string[];
  officialPortalUrl: string;
  portalName: string;
  helpline: string;
}

@Component({
  selector: 'app-agri-schemes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './agri-schemes.component.html',
  styleUrl: './agri-schemes.component.scss'
})
export class AgriSchemesComponent implements OnInit {
  private seoService = inject(SeoService);

  searchQuery = '';
  selectedCategory: 'all' | 'income-pension' | 'loans-insurance' | 'solar-irrigation' | 'machinery' | 'organic-horticulture' | 'dairy-animal' = 'all';
  selectedScheme: AgriScheme | null = null;

  // Categories list for filter tabs
  categories = [
    { id: 'all', labelHi: 'सभी योजनाएं (All)', icon: 'bi-grid-fill' },
    { id: 'income-pension', labelHi: 'आय व पेंशन (Income/Pension)', icon: 'bi-cash-coin' },
    { id: 'loans-insurance', labelHi: 'ऋण व फसल बीमा (Loans/Insurance)', icon: 'bi-shield-check' },
    { id: 'solar-irrigation', labelHi: 'सोलर व सिंचाई (Solar/Irrigation)', icon: 'bi-sun-fill' },
    { id: 'machinery', labelHi: 'कृषि यंत्र व ट्रैक्टर (Machinery)', icon: 'bi-truck' },
    { id: 'organic-horticulture', labelHi: 'जैविक व बागवानी (Organic/Horticulture)', icon: 'bi-flower1' },
    { id: 'dairy-animal', labelHi: 'डेयरी व पशुपालन (Dairy/Animal)', icon: 'bi-house-heart-fill' }
  ];

  // 12+ Comprehensive Indian Agricultural Schemes
  schemes: AgriScheme[] = [
    {
      id: 'pm-kisan',
      nameHi: 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)',
      nameEn: 'PM Kisan Samman Nidhi Yojana',
      category: 'income-pension',
      categoryLabelHi: 'प्रत्यक्ष आय सहायता',
      categoryLabelEn: 'Direct Income Support',
      tagline: 'सभी पात्र किसान परिवारों को प्रति वर्ष ₹6,000 की वित्तीय सहायता',
      badge: '₹6,000 / वर्ष',
      badgeColor: 'success',
      icon: 'bi-cash-stack',
      benefitAmount: '₹2,000 की तीन समान किस्तों में प्रति वर्ष ₹6,000 सीधे DBT द्वारा बैंक खाते में।',
      description: 'पीएम किसान योजना भारत सरकार की 100% वित्त पोषित योजना है जो छोटे, सीमांत और सभी भूमिधारक किसान परिवारों को कृषि आदान और घरेलू जरूरतों के लिए आर्थिक मदद देती है।',
      eligibility: [
        'सभी भूमिधारक किसान परिवार जिनके नाम पर खेती योग्य जमीन दर्ज है।',
        'संस्थागत भूमिधारक, संवैधानिक पदधारक, 10,000+ पेंशनभोगी और आयकर दाता अपात्र हैं।',
        'e-KYC और बैंक खाते का आधार व NPCI से लिंक होना अनिवार्य है।'
      ],
      documentsRequired: [
        'आधार कार्ड (Aadhaar Card)',
        'जमीन के दस्तावेज (खसरा-खतौनी / Land Records)',
        'आधार लिंक बैंक पासबुक विवरण',
        'सक्रिय मोबाइल नंबर'
      ],
      applicationProcess: [
        'pmkisan.gov.in पोर्टल पर जाएं या नजदीकी CSC / जनसेवा केंद्र पर संपर्क करें।',
        'New Farmer Registration पर क्लिक करके आधार व जमीन विवरण दर्ज करें।',
        'OTP सत्यापन के बाद आवेदन सबमिट करें और स्टेटस ट्रैक करें।'
      ],
      officialPortalUrl: 'https://pmkisan.gov.in',
      portalName: 'PM-KISAN Official Portal',
      helpline: '155261 / 011-24300606'
    },
    {
      id: 'pm-kusum',
      nameHi: 'PM-KUSUM सोलर पंप योजना (घटक B व C)',
      nameEn: 'PM KUSUM Solar Pump Scheme',
      category: 'solar-irrigation',
      categoryLabelHi: 'सोलर व हरित ऊर्जा',
      categoryLabelEn: 'Solar Energy',
      tagline: 'खेतों में सोलर पंप स्थापना पर 60% तक कुल सरकारी सब्सिडी',
      badge: '60% सब्सिडी',
      badgeColor: 'primary',
      icon: 'bi-sun-fill',
      benefitAmount: '30% केंद्र सरकार + 30% राज्य सरकार सब्सिडी (कुल 60%)। किसान का नकद हिस्सा मात्र 10% (शेष 30% बैंक लोन)।',
      description: 'किसानों को डीजल पंपों से मुक्ति दिलाने और दिन के समय निर्बाध सौर ऊर्जा आधारित सिंचाई सुविधा उपलब्ध कराने हेतु नवीन एवं नवीकरणीय ऊर्जा मंत्रालय (MNRE) की प्रमुख योजना।',
      eligibility: [
        'व्यक्तिगत किसान, किसानों के समूह, सहकारी समितियां, पंचायतें और FPO।',
        'खेत में सिंचाई जल स्रोत (बोरवेल, कुआं या तालाब) उपलब्ध होना चाहिए।',
        '2 HP से 10 HP क्षमता तक के पंपों के लिए आवेदन मान्य।'
      ],
      documentsRequired: [
        'आधार कार्ड व पासपोर्ट फोटो',
        'खतौनी/जमीन की नकल व सिंचाई स्रोत प्रमाणपत्र',
        'बैंक खाता विवरण',
        'घोषणा पत्र (डीजल पंप प्रतिस्थापन)'
      ],
      applicationProcess: [
        'राज्य के कृषि/ऊर्जा विभाग के सोलर पोर्टल (उदा. upagriculture.com) पर ऑनलाइन आवेदन करें।',
        '10% कृषक अंशदान का चालान/ऑनलाइन भुगतान जमा करें।',
        'सत्यापन उपरांत अधिकृत वेंडर द्वारा खेत में सोलर पंप स्थापित किया जाएगा।'
      ],
      officialPortalUrl: 'https://pmkusum.mnre.gov.in',
      portalName: 'MNRE PM-KUSUM Portal',
      helpline: '1800-180-3333'
    },
    {
      id: 'kcc-scheme',
      nameHi: 'किसान क्रेडिट कार्ड (KCC) रियायती फसल ऋण',
      nameEn: 'Kisan Credit Card (KCC) Scheme',
      category: 'loans-insurance',
      categoryLabelHi: 'रियायती कृषि ऋण',
      categoryLabelEn: 'Subsidized Agri Loan',
      tagline: 'समय पर भुगतान पर 3% छूट के साथ मात्र 4% शुद्ध ब्याज दर पर ऋण',
      badge: '4% शुद्ध ब्याज',
      badgeColor: 'success',
      icon: 'bi-credit-card-2-front-fill',
      benefitAmount: '₹3 लाख तक के ऋण पर 4% प्रभावी ब्याज दर। ₹1.60 लाख तक बिना किसी भूमि बंधक (Collateral-free)।',
      description: 'किसानों को बीज, खाद, कीटनाशक खरीद और कृषि आकस्मिक खर्चों के लिए बैंकों द्वारा एकल खिड़की के माध्यम से समय पर रियायती संस्थागत ऋण उपलब्ध कराया जाता है।',
      eligibility: [
        'सभी व्यक्तिगत किसान / संयुक्त कृषक / हिस्सेदार (Sharecroppers) और पट्टेदार किसान।',
        'पशुपालन, डेयरी और मत्स्य पालन करने वाले किसान भी पात्र हैं (₹2 लाख तक सीमा)।',
        'आयु 18 से 75 वर्ष के मध्य।'
      ],
      documentsRequired: [
        'KCC आवेदन फॉर्म (सरल 1-पेज फॉर्म)',
        'आधार कार्ड, पैन कार्ड या वोटर आईडी',
        'भू-स्वामित्व दस्तावेज (खतौनी, खसरा, लगान रसीद)',
        'निकटवर्ती बैंकों से नो-ड्यूज सर्टिफिकेट (NDC)'
      ],
      applicationProcess: [
        'नजदीकी बैंक शाखा या जनसेवा केंद्र पर 1-पेज का KCC फॉर्म भरें।',
        'भू-अभिलेख और पहचान पत्र संलग्न करके जमा करें।',
        'बैंक द्वारा 14 दिनों के भीतर KCC कार्ड व स्वीकृति पत्र जारी किया जाता है।'
      ],
      officialPortalUrl: 'https://fasalrin.gov.in',
      portalName: 'KCC Fasal Rin Portal',
      helpline: '1800-180-1551'
    },
    {
      id: 'pmfby',
      nameHi: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
      nameEn: 'Pradhan Mantri Fasal Bima Yojana',
      category: 'loans-insurance',
      categoryLabelHi: 'फसल सुरक्षा व बीमा',
      categoryLabelEn: 'Crop Insurance',
      tagline: 'प्राकृतिक आपदाओं, सूखा, बाढ़ व कीट प्रकोप से फसल क्षति पर संपूर्ण वित्तीय सुरक्षा',
      badge: '1.5% - 2% प्रीमियम',
      badgeColor: 'warning',
      icon: 'bi-shield-fill-check',
      benefitAmount: 'खरीफ फसलों पर मात्र 2%, रबी पर 1.5% और बागवानी पर 5% प्रीमियम। शेष 85-98% प्रीमियम सरकार वहन करती है।',
      description: 'बुआई से लेकर कटाई उपरांत तक प्रतिकूल मौसम, ओलावृष्टि, चक्रवात, जलभराव और कीट रोगों से होने वाले नुकसान की स्थिति में किसानों को संपूर्ण बीमा क्षतिपूर्ति प्रदान करती है।',
      eligibility: [
        'अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले सभी किसान (ऋणी व गैर-ऋणी दोनों)।',
        'बटाईदार व किराएदार किसान भी फसल बीमा कराने के पात्र हैं।'
      ],
      documentsRequired: [
        'आधार कार्ड व बैंक पासबुक (DBT सक्रिय)',
        'भूमि की खतौनी / किराएदारी अनुबंध पत्र',
        'पटवारी / ग्राम प्रधान द्वारा जारी बुआई प्रमाण पत्र (Sowing Certificate)'
      ],
      applicationProcess: [
        'pmfby.gov.in पर जाएं या बैंक शाखा / CSC केंद्र पर आवेदन करें।',
        'फसल क्षति होने पर 72 घंटे के भीतर Crop Insurance App या 14447 पर क्लेम दर्ज करें।',
        'सर्वेक्षण उपरांत क्लेम राशि सीधे बैंक खाते में ट्रांसफर होती है।'
      ],
      officialPortalUrl: 'https://pmfby.gov.in',
      portalName: 'PMFBY Portal',
      helpline: '14447 (Kisan Call Center)'
    },
    {
      id: 'smam-machinery',
      nameHi: 'कृषि यंत्रीकरण उप-मिशन (SMAM / कृषि यंत्र सब्सिडी)',
      nameEn: 'Sub-Mission on Agricultural Mechanization',
      category: 'machinery',
      categoryLabelHi: 'कृषि यंत्र व ट्रैक्टर',
      categoryLabelEn: 'Farm Mechanization',
      tagline: 'ट्रैक्टर, रोटावेटर, कंबाइन हार्वेस्टर व लेजर लैंड लेवलर पर 40% से 50% सब्सिडी',
      badge: '40% - 50% छूट',
      badgeColor: 'primary',
      icon: 'bi-truck',
      benefitAmount: 'व्यक्तिगत कृषि यंत्रों पर 40% से 50% और कस्टम हायरिंग सेंटर (CHC) स्थापना पर 80% तक (₹10 लाख तक) सब्सिडी।',
      description: 'छोटे और सीमांत किसानों तक आधुनिक कृषि यंत्रों की पहुंच आसान बनाने हेतु कृषि एवं किसान कल्याण मंत्रालय द्वारा अनुदानित दर पर यंत्र उपलब्ध कराए जाते हैं।',
      eligibility: [
        'महिला किसान, छोटे व सीमांत किसान (SC/ST किसानों को अतिरिक्त 10% छूट)।',
        'किसान ने पिछले 3 से 5 वर्षों में उसी यंत्र पर कोई सरकारी सब्सिडी न ली हो।'
      ],
      documentsRequired: [
        'आधार कार्ड व पासपोर्ट फोटो',
        'खतौनी की प्रति (Land Records)',
        'बैंक पासबुक की प्रति',
        'ट्रैक्टर चालित यंत्रों के लिए ट्रैक्टर की वैध RC'
      ],
      applicationProcess: [
        'agrimachinery.nic.in या राज्य के कृषि यंत्र डीबीटी पोर्टल पर टोकन जनरेट करें।',
        'टोकन बुक करने के बाद अधिकृत डीलर से यंत्र क्रय करें।',
        'यंत्र की जीपीएस फोटो व बिल अपलोड करने पर सब्सिडी सीधे बैंक खाते में आएगी।'
      ],
      officialPortalUrl: 'https://agrimachinery.nic.in',
      portalName: 'FarMech SMAM Portal',
      helpline: '1800-180-1551'
    },
    {
      id: 'pmksy-irrigation',
      nameHi: 'PMKSY - प्रति बूंद अधिक फसल (ड्रिप व स्प्रिंकलर सब्सिडी)',
      nameEn: 'PM Krishi Sinchayee Yojana (PDMC)',
      category: 'solar-irrigation',
      categoryLabelHi: 'सूक्ष्म सिंचाई',
      categoryLabelEn: 'Micro Irrigation',
      tagline: 'ड्रिप (टपक) और स्प्रिंकलर (फव्वारा) सिंचाई संयंत्र स्थापना पर 55% तक अनुदान',
      badge: '45% - 55% सब्सिडी',
      badgeColor: 'info',
      icon: 'bi-droplet-half',
      benefitAmount: 'छोटे व सीमांत किसानों को 55% और अन्य किसानों को 45% सब्सिडी। 60-70% जल बचत और 30% अधिक पैदावार।',
      description: 'सूक्ष्म सिंचाई तकनीकों (Drip & Sprinkler) के माध्यम से जल उपयोग दक्षता बढ़ाने और उर्वरकों के सटीक उपयोग (Fertigation) को बढ़ावा देने की योजना।',
      eligibility: [
        'सभी किसान जिनके पास सुरक्षित सिंचाई जल स्रोत और खेती योग्य भूमि है।',
        'न्यूनतम 0.5 एकड़ से अधिकतम 5 हेक्टेयर तक अनुदान अनुमन्य।'
      ],
      documentsRequired: [
        'आधार कार्ड',
        'भू-अभिलेख (खसरा/खतौनी)',
        'जल स्रोत उपलब्धता प्रमाण पत्र',
        'बैंक पासबुक'
      ],
      applicationProcess: [
        'राज्य के उद्यान / सूक्ष्म सिंचाई पोर्टल पर पंजीकरण करें।',
        'पंजीकृत कंपनी/वेंडर द्वारा खेत का सर्वे और एस्टीमेट तैयार कराया जाएगा।',
        'अनुदान स्वीकृति के बाद सिस्टम इंस्टॉल होगा और सत्यापन उपरांत सब्सिडी जारी होगी।'
      ],
      officialPortalUrl: 'https://pmksy.gov.in',
      portalName: 'PMKSY Official Portal',
      helpline: '1800-180-1551'
    },
    {
      id: 'soil-health-card',
      nameHi: 'मृदा स्वास्थ्य कार्ड योजना (Soil Health Card)',
      nameEn: 'Soil Health Card Scheme',
      category: 'organic-horticulture',
      categoryLabelHi: 'मृदा परीक्षण व पोषक तत्व',
      categoryLabelEn: 'Soil Nutrient Guidance',
      tagline: 'मिट्टी के 12 पोषक तत्वों की निःशुल्क जांच व संतुलित खाद की वैज्ञानिक सलाह',
      badge: '100% निःशुल्क जांच',
      badgeColor: 'success',
      icon: 'bi-clipboard2-pulse-fill',
      benefitAmount: 'निःशुल्क मृदा जांच कार्ड जिसमें N, P, K, pH, EC, जैविक कार्बन व सूक्ष्म पोषक तत्वों की विस्तृत रिपोर्ट और फसल अनुसार खाद की खुराक दी जाती है।',
      description: 'किसानों को उनकी मिट्टी की उर्वरता स्थिति से अवगत कराकर रासायनिक खादों के अत्यधिक उपयोग को रोकना और लागत घटाकर पैदावार बढ़ाना।',
      eligibility: [
        'देश के सभी किसान जिनके पास कृषि भूमि है।'
      ],
      documentsRequired: [
        'आधार कार्ड',
        'खेत का खसरा नंबर व क्षेत्रफल'
      ],
      applicationProcess: [
        'कृषि विभाग की टीम द्वारा खेत से मिट्टी का नमूना एकत्र किया जाता है।',
        'प्रयोगशाला जांच के बाद 3 वर्ष के लिए वैध सॉइल हेल्थ कार्ड प्रदान किया जाता है।',
        'portal: soilhealth.dac.gov.in से कभी भी ऑनलाइन डाउनलोड कर सकते हैं।'
      ],
      officialPortalUrl: 'https://soilhealth.dac.gov.in',
      portalName: 'Soil Health Card Portal',
      helpline: '011-24305591'
    },
    {
      id: 'aif-scheme',
      nameHi: 'एग्रीकल्चर इंफ्रास्ट्रक्चर फंड (AIF)',
      nameEn: 'Agriculture Infrastructure Fund',
      category: 'loans-insurance',
      categoryLabelHi: 'कटाई उपरांत अवसंरचना',
      categoryLabelEn: 'Post Harvest Infra',
      tagline: 'गोदाम, कोल्ड स्टोरेज, ग्रेडिंग यूनिट व कस्टम हायरिंग हेतु ₹2 करोड़ तक पर 3% ब्याज छूट',
      badge: '3% ब्याज छूट + गारंटी',
      badgeColor: 'primary',
      icon: 'bi-building-gear',
      benefitAmount: '₹2 करोड़ तक के ऋण पर 7 वर्षों तक 3% वार्षिक ब्याज छूट और CGTMSE अंतर्गत बिना गारंटी कवरेज।',
      description: 'फसल कटाई के बाद नुकसान कम करने, बेहतर भंडारण और सीधे प्रसंस्करण इकाई स्थापित करने के लिए ₹1 लाख करोड़ का मध्यम-दीर्घकालिक वित्तपोषण कोष।',
      eligibility: [
        'किसान, FPO, प्राथमिक कृषि ऋण समितियां (PACS), कृषि उद्यमी व स्टार्ट-अप्स।'
      ],
      documentsRequired: [
        'DPR (डिटेल्ड प्रोजेक्ट रिपोर्ट)',
        'केवाईसी व पैन कार्ड',
        'जमीन के दस्तावेज / लीज एग्रीमेंट',
        'बैंक अकाउंट व बैलेंस शीट (यदि लागू हो)'
      ],
      applicationProcess: [
        'agriinfra.dac.gov.in पोर्टल पर ऑनलाइन प्रोजेक्ट सबमिट करें।',
        'मंत्रालय द्वारा प्रारंभिक अनुमोदन के बाद चयनित बैंक द्वारा ऋण स्वीकृत किया जाएगा।'
      ],
      officialPortalUrl: 'https://agriinfra.dac.gov.in',
      portalName: 'AIF Official Portal',
      helpline: '011-23382012'
    },
    {
      id: 'pkvy-organic',
      nameHi: 'परम्परागत कृषि विकास योजना (PKVY - जैविक खेती)',
      nameEn: 'Paramparagat Krishi Vikas Yojana',
      category: 'organic-horticulture',
      categoryLabelHi: 'जैविक व प्राकृतिक खेती',
      categoryLabelEn: 'Organic Farming',
      tagline: 'जैविक खेती क्लस्टर अपनाने पर प्रति हेक्टेयर ₹50,000 की वित्तीय सहायता',
      badge: '₹50,000 / हेक्टेयर',
      badgeColor: 'success',
      icon: 'bi-flower2',
      benefitAmount: '3 वर्षों के लिए प्रति हेक्टेयर ₹50,000 की सहायता (जिसमें से ₹31,000 सीधे किसान को जैविक खाद व बीज हेतु DBT दिए जाते हैं)।',
      description: 'रसायन-मुक्त जैविक खेती को क्लस्टर पद्धति और PGS-India सर्टिफिकेशन के जरिए बढ़ावा देने की राष्ट्रीय योजना।',
      eligibility: [
        '20 या अधिक किसानों का क्लस्टर (न्यूनतम 50 एकड़ / 20 हेक्टेयर क्षेत्रफल)।',
        'जैविक प्रमाणीकरण में रुचि रखने वाले सभी किसान।'
      ],
      documentsRequired: [
        'आधार कार्ड व बैंक पासबुक',
        'खतौनी की प्रति',
        'क्लस्टर ग्रुप का संकल्प पत्र'
      ],
      applicationProcess: [
        'pgsindia-ncof.gov.in या जिला कृषि/उद्यान अधिकारी कार्यालय के माध्यम से क्लस्टर बनाएं।',
        'प्रशिक्षण और 3 वर्ष तक नियमित निरीक्षण के बाद ऑर्गेनिक सर्टिफिकेट जारी किया जाता है।'
      ],
      officialPortalUrl: 'https://pgsindia-ncof.gov.in',
      portalName: 'PGS-India Organic Portal',
      helpline: '1800-180-1551'
    },
    {
      id: 'pm-kmy',
      nameHi: 'प्रधानमंत्री किसान मानधन योजना (PM-KMY पेंशन)',
      nameEn: 'PM Kisan Maandhan Yojana',
      category: 'income-pension',
      categoryLabelHi: 'सामाजिक सुरक्षा व पेंशन',
      categoryLabelEn: 'Farmer Pension',
      tagline: '60 वर्ष की आयु पूर्ण होने पर छोटे व सीमांत किसानों को ₹3,000 मासिक सुनिश्चित पेंशन',
      badge: '₹3,000 / माह पेंशन',
      badgeColor: 'warning',
      icon: 'bi-shield-heart-fill',
      benefitAmount: '60 वर्ष की आयु के बाद ₹3,000 प्रति माह (₹36,000/वर्ष) आजीवन पेंशन। किसान की मृत्यु पर पत्नी को 50% पारिवारिक पेंशन।',
      description: 'वृद्धावस्था में छोटे और सीमांत किसानों को सामाजिक सुरक्षा प्रदान करने हेतु केंद्र सरकार और LIC द्वारा संचालित स्वैच्छिक पेंशन योजना।',
      eligibility: [
        '18 से 40 वर्ष आयु के छोटे व सीमांत किसान (अधिकतम 2 हेक्टेयर तक भूमि)।',
        'मासिक अंशदान ₹55 से ₹200 (उम्र अनुसार), बराबर 50% अंशदान केंद्र सरकार देती है।'
      ],
      documentsRequired: [
        'आधार कार्ड',
        'बचत बैंक खाता पासबुक (ऑटो-डेबिट सहमति)',
        'जमीन की खतौनी'
      ],
      applicationProcess: [
        'नजदीकी CSC / जनसेवा केंद्र पर जाएं या maandhan.in पर सेल्फ-रजिस्टर करें।',
        'पंजीकरण पूर्ण होने पर किसान पेंशन कार्ड जारी किया जाता है।'
      ],
      officialPortalUrl: 'https://maandhan.in',
      portalName: 'PM-KMY Maandhan Portal',
      helpline: '1800-267-6888'
    },
    {
      id: 'dairy-ahidf',
      nameHi: 'पशुपालन अवसंरचना विकास कोष (AHIDF) व राष्ट्रीय गोकुल मिशन',
      nameEn: 'Animal Husbandry Infrastructure (AHIDF)',
      category: 'dairy-animal',
      categoryLabelHi: 'डेयरी व पशुपालन',
      categoryLabelEn: 'Dairy & Livestock',
      tagline: 'डेयरी प्रसंस्करण, पशु आहार संयंत्र व नस्ल सुधार फार्म पर 3% ब्याज छूट व पूंजीगत अनुदान',
      badge: '3% ब्याज छूट + 25% सब्सिडी',
      badgeColor: 'info',
      icon: 'bi-house-heart-fill',
      benefitAmount: 'परियोजना लागत का 90% तक बैंक ऋण, 3% ब्याज छूट और नाबार्ड/विभाग से 25% से 33% तक पूंजीगत सब्सिडी।',
      description: 'दूध उत्पादन, आधुनिक डेयरी शेड, साइलेज मेकिंग, नस्ल संवर्धन और पशु आहार संयंत्र स्थापित करने के लिए पशुपालन एवं डेयरी विभाग की प्रमुख योजना।',
      eligibility: [
        'व्यक्तिगत किसान, दुग्ध उत्पादक, FPO, MSME और डेयरी सहकारी समितियां।'
      ],
      documentsRequired: [
        'आधार, पैन कार्ड व फोटोग्राफ',
        'परियोजना डीपीआर (DPR)',
        'भूमि अभिलेख / पशुधन संख्या विवरण',
        'बैंक खाता व सिविल स्कोर'
      ],
      applicationProcess: [
        'ahidf.udyamimitra.in पर ऑनलाइन प्रोजेक्ट अपलोड करें।',
        'SIDBI / बैंक द्वारा सत्यापन के बाद सब्सिडी व लोन प्रोसेस होगा।'
      ],
      officialPortalUrl: 'https://ahidf.udyamimitra.in',
      portalName: 'AHIDF Portal',
      helpline: '1800-180-1551'
    },
    {
      id: 'nbhm-beekeeping',
      nameHi: 'राष्ट्रीय मधुमक्खी पालन एवं शहद मिशन (NBHM)',
      nameEn: 'National Beekeeping & Honey Mission',
      category: 'organic-horticulture',
      categoryLabelHi: 'मधुमक्खी पालन व शहद',
      categoryLabelEn: 'Honey & Beekeeping',
      tagline: 'मधुमक्खी के बक्से, निष्कर्षण यंत्र व प्रशिक्षण पर 80% तक सरकारी अनुदान',
      badge: '80% तक सब्सिडी',
      badgeColor: 'warning',
      icon: 'bi-hexagon-fill',
      benefitAmount: 'मधुमक्खी कालोनी व बक्से (50 बॉक्स तक) खरीदने पर प्रति यूनिट 80% सब्सिडी और शहद प्रसंस्करण लैब पर ₹5 लाख तक सहायता।',
      description: 'किसानों की आय में अतिरिक्त वृद्धि, परागण द्वारा फसलों की पैदावार में 20-30% बढ़ोतरी और मीठी क्रांति (Sweet Revolution) को बढ़ावा देने की योजना।',
      eligibility: [
        'व्यक्तिगत किसान, बेरोजगार युवा, महिला स्वयं सहायता समूह व FPO।'
      ],
      documentsRequired: [
        'आधार कार्ड व बैंक पासबुक',
        'निवास प्रमाण पत्र',
        'मधुमक्खी पालन प्रशिक्षण प्रमाण पत्र (KVK या उद्यान विभाग से)'
      ],
      applicationProcess: [
        'madhukranti.in पोर्टल पर पंजीकरण करें।',
        'जिला उद्यान अधिकारी कार्यालय में सब्सिडी प्रस्ताव जमा करें।'
      ],
      officialPortalUrl: 'https://madhukranti.in',
      portalName: 'MadhuKranti Portal',
      helpline: '1800-180-1551'
    }
  ];

  ngOnInit(): void {
    this.setupSeoAndSchema();
  }

  private setupSeoAndSchema(): void {
    this.seoService.updateSeo({
      title: 'सरकारी कृषि योजनाएं व सब्सिडी डायरेक्टरी (Sarkari Krishi Yojana & Subsidy) | KrisiMarg',
      description: 'भारत सरकार की सभी प्रमुख कृषि योजनाएं: PM-KISAN, PM-KUSUM 60% सोलर पंप, KCC 4% ऋण, PMFBY फसल बीमा, कृषि यंत्र सब्सिडी व पशुपालन योजनाओं की सम्पूर्ण जानकारी व ऑनलाइन आवेदन लिंक।',
      keywords: 'Sarkari Krishi Yojana, Government Agriculture Schemes, PM Kisan Samman Nidhi, PM Kusum Solar Subsidy, KCC Loan Scheme, PMFBY Fasal Bima, Krishi Yantra Subsidy, Kisan Pension, Agri Schemes India, Krishi Marg',
      url: '/schemes'
    });

    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          'name': 'KrisiMarg Indian Government Agriculture Schemes & Subsidies Directory',
          'url': 'https://krisimarg.com/schemes',
          'description': 'Complete guide to Indian Central and State Government agriculture schemes, subsidies, eligibility, and application portals.',
          'publisher': {
            '@type': 'Organization',
            'name': 'KrisiMarg Technologies',
            'url': 'https://krisimarg.com'
          }
        },
        {
          '@type': 'FAQPage',
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'PM-KISAN योजना की अगली किस्त कब आएगी और e-KYC कैसे करें?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'PM-KISAN की किस्तें प्रति वर्ष अप्रैल-जुलाई, अगस्त-नवंबर और दिसंबर-मार्च में जारी की जाती हैं। किसान pmkisan.gov.in पर ओटीपी या नजदीकी सीएससी केंद्र पर बायोमेट्रिक द्वारा e-KYC पूरी कर सकते हैं।'
              }
            },
            {
              '@type': 'Question',
              'name': 'कृषि यंत्रों और ट्रैक्टर पर कितनी सब्सिडी मिलती है?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'SMAM योजना के तहत रोटावेटर, कल्टीवेटर, लेजर लैंड लेवलर और ट्रैक्टर पर 40% से 50% तक और कस्टम हायरिंग सेंटर (CHC) पर 80% तक सरकारी सब्सिडी मिलती है।'
              }
            },
            {
              '@type': 'Question',
              'name': 'PM-KUSUM सोलर पंप योजना में आवेदन कैसे करें?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'PM-KUSUM योजना में कुल 60% सरकारी सब्सिडी (30% केंद्र + 30% राज्य) मिलती है। किसान राज्य के कृषि/ऊर्जा पोर्टल पर ऑनलाइन आवेदन कर 10% कृषक अंशदान जमा करके सोलर पंप प्राप्त कर सकते हैं।'
              }
            }
          ]
        }
      ]
    };

    this.seoService.setJsonLd(schema, 'agri-schemes-schema');
  }

  // Filtered list getter
  get filteredSchemes(): AgriScheme[] {
    return this.schemes.filter(s => {
      const matchesCategory = this.selectedCategory === 'all' || s.category === this.selectedCategory;
      const q = this.searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        s.nameHi.toLowerCase().includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.tagline.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.badge.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }

  setCategory(catId: any): void {
    this.selectedCategory = catId;
  }

  openSchemeDetails(scheme: AgriScheme): void {
    this.selectedScheme = scheme;
  }

  closeSchemeDetails(): void {
    this.selectedScheme = null;
  }

  applyViaWhatsApp(scheme: AgriScheme): void {
    const msg = `नमस्ते KrisiMarg टीम, मुझे "${scheme.nameHi}" (${scheme.badge}) के लिए आवेदन और सरकारी सब्सिडी की जानकारी चाहिए।\n\n📌 योजना: ${scheme.nameHi}\n📌 लाभ: ${scheme.benefitAmount}\n\nकृपया मुझे पात्रता जांच और आवेदन प्रक्रिया में सहायता प्रदान करें।`;
    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/917219159731?text=${encoded}`, '_blank');
  }

  openOfficialPortal(url: string): void {
    window.open(url, '_blank');
  }
}
