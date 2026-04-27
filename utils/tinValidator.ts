/**
 * TIN (Tax Identification Number) Validator
 * Supports multiple country formats and two version modes:
 * 1. Strict (US/UK only)
 * 2. Global (US, UK, and other international formats)
 */

export type CountryCode = 'US' | 'UK' | 'GLOBAL' | 'OTHER';

export interface TINConfig {
    label: string;
    placeholder: string;
    description: string;
    format: (value: string) => string;
    validate: (value: string) => { isValid: boolean; errorMessage: string };
}

export const TIN_CONFIGS: Record<CountryCode, TINConfig> = {
    US: {
        label: 'United States',
        placeholder: 'XXX-XX-XXXX (SSN/EIN)',
        description: '9-digit Social Security or Employer ID',
        format: (val) => {
            const cleaned = val.replace(/\D/g, '').substring(0, 9);
            if (cleaned.length > 5) return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 5)}-${cleaned.substring(5)}`;
            if (cleaned.length > 3) return `${cleaned.substring(0, 3)}-${cleaned.substring(3)}`;
            return cleaned;
        },
        validate: (val) => {
            const cleaned = val.replace(/\D/g, '');
            if (cleaned.length !== 9) return { isValid: false, errorMessage: 'US TIN must be 9 digits' };
            if (/^(000|666|9\d{2})/.test(cleaned)) return { isValid: false, errorMessage: 'Invalid US SSN prefix' };
            return { isValid: true, errorMessage: '' };
        }
    },
    UK: {
        label: 'United Kingdom',
        placeholder: 'XXXXX XXXXXX (UTR/NI)',
        description: '10-digit UTR or NI Number (AA 12 34 56 A)',
        format: (val) => {
            const cleaned = val.replace(/[^A-Z0-9]/gi, '').toUpperCase();
            // UK UTR (10 digits)
            if (/^\d+$/.test(cleaned)) {
                const truncated = cleaned.substring(0, 10);
                if (truncated.length > 5) return `${truncated.substring(0, 5)} ${truncated.substring(5)}`;
                return truncated;
            }
            // UK NI (AA 12 34 56 A)
            const ni = cleaned.substring(0, 9);
            const parts = [];
            if (ni.length > 0) parts.push(ni.substring(0, 2));
            if (ni.length > 2) parts.push(ni.substring(2, 4));
            if (ni.length > 4) parts.push(ni.substring(4, 6));
            if (ni.length > 6) parts.push(ni.substring(6, 8));
            if (ni.length > 8) parts.push(ni.substring(8, 9));
            return parts.join(' ');
        },
        validate: (val) => {
            const cleaned = val.replace(/[^A-Z0-9]/gi, '').toUpperCase();
            // UTR: 10 digits
            if (/^\d+$/.test(cleaned)) {
                if (cleaned.length === 10) return { isValid: true, errorMessage: '' };
                return { isValid: false, errorMessage: 'UK UTR must be 10 digits' };
            }
            // NI: 2 letters + 6 digits + 1 letter
            if (/^[A-Z]{2}\d{6}[A-Z]$/.test(cleaned)) {
                const forbidden = ['BG', 'GB', 'NK', 'KN', 'TN', 'NT', 'ZZ'];
                if (forbidden.includes(cleaned.substring(0, 2))) {
                    return { isValid: false, errorMessage: 'Invalid UK NI prefix' };
                }
                return { isValid: true, errorMessage: '' };
            }
            return { isValid: false, errorMessage: 'Invalid UK TIN format' };
        }
    },
    GLOBAL: {
        label: 'Other Countries',
        placeholder: 'Enter Tax ID',
        description: 'International Tax Identification Number',
        format: (val) => {
            const cleaned = val.replace(/[^A-Z0-9]/gi, '').toUpperCase().substring(0, 15);
            return cleaned.replace(/(.{4})/g, '$1 ').trim();
        },
        validate: (val) => {
            const cleaned = val.replace(/[^A-Z0-9]/gi, '');
            if (cleaned.length < 6) return { isValid: false, errorMessage: 'TIN must be at least 6 characters' };
            if (cleaned.length > 15) return { isValid: false, errorMessage: 'TIN must be maximum 15 characters' };
            return { isValid: true, errorMessage: '' };
        }
    },
    OTHER: {
        label: 'Other Countries',
        placeholder: 'Enter Tax ID',
        description: 'International Tax Identification Number',
        format: (val) => {
            const cleaned = val.replace(/[^A-Z0-9]/gi, '').toUpperCase().substring(0, 15);
            return cleaned.replace(/(.{4})/g, '$1 ').trim();
        },
        validate: (val) => {
            const cleaned = val.replace(/[^A-Z0-9]/gi, '');
            if (cleaned.length < 6) return { isValid: false, errorMessage: 'TIN must be at least 6 characters' };
            if (cleaned.length > 15) return { isValid: false, errorMessage: 'TIN must be maximum 15 characters' };
            return { isValid: true, errorMessage: '' };
        }
    }
};

/**
 * Clean TIN by removing all non-numeric characters (except letters)
 */
export const cleanTIN = (tin: string): string => {
    return tin.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
};

/**
 * Auto-detect and format TIN based on input (if country not selected)
 */
export const formatTIN = (tin: string, countryCode?: CountryCode): string => {
    if (countryCode && TIN_CONFIGS[countryCode]) {
        return TIN_CONFIGS[countryCode].format(tin);
    }

    const cleaned = cleanTIN(tin);
    if (cleaned.length === 0) return '';
    
    // Auto-detect for 9 digits (US)
    if (cleaned.length === 9 && /^\d+$/.test(cleaned)) {
        return TIN_CONFIGS.US.format(cleaned);
    }
    // Auto-detect for 10 digits (UK UTR)
    if (cleaned.length === 10 && /^\d+$/.test(cleaned)) {
        return TIN_CONFIGS.UK.format(cleaned);
    }
    // Auto-detect for NI (letters then digits)
    if (/^[A-Z]{2}/.test(cleaned)) {
        return TIN_CONFIGS.UK.format(cleaned);
    }
    
    return TIN_CONFIGS.GLOBAL.format(cleaned);
};

/**
 * Validate TIN
 */
export const validateTIN = (tin: string, countryCode?: CountryCode): { isValid: boolean; errorMessage: string } => {
    const tinValue = tin.trim();
    if (!tinValue) return { isValid: false, errorMessage: 'TIN is required' };

    if (countryCode && TIN_CONFIGS[countryCode]) {
        return TIN_CONFIGS[countryCode].validate(tinValue);
    }

    // Default validation if no country selected
    const cleaned = cleanTIN(tinValue);
    if (cleaned.length < 6) return { isValid: false, errorMessage: 'TIN must be at least 6 characters' };
    if (cleaned.length > 15) return { isValid: false, errorMessage: 'TIN must be maximum 15 characters' };
    
    return { isValid: true, errorMessage: '' };
};

/**
 * Quick validation check (boolean only)
 */
export const isTINValid = (tin: string, countryCode?: CountryCode): boolean => {
    return validateTIN(tin, countryCode).isValid;
};
