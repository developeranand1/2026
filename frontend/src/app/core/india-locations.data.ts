/**
 * Comprehensive Database of All 28 States and 8 Union Territories of India
 * with their respective Districts, Cities, and Major APMC Agricultural Mandis.
 */

export interface StateLocationInfo {
  state: string;
  hindiName: string;
  code: string;
  isUT?: boolean;
  districts: string[];
  popularMandis: string[];
}

export const INDIA_STATES_DISTRICTS: Record<string, StateLocationInfo> = {
  "Uttar Pradesh": {
    state: "Uttar Pradesh",
    hindiName: "उत्तर प्रदेश",
    code: "UP",
    districts: [
      "Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", 
      "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", 
      "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", 
      "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", 
      "Gautam Buddha Nagar (Noida)", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", 
      "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", 
      "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri (Lakhimpur)", 
      "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", 
      "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", 
      "Prayagraj (Allahabad)", "Raebareli", "Rampur", "Saharanpur", "Sambhal", 
      "Sant Kabir Nagar (Khalilabad)", "Shahjahanpur", "Shamli", "Shravasti", 
      "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"
    ],
    popularMandis: ["Khalilabad APMC", "Gorakhpur Mandi", "Kanpur Mandi", "Agra Mandi", "Lucknow Mandi", "Meerut APMC", "Varanasi Mandi", "Bareilly Mandi", "Aligarh APMC"]
  },
  "Bihar": {
    state: "Bihar",
    hindiName: "बिहार",
    code: "BI",
    districts: [
      "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur (Arrah)", 
      "Buxar", "Darbhanga", "East Champaran (Motihari)", "Gaya", "Gopalganj", "Jamui", 
      "Jehanabad", "Kaimur (Bhabua)", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", 
      "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda (Bihar Sharif)", "Nawada", 
      "Patna", "Purnia", "Rohtas (Sasaram)", "Saharsa", "Samastipur", "Saran (Chhapra)", 
      "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali (Hajipur)", "West Champaran (Bettiah)"
    ],
    popularMandis: ["Muzaffarpur APMC", "Patna Krishi Mandi", "Bhagalpur Mandi", "Hajipur Mandi", "Purnia Grain Mandi", "Gaya Mandi", "Samastipur Mandi", "Sasaram Mandi"]
  },
  "Punjab": {
    state: "Punjab",
    hindiName: "पंजाब",
    code: "PB",
    districts: [
      "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", 
      "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", 
      "Malerkotla", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar (Ropar)", 
      "Sahibzada Ajit Singh Nagar (Mohali)", "Sangrur", "Shahid Bhagat Singh Nagar (Nawanshahr)", 
      "Sri Muktsar Sahib", "Tarn Taran"
    ],
    popularMandis: ["Khanna Grain Market (Asia's Largest)", "Ludhiana APMC", "Amritsar Mandi", "Jalandhar Mandi", "Bathinda Mandi", "Patiala Mandi", "Sangrur APMC"]
  },
  "Haryana": {
    state: "Haryana",
    hindiName: "हरियाणा",
    code: "HR",
    districts: [
      "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", 
      "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", 
      "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"
    ],
    popularMandis: ["Karnal Grain Mandi", "Panipat APMC", "Hisar Mandi", "Sirsa Mandi", "Ambala Mandi", "Kurukshetra Mandi", "Rohtak Grain Market"]
  },
  "Madhya Pradesh": {
    state: "Madhya Pradesh",
    hindiName: "मध्य प्रदेश",
    code: "MP",
    districts: [
      "Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", 
      "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", 
      "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad (Narmadapuram)", 
      "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", 
      "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", 
      "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", 
      "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"
    ],
    popularMandis: ["Indore Choithram APMC", "Ujjain Mandi", "Neemuch Krishi Mandi", "Mandsaur Mandi", "Bhopal Mandi", "Jabalpur APMC", "Gwalior Mandi", "Sagar APMC"]
  },
  "Rajasthan": {
    state: "Rajasthan",
    hindiName: "राजस्थान",
    code: "RJ",
    districts: [
      "Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", 
      "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", 
      "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", 
      "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", 
      "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"
    ],
    popularMandis: ["Kota Bhamashah Mandi", "Jaipur Muhana Mandi", "Sri Ganganagar Mandi", "Jodhpur APMC", "Bikaner Mandi", "Bhilwara Mandi", "Alwar Mandi"]
  },
  "Maharashtra": {
    state: "Maharashtra",
    hindiName: "महाराष्ट्र",
    code: "MH",
    districts: [
      "Ahmednagar", "Akola", "Amravati", "Aurangabad (Chhatrapati Sambhajinagar)", 
      "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", 
      "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", 
      "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad (Dharashiv)", "Palghar", 
      "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", 
      "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
    ],
    popularMandis: ["Lasalgaon Onion Mandi (Nashik)", "Navi Mumbai APMC (Vashi)", "Pune Market Yard", "Nagpur Orange Mandi", "Sangli Turmeric Mandi", "Latur Pulse Mandi", "Kolhapur Jaggery Mandi"]
  },
  "Gujarat": {
    state: "Gujarat",
    hindiName: "गुजरात",
    code: "GJ",
    districts: [
      "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha (Palanpur)", "Bharuch", 
      "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang (Ahwa)", "Devbhoomi Dwarka", 
      "Gandhinagar", "Gir Somnath (Veraval)", "Jamnagar", "Junagadh", "Kheda (Nadiad)", 
      "Kutch (Bhuj)", "Mahisagar (Lunawada)", "Mehsana", "Morbi", "Narmada (Rajpipla)", 
      "Navsari", "Panchmahal (Godhra)", "Patan", "Porbandar", "Rajkot", "Sabarkantha (Himmatnagar)", 
      "Surat", "Surendranagar", "Tapi (Vyara)", "Vadodara", "Valsad"
    ],
    popularMandis: ["Unjha Cumin/Spices Mandi", "Rajkot APMC", "Gondal APMC", "Surat APMC", "Ahmedabad APMC", "Patan Mandi", "Deesa Potato Mandi"]
  },
  "West Bengal": {
    state: "West Bengal",
    hindiName: "पश्चिम बंगाल",
    code: "WB",
    districts: [
      "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", 
      "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", 
      "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", 
      "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"
    ],
    popularMandis: ["Burdwan Rice Mandi", "Siliguri APMC", "Kolkata Koley Market", "Hooghly Potato Mandi", "Malda Mango Mandi", "Murshidabad Jute Mandi"]
  },
  "Andhra Pradesh": {
    state: "Andhra Pradesh",
    hindiName: "आंध्र प्रदेश",
    code: "AP",
    districts: [
      "Alluri Sitharama Raju", "Anakapalli", "Ananthapuramu", "Annamayya", "Bapatla", 
      "Chittoor", "Dr. B.R. Ambedkar Konaseema", "East Godavari (Rajahmundry)", "Eluru", 
      "Guntur", "Kakinada", "Krishna (Machilipatnam)", "Kurnool", "Nandyal", "NTR (Vijayawada)", 
      "Palnadu", "Parvathipuram Manyam", "Prakasam (Ongole)", "Sri Potti Sriramulu Nellore", 
      "Sri Sathya Sai", "Srikakulam", "Tirupati", "Visakhapatnam", "Vizianagaram", 
      "West Godavari (Bhimavaram)", "YSR Kadapa"
    ],
    popularMandis: ["Guntur Mirchi (Chilli) Yard", "Vijayawada Mandi", "Kurnool Onion Mandi", "Tirupati APMC", "Rajahmundry Mandi", "Anantapur Groundnut Yard"]
  },
  "Karnataka": {
    state: "Karnataka",
    hindiName: "कर्नाटक",
    code: "KA",
    districts: [
      "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", 
      "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada (Mangaluru)", 
      "Davanagere", "Dharwad (Hubballi)", "Gadag", "Hassan", "Haveri", "Kalaburagi (Gulbarga)", 
      "Kodagu (Madikeri)", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", 
      "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada (Karwar)", "Vijayanagara", "Vijayapura (Bijapur)", "Yadgir"
    ],
    popularMandis: ["Yeshwanthpur APMC (Bengaluru)", "Hubballi Mandi", "Belagavi APMC", "Kalaburagi Red Gram Mandi", "Kolar Tomato Market", "Mysuru APMC"]
  },
  "Tamil Nadu": {
    state: "Tamil Nadu",
    hindiName: "तमिलनाडु",
    code: "TN",
    districts: [
      "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", 
      "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari (Nagercoil)", 
      "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", 
      "Nilgiris (Udhagamandalam)", "Perambalur", "Pudukkottai", "Ramanathapuram", 
      "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", 
      "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", 
      "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
    ],
    popularMandis: ["Koyambedu Wholesale Market (Chennai)", "Erode Turmeric Market", "Madurai Mattuthavani Market", "Coimbatore APMC", "Salem Mango Mandi", "Thanjavur Paddy Yard"]
  },
  "Telangana": {
    state: "Telangana",
    hindiName: "तेलंगाना",
    code: "TS",
    districts: [
      "Adilabad", "Bhadradri Kothagudem", "Hanamkonda", "Hyderabad", "Jagtial", 
      "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", 
      "Karimnagar", "Khammam", "Komaram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", 
      "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", 
      "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Ranga Reddy", 
      "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"
    ],
    popularMandis: ["Bowenpally Market (Hyderabad)", "Warangal Enmamulagadda Chilli/Cotton Mandi", "Nizamabad Turmeric Market", "Karimnagar APMC", "Khammam Mandi"]
  },
  "Kerala": {
    state: "Kerala",
    hindiName: "केरल",
    code: "KL",
    districts: [
      "Alappuzha", "Ernakulam (Kochi)", "Idukki", "Kannur", "Kasaragod", "Kollam", 
      "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", 
      "Thiruvananthapuram", "Thrissur", "Wayanad"
    ],
    popularMandis: ["Kochi Spices & Copra Market", "Palakkad Paddy Yard", "Kozhikode Coconut Mandi", "Thrissur APMC", "Idukki Cardamom Market", "Kottayam Rubber Market"]
  },
  "Odisha": {
    state: "Odisha",
    hindiName: "ओडिशा",
    code: "OD",
    districts: [
      "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", 
      "Deogarh", "Dhenkanal", "Gajapati", "Ganjam (Berhampur)", "Jagatsinghpur", 
      "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", 
      "Khordha (Bhubaneswar)", "Koraput", "Malkangiri", "Mayurbhanj (Baripada)", 
      "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"
    ],
    popularMandis: ["Bargarh Paddy Market (Rice Bowl)", "Bhubaneswar Aiginia Mandi", "Cuttack Malgodown", "Berhampur Mandi", "Sambalpur APMC"]
  },
  "Assam": {
    state: "Assam",
    hindiName: "असम",
    code: "AS",
    districts: [
      "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar (Silchar)", "Charaideo", 
      "Chirang", "Darrang (Mangaldai)", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao (Haflong)", 
      "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan (Guwahati)", 
      "Kamrup Rural", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", 
      "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur (Tezpur)", "South Salmara-Mankachar", 
      "Tinsukia", "Udalguri", "West Karbi Anglong"
    ],
    popularMandis: ["Guwahati Pamohi Fruit/Veg Mandi", "Jorhat Tea & Grain Market", "Silchar APMC", "Nagaon Mandi", "Tezpur APMC"]
  },
  "Jharkhand": {
    state: "Jharkhand",
    hindiName: "झारखंड",
    code: "JH",
    districts: [
      "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum (Jamshedpur)", 
      "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", 
      "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu (Daltonganj)", "Ramgarh", 
      "Ranchi", "Sahebganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum (Chaibasa)"
    ],
    popularMandis: ["Ranchi Pandra Krishi Mandi", "Jamshedpur APMC", "Dhanbad Grain Market", "Hazaribagh Mandi", "Deoghar Mandi"]
  },
  "Chhattisgarh": {
    state: "Chhattisgarh",
    hindiName: "छत्तीसगढ़",
    code: "CG",
    districts: [
      "Balod", "Baloda Bazar", "Balrampur", "Bastar (Jagdalpur)", "Bemetara", "Bijapur", 
      "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela-Pendra-Marwahi", 
      "Janjgir-Champa", "Jashpur", "Kabirdham (Kawardha)", "Kanker", "Khairagarh-Chhuikhadan-Gandai", 
      "Kondagaon", "Korba", "Korea", "Mahasamund", "Manendragarh-Chirmiri-Bharatpur", 
      "Mohla-Manpur-Ambagarh Chowki", "Mungeli", "Narayanpur", "Raigarh", "Raipur", 
      "Rajnandgaon", "Sarangarh-Bilaigarh", "Shakti", "Sukma", "Surajpur", "Surguja (Ambikapur)"
    ],
    popularMandis: ["Raipur Tulsi APMC", "Bilaspur Krishi Mandi", "Dhamtari Paddy Market", "Rajnandgaon Mandi", "Durg Mandi", "Ambikapur APMC"]
  },
  "Himachal Pradesh": {
    state: "Himachal Pradesh",
    hindiName: "हिमाचल प्रदेश",
    code: "HP",
    districts: [
      "Bilaspur", "Chamba", "Hamirpur", "Kangra (Dharamshala)", "Kinnaur", "Kullu", 
      "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur (Nahan)", "Solan", "Una"
    ],
    popularMandis: ["Shimla Bhattakufar Apple Mandi", "Solan Sabzi Mandi", "Kullu Fruit Mandi", "Kangra APMC", "Una Grain Market"]
  },
  "Uttarakhand": {
    state: "Uttarakhand",
    hindiName: "उत्तराखंड",
    code: "UK",
    districts: [
      "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", 
      "Nainital (Haldwani)", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", 
      "Tehri Garhwal", "Udham Singh Nagar (Rudrapur / Kashipur)", "Uttarkashi"
    ],
    popularMandis: ["Haldwani Mandi (Kumaon Gateway)", "Dehradun Niranjanpur Mandi", "Rudrapur Grain Mandi", "Haridwar APMC", "Kashipur Mandi"]
  },
  "Jammu and Kashmir": {
    state: "Jammu and Kashmir",
    hindiName: "जम्मू और कश्मीर",
    code: "JK",
    isUT: true,
    districts: [
      "Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", 
      "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", 
      "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"
    ],
    popularMandis: ["Sopore Apple Fruit Mandi (Asia's 2nd Largest)", "Parimpora Fruit Mandi (Srinagar)", "Jammu Narwal Mandi", "Shopian Apple Mandi", "Kathua APMC"]
  },
  "Delhi": {
    state: "Delhi",
    hindiName: "दिल्ली (राष्ट्रीय राजधानी क्षेत्र)",
    code: "DL",
    isUT: true,
    districts: [
      "Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", 
      "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"
    ],
    popularMandis: ["Azadpur Mandi (Asia's Largest Fruit & Veg Mandi)", "Ghazipur Sabzi & Fish Mandi", "Okhla Sabzi Mandi", "Najafgarh Grain Mandi", "Narela Grain Market", "Keshopur Sabzi Mandi"]
  },
  "Goa": {
    state: "Goa",
    hindiName: "गोवा",
    code: "GO",
    districts: ["North Goa (Panaji)", "South Goa (Margao)", "Mapusa", "Ponda", "Vasco da Gama", "Bicholim", "Curchorem"],
    popularMandis: ["Margao APMC", "Mapusa Sabzi Market", "Panaji Municipal Market", "Ponda Krishi Mandi"]
  },
  "Tripura": {
    state: "Tripura",
    hindiName: "त्रिपुरा",
    code: "TR",
    districts: ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura (Agartala)"],
    popularMandis: ["Agartala Battala Market", "Gol Bazar Mandi", "Udaipur Krishi Mandi", "Dharmanagar APMC"]
  },
  "Meghalaya": {
    state: "Meghalaya",
    hindiName: "मेघालय",
    code: "ME",
    districts: ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills (Shillong)", "North Garo Hills", "Ri-Bhoi (Nongpoh)", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills (Tura)", "West Jaintia Hills", "West Khasi Hills"],
    popularMandis: ["Shillong Iewduh (Bara Bazar)", "Tura Super Market", "Nongpoh Agri Mandi"]
  },
  "Manipur": {
    state: "Manipur",
    hindiName: "मणिपुर",
    code: "MN",
    districts: ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
    popularMandis: ["Ima Keithel (Mother's Market, Imphal)", "Thoubal Market", "Churachandpur Agri Center"]
  },
  "Nagaland": {
    state: "Nagaland",
    hindiName: "नागालैंड",
    code: "NL",
    districts: ["Chumoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Niuland", "Noklak", "Peren", "Phek", "Shamator", "Tseminyu", "Tuensang", "Wokha", "Zunheboto"],
    popularMandis: ["Dimapur Super Market", "Kohima Mao Market", "Mokokchung Daily Market"]
  },
  "Mizoram": {
    state: "Mizoram",
    hindiName: "मिज़ोरम",
    code: "MZ",
    districts: ["Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Saitual", "Serchhip"],
    popularMandis: ["Aizawl Bara Bazar", "Champhai Agri Mandi", "Lunglei Market"]
  },
  "Arunachal Pradesh": {
    state: "Arunachal Pradesh",
    hindiName: "अरुणाचल प्रदेश",
    code: "AR",
    districts: ["Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang (Pasighat)", "Kamle", "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit (Tezu)", "Longding", "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai", "Pakke Kessang", "Papum Pare (Itanagar)", "Shi Yomi", "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"],
    popularMandis: ["Naharlagun Ganga Market", "Pasighat Daily Market", "Tezu APMC", "Namsai Agri Mandi"]
  },
  "Sikkim": {
    state: "Sikkim",
    hindiName: "सिक्किम",
    code: "SK",
    districts: ["Gangtok", "Gyalshing", "Mangan", "Namchi", "Pakyong", "Soreng"],
    popularMandis: ["Gangtok Lal Bazar Organic Market", "Namchi Daily Market", "Gyalshing Agri Mandi"]
  },
  "Chandigarh": {
    state: "Chandigarh",
    hindiName: "चंडीगढ़",
    code: "CH",
    isUT: true,
    districts: ["Chandigarh City", "Sector 26 Grain & Vegetable Market", "Manimajra"],
    popularMandis: ["Sector 26 Wholesale Grain & Vegetable APMC", "Sector 39 Mandi"]
  },
  "Puducherry": {
    state: "Puducherry",
    hindiName: "पुदुचेरी",
    code: "PY",
    isUT: true,
    districts: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
    popularMandis: ["Puducherry Grand Bazaar", "Karaikal Fish & Agri Market", "Uzhavar Sandhai Pondy"]
  },
  "Ladakh": {
    state: "Ladakh",
    hindiName: "लद्दाख",
    code: "LA",
    isUT: true,
    districts: ["Leh", "Kargil", "Nubra Valley", "Zanskar"],
    popularMandis: ["Leh Main Bazaar APMC", "Kargil Vegetable Market"]
  },
  "Dadra and Nagar Haveli and Daman and Diu": {
    state: "Dadra and Nagar Haveli and Daman and Diu",
    hindiName: "दादरा और नगर हवेली और दमन और दीव",
    code: "DN",
    isUT: true,
    districts: ["Daman", "Diu", "Dadra and Nagar Haveli (Silvassa)"],
    popularMandis: ["Silvassa APMC", "Daman Municipal Vegetable Market"]
  },
  "Andaman and Nicobar Islands": {
    state: "Andaman and Nicobar Islands",
    hindiName: "अंडमान और निकोबार द्वीप समूह",
    code: "AN",
    isUT: true,
    districts: ["North and Middle Andaman", "South Andaman (Port Blair)", "Nicobar"],
    popularMandis: ["Port Blair Mohanpura Market", "Bathubasti Vegetable Market"]
  },
  "Lakshadweep": {
    state: "Lakshadweep",
    hindiName: "लक्षद्वीप",
    code: "LD",
    isUT: true,
    districts: ["Kavaratti", "Agatti", "Amini", "Andrott", "Minicoy", "Kalpeni", "Kadmat", "Kiltan", "Chetlat", "Bitra"],
    popularMandis: ["Kavaratti Island Market", "Agatti Coconut Cooperative"]
  }
};

/**
 * Returns sorted list of all State/UT names
 */
export function getAllIndianStates(): string[] {
  return Object.keys(INDIA_STATES_DISTRICTS).sort((a, b) => {
    // Keep high-volume agricultural states first for convenience
    const topOrder = ["Uttar Pradesh", "Bihar", "Madhya Pradesh", "Punjab", "Haryana", "Rajasthan", "Maharashtra", "Gujarat", "West Bengal"];
    const idxA = topOrder.indexOf(a);
    const idxB = topOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });
}

/**
 * Returns all districts/cities for a given state
 */
export function getDistrictsForState(stateName: string): string[] {
  const info = INDIA_STATES_DISTRICTS[stateName];
  if (!info) return [];
  return info.districts;
}

/**
 * Returns popular mandis for a given state
 */
export function getPopularMandisForState(stateName: string): string[] {
  const info = INDIA_STATES_DISTRICTS[stateName];
  if (!info) return [];
  return info.popularMandis;
}
