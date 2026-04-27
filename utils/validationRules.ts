import { getAppVersion, APP_VERSION, VERSION_CONFIG } from './versionConfig';

// Get current version config
const currentVersion = getAppVersion();
const config = VERSION_CONFIG[currentVersion];

// Phone validation patterns
const PHONE_PATTERNS = {
  UK: /^(\+44|0)[1-9]\d{9}$/,
  US: /^(\+1)?[2-9]\d{9}$/,
  GLOBAL: /^[\d\s\-\+\(\)]{8,}$/,
};

// Email validation
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Postcode/ZIP validation
const POSTCODE_PATTERNS = {
  UK: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i,
  US: /^\d{5}(-\d{4})?$/,
  GLOBAL: /^.{3,}$/,
};

// Password strength requirements
const PASSWORD_REQUIREMENTS = {
  STRICT: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
  },
  GLOBAL: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: false,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
  },
};

// Validation functions
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  
  if (!EMAIL_PATTERN.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  
  return { valid: true };
};

export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  if (!phone) {
    if (config.requirePhoneVerification) {
      return { valid: false, error: 'Phone number is required' };
    }
    return { valid: true }; // Optional for global version
  }
  
  const pattern = currentVersion === APP_VERSION.UK_US 
    ? PHONE_PATTERNS.UK 
    : PHONE_PATTERNS.GLOBAL;
  
  if (!pattern.test(phone.replace(/\s/g, ''))) {
    const message = currentVersion === APP_VERSION.UK_US
      ? 'Please enter a valid UK/US phone number'
      : 'Please enter a valid phone number';
    return { valid: false, error: message };
  }
  
  return { valid: true };
};

export const validatePassword = (password: string): { valid: boolean; error?: string; strength?: number } => {
  if (!password) {
    return { valid: false, error: 'Password is required', strength: 0 };
  }
  
  const requirements = config.strictValidation 
    ? PASSWORD_REQUIREMENTS.STRICT 
    : PASSWORD_REQUIREMENTS.GLOBAL;
  
  if (password.length < requirements.minLength) {
    return { 
      valid: false, 
      error: `Password must be at least ${requirements.minLength} characters`,
      strength: 1,
    };
  }
  
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    return { 
      valid: false, 
      error: 'Password must contain at least one uppercase letter',
      strength: 2,
    };
  }
  
  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    return { 
      valid: false, 
      error: 'Password must contain at least one lowercase letter',
      strength: 2,
    };
  }
  
  if (requirements.requireNumber && !/\d/.test(password)) {
    return { 
      valid: false, 
      error: 'Password must contain at least one number',
      strength: 3,
    };
  }
  
  if (requirements.requireSpecial && !/[@$!%*?&]/.test(password)) {
    return { 
      valid: false, 
      error: 'Password must contain at least one special character (@$!%*?&)',
      strength: 3,
    };
  }
  
  if (!requirements.pattern.test(password)) {
    return { 
      valid: false, 
      error: 'Password does not meet security requirements',
      strength: 2,
    };
  }
  
  return { valid: true, strength: 4 };
};

export const validatePostcode = (postcode: string): { valid: boolean; error?: string } => {
  if (!postcode) {
    if (config.strictValidation) {
      return { valid: false, error: 'Postcode/ZIP is required' };
    }
    return { valid: true }; // Optional for global version
  }
  
  const pattern = currentVersion === APP_VERSION.UK_US 
    ? POSTCODE_PATTERNS.UK 
    : POSTCODE_PATTERNS.GLOBAL;
  
  if (!pattern.test(postcode)) {
    const message = currentVersion === APP_VERSION.UK_US
      ? 'Please enter a valid UK postcode or US ZIP code'
      : 'Please enter a valid postcode';
    return { valid: false, error: message };
  }
  
  return { valid: true };
};

export const validateName = (name: string): { valid: boolean; error?: string } => {
  if (!name) {
    return { valid: false, error: 'Name is required' };
  }
  
  if (name.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (config.strictValidation) {
    // Strict: Only letters, spaces, hyphens, apostrophes
    if (!/^[a-zA-Z\s\-']+$/.test(name)) {
      return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
    }
  }
  
  return { valid: true };
};

export const validatePaymentCard = (cardNumber: string): { valid: boolean; error?: string } => {
  if (!config.paymentValidation) {
    return { valid: true }; // Skip validation for global version
  }
  
  if (!cardNumber) {
    return { valid: false, error: 'Card number is required' };
  }
  
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s\-]/g, '');
  
  // Check if it's all digits
  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, error: 'Card number must contain only digits' };
  }
  
  // Check length (13-19 digits for most cards)
  if (cleaned.length < 13 || cleaned.length > 19) {
    return { valid: false, error: 'Invalid card number length' };
  }
  
  // Luhn algorithm check
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  if (sum % 10 !== 0) {
    return { valid: false, error: 'Invalid card number' };
  }
  
  return { valid: true };
};

export const validateCVV = (cvv: string): { valid: boolean; error?: string } => {
  if (!config.paymentValidation) {
    return { valid: true }; // Skip validation for global version
  }
  
  if (!cvv) {
    return { valid: false, error: 'CVV is required' };
  }
  
  if (!/^\d{3,4}$/.test(cvv)) {
    return { valid: false, error: 'CVV must be 3 or 4 digits' };
  }
  
  return { valid: true };
};

export const validateAge = (birthDate: string): { valid: boolean; error?: string } => {
  if (!birthDate) {
    return { valid: false, error: 'Date of birth is required' };
  }
  
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  const minAge = config.strictValidation ? 18 : 16;
  
  if (age < minAge) {
    return { valid: false, error: `You must be at least ${minAge} years old` };
  }
  
  return { valid: true };
};

// Form validation helper
export const validateForm = (formData: Record<string, any>): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Email validation
  if (formData.email !== undefined) {
    const emailResult = validateEmail(formData.email);
    if (!emailResult.valid) {
      errors.email = emailResult.error!;
    }
  }
  
  // Phone validation
  if (formData.phone !== undefined) {
    const phoneResult = validatePhone(formData.phone);
    if (!phoneResult.valid) {
      errors.phone = phoneResult.error!;
    }
  }
  
  // Password validation
  if (formData.password !== undefined) {
    const passwordResult = validatePassword(formData.password);
    if (!passwordResult.valid) {
      errors.password = passwordResult.error!;
    }
  }
  
  // Name validation
  if (formData.name !== undefined) {
    const nameResult = validateName(formData.name);
    if (!nameResult.valid) {
      errors.name = nameResult.error!;
    }
  }
  
  // Postcode validation
  if (formData.postcode !== undefined) {
    const postcodeResult = validatePostcode(formData.postcode);
    if (!postcodeResult.valid) {
      errors.postcode = postcodeResult.error!;
    }
  }
  
  // Age validation
  if (formData.birthDate !== undefined) {
    const ageResult = validateAge(formData.birthDate);
    if (!ageResult.valid) {
      errors.birthDate = ageResult.error!;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

// Get validation requirements for display
export const getValidationRequirements = () => {
  return {
    version: currentVersion,
    strictValidation: config.strictValidation,
    requireEmailVerification: config.requireEmailVerification,
    requirePhoneVerification: config.requirePhoneVerification,
    paymentValidation: config.paymentValidation,
    passwordMinLength: config.strictValidation ? 12 : 8,
    passwordRequireSpecial: config.strictValidation,
    minAge: config.strictValidation ? 18 : 16,
  };
};
