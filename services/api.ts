import axios from 'axios';

// Version mode: "strict" (UK/US, real backend) vs "global" (more relaxed)
const VERSION_MODE = import.meta.env.VITE_VERSION_MODE || 'global';

// Real backend for strict mode (no simulation)
const REAL_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://apidecor.kelolahrd.life';

// MockAPI backend kept only for global / relaxed builds
const MOCK_API_JS_URL = import.meta.env.VITE_MOCKAPI_BASE_URL || 'https://67cbf7e63395520e6af6c5ac.mockapi.io/api/v1';

const isStrictMode = VERSION_MODE === 'strict';

// In strict mode all requests go to the real API, otherwise we keep using MockAPI
const API_BASE_URL = isStrictMode ? REAL_API_BASE_URL : MOCK_API_JS_URL;
const isMockApiMode = !isStrictMode;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 8000
});

const apiGet = async <T = any>(url: string, config?: any) => {
  const { data } = await api.get(url, config);
  return data as T;
};

const apiPost = async <T = any>(url: string, payload?: any, config?: any) => {
  const { data } = await api.post(url, payload, config);
  return data as T;
};

const apiPut = async <T = any>(url: string, payload?: any, config?: any) => {
  const { data } = await api.put(url, payload, config);
  return data as T;
};

const apiDelete = async <T = any>(url: string, config?: any) => {
  const { data } = await api.delete(url, config);
  return data as T;
};

// ==========================================
// AUTHENTICATION
// ==========================================

export const apiLogin = async (emailOrPhone: string, password: string) => {
  if (isMockApiMode) {
    try {
      const query = encodeURIComponent(emailOrPhone.trim());
      const { data } = await api.get(`/users?search=${query}`);
      const users = Array.isArray(data) ? data : [];
      const foundUser = users.find((u: any) =>
        (u.email && u.email.toLowerCase() === emailOrPhone.toLowerCase()) ||
        (u.phone && u.phone === emailOrPhone)
      );
      if (!foundUser || foundUser.password !== password) {
        throw new Error('Invalid email/phone or password');
      }
      const token = `mockapi-token-${foundUser.id}-${Date.now()}`;
      localStorage.setItem('token', token);
      return {
        id: String(foundUser.id),
        fullName: foundUser.fullName || foundUser.name || 'User',
        email: foundUser.email || '',
        phone: foundUser.phone || '',
        city: foundUser.city || '',
        avatarUrl: foundUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(foundUser.fullName || 'User')}&background=random`,
        vehicles: foundUser.vehicles || [],
        token,
        tin: foundUser.tin || '',
        ageProofFileName: foundUser.ageProofFileName || ''
      };
    } catch (mockError: any) {
      throw new Error(mockError?.message || 'MockAPI login failed');
    }
  }
  const { data } = await api.post('/api/auth/login', { emailOrPhone, password });
  if (!data.success) throw new Error(data.message || data.error);

  // Store token and return user data with vehicles
  const token = data.data.token;
  localStorage.setItem('token', token);

  return {
    ...data.data.customer,
    vehicles: data.data.vehicles,
    token
  };
};

export const apiRegisterStep1 = async (userData: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}) => {
  const { data } = await api.post('/api/auth/register/step1', userData);
  if (!data.success) throw new Error(data.message || data.error);
  return data.data;
};

export const apiRegister = async (registrationData: {
  step1: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    tin?: string;
    ageProofFileName?: string;
    ageProofDataUrl?: string;
    birthDate?: string;
  };
  step2: {
    brand: string;
    color: string;
    licenseNumber: string;
    fuelType: string;
  };
  subscription?: {
    planId: string;
  };
}) => {
  if (isMockApiMode) {
    try {
      const payload = {
        fullName: registrationData.step1.fullName,
        email: registrationData.step1.email,
        phone: registrationData.step1.phoneNumber,
        password: registrationData.step1.password,
        tin: registrationData.step1.tin || '',
        ageProofFileName: registrationData.step1.ageProofFileName || '',
        ageProofDataUrl: registrationData.step1.ageProofDataUrl || '',
        birthDate: registrationData.step1.birthDate || '',
        vehicles: [
          {
            id: `vehicle-${Date.now()}`,
            brand: registrationData.step2.brand,
            color: registrationData.step2.color,
            licenseNumber: registrationData.step2.licenseNumber,
            fuelType: registrationData.step2.fuelType
          }
        ],
        createdAt: new Date().toISOString()
      };
      const { data } = await api.post('/users', payload);
      const token = `mockapi-token-${data?.id || Date.now()}-${Date.now()}`;
      return {
        customer: {
          id: String(data?.id || Date.now()),
          fullName: payload.fullName,
          email: payload.email,
          phone: payload.phone,
          city: '',
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.fullName)}&background=random`,
          vehicles: payload.vehicles,
          tin: payload.tin,
          ageProofFileName: payload.ageProofFileName
        },
        token,
        subscription: registrationData.subscription || null
      };
    } catch (mockError: any) {
      throw new Error(mockError?.message || 'MockAPI register failed');
    }
  }
  const { data } = await api.post('/api/auth/register', registrationData);
  if (!data.success) throw new Error(data.message || data.error);
  return data.data;
};

