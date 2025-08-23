// English translations - static file
// Sourced from Lokalise, updated manually as needed

export const en = {
  // Common actions
  add: "Add",
  back: "Back",
  cancel: "Cancel",
  continue: "Continue",
  delete: "Delete",
  edit: "Edit",
  save: "Save",
  submit: "Submit",
  loading: "Loading...",
  
  // Dashboard
  dashboard: "Dashboard",
  goodToSeeYou: "Hello! Let's turn food waste into impact.",
  
  // Impact metrics
  totalFoodDonated: "Food Rescued",
  donations: "Donations", 
  costSavings: "Cost Saved",
  co2Avoided: "CO₂ Prevented",
  portionsOffered: "Portions Offered",
  savedInFoodDisposalCosts: "Saved in Food Disposal Costs",
  emissionReduction: "Emission Reduction",
  
  // Navigation
  profile: "Profile",
  logout: "Logout",
  
  // Food donation
  donate: "Create listing",
  createDonation: "Create new listing",
  donationCreated: "Listing created successfully!",
  nameOfFood: "Name of food",
  quantity: "Quantity",
  description: "Description",
  address: "Address",
  
  // Auth
  email: "Email",
  password: "Password", 
  login: "Login",
  register: "Register",
  signIn: "Sign in",
  signUp: "Sign up",
  welcomeBack: "Welcome back",
  signInToAccount: "Sign in to your account",
  dontHaveAccount: "Don't have an account?",
  forgotPassword: "Forgot your password?",
  rememberMe: "Remember me",
  signingIn: "Signing in...",
  invalidEmailPassword: "Invalid email or password",
  networkError: "Network error. Please try again.",
  resetPasswordDesc: "Enter your email to receive a reset link",
  sendResetLink: "Send Reset Link",
  sendingResetLink: "Sending...",
  backToLogin: "Back to Login",
  checkEmail: "Check your email for reset instructions",
  resetPassword: "Reset Password",
  newPassword: "New Password",
  confirmPassword: "Confirm Password",
  confirmNewPassword: "Confirm New Password",
  updatePassword: "Update Password",
  updatingPassword: "Updating...",
  passwordUpdated: "Password updated successfully",
  createAccount: "Create Account",
  creatingAccount: "Creating Account...",
  alreadyHaveAccount: "Already have an account?",
  
  // Forms
  required: "Required",
  optional: "Optional",
  fieldRequired: "This field is required",
  
  // Errors
  error: "Error",
  somethingWentWrong: "Something went wrong",
  
  // Common words
  available: "Available",
  claimed: "Claimed",
  cancelled: "Cancelled",
  from: "from",
  until: "Until",
  today: "Today",
  tomorrow: "Tomorrow",
  
} as const;

export type TranslationKey = keyof typeof en;