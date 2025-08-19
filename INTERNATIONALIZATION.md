# 🌍 Global Dot Bank - Internationalization (i18n) Guide

## Overview

Global Dot Bank now supports **7 languages** to serve our global user base, with special focus on Thai users and other major markets:

- 🇺🇸 **English** (en) - Default language
- 🇹🇭 **Thai** (th) - Primary focus for Thai users
- 🇫🇷 **French** (fr) - Francophone markets
- 🇮🇳 **Hindi** (hi) - Indian market
- 🇮🇳 **Tamil** (ta) - South Indian market
- 🇨🇳 **Chinese** (zh) - Chinese market
- 🇯🇵 **Japanese** (ja) - Japanese market

## 🚀 Features

### ✅ **Implemented**
- **Automatic Language Detection**: Detects user's browser language
- **Language Switcher**: Dropdown and button variants
- **Translation System**: Complete JSON-based translation files
- **URL-based Routing**: `/en/`, `/th/`, `/fr/`, etc.
- **Localized Formatting**: Currency, dates, and numbers
- **Fallback System**: English fallback for missing translations
- **Persistent Language**: Saves user preference in localStorage

### 🔧 **Technical Implementation**

#### **1. Translation Files**
```
src/locales/
├── en.json     # English (complete)
├── th.json     # Thai (complete)
├── fr.json     # French (basic structure)
├── hi.json     # Hindi (basic structure)
├── ta.json     # Tamil (basic structure)
├── zh.json     # Chinese (basic structure)
└── ja.json     # Japanese (basic structure)
```

#### **2. Core Components**
- `src/lib/i18n.ts` - Translation utility and hooks
- `src/components/LanguageSwitcher.tsx` - Language selection component
- `src/middleware.ts` - Language detection and routing
- `src/app/api/language/route.ts` - Language API endpoints

#### **3. Usage in Components**
```tsx
import { useTranslation, getCurrentLocale } from '@/lib/i18n';

function MyComponent() {
  const { t } = useTranslation(getCurrentLocale());
  
  return (
    <div>
      <h1>{t('navigation.dashboard')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

## 🎯 **Language Detection Priority**

1. **URL Path**: `/th/dashboard` → Thai
2. **localStorage**: Previously saved preference
3. **Browser Language**: `navigator.language`
4. **Default**: English

## 📝 **Adding New Translations**

### **Step 1: Update Translation File**
Add new keys to all language files in `src/locales/`:

```json
{
  "newSection": {
    "title": "English Title",
    "description": "English description"
  }
}
```

### **Step 2: Use in Components**
```tsx
const { t } = useTranslation(currentLocale);
return <h1>{t('newSection.title')}</h1>;
```

### **Step 3: Add to Language Files**
Update each language file with the translation:

**Thai (th.json):**
```json
{
  "newSection": {
    "title": "ชื่อภาษาไทย",
    "description": "คำอธิบายภาษาไทย"
  }
}
```

## 🔄 **Language Switching**

### **Component Usage**
```tsx
import LanguageSwitcher from '@/components/LanguageSwitcher';

// Dropdown variant (default)
<LanguageSwitcher />

// Button variant
<LanguageSwitcher variant="buttons" />
```

### **Programmatic Switching**
```tsx
import { setLocale } from '@/lib/i18n';

// Change language
setLocale('th');
```

## 🌐 **URL Structure**

- **English**: `https://globaldotbank.com/en/dashboard`
- **Thai**: `https://globaldotbank.com/th/dashboard`
- **French**: `https://globaldotbank.com/fr/dashboard`
- **Hindi**: `https://globaldotbank.com/hi/dashboard`
- **Tamil**: `https://globaldotbank.com/ta/dashboard`
- **Chinese**: `https://globaldotbank.com/zh/dashboard`
- **Japanese**: `https://globaldotbank.com/ja/dashboard`

## 📊 **Translation Status**