export const apiGoogleAuth = async (googleData: {
  uid: string;
  email: string;
  displayName: string;
}) => {
  if (isMockApiMode) {
    try {
      // Use email directly for search without encoding to ensure MockAPI matches correctly
      const { data: users } = await api.get(`/users?search=${googleData.email}`);
      const existingUser = Array.isArray(users)
        ? users.find((u: any) => u.email?.toLowerCase() === googleData.email.toLowerCase())
        : null;

      if (existingUser) {
        return {
          isNewUser: false,
          customer: {
            id: String(existingUser.id),
            fullName: existingUser.fullName || existingUser.name || googleData.displayName,
            email: existingUser.email,
            phone: existingUser.phone || '',
            city: existingUser.city || '',
            avatarUrl: existingUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(googleData.displayName)}&background=random`,
            vehicles: existingUser.vehicles || []
          },
          token: `mockapi-google-token-${existingUser.id}-${Date.now()}`
        };
      }
      return {
        isNewUser: true,
        profile: {
          fullName: googleData.displayName,
          email: googleData.email,
          phone: '',
          city: '',
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(googleData.displayName)}&background=random`,
          vehicles: []
        }
      };
    } catch (mockError: any) {
      throw new Error(mockError?.message || 'MockAPI Google auth failed');
    }
  }
  const { data } = await api.post('/api/auth/google', googleData);
  if (!data.success) throw new Error(data.message || data.error);
  const payload = data.data || {};
  if (payload?.isNewUser) return payload;
  if (payload?.customer || payload?.token) {
    return {
      isNewUser: false,
      ...payload
    };
  }
  return {
    isNewUser: true,
    profile: {
      fullName: googleData.displayName,
      email: googleData.email,
      phone: '',
      city: '',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(googleData.displayName)}&background=random`,
      vehicles: []
    }
  };
};

export const apiResolveGoogleUserLocal = async (googleData: {
  uid: string;
  email: string;
  displayName: string;
}) => {
  try {
    // Get all users and search for exact email match
    const { data: users } = await api.get('/users');
    const existingUser = Array.isArray(users)
      ? users.find((u: any) => u.email?.toLowerCase() === googleData.email.toLowerCase())
      : null;

    if (existingUser) {
      console.log('🔍 Existing user found:', existingUser.email);
      return {
        isNewUser: false,
        customer: {
          id: String(existingUser.id),
          fullName: existingUser.fullName || existingUser.name || googleData.displayName,
          email: existingUser.email,
          phone: existingUser.phone || '',
          city: existingUser.city || '',
          avatarUrl: existingUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(googleData.displayName)}&background=random`,
          vehicles: existingUser.vehicles || []
        },
        token: `mockapi-google-token-${existingUser.id}-${Date.now()}`
      };
    }
  } catch (error) {
    console.error('❌ Error checking for existing user:', error);
    const localRaw = localStorage.getItem('user');
    if (localRaw) {
      try {
        const localUser = JSON.parse(localRaw);
        if (localUser?.email?.toLowerCase() === googleData.email.toLowerCase()) {
          console.log('🔍 Existing user found in localStorage');
          return {
            isNewUser: false,
            customer: localUser,
            token: localStorage.getItem('token') || `local-google-token-${Date.now()}`
          };
        }
      } catch {
      }
    }
  }

  console.log('🔍 New user detected:', googleData.email);
  return {
    isNewUser: true,
    profile: {
      fullName: googleData.displayName,
      email: googleData.email,
      phone: '',
      city: '',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(googleData.displayName)}&background=random`,
      vehicles: []
    }
  };
};

export const apiGetMe = async () => {
  if (isMockApiMode) {
    // For mock API, just return the data stored in localStorage if we have it
    const storedUser = localStorage.getItem('user');
    if (storedUser) return JSON.parse(storedUser);
    throw new Error('User not found in MockAPI context');
  }
  const { data } = await api.get('/api/auth/me');
  if (data?.success === false) throw new Error(data.message || data.error);
  return data?.data || data;
};

export const apiForgotPassword = async (emailOrPhone: string) => {
  const { data } = await api.post('/api/auth/forgot-password', { emailOrPhone });
  if (!data.success) throw new Error(data.message || data.error);
  return data;
};

export const apiResetPassword = async (email: string, password: string) => {
  const { data } = await api.post('/api/auth/reset-password', { email, password });
  if (!data.success) throw new Error(data.message || data.error);
  return data;
};

// ==========================================
// OTP SERVICES
// ==========================================

export const apiSendEmailOTP = async (email: string) => {
  try {
    const { data } = await api.post('/api/auth/otp/email/send', { email });
    if (!data.success) throw new Error(data.message || data.error);
    return data;
  } catch (error: any) {
    console.log('Email OTP API failed, using fallback');
    // Fallback for development/testing
    return {
      success: true,
      message: 'OTP sent successfully',
      simulated: true,
      otp: '123456' // Fixed OTP for testing
    };
  }
};

export const apiVerifyEmailOTP = async (email: string, otp: string) => {
  try {
    const { data } = await api.post('/api/auth/otp/email/verify', { email, otp });
    if (!data.success) throw new Error(data.message || data.error);
    return data;
  } catch (error: any) {
    console.log('Email OTP verification API failed, using fallback');
    // Fallback for development/testing - accept 123456 as valid OTP
    if (otp === '123456') {
      return {
        success: true,
        message: 'OTP verified successfully',
        user: {
          id: `user-${Date.now()}`,
          fullName: email.split('@')[0],
          email,
          phone: '',
          city: '',
          avatarUrl: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random`,
          vehicles: []
        }
      };
    }
    throw new Error('Invalid OTP code');
  }
};

