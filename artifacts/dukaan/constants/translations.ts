export type Language = "en" | "hi" | "mr";

export const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "mr", label: "Marathi", native: "मराठी" },
];

export type BusinessType =
  | "kirana"
  | "dairy"
  | "hardware"
  | "flour_mill"
  | "stationery"
  | "other";

export const BUSINESS_TYPES: {
  type: BusinessType;
  en: string;
  hi: string;
  mr: string;
  icon: string;
}[] = [
  { type: "kirana", en: "Grocery / Kirana", hi: "किराना", mr: "किराणा", icon: "shopping-bag" },
  { type: "dairy", en: "Milk / Dairy", hi: "दूध / डेयरी", mr: "दूध / डेअरी", icon: "droplet" },
  { type: "hardware", en: "Hardware", hi: "हार्डवेयर", mr: "हार्डवेअर", icon: "tool" },
  { type: "flour_mill", en: "Flour Mill", hi: "आटा चक्की", mr: "पीठ चक्की", icon: "wind" },
  { type: "stationery", en: "Stationery", hi: "स्टेशनरी", mr: "स्टेशनरी", icon: "pen-tool" },
  { type: "other", en: "Other Shop", hi: "अन्य दुकान", mr: "इतर दुकान", icon: "briefcase" },
];

type T = {
  selectLanguage: string;
  chooseLanguage: string;
  continue: string;
  whatDoYouSell: string;
  selectBusiness: string;
  quickStart: string;
  quickStartDesc: string;
  startApp: string;
  today: string;
  newSale: string;
  inventory: string;
  history: string;
  settings: string;
  todaySales: string;
  totalRevenue: string;
  recentSales: string;
  noSalesToday: string;
  salesCount: string;
  addItem: string;
  itemName: string;
  price: string;
  unit: string;
  service: string;
  save: string;
  cancel: string;
  delete: string;
  quantity: string;
  total: string;
  addToCart: string;
  createBill: string;
  emptyCart: string;
  selectItems: string;
  salesHistory: string;
  noHistory: string;
  language: string;
  businessType: string;
  guestMode: string;
  backupToCloud: string;
  backupDesc: string;
  items: string;
  editItem: string;
  deleteConfirm: string;
  yes: string;
  no: string;
  amount: string;
  rate: string;
  billCreated: string;
  noItems: string;
  addFirstItem: string;
  rupee: string;
  saleNumber: string;
  selectPrice: string;
  tapToAdd: string;
  clearCart: string;
  shopName: string;
  shopNameHint: string;
  quickSale: string;
  enterAmount: string;
  confirmQuickSale: string;
  scanBarcode: string;
  barcodeNotFound: string;
  addToCatalog: string;
  quickSaleOnly: string;
  fetchingDetails: string;
};