| Language | Status | Coverage | Notes |
|----------|--------|----------|-------|
| 🇺🇸 English | ✅ Complete | 100% | Default language |
| 🇹🇭 Thai | ✅ Complete | 100% | Primary focus |
| 🇫🇷 French | 🔄 Partial | 60% | Basic structure ready |
| 🇮🇳 Hindi | 🔄 Partial | 30% | Basic structure ready |
| 🇮🇳 Tamil | 🔄 Partial | 30% | Basic structure ready |
| 🇨🇳 Chinese | 🔄 Partial | 30% | Basic structure ready |
| 🇯🇵 Japanese | 🔄 Partial | 30% | Basic structure ready |

## 🛠 **Development Commands**

### **Generate Translation Files**
```bash
node scripts/generate-translations.js
```

### **Test Language Demo**
Visit: `http://localhost:3000/language-demo`

### **API Endpoints**
- `GET /api/language` - Get supported languages
- `POST /api/language` - Update language preference

## 🎨 **UI Components**

### **Language Switcher**
- **Dropdown**: Globe icon with language name
- **Buttons**: Horizontal button layout
- **Mobile**: Responsive button layout

### **Features**
- ✅ Visual feedback for current language
- ✅ Smooth transitions
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Persistent selection

## 🔧 **Configuration**

### **Next.js Config**
```js
// next.config.js
i18n: {
  locales: ['en', 'th', 'fr', 'hi', 'ta', 'zh', 'ja'],
  defaultLocale: 'en',
  localeDetection: true,
}
```

### **Environment Variables**
```env
# Optional: Google Translate API for bulk translation
GOOGLE_TRANSLATE_API_KEY=your_api_key
```

## 🚀 **Deployment**

### **Vercel**
- Automatic language detection works
- Edge functions support middleware
- Static generation for all locales

### **Other Platforms**
- Ensure middleware support
- Configure locale routing
- Set up CDN for static assets

## 📈 **Analytics & Monitoring**

### **Language Usage Tracking**
```tsx
// Track language changes
useEffect(() => {
  analytics.track('language_changed', {
    from: previousLocale,
    to: currentLocale
  });
}, [currentLocale]);
```

### **Missing Translation Monitoring**
```tsx
// Log missing translations in development
if (process.env.NODE_ENV === 'development') {
  console.warn(`Missing translation: ${key} for locale: ${locale}`);
}
```

## 🔮 **Future Enhancements**

### **Planned Features**
- [ ] **RTL Support**: Arabic, Hebrew
- [ ] **Regional Variants**: en-US, en-GB, zh-CN, zh-TW
- [ ] **Dynamic Loading**: Load translations on demand
- [ ] **Translation Memory**: Save user corrections
- [ ] **Auto-translation**: Google Translate integration
- [ ] **Voice Interface**: Language-specific voice commands

### **Performance Optimizations**
- [ ] **Bundle Splitting**: Separate language bundles
- [ ] **Caching**: Cache translations in service worker
- [ ] **Preloading**: Preload common language pairs

## 🆘 **Troubleshooting**

### **Common Issues**

**1. Language not switching**
```bash
# Check localStorage
localStorage.getItem('locale')

# Check browser language
navigator.language
```

**2. Missing translations**
```bash
# Check translation file exists
ls src/locales/

# Check key exists in file
grep "keyName" src/locales/en.json
```

**3. URL routing issues**
```bash
# Check middleware configuration
cat src/middleware.ts

# Verify Next.js config
cat next.config.js
```

### **Debug Mode**
```tsx
// Enable debug logging
const DEBUG_I18N = process.env.NODE_ENV === 'development';

if (DEBUG_I18N) {
  console.log('Translation key:', key);
  console.log('Locale:', locale);
  console.log('Result:', result);
}
```

## 📞 **Support**

For translation issues or new language requests:
1. Check existing translation files
2. Use the translation generator script
3. Test with the language demo page
4. Contact the development team

---

**Last Updated**: July 2025
**Version**: 1.0.0
**Maintainer**: Global Dot Bank Development Team 