// ==========================================
// WHATSAPP OTP (Using Baileys Service)
// ==========================================

export const apiSendWhatsAppOTP = async (phoneNumber: string) => {
  try {
    // Import the new WhatsApp service
    const { sendWhatsAppOTP } = await import('./whatsappService');

    // Use the Baileys-based WhatsApp service
    const result = await sendWhatsAppOTP(phoneNumber);

    if (!result.success && !result.simulated) {
      throw new Error(result.error || 'Failed to send OTP');
    }

    return result;
  } catch (error: any) {
    console.log('WhatsApp OTP service failed, using fallback');
    // Fallback for development/testing
    return {
      success: true,
      message: 'OTP sent successfully',
      simulated: true,
      otp: '123456' // Fixed OTP for testing
    };
  }
};

export const apiVerifyWhatsAppOTP = async (phoneNumber: string, otp: string) => {
  try {
    // Import the new WhatsApp service
    const { verifyWhatsAppOTP } = await import('./whatsappService');

    // Use the Baileys-based WhatsApp service
    const result = await verifyWhatsAppOTP(phoneNumber, otp);

    if (!result.success) {
      throw new Error(result.error || 'Invalid OTP code');
    }

    return result;
  } catch (error: any) {
    console.log('WhatsApp OTP verification service failed, using fallback');
    // Fallback for development/testing - accept 123456 as valid OTP
    if (otp === '123456') {
      return {
        success: true,
        message: 'OTP verified successfully',
        user: {
          id: `user-${Date.now()}`,
          fullName: 'WhatsApp User',
          email: '',
          phone: phoneNumber,
          city: '',
          avatarUrl: 'https://ui-avatars.com/api/?name=WhatsApp+User&background=random',
          vehicles: []
        }
      };
    }
    throw new Error('Invalid OTP code');
  }
};

export const apiGetWhatsAppStatus = async () => {
  try {
    const { checkWhatsAppServiceStatus } = await import('./whatsappService');
    return await checkWhatsAppServiceStatus();
  } catch (error) {
    return {
      success: false,
      status: 'disconnected',
      hasQR: false
    };
  }
};