export const translations: Record<Language, T> = {
  en: {
    selectLanguage: "Select Language",
    chooseLanguage: "Choose your preferred language",
    continue: "Continue",
    whatDoYouSell: "What do you sell?",
    selectBusiness: "Choose your shop type",
    quickStart: "Add Your Items",
    quickStartDesc: "Set prices for your products",
    startApp: "Start Using SaleSync",
    today: "Today",
    newSale: "Sale",
    inventory: "Items",
    history: "History",
    settings: "Settings",
    todaySales: "Today's Sales",
    totalRevenue: "Total Revenue",
    recentSales: "Recent Sales",
    noSalesToday: "No sales recorded today",
    salesCount: "Sales",
    addItem: "Add Item",
    itemName: "Item Name",
    price: "Price (₹)",
    unit: "Unit",
    service: "Service (no stock deduction)",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    quantity: "Qty",
    total: "Total",
    addToCart: "Add",
    createBill: "Create Bill",
    emptyCart: "Cart is empty",
    selectItems: "Tap items below to add to bill",
    salesHistory: "Sales History",
    noHistory: "No sales recorded yet",
    language: "Language",
    businessType: "Business Type",
    guestMode: "Guest Mode (data stored on device)",
    backupToCloud: "Backup to Cloud",
    backupDesc: "Link Google account to keep your data safe",
    items: "items",
    editItem: "Edit Item",
    deleteConfirm: "Delete this item?",
    yes: "Yes, Delete",
    no: "Cancel",
    amount: "Amount",
    rate: "Rate",
    billCreated: "Bill Created!",
    noItems: "No items in inventory",
    addFirstItem: "Add your first item to get started",
    rupee: "₹",
    saleNumber: "Sale",
    selectPrice: "Enter price",
    tapToAdd: "Tap to add to bill",
    clearCart: "Clear",
    shopName: "Shop Name",
    shopNameHint: "Your shop name (optional)",
    quickSale: "Quick Sale",
    enterAmount: "Enter Amount",
    confirmQuickSale: "Confirm Quick Sale",
    scanBarcode: "Scan Barcode",
    barcodeNotFound: "New Item Scanned",
    addToCatalog: "Add to Catalog",
    quickSaleOnly: "Quick Sale Only",
    fetchingDetails: "Fetching details...",
  },
  hi: {
    selectLanguage: "भाषा चुनें",
    chooseLanguage: "अपनी पसंदीदा भाषा चुनें",
    continue: "आगे बढ़ें",
    whatDoYouSell: "आप क्या बेचते हैं?",
    selectBusiness: "अपना व्यापार चुनें",
    quickStart: "अपना सामान जोड़ें",
    quickStartDesc: "अपनी चीज़ों के दाम डालें",
    startApp: "SaleSync शुरू करें",
    today: "आज",
    newSale: "बिक्री",
    inventory: "सामान",
    history: "इतिहास",
    settings: "सेटिंग",
    todaySales: "आज की बिक्री",
    totalRevenue: "कुल आमदनी",
    recentSales: "हाल की बिक्री",
    noSalesToday: "आज कोई बिक्री नहीं",
    salesCount: "बिक्री",
    addItem: "सामान जोड़ें",
    itemName: "सामान का नाम",
    price: "दाम (₹)",
    unit: "इकाई",
    service: "सेवा (स्टॉक नहीं)",
    save: "सेव करें",
    cancel: "रद्द करें",
    delete: "हटाएं",
    quantity: "मात्रा",
    total: "कुल",
    addToCart: "जोड़ें",
    createBill: "बिल बनाएं",
    emptyCart: "कार्ट खाली है",
    selectItems: "बिल के लिए सामान चुनें",
    salesHistory: "बिक्री इतिहास",
    noHistory: "अभी तक कोई बिक्री नहीं",
    language: "भाषा",
    businessType: "व्यापार का प्रकार",
    guestMode: "अतिथि मोड (डेटा फोन पर)",
    backupToCloud: "क्लाउड बैकअप",
    backupDesc: "डेटा सुरक्षित रखने के लिए Google खाता जोड़ें",
    items: "सामान",
    editItem: "सामान बदलें",
    deleteConfirm: "इसे हटाएं?",
    yes: "हाँ, हटाएं",
    no: "रद्द करें",
    amount: "रकम",
    rate: "दर",
    billCreated: "बिल बन गया!",
    noItems: "कोई सामान नहीं",
    addFirstItem: "शुरू करने के लिए पहला सामान जोड़ें",
    rupee: "₹",
    saleNumber: "बिल",
    selectPrice: "दाम डालें",
    tapToAdd: "जोड़ने के लिए टैप करें",
    clearCart: "साफ़ करें",
    shopName: "दुकान का नाम",
    shopNameHint: "आपकी दुकान का नाम (वैकल्पिक)",
    quickSale: "तुरंत बिक्री",
    enterAmount: "रकम डालें",
    confirmQuickSale: "बिक्री पक्की करें",
    scanBarcode: "बारकोड स्कैन करें",
    barcodeNotFound: "नया सामान स्कैन किया",
    addToCatalog: "कैटलॉग में जोड़ें",
    quickSaleOnly: "केवल तुरंत बिक्री",
    fetchingDetails: "जानकारी खोज रहे हैं...",
  },
  mr: {
    selectLanguage: "भाषा निवडा",
    chooseLanguage: "आपली पसंतीची भाषा निवडा",
    continue: "पुढे जा",
    whatDoYouSell: "तुम्ही काय विकता?",
    selectBusiness: "तुमचा व्यवसाय निवडा",
    quickStart: "तुमच्या वस्तू जोडा",
    quickStartDesc: "तुमच्या वस्तूंच्या किंमती घाला",
    startApp: "SaleSync सुरू करा",
    today: "आज",
    newSale: "विक्री",
    inventory: "माल",
    history: "इतिहास",
    settings: "सेटिंग",
    todaySales: "आजची विक्री",
    totalRevenue: "एकूण उत्पन्न",
    recentSales: "अलीकडील विक्री",
    noSalesToday: "आज कोणतीही विक्री नाही",
    salesCount: "विक्री",
    addItem: "वस्तू जोडा",
    itemName: "वस्तूचे नाव",
    price: "किंमत (₹)",
    unit: "एकक",
    service: "सेवा (स्टॉक नाही)",
    save: "सेव्ह करा",
    cancel: "रद्द करा",
    delete: "हटवा",
    quantity: "प्रमाण",
    total: "एकूण",
    addToCart: "जोडा",
    createBill: "बिल बनवा",
    emptyCart: "कार्ट रिकामी आहे",
    selectItems: "बिलासाठी माल निवडा",
    salesHistory: "विक्री इतिहास",
    noHistory: "अद्याप कोणतीही विक्री नाही",
    language: "भाषा",
    businessType: "व्यवसायाचा प्रकार",
    guestMode: "पाहुणा मोड (डेटा फोनवर)",
    backupToCloud: "क्लाउड बॅकअप",
    backupDesc: "डेटा सुरक्षित ठेवण्यासाठी Google खाते जोडा",
    items: "वस्तू",
    editItem: "वस्तू बदला",
    deleteConfirm: "हे हटवायचे?",
    yes: "हो, हटवा",
    no: "रद्द करा",
    amount: "रक्कम",
    rate: "दर",
    billCreated: "बिल तयार झाले!",
    noItems: "कोणताही माल नाही",
    addFirstItem: "सुरू करण्यासाठी पहिली वस्तू जोडा",
    rupee: "₹",
    saleNumber: "बिल",
    selectPrice: "किंमत घाला",
    tapToAdd: "जोडण्यासाठी टॅप करा",
    clearCart: "साफ करा",
    shopName: "दुकानाचे नाव",
    shopNameHint: "तुमच्या दुकानाचे नाव (ऐच्छिक)",
    quickSale: "जलद विक्री",
    enterAmount: "रक्कम टाका",
    confirmQuickSale: "विक्री निश्चित करा",
    scanBarcode: "बारकोड स्कॅन करा",
    barcodeNotFound: "नवीन वस्तू स्कॅन केली",
    addToCatalog: "कॅटलॉगमध्ये जोडा",
    quickSaleOnly: "फक्त जलद विक्री",
    fetchingDetails: "माहिती शोधत आहे...",
  },
};

