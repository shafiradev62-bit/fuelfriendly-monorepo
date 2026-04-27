/**
 * Google Authentication Service with Firebase Integration
 * Supports both Web (OAuth) and Native (Capacitor Plugin)
 */

import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { signInWithGoogleCredential } from '../../firebase';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  imageUrl?: string;
  givenName?: string;
  familyName?: string;
}

export interface GoogleAuthResult {
  success: boolean;
  user?: GoogleUser;
  error?: string;
  firebaseUser?: any; // Firebase user object
}

export interface BackendAuthResult {
  success: boolean;
  customer?: { id: string; fullName: string; email: string; isEmailVerified?: boolean };
  token?: string;
  isNewUser?: boolean; // Flag to indicate auto sign-up
  error?: string;
}

class GoogleAuthService {
  private initialized = false;
  /**
   * Google OAuth Client ID
   * - Prefer VITE_GOOGLE_CLIENT_ID when available (web)
   * - Fallback to the same Web Client ID used in capacitor.config.ts
   *   so that native Android (APK) always uses a valid, SHA-registered client.
   */
  private clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "361936469399-t2o5h62466mk8gcuvqt62erj7oekt0ar.apps.googleusercontent.com";
  // Always use production API for APK compatibility
  private apiBase = "https://apidecor.kelolahrd.life";

  /**
   * Initialize Google Auth
   * Must be called before using signIn
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      if (Capacitor.isNativePlatform()) {
        // Native platform (Android/iOS)
        await GoogleAuth.initialize({
          clientId: this.clientId,
          scopes: ['profile', 'email'],
        });
        console.log('[GoogleAuth] Initialized for native platform');
      } else {
        console.log('[GoogleAuth] Using web OAuth');
        if (!(window as any).google) {
          await new Promise<void>((resolve) => {
            const check = () => {
              if ((window as any).google) resolve();
              else setTimeout(check, 50);
            };
            check();
          });
        }
      }
      this.initialized = true;
    } catch (error) {
      console.error('[GoogleAuth] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Sign in with Google and integrate with Firebase
   * Works on both web and native platforms
   */
  async signIn(): Promise<GoogleAuthResult> {
    try {
      await this.initialize();

      if (Capacitor.isNativePlatform()) {
        return await this.signInNative();
      } else {
        return await this.signInWeb();
      }
    } catch (error: any) {
      console.error('[GoogleAuth] Sign in failed:', error);
      return {
        success: false,
        error: error.message || 'Sign in failed',
      };
    }
  }

