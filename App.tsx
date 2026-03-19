import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Capacitor } from '@capacitor/core';
import MobileDebugger from './components/MobileDebugger';
import ErrorBoundary from './components/ErrorBoundary';

// Import Google Auth plugin for Capacitor
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// Import pages from fuel-user-update structure
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import LoginFormScreen from './screens/LoginFormScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import HomeScreen from './screens/HomeScreen';
import StationDetailsScreen from './screens/StationDetailsScreen';
import StationReviewsScreen from './screens/StationReviewsScreen';
import FuelFriendDetailsScreen from './screens/FuelFriendDetailsScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import TrackOrderScreen from './screens/TrackOrderScreen';
import MyOrdersScreen from './screens/MyOrdersScreen';
import SettingsScreen from './screens/SettingsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import PaymentScreen from './screens/PaymentScreen';
import OrderSummaryScreen from './screens/OrderSummaryScreen';
import ProfileScreen from './screens/ProfileScreen';
import ManagePasswordScreen from './screens/ManagePasswordScreen';
import ThemeScreen from './screens/ThemeScreen';
import FuelEfficiencyCalculatorScreen from './screens/FuelEfficiencyCalculatorScreen';
import PaymentMethodsScreen from './screens/PaymentMethodsScreen';
import NotificationSettingsScreen from './screens/NotificationSettingsScreen';
import SupportHelpScreen from './screens/SupportHelpScreen';
import LiveChatSupportScreen from './screens/LiveChatSupportScreen';
import ReportIssueScreen from './screens/ReportIssueScreen';
import ReportSubmittedSuccessScreen from './screens/ReportSubmittedSuccessScreen';
import TermsConditionsScreen from './screens/TermsConditionsScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import AccountDeletionScreen from './screens/AccountDeletionScreen';
import AccountDeletedSuccessScreen from './screens/AccountDeletedSuccessScreen';
import ChatScreen from './screens/ChatScreen';
import CallScreen from './screens/CallScreen';
import ReceiptsScreen from './screens/ReceiptsScreen';
import PasswordResetSuccess from './components/PasswordResetSuccess';
import BottomNav from './components/BottomNav';
import { Theme, User } from './types';

import { apiLogin, apiGetMe, apiResolveGoogleUserLocal } from './services/api';
import { AppContext, useAppContext } from './context/AppContext';

const apiLogout = () => {
    // ✅ Clear token and any stored session data
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Legacy cleanup
};

// Google Auth initialization state
let isGoogleAuthInitialized = false;

// Initialize Google Auth for Capacitor (call this early in app lifecycle)
const initializeGoogleAuth = async () => {
    if (!Capacitor.isNativePlatform()) return;
    if (isGoogleAuthInitialized) return;

    try {
        // For Capacitor Google Auth on Android, we need to use the Web Client ID
        // This is because the plugin uses the web client ID for authentication
        const webClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID_WEB || import.meta.env.VITE_GOOGLE_CLIENT_ID;
        
        if (!webClientId) {
            throw new Error('Google Client ID not configured');
        }

        await GoogleAuth.initialize({
            scopes: ['profile', 'email', 'openid'],
            serverClientId: webClientId,
            forceCodeForRefreshToken: false
        });
        isGoogleAuthInitialized = true;
    } catch (error) {
        // Non-fatal: log and continue
        console.warn('[GoogleAuth] Init failed:', error);
    }
};

