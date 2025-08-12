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
    anErrorOccurred: 'An error occurred. Please try again.',
    
    // Common Actions
    saving: 'Saving...',
    saveChanges: 'Save Changes',
    editProfile: 'Edit Profile',
    logout: 'Logout',
    loggingOut: 'Logging out...',
    notSet: 'Not set',
    detail: 'Detail',
    donationLabel: 'Donation',
    showMore: 'Show more',
    showLess: 'Show less',
    selectAllergens: 'Select allergens',
    photosHelpIdentify: 'Photos help receivers identify your food items',
    placeholderFoodName: 'e.g. Bread, Rice, etc.',
    placeholderQuantity: 'e.g. 10',
    placeholderDescription: 'e.g. A delicious and healthy meal.',
    
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
    
    // Donation Dashboard
    yourImpact: 'Your impact',
    totalFoodOffered: 'Total food offered',
    portionsOffered: 'Portions offered',
    savedInFoodDisposalCosts: 'Saved in food disposal costs',
    co2Avoided: 'CO2 Avoided',
    exportToPdf: 'Export to PDF',
    environmentalAndSocialImpactData: 'Environmental and social impact data for reporting, and operation planning.',
    thisIsWhomYouveHelped: 'This is whom you\'ve helped',
    
    // Manual Donation Form
    nameOfFood: 'Name of food',
    quantityKg: 'Quantity (kg)',
    addFoodItem: 'Add food item',
    editFoodItem: 'Edit food item',
    currentItemsInDonation: 'Current Items in Donation',
    addAnotherItem: 'Add another item',
    addItem: 'Add item',
    changesSaved: 'Changes saved',
    goBackToDashboard: 'Go back to Dashboard',
    noDonationItemsFound: 'No donation items found.',
    startNewDonation: 'Start New Donation',
    createDonationLong: 'Create donation',
    typeDonationManually: 'Type donation manually',
    itOnlyTakesFewMinutes: 'It only takes a few minutes',
    
    // Pickup Slot Management
    addPickupSlot: 'Add pickup slot',
    editPickupSlot: 'Edit pickup slot',
    addAnotherPickupSlot: 'Add another pickup slot',
    addAnother: '+ Add another',
    dateNotSet: 'Date not set',
    
    // Donation Summary
    donationSummary: 'Donation summary',
    donationItems: 'Donation items',
    pickupSchedule: 'Pickup schedule',
    deliveryDetails: 'Delivery details',
    instructionsForDriver: 'Instructions for driver',
    enterYourFullAddress: 'Enter your full address',
    pleaseRingTheDoorbell: 'e.g. Please ring the doorbell',
    updateAddressInProfile: 'Also update this address in my profile for future donations',
    updateInstructionsInProfile: 'Also update these instructions in my profile as default',
    continuing: 'Continuing...',
    
    // Feed Page
    exploreAvailableDonations: 'Explore available donations',
    searchDonations: 'Search donations...',
    noDonationsFound: 'No donations found',
    noDonationsMatchingSearch: 'There are no available donations matching your search.',
    
    // Request Flow - New Request Page
    newRequest: 'New request',
    recurringInterval: 'Recurring interval',
    selectInterval: 'Select interval',
    daily: 'Daily',
    weekly: 'Weekly', 
    monthly: 'Monthly',
    quantityPortions: 'Quantity (portions)',
    enterQuantity: 'Enter quantity',
    allergiesIntolerancesDiets: 'Allergies, intolerances & diets',
    selectDietaryRestrictions: 'Select dietary restrictions...',
    requestHintText: 'This is a hint text.',
    requestOnlyAllowsPreselected: 'Zipli only allows to request according to a preselected set of options.',
    
    // Request Flow - Pickup Slot Page  
    pickupSlot: 'Pickup slot',
    whenDoYouNeed: 'When do you need',
    selectADay: 'Select a day',
    selectDate: 'Select date',
    startTime: 'Start time',
    endTime: 'End time',
    
    // Request Flow - Summary Page
    requestSummary: 'Request summary',
    oneTime: 'One-time',
    portions: 'portions',
    nextSteps: 'Next steps',
    requestSubmitted: 'Request submitted',
    requestAddedToSystem: 'Your request has been added to our system',
    matchingInProgress: 'Matching in progress',
    lookingForMatches: 'We\'re looking for donations that match your criteria',
    getNotified: 'Get notified',
    receiveNotificationWhenMatch: 'You\'ll receive a notification when we find a match',
    submitRequest: 'Submit request',
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
    anErrorOccurred: 'Virhe tapahtui. Yritä uudelleen.',
    
    // Common Actions
    saving: 'Tallennetaan...',
    saveChanges: 'Tallenna muutokset',
    editProfile: 'Muokkaa profiilia',
    logout: 'Kirjaudu ulos',
    loggingOut: 'Kirjaudutaan ulos...',
    notSet: 'Ei asetettu',
    detail: 'Lisätiedot',
    donationLabel: 'Lahjoitus',
    showMore: 'Näytä lisää',
    showLess: 'Näytä vähemmän',
    selectAllergens: 'Valitse allergeenit',
    photosHelpIdentify: 'Kuvat auttavat vastaanottajia tunnistamaan ruoka-aineet',
    placeholderFoodName: 'esim. Leipä, Riisi, jne.',
    placeholderQuantity: 'esim. 10',
    placeholderDescription: 'esim. Herkullinen ja terveellinen ateria.',
    
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
    
    // Donation Dashboard
    yourImpact: 'Vaikutuksesi',
    totalFoodOffered: 'Tarjottu ruoka yhteensä',
    portionsOffered: 'Tarjotut annokset',
    savedInFoodDisposalCosts: 'Säästetty ruoan hävityskustannuksissa',
    co2Avoided: 'Vältetty CO2',
    exportToPdf: 'Vie PDF:ksi',
    environmentalAndSocialImpactData: 'Ympäristö- ja sosiaalisen vaikutuksen tiedot raportointia ja toiminnan suunnittelua varten.',
    thisIsWhomYouveHelped: 'Näitä olet auttanut',
    
    // Manual Donation Form
    nameOfFood: 'Ruoan nimi',
    quantityKg: 'Määrä (kg)',
    addFoodItem: 'Lisää ruoka-aine',
    editFoodItem: 'Muokkaa ruoka-ainetta',
    currentItemsInDonation: 'Nykyiset tuotteet lahjoituksessa',
    addAnotherItem: 'Lisää toinen tuote',
    addItem: 'Lisää tuote',
    changesSaved: 'Muutokset tallennettu',
    goBackToDashboard: 'Palaa kojelautaan',
    noDonationItemsFound: 'Lahjoitustuotteita ei löytynyt.',
    startNewDonation: 'Aloita uusi lahjoitus',
    createDonationLong: 'Luo lahjoitus',
    typeDonationManually: 'Kirjoita lahjoitus käsin',
    itOnlyTakesFewMinutes: 'Se kestää vain muutaman minuutin',
    
    // Pickup Slot Management
    addPickupSlot: 'Lisää noutopaikka',
    editPickupSlot: 'Muokkaa noutopaikka',
    addAnotherPickupSlot: 'Lisää toinen noutopaikka',
    addAnother: '+ Lisää toinen',
    dateNotSet: 'Päivämäärää ei asetettu',
    
    // Donation Summary
    donationSummary: 'Lahjoituksen yhteenveto',
    donationItems: 'Lahjoitustuotteet',
    pickupSchedule: 'Noutaikataulu',
    deliveryDetails: 'Toimitusten tiedot',
    instructionsForDriver: 'Ohjeet kuljettajalle',
    enterYourFullAddress: 'Syötä koko osoitteesi',
    pleaseRingTheDoorbell: 'esim. Soita ovikelloa',
    updateAddressInProfile: 'Päivitä tämä osoite myös profiiliini tulevia lahjoituksia varten',
    updateInstructionsInProfile: 'Päivitä nämä ohjeet myös profiiliini oletuksena',
    continuing: 'Jatketaan...',
    
    // Feed Page
    exploreAvailableDonations: 'Tutki saatavilla olevia lahjoituksia',
    searchDonations: 'Hae lahjoituksia...',
    noDonationsFound: 'Lahjoituksia ei löytynyt',
    noDonationsMatchingSearch: 'Haullasi ei löytynyt saatavilla olevia lahjoituksia.',
    
    // Request Flow - New Request Page
    newRequest: 'Uusi pyyntö',
    recurringInterval: 'Toistuvuusväli',
    selectInterval: 'Valitse väli',
    daily: 'Päivittäin',
    weekly: 'Viikoittain', 
    monthly: 'Kuukausittain',
    quantityPortions: 'Määrä (annokset)',
    enterQuantity: 'Syötä määrä',
    allergiesIntolerancesDiets: 'Allergiat, intoleranssit ja ruokavaliot',
    selectDietaryRestrictions: 'Valitse ruokavaliorajoitukset...',
    requestHintText: 'Tämä on vihjeteksti.',
    requestOnlyAllowsPreselected: 'Zipli sallii pyynnön vain ennalta valittujen vaihtoehtojen mukaan.',
    
    // Request Flow - Pickup Slot Page  
    pickupSlot: 'Noutopaikka',
    whenDoYouNeed: 'Milloin tarvitset',
    selectADay: 'Valitse päivä',
    selectDate: 'Valitse päivämäärä',
    startTime: 'Aloitusaika',
    endTime: 'Lopetusaika',
    
    // Request Flow - Summary Page
    requestSummary: 'Pyynnön yhteenveto',
    oneTime: 'Kertaluontoinen',
    portions: 'annosta',
    nextSteps: 'Seuraavat vaiheet',
    requestSubmitted: 'Pyyntö lähetetty',
    requestAddedToSystem: 'Pyyntösi on lisätty järjestelmään',
    matchingInProgress: 'Vastaavuushaku käynnissä',
    lookingForMatches: 'Etsimme lahjoituksia, jotka vastaavat kriteerejäsi',
    getNotified: 'Saat ilmoituksen',
    receiveNotificationWhenMatch: 'Saat ilmoituksen kun löydämme sopivan lahjoituksen',
    submitRequest: 'Lähetä pyyntö',
  }
} as const;

export type TranslationKey = keyof typeof translations.en;