  /**
   * Native sign in (Android/iOS) with Firebase integration
   * Uses Capacitor Google Auth plugin for in-app authentication
   */
  private async signInNative(): Promise<GoogleAuthResult> {
    try {
      console.log('[GoogleAuth] Starting native sign in...');
      
      // Use Capacitor Google Auth plugin
      const result = await GoogleAuth.signIn();
      
      console.log('[GoogleAuth] Native sign in raw result:', result);
      
      if (!result || !result.email) {
        console.error('[GoogleAuth] No result from native sign in');
        throw new Error('No user data returned from Google Sign-In');
      }

      const user: GoogleUser = {
        id: result.id,
        email: result.email,
        name: result.name || (result as any).displayName || result.email.split('@')[0],
        imageUrl: (result as any).imageUrl,
        givenName: result.givenName,
        familyName: result.familyName,
      };

      console.log('[GoogleAuth] Native sign in successful:', user.email);

      // Fire-and-forget Firebase integration
      const idToken = (result as any).authentication?.idToken || (result as any).idToken;
      if (idToken) {
        signInWithGoogleCredential(idToken).catch(() => {});
      }

      return { success: true, user };
    } catch (error: any) {
      console.error('[GoogleAuth] Native sign in error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Native Google Sign-In failed. Please try again.';
      
      if (error.message?.includes('12501')) {
        errorMessage = 'Sign in was cancelled.';
      } else if (error.message?.includes('10')) {
        errorMessage = 'Google Play Services not available. Please update Google Play Services.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Web sign in (Browser) with Firebase integration
   * Uses Google Identity Services
   */
  private async signInWeb(): Promise<GoogleAuthResult> {
    return new Promise((resolve) => {
      if (!window.google) {
        resolve({
          success: false,
          error: 'Google Identity Services not loaded',
        });
        return;
      }

      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: async (response: any) => {
          try {
            // Decode JWT token from Google Identity Services
            const credential = response.credential;
            const base64Url = credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const userInfo = JSON.parse(jsonPayload);
            const user: GoogleUser = {
              id: userInfo.sub,
              email: userInfo.email,
              name: userInfo.name,
              imageUrl: userInfo.picture,
              givenName: userInfo.given_name,
              familyName: userInfo.family_name,
            };

            console.log('[GoogleAuth] Web sign in successful:', user.email);

            // Fire-and-forget Firebase integration
            signInWithGoogleCredential(response.credential).catch(() => {});
            resolve({ success: true, user });
          } catch (error: any) {
            console.error('[GoogleAuth] Token decode error:', error);
            resolve({
              success: false,
              error: 'Failed to decode user data',
            });
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Trigger the sign-in prompt
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('[GoogleAuth] Prompt not displayed:', notification.getNotDisplayedReason());
          resolve({
            success: false,
            error: 'Sign in prompt not displayed',
          });
        }
      });
    });
  }

  /**
   * Sign out from both Google and Firebase
   */
  async signOut(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await GoogleAuth.signOut();
        console.log('[GoogleAuth] Native sign out successful');
      } else {
        // Web sign out - clear session
        if (window.google) {
          (window.google.accounts.id as any).disableAutoSelect?.();
        }
        console.log('[GoogleAuth] Web sign out successful');
      }
    } catch (error) {
      console.error('[GoogleAuth] Sign out failed:', error);
    }
  }

  async authenticateWithBackend(user: GoogleUser): Promise<BackendAuthResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.apiBase}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.id,
          email: user.email,
          displayName: user.name,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok) {
        console.error('[GoogleAuth] Backend authentication failed:', result?.error);
        // Graceful fallback: treat as local login so Google Sign-In
        // still works even if backend is down or unreachable.
        const fallbackCustomer = {
          id: user.id,
          fullName: user.name,
          email: user.email,
          isEmailVerified: true,
        };

        return {
          success: true,
          customer: fallbackCustomer,
          // Surface backend error only as informational text; caller will still proceed.
          error: result?.error || "Backend unavailable, using local Google login.",
          isNewUser: false,
        };
      }

      console.log('[GoogleAuth] Backend authentication successful');
      return {
        success: true,
        customer: result.customer,
        token: result.token,
        isNewUser: result.isNewUser, // Pass through the flag
      };
    } catch (error: any) {
      console.error('[GoogleAuth] Backend authentication error (network?):', error);

      // Network / CORS / DNS errors often surface as "Failed to fetch".
      // Instead of blocking login, fall back to a local customer profile
      // so the user can still continue using the app.
      const fallbackCustomer = {
        id: user.id,
        fullName: user.name,
        email: user.email,
        isEmailVerified: true,
      };

      return {
        success: true,
        customer: fallbackCustomer,
        error: error?.message || "Network error while contacting server. Using local Google login.",
        isNewUser: false,
      };
    }
  }

  /**
   * Refresh token (native only)
   */
  async refresh(): Promise<GoogleAuthResult> {
    if (!Capacitor.isNativePlatform()) {
      return {
        success: false,
        error: 'Refresh only available on native platforms',
      };
    }

    try {
      const result = await GoogleAuth.refresh();
      
      const user: GoogleUser = {
        id: (result as any).id || '',
        email: (result as any).email || '',
        name: (result as any).name || (result as any).displayName || '',
        imageUrl: (result as any).imageUrl,
      };

      return {
        success: true,
        user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Refresh failed',
      };
    }
  }
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService();