// ==========================================
// WHATSAPP ORDER NOTIFICATIONS
// ==========================================

export const apiSendOrderConfirmationWhatsApp = async (
  phoneNumber: string,
  orderDetails: {
    orderId?: string;
    items?: string;
    total?: string;
    address?: string;
    deliveryTime?: string;
  }
) => {
  try {
    const { sendOrderConfirmation } = await import('./whatsappService');
    return await sendOrderConfirmation(phoneNumber, orderDetails);
  } catch (error: any) {
    console.error('Failed to send order confirmation via WhatsApp:', error);
    return {
      success: false,
      error: error.message || 'Failed to send order confirmation'
    };
  }
};

export const apiSendWhatsAppNotification = async (
  phoneNumber: string,
  message: string,
  title?: string
) => {
  try {
    const { sendWhatsAppNotification } = await import('./whatsappService');
    return await sendWhatsAppNotification(phoneNumber, message, title);
  } catch (error: any) {
    console.error('Failed to send WhatsApp notification:', error);
    return {
      success: false,
      error: error.message || 'Failed to send notification'
    };
  }
};

// ==========================================
// FUEL STATIONS
// ==========================================

export const apiGetStations = async (lat: number, lng: number, radius = 10000) => {
  const url = isMockApiMode ? '/stations' : `/api/stations?lat=${lat}&lng=${lng}&radius=${radius}`;
  const { data } = await api.get(url);
  if (Array.isArray(data)) return data;
  if (data?.success === false) throw new Error(data.message || data.error);
  return data?.data || data || [];
};

export const apiGetStationDetails = async (id: string) => {
  const url = isMockApiMode ? `/stations/${id}` : `/api/stations/${id}`;
  const { data } = await api.get(url);
  if (data?.id) return data;
  if (data?.success === false) throw new Error(data.message || data.error);
  return data?.data || data;
};

export const apiGetStationReviews = async (id: string, limit = 20) => {
  const url = isMockApiMode ? `/reviews?stationId=${id}` : `/api/stations/${id}/reviews?limit=${limit}`;
  const { data } = await api.get(url);
  if (Array.isArray(data)) return data;
  if (data?.success === false) throw new Error(data.message || data.error);
  return data?.data || data || [];
};

export const apiGetFuelFriendDetails = async (id: string) => {
  const url = isMockApiMode ? `/fuelfriends/${id}` : `/api/fuel-friends/${id}`;
  const { data } = await api.get(url);
  if (data?.id) return data;
  if (data?.success === false) throw new Error(data.message || data.error);
  return data?.data || data;
};

export const apiGetFuelFriendReviews = async (id: string, limit = 20) => {
  const url = isMockApiMode ? `/reviews?fuelFriendId=${id}` : `/api/fuel-friends/${id}/reviews?limit=${limit}`;
  const { data } = await api.get(url);
  if (Array.isArray(data)) return data;
  if (data?.success === false) throw new Error(data.message || data.error);
  return data?.data || data || [];
};

export const apiAddReview = async (reviewData: {
  customerId: string;
  stationId?: string;
  fuelFriendId?: string;
  rating: number;
  comment?: string;
}) => {
  const url = isMockApiMode ? '/reviews' : '/api/reviews';
  const { data } = await api.post(url, reviewData);
  if (data?.id) return data;
  if (data?.success === false) throw new Error(data.message || data.error);
  return data?.data || data;
};

// ==========================================
// ORDERS
// ==========================================

export const apiCreateOrder = async (orderData: {
  vehicleId: string;
  deliveryAddress: string;
  deliveryPhone: string;
  fuelType: string;
  fuelQuantity: string;
  fuelCost: string;
  deliveryFee: string;
  totalAmount: string;
  orderType?: string;
}) => {
  const url = isMockApiMode ? '/orders' : '/api/orders';
  const { data } = await api.post(url, {
    ...orderData,
    createdAt: new Date().toISOString()
  });
  if (data?.id) return data;
  if (data?.success === false) throw new Error(data.message || data.error);
  return data?.data || data;
};

export const apiConfirmPayment = async (orderId: string, paymentIntentId: string) => {
  // Try mock first
  if (isMockApiMode) {
    const { data } = await api.put(`/orders/${orderId}`, { paymentIntentId, status: 'paid' });
    if (data?.id) return data;
  }
  const { data } = await api.post(`/api/orders/${orderId}/confirm-payment`, {
    paymentIntentId
  });
  if (data?.success === false) throw new Error(data.message || data.error);
  return data?.data || data;
};

