# PetNexa AI — Web & App Store Assets

Official public web presence and store listing asset repository for **PetNexa AI**, including the landing showcase, full legal Privacy Policy, Account Deletion portal, Help Center, and Google Play Store marketing assets.

---

## Repository Structure

```
petnexa-ai-privacy/
├── index.html                      # Main landing page with live app showcase
├── privacy-policy.html             # Full legal privacy policy
├── account-deletion.html           # Dedicated account & data deletion portal
├── support.html                    # Help center, FAQs, and support contact
├── styles.css                      # Master design system stylesheet
├── script.js                       # Site interactions & policy config
├── image.png                       # Official PetNexa AI logo & brand icon
├── live-app-preview.mp4            # Live app showcase video preview
├── live-app-preview.webm           # WebM format for universal browser support
├── sitemap.xml                     # Search engine sitemap
├── robots.txt                      # Search crawler configuration
├── app-ads.txt                     # AdMob publisher verification
├── package.json                    # Project manifest & npm automation scripts
│
├── play-store-assets/              # Google Play Console phone assets (9:16)
│   ├── 01-phone-dashboard.png      # Care Dashboard (Featured)
│   ├── 02-phone-ai-assistant.png   # 24/7 AI Health Guidance
│   ├── 03-phone-records.png        # Clinical Records Vault
│   ├── 04-phone-my-pets.png        # Multi-Pet Passports
│   ├── 05-phone-privacy-controls.png # Privacy & Local Data Control
│   ├── 06-phone-onboarding.png     # Quick Onboarding Setup
│   ├── index.html                  # Interactive asset preview gallery
│   └── template.html               # 1080×1920 phone chassis render template
│
├── screenshots/                    # Authentic mobile app captures (demo data)
│   ├── 01-onboarding-login.png
│   ├── 02-dashboard.png
│   ├── 03-my-pets.png
│   ├── 04-records.png
│   ├── 05-ai-assistant.png
│   └── 06-settings-privacy-controls.png
│
├── scripts/                        # Developer automation & build tools
│   ├── capture-screenshots.mjs     # Captures raw app screens via Chrome CDP
│   └── generate-play-screenshots.mjs # Renders 9:16 Play Store promotional cards
│
└── privacy-policy/, account-deletion/, support/ # GitHub Pages URL redirect bridges
```

---

## Quick Start & Commands

### 1. Local Preview

Open [`index.html`](file:///c:/Users/Dahon/Documents/Projects/petnexa-ai-privacy/index.html) directly in any browser, or run a local static server:

```powershell
npx serve .
```

---

### 2. Google Play Phone Screenshots (9:16)

Generates 6 promotional marketing graphics ($1080 \times 1920\text{ px}$, 9:16 aspect ratio, lossless PNG, under 1 MB each) ready for direct upload to the Google Play Developer Console:

```powershell
npm run screenshots:play-store
# or: node scripts/generate-play-screenshots.mjs
```

Outputs are saved in [`play-store-assets/`](file:///c:/Users/Dahon/Documents/Projects/petnexa-ai-privacy/play-store-assets). Preview and download all assets by opening [`play-store-assets/index.html`](file:///c:/Users/Dahon/Documents/Projects/petnexa-ai-privacy/play-store-assets/index.html).

---

### 3. Refresh Raw App Screenshots

To re-capture the base in-app screens using demo data from the Expo local dev server:

1. Start Expo web server:
   ```powershell
   npx expo start --web --port 8098
   ```

2. Capture all mobile views via automated CDP:
   ```powershell
   npm run screenshots:capture
   # or: node scripts/capture-screenshots.mjs
   ```

Screenshots are saved directly to [`screenshots/`](file:///c:/Users/Dahon/Documents/Projects/petnexa-ai-privacy/screenshots).

---

## Production Deployment Checklist

1. **Verify Site Metadata**: Confirm `effectiveDate`, `contactEmail`, and `developerName` in [`script.js`](file:///c:/Users/Dahon/Documents/Projects/petnexa-ai-privacy/script.js).
2. **Canonical Links**: Ensure [`sitemap.xml`](file:///c:/Users/Dahon/Documents/Projects/petnexa-ai-privacy/sitemap.xml) and canonical meta tags match the production domain (`https://devdahon.github.io/petnexa-ai-privacy/`).
3. **Google Play Store Policy URLs**:
   - **Privacy Policy**: `https://devdahon.github.io/petnexa-ai-privacy/privacy-policy.html`
   - **Account Deletion**: `https://devdahon.github.io/petnexa-ai-privacy/account-deletion.html`
   - **Support & Feedback**: `https://devdahon.github.io/petnexa-ai-privacy/support.html`
