// Simple translation system for demo
export type Language = 'en' | 'fi';

export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    donate: 'Donate',
    request: 'Request',
    profile: 'Profile',
    
    // Common
    welcome: 'Welcome',
    login: 'Login',
    register: 'Register',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    loading: 'Loading...',
    
    // Donation
    createDonation: 'Create Donation',
    foodItem: 'Food Item',
    quantity: 'Quantity',
    pickupTime: 'Pickup Time',
    description: 'Description',
    
    // Demo specific
    goodToSeeYou: 'Good to see you!',
    testDonor: 'Test Donor',
    language: 'Language',
    english: 'English',
    finnish: 'Finnish',
    
    // Additional common terms
    explore: 'Explore',
    analytics: 'Analytics',
    overview: 'Overview',
    activity: 'Your activity',
    noActivity: "You don't have any active donations or requests",
  },
  fi: {
    // Navigation
    dashboard: 'Kojelauta',
    donate: 'Lahjoita',
    request: 'Pyydä',
    profile: 'Profiili',
    
    // Common
    welcome: 'Tervetuloa',
    login: 'Kirjaudu',
    register: 'Rekisteröidy',
    save: 'Tallenna',
    cancel: 'Peruuta',
    submit: 'Lähetä',
    loading: 'Ladataan...',
    
    // Donation
    createDonation: 'Luo Lahjoitus',
    foodItem: 'Ruoka-aine',
    quantity: 'Määrä',
    pickupTime: 'Noutaika',
    description: 'Kuvaus',
    
    // Demo specific
    goodToSeeYou: 'Hyvä nähdä sinut!',
    testDonor: 'Testi Lahjoittaja',
    language: 'Kieli',
    english: 'Englanti',
    finnish: 'Suomi',
    
    // Additional common terms
    explore: 'Tutki',
    analytics: 'Analytiikka',
    overview: 'Yleiskatsaus',
    activity: 'Toimintasi',
    noActivity: 'Sinulla ei ole aktiivisia lahjoituksia tai pyyntöjä',
  }
} as const;

export type TranslationKey = keyof typeof translations.en;