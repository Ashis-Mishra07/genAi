"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type Language =
  | "en"
  | "hi"
  | "bn"
  | "te"
  | "mr"
  | "ta"
  | "gu"
  | "kn"
  | "or"
  | "pa";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation & General
    artisanStudio: "Artisan Studio",
    creativePortal: "Creative Portal",
    dashboard: "Dashboard",
    profile: "Profile",
    analytics: "Analytics",
    messages: "Messages",
    addProduct: "Add Product",
    editProduct: "Edit Product",
    signOut: "Sign Out",
    feedback: "Feedback",

    // Dashboard
    activeListings: "Active Listings",
    totalViews: "Total Views",
    recentProducts: "Recent Products",
    featured: "Featured",
    views: "views",

    // Product Details
    productDetails: "Product Details",
    category: "Category",
    description: "Description",
    dimensions: "Dimensions",
    weight: "Weight",
    materials: "Materials",
    closeModal: "Close Modal",

    // Categories
    selectCategory: "Select Category",
    textilesAndFabrics: "Textiles & Fabrics",
    jewelryAndAccessories: "Jewelry & Accessories",
    potteryAndCeramics: "Pottery & Ceramics",
    woodCrafts: "Wood Crafts",
    metalWork: "Metal Work",
    paintingsAndArt: "Paintings & Art",
    homeDecor: "Home Decor",
    traditionalWear: "Traditional Wear",
    sculptures: "Sculptures",
    other: "Other",

    // Languages
    language: "Language",
    english: "English",
    hindi: "हिंदी",
    bengali: "বাংলা",
    telugu: "తెలుగు",
    marathi: "मराठी",
    tamil: "தமிழ்",
    gujarati: "ગુજરાતી",
    kannada: "ಕನ್ನಡ",
    odia: "ଓଡ଼ିଆ",
    punjabi: "ਪੰਜਾਬੀ",

    // Edit Product Page
    basicInformation: "Basic Information",
    productName: "Product Name",
    shortDescription: "Short Description",
    descriptionStory: "Description & Story",
    productDescription: "Product Description",
    tellYourStory: "Tell Your Story",
    originalPrice: "Original Price",
    discountedPrice: "Discounted Price",
    stockQuantity: "Stock Quantity",
    availableStock: "Available Stock",
    imagesLinks: "Images & Links",
    productImageUrl: "Product Image URL",
    marketingPosterUrl: "Marketing Poster URL",
    instagramPostUrl: "Instagram Post URL",
    preview: "Preview",
    updateProduct: "Update Product",
    updating: "Updating...",
    loading: "Loading...",

    // Orders & Shopping
    order: "Order",
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    notifyMe: "Notify Me",
    myOrders: "My Orders",
    totalOrders: "Total Orders",
    pendingOrders: "Pending",
    shippedOrders: "Shipped",
    deliveredOrders: "Delivered",
    cancelledOrders: "Cancelled",
    confirmedOrders: "Confirmed",
    orderDetails: "Order Details",
    orderNumber: "Order Number",
    orderDate: "Order Date",
    orderStatus: "Order Status",
    trackingNumber: "Tracking Number",
    estimatedDelivery: "Estimated Delivery",
    shippingAddress: "Shipping Address",
    billingAddress: "Billing Address",
    paymentMethod: "Payment Method",
    orderTotal: "Order Total",
    subtotal: "Subtotal",
    shipping: "Shipping",
    tax: "Tax",
    discount: "Discount",
    items: "Items",
    quantity: "Quantity",
    startShopping: "Start Shopping",
    continueShopping: "Continue Shopping",
    viewDetails: "View Details",
    viewAll: "View All",
    browseAll: "Browse All",
    trackOrders: "Track Orders",
    orderHistory: "Order History",
    noOrdersFound: "No Orders Found",
    noOrdersYet: "You haven't placed any orders yet",
    startShoppingDescription: "Start shopping to see your orders here!",

    // Product related
    products: "Products",
    noProductsFound: "No products found",
    searchProducts: "Search products...",
    filterByCategory: "Filter by Category",
    allCategories: "All Categories",
    sortBy: "Sort By",
    newestFirst: "Newest First",
    priceLowToHigh: "Price: Low to High",
    priceHighToLow: "Price: High to Low",
    nameAToZ: "Name: A to Z",
    highestRated: "Highest Rated",
    mostPopular: "Most Popular",
    priceRange: "Price Range",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    lowStock: "Low Stock",
    addMoreItems: "+ Add more items",

    // Dashboard
    welcomeBack: "Welcome Back",
    quickActions: "Quick Actions",
    recentOrders: "Recent Orders",
    recommendedForYou: "Recommended for You",
    browseProducts: "Browse Products",
    discoverAmazing: "Discover amazing handcrafted items",
    monitorOrderStatus: "Monitor your order status",

    // Common actions
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    apply: "Apply",
    clear: "Clear",
    close: "Close",
    back: "Back",
    next: "Next",
    previous: "Previous",
    save: "Save",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    cancel: "Cancel",
    yes: "Yes",
    no: "No",
    ok: "OK",
  },
  hi: {
    // Navigation & General
    artisanStudio: "कारीगर स्टूडियो",
    creativePortal: "रचनात्मक पोर्टल",
    dashboard: "डैशबोर्ड",
    profile: "प्रोफ़ाइल",
    analytics: "विश्लेषण",
    messages: "संदेश",
    addProduct: "उत्पाद जोड़ें",
    editProduct: "उत्पाद संपादित करें",
    signOut: "साइन आउट",
    feedback: "प्रतिक्रिया",

    // Dashboard
    activeListings: "सक्रिय सूची",
    totalViews: "कुल दृश्य",
    recentProducts: "हाल के उत्पाद",
    featured: "विशेष रुप से प्रदर्शित",
    price: "मूल्य",
    stock: "स्टॉक",
    views: "दृश्य",
    orders: "आदेश",

    // Product Details
    productDetails: "उत्पाद विवरण",
    category: "श्रेणी",
    description: "विवरण",
    dimensions: "आयाम",
    weight: "वजन",
    materials: "सामग्री",
    closeModal: "मॉडल बंद करें",

    // Categories
    selectCategory: "श्रेणी चुनें",
    textilesAndFabrics: "वस्त्र और कपड़े",
    jewelryAndAccessories: "आभूषण और सहायक उपकरण",
    potteryAndCeramics: "मिट्टी के बर्तन और सिरामिक",
    woodCrafts: "लकड़ी के शिल्प",
    metalWork: "धातु का काम",
    paintingsAndArt: "चित्रकारी और कला",
    homeDecor: "घर की सजावट",
    traditionalWear: "पारंपरिक पोशाक",
    sculptures: "मूर्तियां",
    other: "अन्य",

    // Languages
    language: "भाषा",
    english: "English",
    hindi: "हिंदी",
    bengali: "বাংলা",
    telugu: "తెలుగు",
    marathi: "मराठी",
    tamil: "தமிழ்",
    gujarati: "ગુજરાતી",
    kannada: "ಕನ್ನಡ",
    odia: "ଓଡ଼ିଆ",
    punjabi: "ਪੰਜਾਬੀ",

    // Edit Product Page
    basicInformation: "मूलभूत जानकारी",
    productName: "उत्पाद का नाम",
    shortDescription: "संक्षिप्त विवरण",
    descriptionStory: "विवरण और कहानी",
    productDescription: "उत्पाद विवरण",
    tellYourStory: "अपनी कहानी बताएं",
    originalPrice: "मूल मूल्य",
    discountedPrice: "छूट मूल्य",
    stockQuantity: "स्टॉक मात्रा",
    availableStock: "उपलब्ध स्टॉक",
    imagesLinks: "चित्र और लिंक",
    productImageUrl: "उत्पाद छवि URL",
    marketingPosterUrl: "मार्केटिंग पोस्टर URL",
    instagramPostUrl: "इंस्टाग्राम पोस्ट URL",
    preview: "पूर्वावलोकन",
    updateProduct: "उत्पाद अपडेट करें",
    updating: "अपडेट हो रहा है...",
    loading: "लोड हो रहा है...",

    // Orders & Shopping
    order: "ऑर्डर करें",
    addToCart: "कार्ट में डालें",
    buyNow: "अभी खरीदें",
    notifyMe: "मुझे सूचित करें",
    myOrders: "मेरे ऑर्डर",
    totalOrders: "कुल ऑर्डर",
    pendingOrders: "लंबित",
    shippedOrders: "भेजे गए",
    deliveredOrders: "वितरित",
    cancelledOrders: "रद्द",
    confirmedOrders: "पुष्ट",
    orderDetails: "ऑर्डर विवरण",
    orderNumber: "ऑर्डर नंबर",
    orderDate: "ऑर्डर दिनांक",
    orderStatus: "ऑर्डर स्थिति",
    trackingNumber: "ट्रैकिंग नंबर",
    estimatedDelivery: "अनुमानित डिलीवरी",
    shippingAddress: "शिपिंग पता",
    billingAddress: "बिलिंग पता",
    paymentMethod: "भुगतान विधि",
    orderTotal: "ऑर्डर कुल",
    subtotal: "उप-योग",
    shipping: "शिपिंग",
    tax: "कर",
    discount: "छूट",
    items: "वस्तुएं",
    quantity: "मात्रा",
    startShopping: "खरीदारी शुरू करें",
    continueShopping: "खरीदारी जारी रखें",
    viewDetails: "विवरण देखें",
    viewAll: "सभी देखें",
    browseAll: "सभी ब्राउज़ करें",
    trackOrders: "ऑर्डर ट्रैक करें",
    orderHistory: "ऑर्डर इतिहास",
    noOrdersFound: "कोई ऑर्डर नहीं मिला",
    noOrdersYet: "आपने अभी तक कोई ऑर्डर नहीं दिया है",
    startShoppingDescription: "अपने ऑर्डर यहाँ देखने के लिए खरीदारी शुरू करें!",

    // Product related
    products: "उत्पाद",
    noProductsFound: "कोई उत्पाद नहीं मिला",
    searchProducts: "उत्पाद खोजें...",
    filterByCategory: "श्रेणी के अनुसार फ़िल्टर करें",
    allCategories: "सभी श्रेणियां",
    sortBy: "इसके अनुसार क्रमबद्ध करें",
    newestFirst: "नवीनतम पहले",
    priceLowToHigh: "मूल्य: कम से अधिक",
    priceHighToLow: "मूल्य: अधिक से कम",
    nameAToZ: "नाम: अ से ज्ञ",
    highestRated: "सर्वोच्च रेटेड",
    mostPopular: "सबसे लोकप्रिय",
    priceRange: "मूल्य सीमा",
    inStock: "स्टॉक में",
    outOfStock: "स्टॉक समाप्त",
    lowStock: "कम स्टॉक",
    addMoreItems: "+ और आइटम जोड़ें",

    // Dashboard
    welcomeBack: "वापस स्वागत है",
    quickActions: "त्वरित कार्य",
    recentOrders: "हाल के ऑर्डर",
    recommendedForYou: "आपके लिए सुझाया गया",
    browseProducts: "उत्पाद ब्राउज़ करें",
    discoverAmazing: "अद्भुत हस्तशिल्प वस्तुओं की खोज करें",
    monitorOrderStatus: "अपने ऑर्डर की स्थिति की निगरानी करें",

    // Common actions
    search: "खोजें",
    filter: "फ़िल्टर",
    sort: "क्रमबद्ध करें",
    apply: "लागू करें",
    clear: "साफ़ करें",
    close: "बंद करें",
    back: "वापस",
    next: "अगला",
    previous: "पिछला",
    save: "सहेजें",
    edit: "संपादित करें",
    delete: "हटाएं",
    confirm: "पुष्टि करें",
    cancel: "रद्द करें",
    yes: "हाँ",
    no: "नहीं",
    ok: "ठीक है",
  },
  // Simplified other languages for now - in a real app you'd want full translations
  bn: {
    artisanStudio: "কারিগর স্টুডিও",
    dashboard: "ড্যাশবোর্ড",
    products: "পণ্য",
    addProduct: "পণ্য যোগ করুন",
    editProduct: "পণ্য সম্পাদনা করুন",
    signOut: "সাইন আউট",
    // Orders & Shopping
    order: "অর্ডার করুন",
    addToCart: "কার্টে যোগ করুন",
    buyNow: "এখনই কিনুন",
    notifyMe: "আমাকে জানান",
    myOrders: "আমার অর্ডার",
    totalOrders: "মোট অর্ডার",
    pendingOrders: "অপেক্ষমাণ",
    shippedOrders: "পাঠানো হয়েছে",
    deliveredOrders: "বিতরণ করা হয়েছে",
    cancelledOrders: "বাতিল",
    confirmedOrders: "নিশ্চিত",
    orderDetails: "অর্ডার বিবরণ",
    viewDetails: "বিস্তারিত দেখুন",
    viewAll: "সব দেখুন",
    browseAll: "সব ব্রাউজ করুন",
    trackOrders: "অর্ডার ট্র্যাক করুন",
    startShopping: "কেনাকাটা শুরু করুন",
    continueShopping: "কেনাকাটা চালিয়ে যান",
    noOrdersFound: "কোন অর্ডার পাওয়া যায়নি",
    noOrdersYet: "আপনি এখনো কোন অর্ডার করেননি",
    startShoppingDescription: "আপনার অর্ডার এখানে দেখতে কেনাকাটা শুরু করুন!",

    // Product related
    noProductsFound: "কোন পণ্য পাওয়া যায়নি",
    searchProducts: "পণ্য খুঁজুন...",
    filterByCategory: "বিভাগ অনুযায়ী ফিল্টার করুন",
    allCategories: "সব বিভাগ",
    sortBy: "সাজান",
    newestFirst: "নতুন প্রথমে",
    priceLowToHigh: "মূল্য: কম থেকে বেশি",
    priceHighToLow: "মূল্য: বেশি থেকে কম",
    nameAToZ: "নাম: অ থেকে ঢ",
    highestRated: "সর্বোচ্চ রেটেড",
    mostPopular: "সবচেয়ে জনপ্রিয়",
    priceRange: "মূল্য পরিসীমা",
    inStock: "স্টকে আছে",
    outOfStock: "স্টক শেষ",
    lowStock: "কম স্টক",
    addMoreItems: "+ আরো আইটেম যোগ করুন",

    // Dashboard
    welcomeBack: "ফিরে স্বাগতম",
    quickActions: "দ্রুত কাজ",
    recentOrders: "সাম্প্রতিক অর্ডার",
    recommendedForYou: "আপনার জন্য প্রস্তাবিত",
    browseProducts: "পণ্য ব্রাউজ করুন",
    discoverAmazing: "অসাধারণ হস্তশিল্প আবিষ্কার করুন",
    monitorOrderStatus: "আপনার অর্ডারের অবস্থা পর্যবেক্ষণ করুন",

    // Common actions
    search: "খুঁজুন",
    filter: "ফিল্টার",
    sort: "সাজান",
    apply: "প্রয়োগ করুন",
    clear: "পরিষ্কার করুন",
    close: "বন্ধ করুন",
    back: "ফিরে যান",
    next: "পরবর্তী",
    previous: "আগের",
    save: "সংরক্ষণ করুন",
    edit: "সম্পাদনা করুন",
    delete: "মুছে দিন",
    confirm: "নিশ্চিত করুন",
    cancel: "বাতিল করুন",
    yes: "হ্যাঁ",
    no: "না",
    ok: "ঠিক আছে",

    english: "English",
    hindi: "हिंदी",
    bengali: "বাংলা",
    telugu: "తెలుగు",
    marathi: "मराठी",
    tamil: "தமিழ்",
    gujarati: "ગુજરાતી",
    kannada: "ಕನ್ನಡ",
    odia: "ଓଡ଼ିଆ",
    punjabi: "ਪੰਜਾਬੀ",
    profile: "প্রোফাইল",
    analytics: "বিশ্লেষণ",
    messages: "বার্তা",
    feedback: "প্রতিক্রিয়া",
  },
  te: {
    artisanStudio: "కళాకారుల స్టూడియో",
    dashboard: "డ్యాష్‌బోర్డ్",
    products: "ఉత్పత్తులు",
    addProduct: "ఉత్పత్తిని జోడించండి",
    editProduct: "ఉత్పత్తిని సవరించండి",
    signOut: "సైన్ అవుట్",
    language: "భాష",
    english: "English",
    hindi: "हिंदी",
    bengali: "বাংলা",
    telugu: "తెలుగు",
    marathi: "मराठी",
    tamil: "தமிழ்",
    gujarati: "ગુજરાતી",
    kannada: "ಕನ್ನಡ",
    odia: "ଓଡ଼ିଆ",
    punjabi: "ਪੰਜਾਬੀ",
    profile: "ప్రొఫైల్",
    analytics: "విశ్లేషణలు",
    messages: "సందేశాలు",
    feedback: "అభిప్రాయం",

    // Orders & Shopping
    order: "ఆర్డర్ చేయండి",
    addToCart: "కార్టులో వేయండి",
    buyNow: "ఇప్పుడే కొనండి",
    notifyMe: "నాకు తెలియజేయండి",
    myOrders: "నా ఆర్డర్లు",
    totalOrders: "మొత్తం ఆర్డర్లు",
    pendingOrders: "వేచి ఉన్న",
    shippedOrders: "పంపబడినవి",
    deliveredOrders: "డెలివరీ అయినవి",
    cancelledOrders: "రద్దు చేయబడినవి",
    confirmedOrders: "ధృవీకరించబడినవి",
    orderDetails: "ఆర్డర్ వివరాలు",
    viewDetails: "వివరాలు చూడండి",
    viewAll: "అన్నీ చూడండి",
    browseAll: "అన్నీ బ్రౌజ్ చేయండి",
    trackOrders: "ఆర్డర్లను ట్రాక్ చేయండి",
    startShopping: "షాపింగ్ ప్రారంభించండి",
    continueShopping: "షాపింగ్ కొనసాగించండి",
    noOrdersFound: "ఆర్డర్లు కనుగొనబడలేదు",
    noOrdersYet: "మీరు ఇంకా ఆర్డర్లు చేయలేదు",
    startShoppingDescription:
      "మీ ఆర్డర్లను ఇక్కడ చూడడానికి షాపింగ్ ప్రారంభించండి!",

    // Product related
    noProductsFound: "ఉత్పత్తులు కనుగొనబడలేదు",
    searchProducts: "ఉత్పత్తులను వెతకండి...",
    filterByCategory: "వర్గం ప్రకారం ఫిల్టర్ చేయండి",
    allCategories: "అన్ని వర్గాలు",
    sortBy: "దీని ప్రకారం క్రమబద్ధీకరించండి",
    newestFirst: "కొత్తవి మొదట",
    priceLowToHigh: "ధర: తక్కువ నుండి ఎక్కువ",
    priceHighToLow: "ధర: ఎక్కువ నుండి తక్కువ",
    nameAToZ: "పేరు: అ నుండి హ",
    highestRated: "అత్యధిక రేటింగ్",
    mostPopular: "అత్యంత జనాదరణ పొందిన",
    priceRange: "ధర పరిధి",
    inStock: "స్టాక్‌లో ఉంది",
    outOfStock: "స్టాక్ అయిపోయింది",
    lowStock: "తక్కువ స్టాక్",
    addMoreItems: "+ మరిన్ని వస్తువులు జోడించండి",

    // Dashboard
    welcomeBack: "తిరిగి స్వాగతం",
    quickActions: "త్వరిత చర్యలు",
    recentOrders: "ఇటీవలి ఆర్డర్లు",
    recommendedForYou: "మీ కోసం సిఫార్సు చేయబడినవి",
    browseProducts: "ఉత్పత్తులను బ్రౌజ్ చేయండి",
    discoverAmazing: "అద్భుతమైన హస్తకళలను కనుగొనండి",
    monitorOrderStatus: "మీ ఆర్డర్ స్థితిని పర్యవేక్షించండి",

    // Common actions
    search: "వెతకండి",
    filter: "ఫిల్టర్",
    sort: "క్రమబద్ధీకరించండి",
    apply: "వర్తింపజేయండి",
    clear: "క్లియర్ చేయండి",
    close: "మూసివేయండి",
    back: "వెనుకకు",
    next: "తరువాత",
    previous: "మునుపటి",
    save: "సేవ్ చేయండి",
    edit: "ఎడిట్ చేయండి",
    delete: "తొలగించండి",
    confirm: "ధృవీకరించండి",
    cancel: "రద్దు చేయండి",
    yes: "అవును",
    no: "లేదు",
    ok: "సరే",
  },
  mr: {
    artisanStudio: "कारागीर स्टुडिओ",
    dashboard: "डॅशबोर्ड",
    products: "उत्पादने",
    addProduct: "उत्पादन जोडा",
    editProduct: "उत्पादन संपादित करा",
    signOut: "साइन आउट",
    language: "भाषा",
    english: "English",
    hindi: "हिंदी",
    bengali: "বাংলা",
    telugu: "తెలుగు",
    marathi: "मराठी",
    tamil: "தமிழ்",
    gujarati: "ગુજરાતી",
    kannada: "ಕನ್ನಡ",
    odia: "ଓଡ଼ିଆ",
    punjabi: "ਪੰਜਾਬੀ",
    profile: "प्रोफाइल",
    analytics: "विश्लेषणे",
    messages: "संदेश",
    feedback: "अभिप्राय",

    // Orders & Shopping
    order: "ऑर्डर द्या",
    addToCart: "कार्टमध्ये घाला",
    buyNow: "आत्ता विकत घ्या",
    notifyMe: "मला कळवा",
    myOrders: "माझे ऑर्डर",
    totalOrders: "एकूण ऑर्डर",
    pendingOrders: "प्रलंबित",
    shippedOrders: "पाठवलेले",
    deliveredOrders: "वितरित",
    cancelledOrders: "रद्द",
    confirmedOrders: "पुष्टी केलेले",
    orderDetails: "ऑर्डर तपशील",
    viewDetails: "तपशील पहा",
    viewAll: "सर्व पहा",
    browseAll: "सर्व ब्राउझ करा",
    trackOrders: "ऑर्डर ट्रॅक करा",
    startShopping: "खरेदी सुरू करा",
    continueShopping: "खरेदी सुरू ठेवा",
    noOrdersFound: "कोणतेही ऑर्डर सापडले नाहीत",
    noOrdersYet: "तुम्ही अजूनपर्यंत कोणतेही ऑर्डर दिलेले नाहीत",
    startShoppingDescription: "तुमचे ऑर्डर येथे पाहण्यासाठी खरेदी सुरू करा!",

    // Product related
    noProductsFound: "उत्पादने सापडली नाहीत",
    searchProducts: "उत्पादने शोधा...",
    filterByCategory: "श्रेणीनुसार फिल्टर करा",
    allCategories: "सर्व श्रेणी",
    sortBy: "यानुसार क्रमवारी लावा",
    newestFirst: "नवीन प्रथम",
    priceLowToHigh: "किंमत: कमी ते जास्त",
    priceHighToLow: "किंमत: जास्त ते कमी",
    nameAToZ: "नाव: अ ते ह",
    highestRated: "सर्वोच्च रेटेड",
    mostPopular: "सर्वात लोकप्रिय",
    priceRange: "किंमत श्रेणी",
    inStock: "स्टॉकमध्ये",
    outOfStock: "स्टॉक संपला",
    lowStock: "कमी स्टॉक",
    addMoreItems: "+ अधिक आयटम जोडा",

    // Dashboard
    welcomeBack: "परत स्वागत",
    quickActions: "त्वरित क्रिया",
    recentOrders: "अलीकडील ऑर्डर",
    recommendedForYou: "तुमच्यासाठी शिफारसीत",
    browseProducts: "उत्पादने ब्राउझ करा",
    discoverAmazing: "आश्चर्यकारक हस्तकला शोधा",
    monitorOrderStatus: "तुमच्या ऑर्डरची स्थिती तपासा",

    // Common actions
    search: "शोधा",
    filter: "फिल्टर",
    sort: "क्रमवारी लावा",
    apply: "लागू करा",
    clear: "साफ करा",
    close: "बंद करा",
    back: "मागे",
    next: "पुढे",
    previous: "मागील",
    save: "जतन करा",
    edit: "संपादित करा",
    delete: "हटवा",
    confirm: "पुष्टी करा",
    cancel: "रद्द करा",
    yes: "होय",
    no: "नाही",
    ok: "ठीक आहे",
  },
  ta: {
    artisanStudio: "கலைஞர் ஸ்டுடியோ",
    dashboard: "டாஷ்போர்டு",
    products: "பொருட்கள்",
    addProduct: "பொருள் சேர்க்கவும்",
    editProduct: "பொருளைத் திருத்தவும்",
    signOut: "வெளியேறு",
    language: "மொழி",
    english: "English",
    hindi: "हिंदी",
    bengali: "বাংলা",
    telugu: "తెలుగు",
    marathi: "मराठी",
    tamil: "தமிழ்",
    gujarati: "ગુજરાતી",
    kannada: "ಕನ್ನಡ",
    odia: "ଓଡ଼ିଆ",
    punjabi: "ਪੰਜਾਬੀ",
    profile: "சுயவிவரம்",
    analytics: "பகுப்பாய்வு",
    messages: "செய்திகள்",
    feedback: "கருத்து",
  },
  gu: {
    artisanStudio: "કલાકાર સ્ટુડિયો",
    dashboard: "ડેશબોર્ડ",
    products: "ઉત્પાદનો",
    addProduct: "ઉત્પાદન ઉમેરો",
    editProduct: "ઉત્પાદન સંપાદિત કરો",
    signOut: "સાઇન આઉટ",
    language: "ભાષા",
    english: "English",
    hindi: "हिंदी",
    bengali: "বাংলা",
    telugu: "తెలుగు",
    marathi: "मराठी",
    tamil: "தமிழ্",
    gujarati: "ગુજરાતી",
    kannada: "ಕನ್ನಡ",
    odia: "ଓଡ଼ିଆ",
    punjabi: "ਪੰਜਾਬੀ",
    profile: "પ્રોફાઇલ",
    analytics: "વિશ્લેષણ",
    messages: "સંદેશા",
    feedback: "પ્રતિસાદ",
  },
  kn: {
    artisanStudio: "ಕಲಾವಿದರ ಸ್ಟುಡಿಯೋ",
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    products: "ಉತ್ಪಾದನೆಗಳು",
    addProduct: "ಉತ್ಪಾದನೆ ಸೇರಿಸಿ",
    editProduct: "ಉತ್ಪಾದನೆ ಸಂಪಾದಿಸಿ",
    signOut: "ಸೈನ್ ಔಟ್",
    language: "ಭಾಷೆ",
    english: "English",
    hindi: "हिंदी",
    bengali: "বাংলা",
    telugu: "తెలుగు",
    marathi: "मराठी",
    tamil: "தமிழ্",
    gujarati: "ગુજરાતી",
    kannada: "ಕನ್ನಡ",
    odia: "ଓଡ଼ିଆ",
    punjabi: "ਪੰਜਾਬੀ",
    profile: "ಪ್ರೊಫೈಲ್",
    analytics: "ವಿಶ್ಲೇಷಣೆ",
    messages: "ಸಂದೇಶಗಳು",
    feedback: "ಪ್ರತಿಕ್ರಿಯೆ",
  },
  or: {
    artisanStudio: "କଳାକାର ଷ୍ଟୁଡିଓ",
    dashboard: "ଡ୍ୟାସବୋର୍ଡ",
    products: "ଉତ୍ପାଦ",
    addProduct: "ଉତ୍ପାଦ ଯୋଡନ୍ତୁ",
    editProduct: "ଉତ୍ପାଦ ସମ୍ପାଦନା କରନ୍ତୁ",
    signOut: "ସାଇନ ଆଉଟ",
    language: "ଭାଷା",
    english: "English",
    hindi: "हिंदी",
    bengali: "বাংলা",
    telugu: "తెలుగు",
    marathi: "मराठी",
    tamil: "তমিழ়",
    gujarati: "ગુજરાતી",
    kannada: "ಕನ್ನಡ",
    odia: "ଓଡ଼ିଆ",
    punjabi: "ਪੰਜਾਬੀ",
    profile: "ପ୍ରୋଫାଇଲ",
    analytics: "ବିଶ୍ଳେଷଣ",
    messages: "ସନ୍ଦେଶ",
    feedback: "ମତାମତ",
  },
  pa: {
    artisanStudio: "ਕਲਾਕਾਰ ਸਟੂਡੀਓ",
    dashboard: "ਡੈਸ਼ਬੋਰਡ",
    products: "ਉਤਪਾਦ",
    addProduct: "ਉਤਪਾਦ ਸ਼ਾਮਿਲ ਕਰੋ",
    editProduct: "ਉਤਪਾਦ ਸੰਪਾਦਿਤ ਕਰੋ",
    signOut: "ਸਾਇਨ ਆਊਟ",
    language: "ਭਾਸ਼ਾ",
    english: "English",
    hindi: "हिंदी",
    bengali: "বাংলা",
    telugu: "తెలుగు",
    marathi: "मराठी",
    tamil: "தমিழ়",
    gujarati: "ગુજરાતી",
    kannada: "ಕನ್ನಡ",
    odia: "ଓଡ଼ିଆ",
    punjabi: "ਪੰਜਾਬੀ",
    profile: "ਪ੍ਰੋਫਾਈਲ",
    analytics: "ਵਿਸ਼ਲੇਸ਼ਣ",
    messages: "ਸੰਦੇਸ਼",
    feedback: "ਫੀਡਬੈਕ",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("en");

  const t = (key: string): string => {
    const translation = translations[language][key] || translations.en[key];
    if (!translation) {
      // Fallback for missing translations - this ensures all keys work
      const fallbackTranslations: Record<string, string> = {
        addToCart:
          language === "hi"
            ? "कार्ट में डालें"
            : language === "bn"
            ? "কার্টে যোগ করুন"
            : language === "te"
            ? "కార్ట్‌లో వేయండి"
            : language === "mr"
            ? "कार्टात घाला"
            : language === "ta"
            ? "கூடையில் சேர்க்கவும்"
            : language === "gu"
            ? "કાર્ટમાં ઉમેરો"
            : language === "kn"
            ? "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ"
            : language === "or"
            ? "କାର୍ଟରେ ଯୋଗ କରନ୍ତୁ"
            : language === "pa"
            ? "ਕਾਰਟ ਵਿੱਚ ਪਾਓ"
            : "Add to Cart",
        notifyMe:
          language === "hi"
            ? "मुझे सूचित करें"
            : language === "bn"
            ? "আমাকে জানান"
            : language === "te"
            ? "నాకు తెలియజేయండి"
            : language === "mr"
            ? "मला सूचित करा"
            : language === "ta"
            ? "எனக்கு தெரிவிக்கவும்"
            : language === "gu"
            ? "મને જણાવો"
            : language === "kn"
            ? "ನನಗೆ ತಿಳಿಸಿ"
            : language === "or"
            ? "ମୋତେ ଜଣାନ୍ତୁ"
            : language === "pa"
            ? "ਮੈਨੂੰ ਦੱਸੋ"
            : "Notify Me",
        order:
          language === "hi"
            ? "ऑर्डर करें"
            : language === "bn"
            ? "অর্ডার করুন"
            : language === "te"
            ? "ఆర్డర్ చేయండి"
            : language === "mr"
            ? "ऑर्डर करा"
            : language === "ta"
            ? "ஆர்டர் செய்யுங்கள்"
            : language === "gu"
            ? "ઓર્ડર કરો"
            : language === "kn"
            ? "ಆರ್ಡರ್ ಮಾಡಿ"
            : language === "or"
            ? "ଅର୍ଡର କରନ୍ତୁ"
            : language === "pa"
            ? "ਆਰਡਰ ਕਰੋ"
            : "Order",
        clear:
          language === "hi"
            ? "साफ़ करें"
            : language === "bn"
            ? "পরিষ্কার করুন"
            : language === "te"
            ? "క్లియర్ చేయండి"
            : language === "mr"
            ? "साफ करा"
            : language === "ta"
            ? "அழிக்கவும்"
            : language === "gu"
            ? "સાફ કરો"
            : language === "kn"
            ? "ಸ್ಪಷ್ಟಗೊಳಿಸಿ"
            : language === "or"
            ? "ସଫା କରନ୍ତୁ"
            : language === "pa"
            ? "ਸਾਫ਼ ਕਰੋ"
            : "Clear",
        searchProducts:
          language === "hi"
            ? "उत्पाद खोजें..."
            : language === "bn"
            ? "পণ্য খুঁজুন..."
            : language === "te"
            ? "ఉత్పత్తులను వెతకండి..."
            : language === "mr"
            ? "उत्पादने शोधा..."
            : language === "ta"
            ? "தயாரிப்புகளைத் தேடுங்கள்..."
            : language === "gu"
            ? "ઉત્પાદનો શોધો..."
            : language === "kn"
            ? "ಉತ್ಪಾದನೆಗಳನ್ನು ಹುಡುಕಿ..."
            : language === "or"
            ? "ଉତ୍ପାଦ ଖୋଜନ୍ତୁ..."
            : language === "pa"
            ? "ਉਤਪਾਦ ਖੋਜੋ..."
            : "Search products...",
        noProductsFound:
          language === "hi"
            ? "कोई उत्पाद नहीं मिला"
            : language === "bn"
            ? "কোন পণ্য পাওয়া যায়নি"
            : language === "te"
            ? "ఉత్పత్తులు కనుగొనబడలేదు"
            : language === "mr"
            ? "कोणतीही उत्पादने सापडली नाहीत"
            : language === "ta"
            ? "தயாரிப்புகள் எதுவும் கிடைக்கவில்லை"
            : language === "gu"
            ? "કોઈ ઉત્પાદનો મળ્યા નથી"
            : language === "kn"
            ? "ಯಾವುದೇ ಉತ್ಪಾದನೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ"
            : language === "or"
            ? "କୌଣସି ଉତ୍ପାଦ ମିଳିଲା ନାହିଁ"
            : language === "pa"
            ? "ਕੋਈ ਉਤਪਾਦ ਨਹੀਂ ਮਿਲਿਆ"
            : "No products found",
      };
      return fallbackTranslations[key] || key;
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const languages: { code: Language; name: string; nativeName: string }[] =
  [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिंदी" },
    { code: "bn", name: "Bengali", nativeName: "বাংলা" },
    { code: "te", name: "Telugu", nativeName: "తెలుగు" },
    { code: "mr", name: "Marathi", nativeName: "मराठी" },
    { code: "ta", name: "Tamil", nativeName: "தমিழ়" },
    { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
    { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
    { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
    { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  ];
