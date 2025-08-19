const fs = require('fs');
const path = require('path');

// This script helps generate translation files for the remaining languages
// You can use Google Translate API or other translation services to populate these

const languages = [
  { code: 'fr', name: 'French' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' }
];

const baseTranslations = {
  common: {
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    submit: "Submit",
    back: "Back",
    next: "Next",
    previous: "Previous",
    close: "Close",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Information"
  },
  navigation: {
    dashboard: "Dashboard",
    transactions: "Transactions",
    transfers: "Transfers",
    cards: "Cards",
    fixedDeposits: "Fixed Deposits",
    profile: "Profile",
    settings: "Settings",
    logout: "Logout",
    login: "Login",
    register: "Register",
    home: "Home",
    features: "Features",
    support: "Support"
  },
  auth: {
    login: "Login",
    register: "Register",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    firstName: "First Name",
    lastName: "Last Name",
    phone: "Phone Number",
    forgotPassword: "Forgot Password?",
    rememberMe: "Remember Me",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",
    signUp: "Sign Up",
    signIn: "Sign In",
    logout: "Logout",
    loginSuccess: "Login successful!",
    registerSuccess: "Registration successful!",
    invalidCredentials: "Invalid email or password",
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
    passwordMinLength: "Password must be at least 8 characters",
    passwordsDoNotMatch: "Passwords do not match",
    emailAlreadyExists: "Email already exists",
    verificationEmailSent: "Verification email sent!",
    emailVerified: "Email verified successfully!"
  }
};

console.log('🌍 Translation Generator for Global Dot Bank');
console.log('============================================\n');

languages.forEach(lang => {
  const filePath = path.join(__dirname, '..', 'src', 'locales', `${lang.code}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`📝 Creating ${lang.name} translation file...`);
    
    // Create a basic structure with English as placeholder
    const translationFile = {
      ...baseTranslations,
      // Add more sections as needed
      language: {
        selectLanguage: "Select Language",
        english: "English",
        thai: "ไทย",
        french: "Français",
        hindi: "हिंदी",
        tamil: "தமிழ்",
        chinese: "中文",
        japanese: "日本語"
      }
    };
    
    fs.writeFileSync(filePath, JSON.stringify(translationFile, null, 2));
    console.log(`✅ Created ${filePath}`);
    console.log(`   Please translate the content in this file to ${lang.name}\n`);
  } else {
    console.log(`✅ ${lang.name} translation file already exists: ${filePath}\n`);
  }
});

console.log('🎯 Next Steps:');
console.log('1. Translate the content in each language file');
console.log('2. Update the i18n.ts file to import the new translations');
console.log('3. Test the language switcher with the new languages');
console.log('4. Consider using translation services like Google Translate API for bulk translation'); 