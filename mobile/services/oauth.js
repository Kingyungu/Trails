import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

// Google OAuth Configuration
const GOOGLE_CLIENT_ID = {
  ios: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  android: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  web: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
};

const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'trails',
  path: 'redirect',
});

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export async function signInWithGoogle() {
  try {
    const clientId = Platform.select({
      ios: GOOGLE_CLIENT_ID.ios,
      android: GOOGLE_CLIENT_ID.android,
      default: GOOGLE_CLIENT_ID.web,
    });

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
      {
        clientId,
        scopes: ['profile', 'email'],
        redirectUri,
      },
      discovery
    );

    if (!request) return null;

    const result = await promptAsync();

    if (result?.type === 'success') {
      const { authentication } = result;

      // Fetch user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      });

      const userInfo = await userInfoResponse.json();

      return {
        provider: 'google',
        providerId: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        avatar: userInfo.picture,
      };
    }

    return null;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    return null;
  }
}

export async function signInWithApple() {
  try {
    // Check if Apple Auth is available (iOS only)
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Apple authentication is not available on this device');
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Apple returns user info only on first sign-in
    const name = credential.fullName
      ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
      : credential.email?.split('@')[0] || 'User';

    return {
      provider: 'apple',
      providerId: credential.user,
      email: credential.email,
      name,
      avatar: '',
    };
  } catch (error) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      // User canceled the sign-in flow
      return null;
    }
    console.error('Apple Sign-In Error:', error);
    throw error;
  }
}

export function useGoogleAuth() {
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: Platform.select({
        ios: GOOGLE_CLIENT_ID.ios,
        android: GOOGLE_CLIENT_ID.android,
        default: GOOGLE_CLIENT_ID.web,
      }),
      scopes: ['profile', 'email'],
      redirectUri,
    },
    discovery
  );

  return { request, response, promptAsync };
}