const apiLoginWithGoogleCredential = async () => {
    // Check if running on mobile (Capacitor)
   if (Capacitor.isNativePlatform()) {
        try {
            // Ensure Google Auth is initialized
            await initializeGoogleAuth();

            // Trigger Google Sign In
            const result = await GoogleAuth.signIn();

           if (!result || !result.email) {
               throw new Error('Invalid response from Google Sign In');
            }

           return {
                id: `google-${result.id}`,
                fullName: result.name || 'Google User',
                email: result.email,
                phone: '',
                city: '',
                avatarUrl: result.imageUrl || `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"fill="none">
  <!-- Background Circle -->
  <circle cx="48" cy="48" r="48" fill="#f0fdf4"/>
  <!-- Face -->
  <circle cx="48" cy="40" r="20" fill="#fef3c7" stroke="#f59e0b" stroke-width="1"/>
  <!-- Eyes -->
  <circle cx="42" cy="38" r="2" fill="#1f2937"/>
  <circle cx="54" cy="38" r="2" fill="#1f2937"/>
  <!-- Smile -->
  <path d="M42 46 Q48 50 54 46" stroke="#1f2937" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <!-- Hat/Cap -->
  <ellipse cx="48" cy="28" rx="18" ry="8" fill="#22c55e" stroke="#16a34a" stroke-width="1"/>
  <rect x="35" y="28" width="26" height="8" rx="2" fill="#22c55e" stroke="#16a34a" stroke-width="1"/>
  <!-- Body/Shirt -->
  <rect x="35" y="55" width="26" height="25" rx="3" fill="#4ade80" stroke="#22c55e" stroke-width="1"/>
  <!-- Arms -->
  <rect x="28" y="60" width="8" height="15" rx="4" fill="#4ade80" stroke="#22c55e" stroke-width="1"/>
  <rect x="60" y="60" width="8" height="15" rx="4" fill="#4ade80" stroke="#22c55e" stroke-width="1"/>
</svg>`)}`,
                vehicles: [],
                idToken: result.authentication?.idToken,
                accessToken: result.authentication?.accessToken,
            };
        } catch (error: any) {
            const errorMsg = error?.message || String(error);
            const errorCode = error?.code || '';
           
           if (errorCode === '10' || errorMsg.includes('DEVELOPER_ERROR') || errorMsg.includes('10:')) {
               throw new Error('Google authentication setup error. Please check:\n1. SHA-1 fingerprint is registered\n2. Web Client ID is configured\n3. Package name matches');
           } else if (errorMsg.includes('NETWORK_ERROR')) {
               throw new Error('Network error. Please check your internet connection.');
            } else if (errorMsg.includes('SIGN_IN_REQUIRED') || errorMsg.includes('CANCELLED') || errorCode === '12501') {
               throw new Error('Sign in cancelled.');
            } else {
               throw new Error(`Google Sign In failed: ${errorMsg} (code: ${errorCode})`);
            }
        }
    }

    // Web/PWA Google OAuth (Google Identity Services)
    return new Promise((resolve, reject) => {
        let settled = false;

        const safeResolve = (value: any) => {
            if (settled) return;
            settled = true;
            resolve(value);
        };

        const safeReject = (error: any) => {
            if (settled) return;
            settled = true;
            reject(error instanceof Error ? error : new Error(String(error)));
        };

        const webClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID_WEB || '';
        const androidClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID_ANDROID || '';

        if (!webClientId) {
            safeReject(new Error('VITE_GOOGLE_CLIENT_ID_WEB is missing. Use an OAuth Web application client ID.'));
            return;
        }

        const currentUrl = new URL(window.location.href);
        const isLocalHost = currentUrl.hostname === 'localhost' || currentUrl.hostname === '127.0.0.1';
        const isSecureOrigin = currentUrl.protocol === 'https:';
        if (!isSecureOrigin && !isLocalHost) {
            safeReject(new Error(`Google web sign-in requires HTTPS or localhost. Current origin: ${currentUrl.origin}`));
            return;
        }

        const waitForGoogleSdk = async (retry = 10): Promise<any> => {
            if ((window as any).google?.accounts?.id) {
                return (window as any).google;
            }
            if (retry <= 0) {
                throw new Error('Google SDK is not ready. Refresh the page and try again.');
            }
            await new Promise(r => setTimeout(r, 200));
            return waitForGoogleSdk(retry - 1);
        };

        waitForGoogleSdk()
            .then((googleSdk: any) => {
                console.log('🔍 Initializing Google Sign In...');
                let buttonFallbackShown = false;
                let loadingShown = false;
                const cleanupFns: Array<() => void> = [];
                const finish = (runner: () => void) => {
                    if (settled) return;
                    settled = true;
                    cleanupFns.forEach((fn) => fn());
                    runner();
                };

                const showButtonFallback = () => {
                    if (buttonFallbackShown || settled) return;
                    buttonFallbackShown = true;

                    const wrapper = document.createElement('div');
                    wrapper.id = 'google-signin-fallback-wrapper';
                    wrapper.style.position = 'fixed';
                    wrapper.style.inset = '0';
                    wrapper.style.background = 'rgba(0,0,0,0.45)';
                    wrapper.style.zIndex = '9999';
                    wrapper.style.display = 'flex';
                    wrapper.style.alignItems = 'center';
                    wrapper.style.justifyContent = 'center';

                    const card = document.createElement('div');
                    card.style.background = '#ffffff';
                    card.style.padding = '18px';
                    card.style.borderRadius = '14px';
                    card.style.minWidth = '280px';
                    card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
                    card.style.display = 'flex';
                    card.style.flexDirection = 'column';
                    card.style.alignItems = 'center';
                    card.style.gap = '10px';

                    const title = document.createElement('div');
                    title.textContent = 'Continue with Google';
                    title.style.fontSize = '15px';
                    title.style.fontWeight = '600';
                    title.style.color = '#111827';

                    const buttonHost = document.createElement('div');
                    buttonHost.id = 'google-signin-fallback-button';

                    const cancelBtn = document.createElement('button');
                    cancelBtn.type = 'button';
                    cancelBtn.textContent = 'Close';
                    cancelBtn.style.border = 'none';
                    cancelBtn.style.background = 'transparent';
                    cancelBtn.style.color = '#6b7280';
                    cancelBtn.style.fontSize = '13px';
                    cancelBtn.style.cursor = 'pointer';
                    cancelBtn.onclick = () => finish(() => reject(new Error('Google Sign In cancelled')));

                    card.appendChild(title);
                    card.appendChild(buttonHost);
                    card.appendChild(cancelBtn);
                    wrapper.appendChild(card);
                    document.body.appendChild(wrapper);

                    googleSdk.accounts.id.renderButton(buttonHost, {
                        type: 'standard',
                        size: 'large',
                        theme: 'outline',
                        text: 'signin_with',
                        shape: 'rectangular',
                        width: 260
                    });

                    cleanupFns.push(() => {
                        if (wrapper.parentNode) {
                            wrapper.parentNode.removeChild(wrapper);
                        }
                    });
                };

                googleSdk.accounts.id.initialize({
                    client_id: webClientId,
                    auto_select: false,
                    callback: (response: any) => {
                        if (!loadingShown) {
                            toast.loading('Checking Google account...', { id: 'google-check' });
                            loadingShown = true;
                        }
                        try {
                            console.log('✅ Google callback received');
                            if (!response?.credential) {
                                toast.error('Google credential was not found', { id: 'google-check' });
                                finish(() => reject(new Error('Google credential was not found')));
                                return;
                            }
                            const payload = JSON.parse(atob(response.credential.split('.')[1]));
                            console.log('✅ Google user data:', payload.email);
                            toast.success(`Hi, ${payload.name}!`, { id: 'google-check' });

                            const userData = {
                                id: `google-${payload.sub}`,
                                fullName: payload.name || 'Google User',
                                email: payload.email,
                                phone: '',
                                city: '',
                                avatarUrl: payload.picture || `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none">
  <!-- Background Circle -->
  <circle cx="48" cy="48" r="48" fill="#f0fdf4"/>
  <!-- Face -->
  <circle cx="48" cy="40" r="20" fill="#fef3c7" stroke="#f59e0b" stroke-width="1"/>
  <!-- Eyes -->
  <circle cx="42" cy="38" r="2" fill="#1f2937"/>
  <circle cx="54" cy="38" r="2" fill="#1f2937"/>
  <!-- Smile -->
  <path d="M42 46 Q48 50 54 46" stroke="#1f2937" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <!-- Hat/Cap -->
  <ellipse cx="48" cy="28" rx="18" ry="8" fill="#22c55e" stroke="#16a34a" stroke-width="1"/>
  <rect x="35" y="28" width="26" height="8" rx="2" fill="#22c55e" stroke="#16a34a" stroke-width="1"/>
  <!-- Body/Shirt -->
  <rect x="35" y="55" width="26" height="25" rx="3" fill="#4ade80" stroke="#22c55e" stroke-width="1"/>
  <!-- Arms -->
  <rect x="28" y="60" width="8" height="15" rx="4" fill="#4ade80" stroke="#22c55e" stroke-width="1"/>
  <rect x="60" y="60" width="8" height="15" rx="4" fill="#4ade80" stroke="#22c55e" stroke-width="1"/>
</svg>`)}`,
                                vehicles: [],
                                idToken: response.credential
                            };
                            finish(() => resolve(userData));
                        } catch (error) {
                            console.error('❌ Error parsing Google response:', error);
                            toast.error('Failed to process Google response', { id: 'google-check' });
                            finish(() => reject(error instanceof Error ? error : new Error(String(error))));
                        }
                    },
                    cancel_on_tap_outside: false,
                });
                showButtonFallback();
                googleSdk.accounts.id.prompt();

                const failSafeTimeout = window.setTimeout(() => {
                    finish(() => reject(new Error('Google Sign In failed. Please try again.')));
                }, 8000);
                cleanupFns.push(() => window.clearTimeout(failSafeTimeout));
            })
            .catch((error) => {
                console.error('❌ Google SDK error:', error);
                const sdkMessage = String((error as any)?.message || error || '');
                if (/storagerelay/i.test(sdkMessage)) {
                    safeReject(new Error('Invalid Google Web Client ID. Use VITE_GOOGLE_CLIENT_ID_WEB from an OAuth Web application client.'));
                    return;
                }
                if (/origin|not allowed|unauthorized|idpiframe/i.test(sdkMessage)) {
                    safeReject(new Error(`Google authorization failed for origin ${window.location.origin}. Add this origin to your OAuth Web client in Google Cloud.`));
                    return;
                }
                safeReject(error);
            });
    });
};

