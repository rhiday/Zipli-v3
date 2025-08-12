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
    back: 'Back',
    next: 'Next',
    continue: 'Continue',
    finish: 'Finish',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    remove: 'Remove',
    
    // Donation Flow
    createDonation: 'Create Donation',
    newDonation: 'New Donation',
    foodItem: 'Food Item',
    quantity: 'Quantity',
    pickupTime: 'Pickup Time',
    description: 'Description',
    allergens: 'Allergens',
    addPhoto: 'Add Photo',
    voiceInput: 'Voice Input',
    manualEntry: 'Manual Entry',
    schedulePickup: 'Schedule Pickup',
    reviewDonation: 'Review Donation',
    confirmDonation: 'Confirm Donation',
    donationCreated: 'Donation Created Successfully!',
    
    // Request Flow
    browseFood: 'Browse Food',
    claimFood: 'Claim Food',
    availableNow: 'Available Now',
    pickupBy: 'Pickup by',
    claimedBy: 'Claimed by',
    
    // Dashboard
    totalDonations: 'Total Donations',
    activeDonations: 'Active Donations',
    completedDonations: 'Completed Donations',
    impactSummary: 'Impact Summary',
    recentActivity: 'Recent Activity',
    
    // Profile
    personalInfo: 'Personal Information',
    organizationInfo: 'Organization Information',
    contactDetails: 'Contact Details',
    preferences: 'Preferences',
    notifications: 'Notifications',
    
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
    
    // Status
    available: 'Available',
    claimed: 'Claimed',
    pickedUp: 'Picked Up',
    cancelled: 'Cancelled',
    
    // Time
    today: 'Today',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    
    // Actions
    startVoiceInput: 'Start Voice Input',
    pressForVoiceInput: 'Press for voice input',
    listening: 'Listening...',
    processing: 'Processing...',
    
    // Auth Pages
    welcomeBack: 'Welcome back',
    signInToAccount: 'Sign in to your account',
    emailAddress: 'Email address',
    password: 'Password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot your password?',
    signIn: 'Sign in',
    signingIn: 'Signing in...',
    dontHaveAccount: "Don't have an account?",
    signUp: 'Sign up',
    
    // Register Page
    createAccount: 'Create your account',
    joinZipli: 'Join Zipli to start sharing food',
    fullName: 'Full Name',
    organizationName: 'Organization Name',
    confirmPassword: 'Confirm Password',
    createAccountBtn: 'Create Account',
    creatingAccount: 'Creating Account...',
    alreadyHaveAccount: 'Already have an account?',
    
    // Forgot Password
    resetPassword: 'Reset Password',
    resetPasswordDesc: 'Enter your email to receive a reset link',
    sendResetLink: 'Send Reset Link',
    sendingResetLink: 'Sending...',
    backToLogin: 'Back to Login',
    
    // Reset Password
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    updatePassword: 'Update Password',
    updatingPassword: 'Updating...',
    
    // Common Form
    required: 'Required',
    optional: 'Optional',
    
    // Profile Page
    email: 'Email',
    fullNameLabel: 'Full Name',
    organizationNameLabel: 'Organization Name',
    role: 'Role',
    address: 'Address',
    contactNumber: 'Contact Number',
    defaultDriverInstructions: 'Default Driver Instructions',
    foodDonor: 'Food Donor (Restaurants, Catering, etc.)',
    foodReceiver: 'Food Receiver (Charities, Shelters, etc.)',
    city: 'City Administrator',
    terminalOperator: 'Terminal Operator',
    cityOfficial: 'City Official',
    iAmA: 'I am a',
    
    // Error Messages
    invalidEmailPassword: 'Invalid email or password',
    networkError: 'Network error. Please try again.',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    fieldRequired: 'This field is required',
    passwordsDoNotMatch: 'Passwords do not match',
    passwordTooShort: 'Password must be at least 6 characters long',
    
    // Common Actions
    saving: 'Saving...',
    saveChanges: 'Save Changes',
    editProfile: 'Edit Profile',
    logout: 'Logout',
    loggingOut: 'Logging out...',
    notSet: 'Not set',
    
    // Request Flow
    newRequest: 'New request',
    pickupSlot: 'Pickup slot',
    selectInterval: 'Select interval',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    enterQuantity: 'Enter quantity',
    whenDoYouNeed: 'When do you need',
    selectDay: 'Select a day',
    startTime: 'Start time',
    endTime: 'End time',
  },
  fi: {
    // Navigation
    dashboard: 'Kojelauta',
    donate: 'Lahjoita',
    request: 'Pyydä',
    profile: 'Profiili',
    
    // Common
    welcome: 'Tervetuloa',
    login: 'Kirjaudu sisään',
    register: 'Rekisteröidy',
    save: 'Tallenna',
    cancel: 'Peruuta',
    submit: 'Lähetä',
    loading: 'Ladataan...',
    back: 'Takaisin',
    next: 'Seuraava',
    continue: 'Jatka',
    finish: 'Valmis',
    edit: 'Muokkaa',
    delete: 'Poista',
    add: 'Lisää',
    remove: 'Poista',
    
    // Donation Flow
    createDonation: 'Luo Lahjoitus',
    newDonation: 'Uusi Lahjoitus',
    foodItem: 'Ruoka-aine',
    quantity: 'Määrä',
    pickupTime: 'Noutaika',
    description: 'Kuvaus',
    allergens: 'Allergeenit',
    addPhoto: 'Lisää Kuva',
    voiceInput: 'Äänisyöte',
    manualEntry: 'Manuaalinen Syöttö',
    schedulePickup: 'Ajoita Nouto',
    reviewDonation: 'Tarkista Lahjoitus',
    confirmDonation: 'Vahvista Lahjoitus',
    donationCreated: 'Lahjoitus Luotu Onnistuneesti!',
    
    // Request Flow
    browseFood: 'Selaa Ruokaa',
    claimFood: 'Varaa Ruoka',
    availableNow: 'Saatavilla Nyt',
    pickupBy: 'Nouto mennessä',
    claimedBy: 'Varannut',
    
    // Dashboard
    totalDonations: 'Lahjoitukset Yhteensä',
    activeDonations: 'Aktiiviset Lahjoitukset',
    completedDonations: 'Valmiit Lahjoitukset',
    impactSummary: 'Vaikutusyhteenveto',
    recentActivity: 'Viimeaikainen Toiminta',
    
    // Profile
    personalInfo: 'Henkilötiedot',
    organizationInfo: 'Organisaatiotiedot',
    contactDetails: 'Yhteystiedot',
    preferences: 'Asetukset',
    notifications: 'Ilmoitukset',
    
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
    
    // Status
    available: 'Saatavilla',
    claimed: 'Varattu',
    pickedUp: 'Noudettu',
    cancelled: 'Peruutettu',
    
    // Time
    today: 'Tänään',
    tomorrow: 'Huomenna',
    thisWeek: 'Tällä Viikolla',
    
    // Actions
    startVoiceInput: 'Aloita Äänisyöte',
    pressForVoiceInput: 'Paina äänisyötettä varten',
    listening: 'Kuuntelee...',
    processing: 'Käsittelee...',
    
    // Auth Pages
    welcomeBack: 'Tervetuloa takaisin',
    signInToAccount: 'Kirjaudu tilillesi',
    emailAddress: 'Sähköpostiosoite',
    password: 'Salasana',
    rememberMe: 'Muista minut',
    forgotPassword: 'Unohditko salasanan?',
    signIn: 'Kirjaudu sisään',
    signingIn: 'Kirjaudutaan sisään...',
    dontHaveAccount: 'Eikö sinulla ole tiliä?',
    signUp: 'Rekisteröidy',
    
    // Register Page
    createAccount: 'Luo tilisi',
    joinZipli: 'Liity Zipliin ja ala jakaa ruokaa',
    fullName: 'Koko nimi',
    organizationName: 'Organisaation nimi',
    confirmPassword: 'Vahvista salasana',
    createAccountBtn: 'Luo tili',
    creatingAccount: 'Luodaan tiliä...',
    alreadyHaveAccount: 'Onko sinulla jo tili?',
    
    // Forgot Password
    resetPassword: 'Nollaa salasana',
    resetPasswordDesc: 'Syötä sähköpostiosoitteesi saadaksesi nollauslinkki',
    sendResetLink: 'Lähetä nollauslinkki',
    sendingResetLink: 'Lähetetään...',
    backToLogin: 'Takaisin kirjautumiseen',
    
    // Reset Password
    newPassword: 'Uusi salasana',
    confirmNewPassword: 'Vahvista uusi salasana',
    updatePassword: 'Päivitä salasana',
    updatingPassword: 'Päivitetään...',
    
    // Common Form
    required: 'Pakollinen',
    optional: 'Valinnainen',
    
    // Profile Page
    email: 'Sähköposti',
    fullNameLabel: 'Koko nimi',
    organizationNameLabel: 'Organisaation nimi',
    role: 'Rooli',
    address: 'Osoite',
    contactNumber: 'Puhelinnumero',
    defaultDriverInstructions: 'Kuljettajan oletusohjeet',
    foodDonor: 'Ruoan lahjoittaja (Ravintolat, Catering, jne.)',
    foodReceiver: 'Ruoan vastaanottaja (Hyväntekeväisyys, Turvakoti, jne.)',
    city: 'Kaupungin ylläpitäjä',
    terminalOperator: 'Terminaalin käyttäjä',
    cityOfficial: 'Kaupungin virkamies',
    iAmA: 'Olen',
    
    // Error Messages
    invalidEmailPassword: 'Virheellinen sähköposti tai salasana',
    networkError: 'Verkkovirhe. Yritä uudelleen.',
    emailRequired: 'Sähköposti vaaditaan',
    passwordRequired: 'Salasana vaaditaan',
    fieldRequired: 'Tämä kenttä on pakollinen',
    passwordsDoNotMatch: 'Salasanat eivät täsmää',
    passwordTooShort: 'Salasanan täytyy olla vähintään 6 merkkiä pitkä',
    
    // Common Actions
    saving: 'Tallennetaan...',
    saveChanges: 'Tallenna muutokset',
    editProfile: 'Muokkaa profiilia',
    logout: 'Kirjaudu ulos',
    loggingOut: 'Kirjaudutaan ulos...',
    notSet: 'Ei asetettu',
    
    // Request Flow
    newRequest: 'Uusi pyyntö',
    pickupSlot: 'Noutopaikka',
    selectInterval: 'Valitse väli',
    daily: 'Päivittäin',
    weekly: 'Viikoittain',
    monthly: 'Kuukausittain',
    enterQuantity: 'Syötä määrä',
    whenDoYouNeed: 'Milloin tarvitset',
    selectDay: 'Valitse päivä',
    startTime: 'Alkamisaika',
    endTime: 'Päättymisaika',
  }
} as const;

export type TranslationKey = keyof typeof translations.en;