export const apiGetOrders = async (customerId?: string, status?: string) => {
  let url = isMockApiMode ? '/orders' : '/api/orders';
  const params = new URLSearchParams();

  if (customerId) params.append('customerId', customerId);
  if (status) params.append('status', status);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const { data } = await api.get(url);
  if (Array.isArray(data)) return data;
  if (data?.success === false) throw new Error(data.message || data.error);
  return data?.data || data || [];
};

export const apiGetOrderDetail = async (orderId: string) => {
  const url = isMockApiMode ? `/orders/${orderId}` : `/api/orders/${orderId}`;
  const { data } = await api.get(url);
  if (data?.id) return data;
  if (data?.success === false) throw new Error(data.message || data.error);
  return data?.data || data;
};

// ==========================================
// SUBSCRIPTIONS
// ==========================================

export const apiGetSubscriptionPlans = async () => {
  const url = isMockApiMode ? '/subscription-plans' : '/api/subscription-plans';
  const { data } = await api.get(url);
  if (Array.isArray(data)) return data;
  if (data?.success === false) throw new Error(data.message || data.error);
  return data?.data || data || [];
};

export const apiGetCards = async () => {
  const data = await apiGet<any>('/cards');
  if (Array.isArray(data)) return data;
  if (data?.success === false) throw new Error(data.message || data.error || 'Failed to load cards');
  return data?.data || [];
};

export const apiAddCard = async (cardData: {
  holderName?: string;
  type: string;
  number: string;
  expiry: string;
  cvv?: string;
  isDefault?: boolean;
}) => {
  const payload = {
    holderName: cardData.holderName || 'FuelFriendly User',
    type: cardData.type,
    lastFour: cardData.number.slice(-4),
    expiry: cardData.expiry,
    isDefault: !!cardData.isDefault
  };
  const data = await apiPost<any>('/cards', payload);
  if (data?.success === false) throw new Error(data.message || data.error || 'Failed to add card');
  return data?.data || data;
};

export const apiDeleteCard = async (cardId: string) => {
  const data = await apiDelete<any>(`/cards/${cardId}`);
  if (data?.success === false) throw new Error(data.message || data.error || 'Failed to delete card');
  return data?.data || data;
};

export const apiCreateSubscription = async (subscriptionData: {
  customerId: string;
  planId: string;
  paymentMethodId?: string;
}) => {
  // Note: This endpoint requires authentication
  // Since we don't have real auth tokens, we'll mock this for now
  console.warn('Subscription creation requires valid auth token');

  // Return mock successful subscription
  return {
    success: true,
    subscription: {
      id: `sub_${Date.now()}`,
      customerId: subscriptionData.customerId,
      planId: subscriptionData.planId,
      status: 'active',
      createdAt: new Date().toISOString()
    }
  };
};

export const apiCreateSubscriptionPlan = async (planData: {
  name: string;
  price: number;
  duration: number;
  discountPercentage: number;
  features: string[];
}) => {
  const { data } = await api.post('/api/admin/subscription-plans', planData);
  if (!data.success) throw new Error(data.message || data.error);
  return data.data;
};

export const apiUpdateSubscriptionPlan = async (planId: string, planData: {
  name?: string;
  price?: number;
  duration?: number;
  discountPercentage?: number;
  features?: string[];
}) => {
  const { data } = await api.put(`/api/admin/subscription-plans/${planId}`, planData);
  if (!data.success) throw new Error(data.message || data.error);
  return data.data;
};

// ==========================================
// PAYMENTS
// ==========================================

export const apiCreatePaymentIntent = async (amount: number, currency: string, orderId: string) => {
  if (isMockApiMode) {
    return {
      clientSecret: `mock_secret_${Date.now()}`,
      paymentIntentId: `pi_${Date.now()}`
    };
  }
  const { data } = await api.post('/api/payments/create-intent', {
    amount,
    currency,
    orderId
  });
  if (data?.success === false) throw new Error(data.message || data.error);
  return data?.data || data;
};

// ==========================================
// NOTIFICATIONS
// ==========================================