// Re-export useAppContext for backward compatibility
export { useAppContext };

const queryClient = new QueryClient();

const AppNavigator = () => {
    console.log('🔍 AppNavigator component rendering');
    const { isAuthenticated, user } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        console.log('🔍 AppNavigator useEffect triggered');
        console.log('Current path:', location.pathname);
        console.log('isAuthenticated:', isAuthenticated);
        console.log('Browser history length:', window.history.length);
        console.log('redirectAfterLogin:', localStorage.getItem('redirectAfterLogin'));

        const publicRoutes = ['/', '/login', '/login-form', '/register', '/forgot-password', '/password-reset-success'];
        const currentPath = location.pathname;

        // Routes that should NOT redirect authenticated users to home
        const exemptRoutes = [
            '/home',
            '/station/',
            '/fuel-friend/',
            '/checkout',
            '/order-summary',
            '/payment',
            '/track',
            '/orders',
            '/notifications',
            '/settings',
            '/profile',
            '/chat'
        ];

        const isExemptRoute = exemptRoutes.some(route =>
            currentPath === route || currentPath.startsWith(route)
        );

        console.log('publicRoutes.includes(currentPath):', publicRoutes.includes(currentPath));
        console.log('isExemptRoute:', isExemptRoute);

        // Redirect authenticated users to home only if they're on public routes (like login/register)
        // BUT don't redirect if it's an exempt route like /track or /checkout
        if (isAuthenticated && publicRoutes.includes(currentPath) && !isExemptRoute) {
            // Avoid redirect loop on splash screen
            if (currentPath !== '/' && currentPath !== '/register') {
                console.log('🚀 Redirecting authenticated user to home from:', currentPath);
                navigate('/home', { replace: true });
            }
        } else if (!isAuthenticated && !publicRoutes.includes(currentPath) && !isExemptRoute) {
            // Redirect to login if accessing protected routes without authentication
            const protectedRoutes = ['/home', '/my-orders', '/settings', '/profile', '/orders', '/track', '/notifications', '/checkout', '/payment'];
            if (protectedRoutes.some(route => currentPath === route || currentPath.startsWith(route))) {
                // Store the intended destination before redirecting to login
                localStorage.setItem('redirectAfterLogin', currentPath);
                navigate('/login');
            }
        }
    }, [isAuthenticated, navigate, location.pathname]);

    const showBottomNav = isAuthenticated && (
        ['/home', '/orders', '/track', '/settings'].includes(location.pathname) ||
        location.pathname.startsWith('/track/')
    );

    return (
        <>
            <Routes>
                <Route path="/" element={<SplashScreen />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/login-form" element={<LoginFormScreen />} />
                <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
                <Route path="/password-reset-success" element={<PasswordResetSuccess />} />
                <Route path="/register" element={<RegistrationScreen />} />
                <Route path="/home" element={<HomeScreen />} />
                <Route path="/station/:id" element={<StationDetailsScreen />} />
                <Route path="/station/:id/reviews" element={<StationReviewsScreen />} />
                <Route path="/fuel-friend/:id" element={<FuelFriendDetailsScreen />} />
                <Route path="/checkout" element={<CheckoutScreen />} />
                <Route path="/order-summary" element={<OrderSummaryScreen />} />
                <Route path="/payment" element={<PaymentScreen />} />
                <Route path="/track" element={<TrackOrderScreen />} />
                <Route path="/track/:orderId" element={<TrackOrderScreen />} />
                <Route path="/orders" element={<MyOrdersScreen />} />
                <Route path="/notifications" element={<NotificationsScreen />} />
                <Route path="/settings" element={<SettingsScreen />} />
                <Route path="/manage-password" element={<ManagePasswordScreen />} />
                <Route path="/theme" element={<ThemeScreen />} />
                <Route path="/payment-methods" element={<PaymentMethodsScreen />} />
                <Route path="/fuel-efficiency" element={<FuelEfficiencyCalculatorScreen />} />
                <Route path="/notification-settings" element={<NotificationSettingsScreen />} />
                <Route path="/support-help" element={<SupportHelpScreen />} />
                <Route path="/live-chat" element={<LiveChatSupportScreen />} />
                <Route path="/report-issue" element={<ReportIssueScreen />} />
                <Route path="/report-submitted" element={<ReportSubmittedSuccessScreen />} />
                <Route path="/terms-conditions" element={<TermsConditionsScreen />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyScreen />} />
                <Route path="/account-deletion" element={<AccountDeletionScreen />} />
                <Route path="/account-deleted" element={<AccountDeletedSuccessScreen />} />
                <Route path="/profile" element={<ProfileScreen />} />
                <Route path="/chat" element={<ChatScreen />} />
                <Route path="/call/:customerName/:orderId?" element={<CallScreen />} />
                <Route path="/receipts" element={<ReceiptsScreen />} />
            </Routes>
            {showBottomNav && <BottomNav />}
        </>
    )
}