export type SuggestedItem = {
  en: string;
  hi: string;
  mr: string;
  unit: string;
  rate: number;
  isService: boolean;
};

export const SUGGESTED_ITEMS: Record<BusinessType, SuggestedItem[]> = {
  kirana: [
    { en: "Sugar", hi: "चीनी", mr: "साखर", unit: "kg", rate: 44, isService: false },
    { en: "Milk", hi: "दूध", mr: "दूध", unit: "liter", rate: 60, isService: false },
    { en: "Tea", hi: "चाय", mr: "चहा", unit: "kg", rate: 400, isService: false },
    { en: "Oil", hi: "तेल", mr: "तेल", unit: "liter", rate: 120, isService: false },
    { en: "Rice", hi: "चावल", mr: "तांदूळ", unit: "kg", rate: 50, isService: false },
    { en: "Salt", hi: "नमक", mr: "मीठ", unit: "kg", rate: 20, isService: false },
  ],
  dairy: [
    { en: "Milk", hi: "दूध", mr: "दूध", unit: "liter", rate: 60, isService: false },
    { en: "Curd", hi: "दही", mr: "दही", unit: "kg", rate: 70, isService: false },
    { en: "Butter", hi: "मक्खन", mr: "लोणी", unit: "kg", rate: 500, isService: false },
    { en: "Ghee", hi: "घी", mr: "तूप", unit: "kg", rate: 600, isService: false },
    { en: "Paneer", hi: "पनीर", mr: "पनीर", unit: "kg", rate: 350, isService: false },
  ],
  hardware: [
    { en: "Nails", hi: "कील", mr: "खिळे", unit: "kg", rate: 80, isService: false },
    { en: "Paint", hi: "रंग", mr: "रंग", unit: "liter", rate: 200, isService: false },
    { en: "Hammer", hi: "हथौड़ा", mr: "हातोडा", unit: "piece", rate: 150, isService: false },
    { en: "Screws", hi: "स्क्रू", mr: "स्क्रू", unit: "dozen", rate: 30, isService: false },
    { en: "Wire", hi: "तार", mr: "तार", unit: "meter", rate: 25, isService: false },
  ],
  flour_mill: [
    { en: "Grinding Charge", hi: "पिसाई", mr: "दळणे", unit: "kg", rate: 5, isService: true },
    { en: "Wheat Flour", hi: "गेहूं आटा", mr: "गहू पीठ", unit: "kg", rate: 35, isService: false },
    { en: "Rice Flour", hi: "चावल आटा", mr: "तांदूळ पीठ", unit: "kg", rate: 45, isService: false },
    { en: "Chakki Charge", hi: "चक्की चार्ज", mr: "चक्की शुल्क", unit: "kg", rate: 3, isService: true },
  ],
  stationery: [
    { en: "Pen", hi: "पेन", mr: "पेन", unit: "piece", rate: 10, isService: false },
    { en: "Notebook", hi: "कॉपी", mr: "वही", unit: "piece", rate: 30, isService: false },
    { en: "Pencil", hi: "पेंसिल", mr: "पेन्सिल", unit: "piece", rate: 5, isService: false },
    { en: "Eraser", hi: "रबर", mr: "रबर", unit: "piece", rate: 5, isService: false },
    { en: "Scale", hi: "स्केल", mr: "पट्टी", unit: "piece", rate: 10, isService: false },
  ],
  other: [
    { en: "Item 1", hi: "सामान 1", mr: "वस्तू 1", unit: "piece", rate: 10, isService: false },
    { en: "Item 2", hi: "सामान 2", mr: "वस्तू 2", unit: "piece", rate: 20, isService: false },
    { en: "Service", hi: "सेवा", mr: "सेवा", unit: "piece", rate: 50, isService: true },
  ],
};
