import { loadStripe } from '@stripe/stripe-js';
import { apiCreatePaymentIntent } from './api';
import { currentVersion, config } from '../utils/versionConfig';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export interface PaymentData {
  amount: number;
  currency: string;
  orderId: string;
  customerId: string;
  description?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntent?: any;
  error?: string;
}

export const createPaymentIntent = async (paymentData: PaymentData) => {
  try {
    const response = await apiCreatePaymentIntent(
      paymentData.amount,
      paymentData.currency,
      paymentData.orderId
    );
    return response;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create payment intent');
  }
};

export const confirmPayment = async (
  clientSecret: string,
  paymentMethodId?: string,
  cardElement?: any
): Promise<PaymentResult> => {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }

    let confirmResult;
    
    if (cardElement) {
      // Use Stripe Elements for real payment
      confirmResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardElement.value?.cardholderName || 'Customer',
          },
        }
      });
    } else if (paymentMethodId) {
      // Use existing payment method
      confirmResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId
      });
    } else {
      throw new Error('No payment method provided');
    }

    if (confirmResult.error) {
      return {
        success: false,
        error: confirmResult.error.message
      };
    }

    // For UK/US version, validate payment intent
    if (config.paymentValidation && confirmResult.paymentIntent) {
      const validation = await validatePaymentIntent(confirmResult.paymentIntent.id);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error || 'Payment validation failed'
        };
      }
    }

    return {
      success: true,
      paymentIntent: confirmResult.paymentIntent
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Payment confirmation failed'
    };
  }
};

// Validate payment intent with backend
const validatePaymentIntent = async (paymentIntentId: string): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const authBase = import.meta.env.VITE_API_BASE_URL || "https://apidecor.kelolahrd.life";
    const response = await fetch(`${authBase}/api/payments/validate`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
      },
      body: JSON.stringify({ paymentIntentId }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Payment validation failed'
      };
    }
    
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Payment validation failed'
    };
  }
};

// Create payment method with real token
export const createPaymentMethod = async (cardElement: any, cardholderName?: string): Promise<{
  success: boolean;
  paymentMethodId?: string;
  error?: string;
}> => {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: cardholderName || 'Customer',
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      paymentMethodId: paymentMethod.id
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create payment method'
    };
  }
};

export { stripePromise };