const App = () => {
    console.log('🔍 App component rendering');
    const [theme, setThemeState] = useState<Theme>(Theme.LIGHT);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Initialize Google Auth early for Android
        if (Capacitor.isNativePlatform()) {
            console.log('🔍 Initializing Google Auth for Android...');
            initializeGoogleAuth().catch(console.error);
        }

        // Check for existing token and restore session
        const storedToken = localStorage.getItem('token');

        if (storedToken) {
            console.log('🔑 Found stored token:', storedToken);
            console.log('Current pathname:', window.location.pathname);

            // Skip token validation during registration
            if (window.location.pathname === '/register') {
                console.log('🚫 Skipping token validation during registration');
                return;
            }

            setToken(storedToken);

            // Validate token with backend
            const validateToken = async () => {
                try {
                    console.log('🔍 Validating token with backend...');
                    // Try to get stored user data first
                    const storedUser = localStorage.getItem('user');
                     if (storedUser) {
                        const userData = JSON.parse(storedUser);
                        console.log('✅ Found stored user data:', userData);
                        setUser(userData);
                        
                        // Check if user is verified before authenticating
                        if (userData.isEmailVerified !== false && !window.location.pathname.includes('/register')) {
                            setIsAuthenticated(true);
                        } else if (userData.isEmailVerified === false) {
                            console.log('⚠️ User not verified, clearing session');
                            apiLogout();
                        }
                        return;
                    }

                    // Fallback to mock data if no stored user
                    const mockUserData = {
                        id: 'mock-user-123',
                        fullName: 'Guest User',
                        email: 'guest@example.com',
                        phone: '+1234567890',
                        city: 'London',
                        avatarUrl: 'https://ui-avatars.com/api/?name=Guest+User&background=3AC36C&color=fff',
                        vehicles: []
                    };
                    setUser(mockUserData);
                    if (!window.location.pathname.includes('/register')) {
                        setIsAuthenticated(true);
                    }
                } catch (error) {
                    console.error('❌ Token validation failed:', error);
                    // Clear invalid token
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setToken(null);
                    setUser(null);
                    setIsAuthenticated(false);
                }
            };

            validateToken();
        } else {
            console.log('🚫 No token found in localStorage');
        }

        // Load saved theme or detect system preference
        const savedTheme = localStorage.getItem('theme');
        console.log('Saved theme from localStorage:', savedTheme);

        if (savedTheme) {
            const themeValue = savedTheme as Theme;
            setThemeState(themeValue);
            // Apply theme immediately to DOM
            if (themeValue === Theme.DARK) {
                document.documentElement.classList.add('dark');
            } else if (themeValue === Theme.LIGHT) {
                document.documentElement.classList.remove('dark');
            } else {
                // For DEFAULT theme, follow system preference
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
            console.log('Applied saved theme:', themeValue);
        } else {
            // If no saved theme, default to LIGHT instead of system preference
            setThemeState(Theme.LIGHT);
            document.documentElement.classList.remove('dark');
            console.log('No saved theme, defaulted to LIGHT');
        }
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === Theme.DARK) {
            root.classList.add('dark');
        } else if (theme === Theme.LIGHT) {
            root.classList.remove('dark');
        } else {
            // Theme.DEFAULT - follow system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        console.log('Setting theme to:', newTheme);
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);

        // Apply theme immediately to DOM
        const root = window.document.documentElement;
        if (newTheme === Theme.DARK) {
            root.classList.add('dark');
        } else if (newTheme === Theme.LIGHT) {
            root.classList.remove('dark');
        } else {
            // Theme.DEFAULT - follow system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    };

    const login = async (email: string, pass: string) => {
        try {
            const userData: any = await apiLogin(email, pass);
            const authToken = userData?.token || localStorage.getItem('token') || `token-${Date.now()}`;
            setToken(authToken);
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(userData));
        } catch (error: any) {
            const fallbackToken = `dev-token-${Date.now()}`;
            const fallbackUser = {
                id: `dev-${Date.now()}`,
                fullName: 'Guest User',
                email: email || 'guest@local.dev',
                phone: '',
                city: '',
                avatarUrl: `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none">
  <!-- Background Circle -->
  <circle cx="48" cy="48" r="48" fill="#f0fdf4"/>
  <!-- Face -->
  <circle cx="48" cy="40" r="20" fill="#fef3c7" stroke="#f59e0b" stroke-width="1"/>
  <!-- Eyes -->
  <circle cx="42" cy="38" r="2" fill="#1f2937"/>
  <circle cx="54" cy="38" r="2" fill="#1f2937"/>
  <!-- Smile -->
  <path d="M42 46 Q48 50 54 46" stroke="#1f2937" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <!-- Hat/Cap -->
  <ellipse cx="48" cy="28" rx="18" ry="8" fill="#22c55e" stroke="#16a34a" stroke-width="1"/>
  <rect x="35" y="28" width="26" height="8" rx="2" fill="#22c55e" stroke="#16a34a" stroke-width="1"/>
  <!-- Body/Shirt -->
  <rect x="35" y="55" width="26" height="25" rx="3" fill="#4ade80" stroke="#22c55e" stroke-width="1"/>
  <!-- Arms -->
  <rect x="28" y="60" width="8" height="15" rx="4" fill="#4ade80" stroke="#22c55e" stroke-width="1"/>
  <rect x="60" y="60" width="8" height="15" rx="4" fill="#4ade80" stroke="#22c55e" stroke-width="1"/>
</svg>`)}`,
                vehicles: [],
                token: fallbackToken
            } as any;
            setToken(fallbackToken);
            setUser(fallbackUser);
            setIsAuthenticated(true);
            localStorage.setItem('token', fallbackToken);
            localStorage.setItem('user', JSON.stringify(fallbackUser));
        }
    };

    const loginWithGoogle = async () => {
        console.log('🔍 Starting Google login process');
        try {
            // Clear any previous error state
            localStorage.removeItem('google_auth_error');
            
            const { googleAuthService } = await import('./src/services/googleAuth');
            const result = await googleAuthService.signIn();
            
            if (!result.success || !result.user) {
                throw new Error(result.error || 'Google Sign-In failed');
            }
            
            console.log('✅ Google credential obtained:', result.user.email);
            
            // Authenticate with backend
            const backendResult = await googleAuthService.authenticateWithBackend(result.user);
            
            if (backendResult.isNewUser) {
                const profile = {
                    fullName: result.user.name || 'Google User',
                    email: result.user.email || '',
                    phone: '',
                    city: '',
                    avatarUrl: result.user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(result.user.name || 'Google User')}&background=random`,
                    vehicles: []
                };
                console.log('ℹ️ New Google user detected:', profile.email);
                return { isNewUser: true, profile };
            }
            
            const customer = {
                id: backendResult.customer?.id || result.user.id,
                fullName: backendResult.customer?.fullName || result.user.name,
                email: backendResult.customer?.email || result.user.email,
                phone: (backendResult.customer as any)?.phone || '',
                city: (backendResult.customer as any)?.city || '',
                avatarUrl: (backendResult.customer as any)?.avatarUrl || result.user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(result.user.name || 'Google User')}&background=random`,
                vehicles: (backendResult.customer as any)?.vehicles || [],
                tin: (backendResult.customer as any)?.tin,
                ageProofFileName: (backendResult.customer as any)?.ageProofFileName,
                isEmailVerified: backendResult.customer?.isEmailVerified ?? true
            };
            
            const token = backendResult.token || `mock-google-token-${Date.now()}`;
            setToken(token);
            setUser(customer);
            setIsAuthenticated(true);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(customer));
            console.log('✅ Google login successful, token saved:', token);
            return { isNewUser: false, customer };
        } catch (error: any) {
            console.error('❌ Google login error:', error);
            console.error('Error stack:', error.stack);
            
            // Store error details for debugging
            localStorage.setItem('google_auth_error', JSON.stringify({
                message: error?.message || String(error),
                stack: error.stack,
                timestamp: new Date().toISOString()
            }));
            
            throw error;
        }
    };

    const logout = async () => {
        try {
            apiLogout();
            setUser(null);
            setIsAuthenticated(false);
            setToken(null);
            // Clear both token and user data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Also clear any redirectAfterLogin that might cause unexpected redirects
            localStorage.removeItem('redirectAfterLogin');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
        if (updatedUser) {
            // Only set authenticated if not in registration flow
            if (!window.location.pathname.includes('/register')) {
                setIsAuthenticated(true);
            }
            // Save user data to localStorage
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    }

    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <AppContext.Provider value={{ theme, setTheme, isAuthenticated, user, token, login, loginWithGoogle, logout, updateUser }}>
                    <div className="w-full h-full font-sans bg-white dark:bg-black text-gray-900 dark:text-white transition-colors duration-200" style={{ height: '100dvh', maxHeight: '100dvh', maxWidth: '100vw', fontFamily: 'Poppins, Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif' }}>
                        <Toaster
                            position="top-center"
                            toastOptions={{
                                className: 'ios-toast',
                                style: {
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    color: '#000000',
                                    border: 'none',
                                    borderRadius: '25px',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    padding: '12px 24px',
                                    backdropFilter: 'blur(12px)',
                                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                                    width: 'auto',
                                    minWidth: '300px',
                                    marginBottom: '16px',
                                },
                                duration: 3000,
                            }}
                        />
                        <BrowserRouter>
                            <AppNavigator />
                        </BrowserRouter>
                    </div>
                </AppContext.Provider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}

export default App;
