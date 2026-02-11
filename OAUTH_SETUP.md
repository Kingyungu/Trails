# OAuth Setup Guide - Google & Apple Sign-In

## Google Sign-In Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API** for your project

### 2. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Configure consent screen if prompted
4. Create **three** OAuth client IDs:

#### For Android:
- Application type: **Android**
- Package name: `com.trails.kenya`
- SHA-1 certificate fingerprint:
  ```bash
  # Get debug SHA-1 (for development)
  cd android
  ./gradlew signingReport
  # Or use keytool:
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  ```
- Copy the **Client ID**

#### For iOS:
- Application type: **iOS**
- Bundle ID: `com.trails.kenya`
- Copy the **Client ID**

#### For Web (Expo):
- Application type: **Web application**
- Authorized redirect URIs: `https://auth.expo.io/@YOUR_EXPO_USERNAME/trails`
- Copy the **Client ID**

### 3. Update Mobile App

Open `mobile/services/oauth.js` and replace the placeholder client IDs:

```javascript
const GOOGLE_CLIENT_ID = {
  ios: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  android: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  web: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
};
```

---

## Apple Sign-In Setup

### 1. Apple Developer Account Required

You need an **Apple Developer account** ($99/year) to use Sign in with Apple.

### 2. Configure App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select **Identifiers** > **App IDs**
4. Find or create your App ID: `com.trails.kenya`
5. Enable **Sign in with Apple** capability
6. Click **Edit** > **Configure**
7. Select your primary App ID (usually the same one)
8. Save

### 3. Update app.json

The plugin is already configured in `mobile/app.json`:

```json
"plugins": [
  "expo-apple-authentication"
]
```

### 4. iOS Only

Apple Sign-In only works on **iOS devices** and **iOS Simulator**. It will not show on Android.

The app automatically detects availability and shows the button only when supported.

---

## Testing

### Install New Dependencies

```bash
cd mobile
npm install --legacy-peer-deps
```

### Reinstall Expo Go or Build Development Client

For **testing on physical devices**:
- Google Sign-In requires a **development build** (Expo Go won't work)
- Apple Sign-In requires **iOS device or simulator**

**Option 1: Build Development Client (Recommended)**
```bash
npx expo install expo-dev-client
eas build --profile development --platform ios
# or
eas build --profile development --platform android
```

**Option 2: Build for Expo Go (Limited)**
```bash
npx expo start
```
Note: Google OAuth may not work fully in Expo Go.

---

## Production Setup

### For Production Builds:

1. **Update redirect URIs** in Google Console to match your production app scheme
2. **Configure proper SHA-1 fingerprints** for release builds (Android)
3. **Enable production Apple Services Identifier** in Apple Developer Portal

---

## Troubleshooting

### Google Sign-In not working
- Verify all three Client IDs are correctly set in `oauth.js`
- Check SHA-1 fingerprint matches in Google Console
- Ensure you're using a development build, not Expo Go

### Apple Sign-In button not showing
- Only works on iOS (check with `AppleAuthentication.isAvailableAsync()`)
- Verify Apple Developer account is active
- Ensure App ID has Sign in with Apple enabled

### OAuth endpoint errors
- Make sure backend server is running (`npm run dev` in server folder)
- Check API_URL in `mobile/services/api.js` points to correct server
- Verify MongoDB is running

---

## Backend is Ready!

The backend OAuth endpoint is already implemented:
- **POST** `/api/auth/oauth` accepts Google & Apple credentials
- Automatically creates or finds users based on email + provider
- Returns JWT token for authenticated sessions

No additional backend configuration needed!