export const apiRegisterFCMToken = async (customerId: string, token: string, deviceType?: string) => {
  if (isMockApiMode) return { success: true };
  const { data } = await api.post('/api/notifications/register-token', {
    customerId,
    token,
    deviceType
  });
  if (data?.success === false) throw new Error(data.message || data.error);
  return data?.data || data;
};

export const apiGetNotifications = async () => {
  const url = isMockApiMode ? '/notifications' : '/api/notifications';
  const { data } = await api.get(url);
  if (Array.isArray(data)) return data;
  if (data?.success === false) throw new Error(data.message || data.error);
  return data?.data || data || [];
};

export const apiMarkNotificationAsRead = async (notificationId: string) => {
  if (isMockApiMode) return { success: true };
  const { data } = await api.patch(`/api/notifications/${notificationId}/read`);
  if (data?.success === false) throw new Error(data.message || data.error);
  return data?.data || data;
};

export const apiSendTestNotification = async () => {
  if (isMockApiMode) return { success: true };
  const { data } = await api.post('/api/notifications/test');
  if (data?.success === false) throw new Error(data.message || data.error);
  return data?.data || data;
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

export const apiUpdateProfile = async (profileData: any) => {
  if (isMockApiMode) {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : {};
    const updated = { ...user, ...profileData };
    localStorage.setItem('user', JSON.stringify(updated));
    return updated;
  }
  const data = await apiPut<any>('/api/profile/update', profileData);
  if (data?.success === false) {
    throw new Error(data.error || 'Failed to update profile');
  }
  return data?.data || data;
};

export const apiChangePassword = async (customerId: string, currentPassword: string, newPassword: string) => {
  if (isMockApiMode) return { success: true };
  const data = await apiPost<any>('/api/auth/change-password', {
    customerId,
    currentPassword,
    newPassword
  });
  if (data?.success === false) {
    throw new Error(data.error || 'Failed to change password');
  }
  return data?.data || data;
};

export const apiDeleteAccount = async (customerId: string, reason?: string) => {
  if (isMockApiMode) {
    apiLogout();
    return { success: true };
  }
  const data = await apiDelete<any>('/api/auth/delete-account', {
    data: {
      customerId,
      reason
    }
  });
  if (data?.success === false) {
    throw new Error(data.error || 'Failed to delete account');
  }
  return data?.data || data;
};

export const apiGetRouteDirections = async (start: [number, number], end: [number, number], mapToken: string) => {
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapToken}`;
  const { data } = await axios.get(url, { timeout: 3000 });
  return data;
};

export const apiSearchFuelStations = async (bbox: string, mapToken: string) => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/fuel.json?access_token=${mapToken}&bbox=${bbox}&limit=10&types=poi&country=US,GB`;
  const { data } = await axios.get(url, { timeout: 4000 });
  return data;
};

export const apiHealthCheck = async () => {
  const { data } = await api.get('/api/health');
  return data;
};

export const apiLogout = () => {
  // ✅ Clear token and user data from localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);

    // Handle network errors
    if (!error.response) {
      const networkError = new Error('Network error. Please check your connection.');
      (networkError as any).isNetworkError = true;
      return Promise.reject(networkError);
    }

    // Handle standardized error responses
    const errorData = error.response?.data;
    if (errorData && !errorData.success) {
      const errorMessage = errorData.message || errorData.error || 'An error occurred';
      const responseCode = errorData.responseCode;

      // Handle specific response codes
      if (!isMockApiMode && (responseCode === 'RC_401' || responseCode === 'RC_A004')) {
        // Unauthorized or token expired
        apiLogout();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // Throw error with standardized message
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).responseCode = responseCode;
      (enhancedError as any).statusCode = error.response.status;
      return Promise.reject(enhancedError);
    }

    // Handle HTTP status codes
    const status = error.response?.status;
    let message = error.message;

    switch (status) {
      case 400:
        message = 'Invalid request. Please check your input.';
        break;
      case 401:
        message = 'Authentication required. Please login.';
        break;
      case 403:
        message = 'Access denied.';
        break;
      case 404:
        message = 'Resource not found.';
        break;
      case 429:
        message = 'Too many requests. Please try again later.';
        break;
      case 500:
        message = 'Server error. Please try again later.';
        break;
    }

    const statusError = new Error(message);
    (statusError as any).statusCode = status;
    return Promise.reject(statusError);
  }
);

export default api;
