import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Eye, EyeOff, Mail, MessageSquare } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiGetSubscriptionPlans, apiRegister, apiSendEmailOTP, apiVerifyEmailOTP, apiSendWhatsAppOTP, apiVerifyWhatsAppOTP } from '../services/api';
import Logo from '../components/Logo';
import AnimatedPage from '../components/AnimatedPage';
import VerificationSuccess from '../components/VerificationSuccess';
import Button from '../components/Button';
import TouchFeedback from '../components/TouchFeedback';
import TapEffectButton from '../components/TapEffectButton';
import SubscriptionPlans from '../components/SubscriptionPlans';
import { validateTIN, formatTIN, cleanTIN, TIN_CONFIGS, CountryCode } from '../utils/tinValidator';

// Get version mode from environment
const VERSION_MODE = import.meta.env.VITE_VERSION_MODE || 'global';

// Module-level OTP store — survives re-renders and step changes reliably
const _otpStore: { code: string; ts: number; email: string } = { code: '', ts: 0, email: '' };


const Stepper = ({ currentStep }: { currentStep: number }) => {
    const steps = [1, 2, 3];
    return (
        <div className="flex items-center justify-center w-full my-2">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center">
                        <div className={`mobile-stepper-circle rounded-full border-2 flex items-center justify-center font-semibold ${index + 1 === currentStep
                            ? 'bg-green-500 border-green-500 text-white'
                            : index + 1 < currentStep
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'bg-white border-gray-300 text-gray-400'
                            }`}>
                            {index + 1 < currentStep ? <Check size={20} /> : step}
                        </div>
                        {/* Car icon positioned below current step */}
                        {index + 1 === currentStep && (
                            <div className="mt-2">
                                <img
                                    src="/car.png"
                                    alt="Car icon"
                                    className="w-8 h-4"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    {index < steps.length - 1 && (
                        <div className="flex items-center mx-4" style={{ minWidth: '40px', maxWidth: '80px' }}>
                            <div className={`w-2 h-2 rounded-full ${index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-300'
                                }`}></div>
                            <div className={`flex-1 h-0.5 mx-1 border-t-2 border-dotted ${index + 1 < currentStep ? 'border-green-500' : 'border-gray-300'
                                }`}></div>
                            <div className={`w-2 h-2 rounded-full ${index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-300'
                                }`}></div>
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

const CustomModalSelect = ({ label, value, options, onChange, placeholder, isDate = false }: {
    label: string,
    value: string,
    options: string[],
    onChange: (val: string) => void,
    placeholder: string,
    isDate?: boolean
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full">
            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out 0s 2;
                }
            `}</style>
            <div
                onClick={() => setIsOpen(true)}
                className="w-full mobile-form-input rounded-full border border-black/50 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-between cursor-pointer py-4"
            >
                <span className={`${value ? 'text-gray-900' : 'text-gray-400'} px-2 font-medium`}>
                    {value || placeholder}
                </span>
                <div className="pr-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)} />
                    <div className="relative w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden animate-slide-up">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center px-8 bg-gray-50/50">
                            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">{label}</h3>
                            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto p-4 bg-white">
                            {isDate ? (
                                <div className="p-4 space-y-4">
                                    <input
                                        type="date"
                                        className="w-full p-5 border-2 border-gray-100 rounded-[20px] focus:border-green-500 focus:outline-none text-xl font-medium"
                                        onChange={(e) => {
                                            onChange(e.target.value);
                                            setIsOpen(false);
                                        }}
                                        value={value}
                                        autoFocus
                                    />
                                    <p className="text-center text-sm text-gray-400 font-medium">Select your date of birth above</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {options.map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                onChange(opt);
                                                setIsOpen(false);
                                            }}
                                            className={`w-full text-left p-5 rounded-2xl text-lg font-bold transition-all flex items-center justify-between ${value === opt ? 'bg-green-500 text-white shadow-lg lg:scale-102' : 'hover:bg-gray-100 text-gray-700 active:bg-gray-200'
                                                }`}
                                        >
                                            {opt}
                                            {value === opt && <Check size={24} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-6 bg-gray-50/30">
                            <button onClick={() => setIsOpen(false)} className="w-full py-4 bg-[#3AC36C] text-white rounded-full font-bold text-lg active:scale-95 transition-all shadow-lg hover:bg-green-600">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const RegistrationScreen = () => {
    console.log('📝 RegistrationScreen component rendered');
    const navigate = useNavigate();
    const location = useLocation();
    const { loginWithGoogle, updateUser } = useAppContext();
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [subscriptionPlans, setSubscriptionPlans] = useState([]);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        tin: '',
        tinCountry: 'US' as CountryCode,
        password: '',
        ageProofFileName: '',
        ageProofDataUrl: '',
        birthDate: '',
        vehicleBrand: '',
        vehicleColor: '',
        licenseNumber: '',
        fuelType: 'Petrol',
    });
    const [loading, setLoading] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState('gold');
    const [verificationMethod, setVerificationMethod] = useState<'email' | 'whatsapp' | null>(null);
    const [pendingOtp, setPendingOtp] = useState(''); // OTP stored in PARENT state — never lost

    useEffect(() => {
        localStorage.setItem('registrationDraft', JSON.stringify(formData));
    }, [formData]);

    useEffect(() => {
        const state = location.state as any;
        if (!state) return;

        if (state.step) {
            setStep(state.step);
        }

        const prefill = state.prefill;
        if (!prefill || typeof prefill !== 'object') return;
        // setStep(1); // Removed to respect state.step if provided
        setFormData((prev) => ({
            ...prev,
            fullName: prefill.fullName || prev.fullName,
            email: prefill.email || prev.email,
            phone: prefill.phone || prev.phone
        }));
    }, [location.state]);

    // Load subscription plans in background (non-blocking)
    useEffect(() => {
        apiGetSubscriptionPlans()
            .then(plans => setSubscriptionPlans(plans))
            .catch(() => {}); // silent fail - not critical for sign up
    }, []);

    const handleNext = () => {
        console.log(`🔄 Moving from step ${step} to step ${step + 1}`);
        setStep(s => s + 1);
    };
    const handleBack = () => {
        if (step > 1) {
            console.log(`⬅️ Moving back from step ${step} to step ${step - 1}`);
            setStep(s => s - 1);
        } else {
            console.log(`⬅️ Back from step 1 - redirecting to login`);
            navigate("/login");
        }
    };

    const createAccount = async (subscription: string = 'gold') => {
        console.log('🔥 createAccount called with subscription:', subscription);
        setLoading(true);
        setError('');

        const registrationData = {
            step1: {
                fullName: formData.fullName.trim(),
                email: formData.email.toLowerCase().trim(),
                phoneNumber: formData.phone.trim(),
                password: formData.password,
                tin: formData.tin.trim(),
                ageProofFileName: formData.ageProofFileName,
                ageProofDataUrl: formData.ageProofDataUrl,
                birthDate: formData.birthDate
            },
            step2: {
                brand: formData.vehicleBrand,
                color: formData.vehicleColor,
                licenseNumber: formData.licenseNumber,
                fuelType: formData.fuelType
            },
            subscription: {
                planId: subscription
            }
        };

        try {
            const response = await apiRegister(registrationData);
            console.log('✅ Registration successful:', response);

            // API returns: { success: true, data: { customer: {...}, token: "...", subscription: null } }
            const { customer, token } = response;

            // Only redirect if backend insert successful
            localStorage.setItem('token', token);
            updateUser(customer);

            // Redirect to home only after successful backend insert
            window.location.href = '/home';

        } catch (error) {
            console.error('❌ Registration failed:', error);

            let errorMessage = "Registration failed. Please try again.";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
            // Don't redirect on error - stay on current screen
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAgeProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload JPG, PNG, WEBP, or PDF.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be under 5MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setFormData((prev) => ({
                ...prev,
                ageProofFileName: file.name,
                ageProofDataUrl: String(reader.result || '')
            }));
            setError('');
        };
        reader.readAsDataURL(file);
    };

    const handleGoogleRegistration = async () => {
        try {
            setLoading(true);
            const googleLoginResult = await loginWithGoogle();
            
            if (googleLoginResult?.isNewUser) {
                const prefill = googleLoginResult?.profile || {};
                setStep(1);
                setFormData((prev) => ({
                    ...prev,
                    fullName: prefill.fullName || prev.fullName,
                    email: prefill.email || prev.email,
                    phone: prefill.phone || prev.phone
                }));
                return;
            }

            // Existing user - Check for incomplete profile
            const user = googleLoginResult.customer;
            if (!user.vehicles || user.vehicles.length === 0) {
                // Incomplete -> Pre-fill and go to step 2
                setFormData((prev) => ({
                    ...prev,
                    fullName: user.fullName || prev.fullName,
                    email: user.email || prev.email,
                    phone: user.phone || prev.phone
                }));
                setStep(2);
                return;
            }
            
            // Complete profile -> Go to Home
            navigate('/home');
        } catch (googleError: any) {
            setError(googleError?.message || 'Google registration failed');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        console.log(`📺 Rendering step ${step}`);
        switch (step) {
            case 1:
                return <Step1 next={handleNext} formData={formData} handleChange={handleChange} handleAgeProofUpload={handleAgeProofUpload} onGoogleSignIn={handleGoogleRegistration} error={error} setError={setError} />;
            case 2:
                return <Step2 next={handleNext} back={handleBack} formData={formData} handleChange={handleChange} error={error} setError={setError} />;
            case 3:
                return <Step3
                    formData={formData}
                    loading={loading}
                    error={error}
                    setError={setError}
                    selectedSubscription={selectedSubscription}
                    setSelectedSubscription={setSelectedSubscription}
                    subscriptionPlans={subscriptionPlans}
                    onEdit={() => setStep(1)}
                    onNext={handleNext}
                />;
            case 4:
                return <EmailVerificationStep
                    formData={formData}
                    onBack={handleBack}
                    onOtpGenerated={(otp) => {
                        setPendingOtp(otp);
                        setStep(5);
                    }}
                    onTryAnotherWay={() => setStep(6)}
                />;
            case 5:
                return <EmailOTPVerification
                    formData={formData}
                    pendingOtp={pendingOtp}
                    selectedSubscription={selectedSubscription}
                    onBack={() => setStep(4)}
                    onResendOtp={(newOtp) => setPendingOtp(newOtp)}
                    onComplete={() => {
                        setVerificationMethod('email');
                        setStep(8);
                    }}
                />;
            case 6:
                return <WhatsAppVerificationStep
                    formData={formData}
                    onBack={() => setStep(4)}
                    onNext={() => {
                        setVerificationMethod('whatsapp');
                        setStep(8);
                    }}
                />;
            case 7:
                return <WhatsAppOTPVerification
                    formData={formData}
                    selectedSubscription={selectedSubscription}
                    onBack={() => setStep(6)}
                    onComplete={() => {
                        setVerificationMethod('whatsapp');
                        setStep(8);
                    }}
                />;
            case 8:
                return <VerificationSuccess
                    type={verificationMethod || 'email'}
                    formData={formData}
                    selectedSubscription={selectedSubscription}
                    onCreateAccount={createAccount}
                    error={error}
                />;
            default:
                return <Step1 next={handleNext} formData={formData} handleChange={handleChange} handleAgeProofUpload={handleAgeProofUpload} onGoogleSignIn={handleGoogleRegistration} />;
        }
    };

    return (
        <AnimatedPage>
            <div className="min-h-screen flex flex-col p-4 bg-white">
                <header className="flex items-center mb-0">
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 active:scale-95 transition-all"
                        disabled={loading}
                    >
                        <img src="/Back.png" alt="Back" className="w-5 h-5" />
                    </button>
                </header>

                {step < 4 && (
                    <>
                        <div className="flex flex-col items-center mb-2">
                            <div className="mobile-logo-size mb-2">
                                <Logo />
                            </div>
                        </div>

                        <div className="text-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Registration</h2>
                        </div>

                        <Stepper currentStep={step} />
                    </>
                )}

                <div className="flex-grow mt-0">
                    {renderStep()}
                </div>
            </div>
        </AnimatedPage>
    );
};

interface StepProps {
    next: () => void;
    back?: () => void;
    formData: any;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleAgeProofUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    loading?: boolean;
    onGoogleSignIn?: () => Promise<void>;
    error?: string;
    setError: (msg: string) => void;
}

const Step1 = ({ next, formData, handleChange, onGoogleSignIn, handleAgeProofUpload, error, setError }: StepProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [tinError, setTinError] = useState('');
    const [ageProofPreview, setAgeProofPreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const ageProofInputRef = useRef<HTMLInputElement | null>(null);

    const selectedCountry = formData.tinCountry || 'US';

    // Filter countries based on version mode
    const availableCountries: CountryCode[] = VERSION_MODE === 'strict' 
        ? ['US', 'UK'] 
        : ['US', 'UK', 'GLOBAL'];

    useEffect(() => {
        if (formData?.ageProofDataUrl && String(formData.ageProofDataUrl).startsWith('data:image/')) {
            setAgeProofPreview(formData.ageProofDataUrl);
        } else {
            setAgeProofPreview(null);
        }
    }, [formData?.ageProofDataUrl]);

    const handleTINChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const formatted = formatTIN(value, selectedCountry);

        // Clear error when user types
        setTinError('');

        // Update form data
        const event = { target: { name: 'tin', value: formatted } } as React.ChangeEvent<HTMLInputElement>;
        handleChange(event);
    };

    const handleCountryChange = (country: string) => {
        const code = country as CountryCode;
        // Update form data with new country
        handleChange({ target: { name: 'tinCountry', value: code } } as any);
        
        // Re-format current TIN with new country rules
        if (formData.tin) {
            const formatted = formatTIN(formData.tin, code);
            handleChange({ target: { name: 'tin', value: formatted } } as any);
        }
    };

    const handleEnhancedAgeProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf', 'image/heic', 'image/heif'];
        const lowerName = String(file.name || '').toLowerCase();
        const allowedByExt = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.heic', '.heif'].some(ext => lowerName.endsWith(ext));
        if (!allowedTypes.includes(file.type) && !allowedByExt) {
            setError('Please upload a valid image (JPG, PNG, WEBP) or PDF file.');
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setError('File size must be under 5MB.');
            return;
        }

        // Simulate upload progress
        setUploadProgress(0);
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 100);

        const reader = new FileReader();
        reader.onload = () => {
            const result = String(reader.result || '');
            
            // Set preview for images only
            if (file.type.startsWith('image/')) {
                setAgeProofPreview(result);
            } else {
                setAgeProofPreview(null); // PDF doesn't show preview
            }

            // Update form data
            const event = {
                target: {
                    name: 'ageProofFileName',
                    value: file.name
                }
            } as any;
            handleChange(event);

            const dataEvent = {
                target: {
                    name: 'ageProofDataUrl',
                    value: result
                }
            } as any;
            handleChange(dataEvent);

            // Complete progress
            clearInterval(progressInterval);
            setUploadProgress(100);
            setTimeout(() => setUploadProgress(0), 1000);
            setError('');
        };

        reader.onerror = () => {
            setError('Failed to read file. Please try again.');
            clearInterval(progressInterval);
            setUploadProgress(0);
        };

        reader.readAsDataURL(file);
    };

    const removeAgeProof = () => {
        setAgeProofPreview(null);
        const fileNameEvent = {
            target: { name: 'ageProofFileName', value: '' }
        } as any;
        handleChange(fileNameEvent);
        
        const dataEvent = {
            target: { name: 'ageProofDataUrl', value: '' }
        } as any;
        handleChange(dataEvent);
        
        if (ageProofInputRef.current) ageProofInputRef.current.value = '';
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate TIN
        const validation = validateTIN(formData.tin, selectedCountry);
        if (!validation.isValid) {
            setTinError(validation.errorMessage);
            // Scroll to TIN if possible or just show error
            return;
        }

        if (formData.password !== confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        if (!formData.birthDate) {
            setError('Please select your birth date.');
            return;
        }

        if (!formData.ageProofDataUrl) {
            setError('Please upload age proof (18+).');
            return;
        }
        next();
    }

    return (
        <div className="space-y-4">
            <form onSubmit={handleFormSubmit} className="space-y-4">
                <input
                    name="fullName"
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full mobile-form-input rounded-full border border-black/50 bg-white focus:outline-none focus:ring-2 focus:ring-[#3AC36C] focus:border-[#3AC36C] placeholder-gray-400 transition-all duration-200"
                    required
                />

                <input
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full mobile-form-input rounded-full border border-black/50 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
                    required
                />

                <input
                    name="phone"
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full mobile-form-input rounded-full border border-black/50 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
                    required
                />

                <div className="space-y-3">
                    <CustomModalSelect
                        label="Select TIN Country"
                        value={TIN_CONFIGS[selectedCountry].label}
                        options={availableCountries.map(code => TIN_CONFIGS[code].label)}
                        onChange={(label) => {
                            const code = (Object.keys(TIN_CONFIGS) as CountryCode[]).find(c => TIN_CONFIGS[c].label === label);
                            if (code) handleCountryChange(code);
                        }}
                        placeholder="Select TIN Country"
                    />

                    <div className="relative">
                        <input
                            name="tin"
                            type="text"
                            placeholder={TIN_CONFIGS[selectedCountry].placeholder}
                            value={formData.tin}
                            onChange={handleTINChange}
                            className={`w-full mobile-form-input rounded-full border bg-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 transition-all ${tinError ? 'border-red-500' : 'border-black/50'
                                }`}
                        />
                        {tinError && (
                            <p className="text-red-500 text-xs mt-1 ml-4 font-medium">{tinError}</p>
                        )}
                        <p className="text-gray-400 text-[10px] mt-1 ml-4">
                            {TIN_CONFIGS[selectedCountry].description}
                        </p>
                    </div>
                </div>

                <div>
                    <input
                        type="file"
                        id="age-proof-upload"
                        accept=".jpg,.jpeg,.png,.webp,.pdf,.heic,.heif,image/*,application/pdf"
                        className="hidden"
                        ref={ageProofInputRef}
                        onChange={handleEnhancedAgeProofUpload}
                    />
                    
                    {!formData.ageProofFileName ? (
                        <button
                            type="button"
                            onClick={() => ageProofInputRef.current?.click()}
                            className="w-full mobile-form-input rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-[#3AC36C] transition-all cursor-pointer flex flex-col items-center justify-center py-8 px-4"
                        >
                            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="text-gray-600 font-medium mb-1">Upload Age Proof (18+)</span>
                            <span className="text-gray-400 text-sm">Driver's License, ID Card, or Passport</span>
                            <span className="text-gray-400 text-xs mt-2">JPG, PNG, WEBP, HEIC, HEIF or PDF (Max 5MB)</span>
                        </button>
                    ) : (
                        <div className="w-full rounded-2xl border-2 border-[#3AC36C] bg-green-50 p-4">
                            {ageProofPreview ? (
                                <div className="space-y-3">
                                    <div className="relative rounded-lg overflow-hidden bg-white">
                                        <img 
                                            src={ageProofPreview} 
                                            alt="Age proof preview" 
                                            className="w-full h-48 object-contain"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-5 h-5 text-[#3AC36C]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                                                {formData.ageProofFileName}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeAgeProof}
                                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
                                                {formData.ageProofFileName}
                                            </p>
                                            <p className="text-xs text-gray-500">PDF Document</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeAgeProof}
                                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                            
                            {uploadProgress > 0 && uploadProgress < 100 && (
                                <div className="mt-3">
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className="bg-[#3AC36C] h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 text-center">Uploading... {uploadProgress}%</p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2 px-2">
                        We need to verify you're 18+ to comply with age restrictions for fuel delivery services.
                    </p>
                </div>

                <div className="relative">
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full mobile-form-input rounded-full border border-black/50 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 px-6 flex items-center text-gray-400"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                <div className="relative">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full mobile-form-input rounded-full border border-black/50 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 px-6 flex items-center text-gray-400"
                    >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                <CustomModalSelect
                    label="Date of Birth"
                    value={formData.birthDate}
                    options={[]} // Special case for date
                    isDate
                    onChange={(val) => handleChange({ target: { name: 'birthDate', value: val } } as any)}
                    placeholder="Date of Birth"
                />

                {error && (
                    <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-xl mt-2">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full py-4 rounded-full font-semibold text-base shadow-lg mt-6"
                >
                    Next
                </Button>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">Or</span>
                </div>
            </div>

            <TouchFeedback className="block">
                <Button
                    type="button"
                    variant="outline"
                    size="md"
                    className="w-full py-4 rounded-full flex items-center justify-center gap-3 shadow-md"
                    onClick={() => onGoogleSignIn && onGoogleSignIn()}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </Button>
            </TouchFeedback>
        </div>
    );
};

const Step2 = ({ next, back, formData, handleChange, error, setError }: StepProps) => {
    const [vehicles, setVehicles] = useState([{
        brand: formData.vehicleBrand || '',
        color: formData.vehicleColor || '',
        licenseNumber: formData.licenseNumber || '',
        fuelType: formData.fuelType || 'Petrol'
    }]);

    const addVehicle = () => {
        setVehicles([...vehicles, {
            brand: '',
            color: '',
            licenseNumber: '',
            fuelType: 'Petrol'
        }]);
    };

    const updateVehicle = (index: number, field: string, value: string) => {
        const updatedVehicles = [...vehicles];
        updatedVehicles[index] = { ...updatedVehicles[index], [field]: value };
        setVehicles(updatedVehicles);

        // Update main form data for first vehicle
        if (index === 0) {
            const event = {
                target: {
                    name: field === 'brand' ? 'vehicleBrand' :
                        field === 'color' ? 'vehicleColor' :
                            field === 'licenseNumber' ? 'licenseNumber' : 'fuelType',
                    value
                }
            } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;
            handleChange(event);
        }
    };

    const removeVehicle = (index: number) => {
        if (vehicles.length > 1) {
            setVehicles(vehicles.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={(e) => { e.preventDefault(); next(); }} className="space-y-4">
                {vehicles.map((vehicle, index) => (
                    <div key={index} className="space-y-4 p-4 border border-gray-200 rounded-lg">
                        {index > 0 && (
                            <div className="flex justify-between items-center">
                                <h3 className="font-medium text-gray-700">Vehicle {index + 1}</h3>
                                <button
                                    type="button"
                                    onClick={() => removeVehicle(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                        )}

                        <CustomModalSelect
                            label="Select Brand"
                            value={vehicle.brand}
                            options={["Toyota", "Honda", "Ford", "BMW", "Mercedes", "Audi", "Tesla", "Hyundai", "Nissan", "Mazda"]}
                            onChange={(val) => updateVehicle(index, 'brand', val)}
                            placeholder="Select Brand"
                        />

                        <CustomModalSelect
                            label="Vehicle Color"
                            value={vehicle.color}
                            options={["White", "Black", "Silver", "Gray", "Red", "Blue", "Brown", "Yellow", "Green", "Other"]}
                            onChange={(val) => updateVehicle(index, 'color', val)}
                            placeholder="Select Color"
                        />

                        <input
                            type="text"
                            placeholder="License Number"
                            value={vehicle.licenseNumber}
                            onChange={(e) => updateVehicle(index, 'licenseNumber', e.target.value)}
                            className="w-full mobile-form-input rounded-full border border-black/50 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
                            required
                        />

                        <CustomModalSelect
                            label="Fuel Type"
                            value={vehicle.fuelType}
                            options={["Petrol", "Diesel", "Electric", "Hybrid"]}
                            onChange={(val) => updateVehicle(index, 'fuelType', val)}
                            placeholder="Select Fuel Type"
                        />
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addVehicle}
                    className="w-full mobile-form-button rounded-full border border-green-500 bg-white hover:bg-green-50 text-green-500 font-medium flex items-center justify-center gap-2 transition-colors"
                >
                    <span className="text-lg">+</span>
                    Add Vehicle
                </button>

                <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full py-4 rounded-full font-semibold text-base shadow-lg mt-6"
                >
                    Next
                </Button>
            </form>
        </div>
    );
};

const Step3 = ({ formData, loading, error, setError, selectedSubscription, setSelectedSubscription, onNext, onEdit, subscriptionPlans }: {
    formData: any;
    loading: boolean;
    error?: string;
    setError: (msg: string) => void;
    selectedSubscription: string;
    setSelectedSubscription: (plan: string) => void;
    onEdit: () => void;
    onNext: () => void;
    subscriptionPlans: any[];
}) => {

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-dotted border-gray-300">
                        <span className="text-gray-600 font-medium">Name</span>
                        <span className="text-gray-800 font-medium">{formData.fullName}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-dotted border-gray-300">
                        <span className="text-gray-600 font-medium">Emai Address</span>
                        <span className="text-gray-800 font-medium">{formData.email}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-dotted border-gray-300">
                        <span className="text-gray-600 font-medium">Phone No.</span>
                        <span className="text-gray-800 font-medium">{formData.phone}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-dotted border-gray-300">
                        <span className="text-gray-600 font-medium">Password</span>
                        <span className="text-gray-800 font-medium">••••••••</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-dotted border-gray-300">
                        <span className="text-gray-600 font-medium">TIN ({TIN_CONFIGS[formData.tinCountry as CountryCode || 'US'].label})</span>
                        <span className="text-gray-800 font-medium">{formData.tin || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-dotted border-gray-300">
                        <span className="text-gray-600 font-medium">Age Proof</span>
                        <span className="text-gray-800 font-medium">{formData.ageProofFileName || '-'}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-dotted border-gray-300">
                        <span className="text-gray-600 font-medium">Vehicle Brand</span>
                        <span className="text-gray-800 font-medium">{formData.vehicleBrand}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-dotted border-gray-300">
                        <span className="text-gray-600 font-medium">Vehicle color</span>
                        <span className="text-gray-800 font-medium">{formData.vehicleColor}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-dotted border-gray-300">
                        <span className="text-gray-600 font-medium">License Number</span>
                        <span className="text-gray-800 font-medium">{formData.licenseNumber}</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Fuel Type</span>
                        <span className="text-gray-800 font-medium">{formData.fuelType}</span>
                    </div>
                </div>
            </div>

            {/* Subscription Selection */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-medium text-gray-800 mb-4">Subscription Plan</h3>
                <SubscriptionPlans
                    selectedPlan={selectedSubscription}
                    onPlanSelect={(plan) => setSelectedSubscription(plan.id)}
                    isNonSubscriber={true}
                    subscriptionPlans={subscriptionPlans || []}
                />
            </div>

            <Button
                onClick={onNext}
                variant="primary"
                size="md"
                className="w-full py-4 rounded-full font-semibold text-base shadow-lg"
                disabled={loading}
            >
                Next
            </Button>

            <div className="text-center">
                <button
                    onClick={onEdit}
                    className="text-green-500 font-semibold text-base hover:underline"
                    disabled={loading}
                >
                    Edit Details
                </button>
            </div>
        </div>
    );
};

const EmailVerificationStep = ({ formData, onBack, onOtpGenerated, onTryAnotherWay }: {
    formData: any;
    onBack: () => void;
    onOtpGenerated: (otp: string) => void;
    onTryAnotherWay: () => void;
}) => {
    const [email, setEmail] = useState(formData.email);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const handleSendCode = async () => {
        if (!email) { setError('Please enter your email'); return; }
        setLoading(true);
        setError('');

        try {
            const otp = Math.floor(1000 + Math.random() * 9000).toString();

            // Also backup to _otpStore and localStorage
            _otpStore.code = otp;
            _otpStore.email = email;
            _otpStore.ts = Date.now();
            try { localStorage.setItem('ff_pending_otp', otp); localStorage.setItem('ff_pending_otp_ts', Date.now().toString()); } catch (_) { }

            // Send via EmailJS
            const emailjs = await import('@emailjs/browser');
            emailjs.init('nUsWUGb2G_tWQpOyT');
            await emailjs.send('service_aso275j', 'template_ddqnsv5', {
                to_email: email, email: email,
                to_name: formData.fullName || email,
                user_name: formData.fullName || email,
                name: formData.fullName || email,
                from_name: 'FuelFriendly',
                otp_code: otp, otp: otp, code: otp, verification_code: otp, passcode: otp,
                message: `Your FuelFriendly verification code is: ${otp}\n\nValid for 5 minutes.`
            });

            setSent(true);
            // PASS OTP to parent via callback — stored in parent state, never lost!
            onOtpGenerated(otp);
        } catch (err: any) {
            console.error('EmailJS error:', err);
            setError('Failed to send email. Please check your email address.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Email Icon */}
            <div className="flex justify-center">
                <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail size={48} className="text-green-500" />
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 text-center">Email Verification</h2>
            <p className="text-base text-gray-600 text-center">
                Enter your email address to receive a 4-digit verification code
            </p>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
            )}

            <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mobile-form-input rounded-full border border-black/50 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
            />

            <Button
                onClick={handleSendCode}
                variant="primary"
                size="md"
                className="w-full py-4 rounded-full font-semibold text-base shadow-lg"
                disabled={loading || !email}
                isLoading={loading}
            >
                {loading ? 'Sending...' : 'Send Code'}
            </Button>

            <div className="text-center">
                <button onClick={onTryAnotherWay} className="text-gray-600 text-base hover:underline">
                    Try another way
                </button>
            </div>
        </div>
    );
};

const EmailOTPVerification = ({ formData, onBack, onComplete, onResendOtp, pendingOtp, selectedSubscription }: {
    formData: any;
    onBack: () => void;
    onComplete: () => void;
    onResendOtp?: (newOtp: string) => void;
    pendingOtp?: string;  // OTP passed from parent state — always fresh!
    selectedSubscription?: string;
}) => {
    // 4-digit OTP
    const [otp, setOtp] = useState(['', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 3) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        setError('');
        const otpCode = otp.join('');
        if (otpCode.length < 4) {
            setError(`Isi semua 4 digit. Baru ${otpCode.length} digit terisi.`);
            return;
        }
        setLoading(true);

        // Priority: prop (parent state) > _otpStore > localStorage
        const stored = pendingOtp || _otpStore.code || localStorage.getItem('ff_pending_otp') || '';
        const ts = _otpStore.ts || parseInt(localStorage.getItem('ff_pending_otp_ts') || '0');
        const expired = ts > 0 && (Date.now() - ts > 5 * 60 * 1000);

        console.log('🔍 OTP Verify — pendingOtp (prop):', pendingOtp, '| _otpStore:', _otpStore.code, '| entered:', otpCode, '| expired:', expired);

        if (!stored) {
            setError('Kode tidak ditemukan. Klik Resend untuk kirim ulang.');
            setLoading(false);
            return;
        }
        if (expired) {
            setError('Kode sudah expired. Klik Resend untuk kirim kode baru.');
            setLoading(false);
            return;
        }
        if (otpCode !== stored) {
            setError(`Kode salah (isi: ${otpCode}, benar: ${stored}). Cek email lagi.`);
            setLoading(false);
            return;
        }

        // ✅ BENAR!
        _otpStore.code = ''; _otpStore.ts = 0; _otpStore.email = '';
        try { localStorage.removeItem('ff_pending_otp'); localStorage.removeItem('ff_pending_otp_ts'); } catch (_) { }
        setLoading(false);
        onComplete();
    };

    const handleResend = async () => {
        setTimer(60);
        setCanResend(false);
        setError('');
        setOtp(['', '', '', '']);
        const email = formData.email;
        try {
            const otp4 = Math.floor(1000 + Math.random() * 9000).toString();
            _otpStore.code = otp4;
            _otpStore.email = email;
            _otpStore.ts = Date.now();
            try { localStorage.setItem('ff_pending_otp', otp4); localStorage.setItem('ff_pending_otp_ts', Date.now().toString()); } catch (_) { }
            // CRITICAL: update parent state with new OTP
            if (onResendOtp) onResendOtp(otp4);
            const emailjs = await import('@emailjs/browser');
            emailjs.init('nUsWUGb2G_tWQpOyT');
            await emailjs.send('service_aso275j', 'template_ddqnsv5', {
                to_email: email, email: email,
                to_name: formData.fullName || email,
                user_name: formData.fullName || email,
                name: formData.fullName || email,
                from_name: 'FuelFriendly',
                otp_code: otp4, otp: otp4, code: otp4, verification_code: otp4, passcode: otp4,
                message: `Your FuelFriendly verification code is: ${otp4}\n\nValid for 5 minutes.`
            });
        } catch (err) {
            console.error('Resend failed:', err);
        }
    };

    return (
        <div className="space-y-8">
            {/* Email Icon */}
            <div className="flex justify-center">
                <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail size={48} className="text-green-500" />
                </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 text-center">Verify code</h2>

            <p className="text-base text-gray-600 text-center">
                Enter the 4-digit verification code sent to <strong>{formData.email}</strong>
            </p>

            {/* 4-digit OTP Input Boxes */}
            <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={(e) => {
                            e.preventDefault();
                            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
                            const newOtp = ['', '', '', ''];
                            pasted.split('').forEach((ch, i) => { newOtp[i] = ch; });
                            setOtp(newOtp);
                            inputRefs.current[Math.min(pasted.length, 3)]?.focus();
                        }}
                        className={`w-14 h-14 text-center text-xl font-bold border-2 rounded-2xl focus:outline-none focus:ring-2 bg-white transition-all ${digit ? 'border-green-500 bg-green-50' : 'border-green-300'
                            }`}
                    />
                ))}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
            )}

            <Button
                onClick={handleVerify}
                variant="primary"
                size="md"
                className="w-full rounded-full font-semibold shadow-lg hover:shadow-xl"
                disabled={loading}
                isLoading={loading}
            >
                {loading ? 'Verifying...' : 'Verify'}
            </Button>

            <div className="text-center space-y-2">
                <p className="text-gray-600">Haven't received the code?</p>
                <button
                    onClick={handleResend}
                    disabled={!canResend || loading}
                    className="text-green-500 font-semibold hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    {canResend ? 'Resend Code' : `Resend in ${timer}s`}
                </button>
            </div>
        </div>
    );
};

const WhatsAppVerificationStep = ({ formData, onBack, onNext }: {
    formData: any;
    onBack: () => void;
    onNext: () => void;
}) => {
    const [phone, setPhone] = useState(formData.phone || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [waOpened, setWaOpened] = useState(false);
    const [checking, setChecking] = useState(false);
    const waOpenedRef = useRef(false);

    // Auto-detect return from WhatsApp
    useEffect(() => {
        if (!waOpened) return;

        const tryComplete = async () => {
            if (!waOpenedRef.current) return;
            setChecking(true);
            setError('');
            try {
                const { completeWhatsAppOneTapVerification } = await import('../services/whatsappService');
                const result = await completeWhatsAppOneTapVerification(phone);
                if (result.success) {
                    onNext();
                }
            } catch (err) {
                console.error('Auto-check error:', err);
            } finally {
                setChecking(false);
            }
        };

        const onFocus = () => tryComplete();
        const onVisible = () => { if (document.visibilityState === 'visible') tryComplete(); };

        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [waOpened]);

    const openWhatsApp = async () => {
        if (!phone) { setError('Please enter your WhatsApp number first'); return; }
        setLoading(true);
        setError('');
        try {
            const { startWhatsAppOneTapVerification } = await import('../services/whatsappService');
            const data = await startWhatsAppOneTapVerification(phone);
            if (data.success) {
                waOpenedRef.current = true;
                setWaOpened(true);
            } else {
                setError(data.error || 'Failed to open WhatsApp');
            }
        } catch {
            setError('Failed to open WhatsApp');
        } finally {
            setLoading(false);
        }
    };

    const manualConfirm = async () => {
        setChecking(true);
        setError('');

        try {
            const { completeWhatsAppOneTapVerification } = await import('../services/whatsappService');
            const result = await completeWhatsAppOneTapVerification(phone);
            if (result.success) {
                onNext();
            } else {
                setError("Verification not found yet. Please send the message first.");
            }
        } catch (err) {
            setError('Verification failed. Please try again.');
        } finally {
            setChecking(false);
        }
    };

    return (
        <div className="space-y-6 pt-4">
            {/* Icon - Clean, no circle */}
            <div className="flex justify-center mb-2">
                <MessageSquare size={64} className="text-green-500" />
            </div>

            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">WhatsApp</h2>
                <p className="text-gray-500 mt-2 text-base px-4">
                    {waOpened
                        ? 'Return to the app after sending the message'
                        : 'Verify your number with a single tap via WhatsApp'}
                </p>
            </div>

            {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-xl">{error}</p>}

            {!waOpened ? (
                <>
                    <input
                        type="tel"
                        placeholder="+628123456789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full mobile-form-input rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
                    />
                    <Button
                        onClick={openWhatsApp}
                        variant="primary"
                        size="md"
                        className="w-full py-4 rounded-full font-semibold text-base shadow-lg"
                        disabled={loading || !phone}
                        isLoading={loading}
                    >
                        Open WhatsApp
                    </Button>
                </>
            ) : (
                <>
                    {checking ? (
                        <div className="flex flex-col items-center space-y-3 py-4">
                            <div className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-500 text-sm">Checking status...</p>
                        </div>
                    ) : (
                        <Button
                            onClick={manualConfirm}
                            variant="primary"
                            size="md"
                            className="w-full py-4 rounded-full font-semibold text-base"
                            disabled={checking}
                        >
                            I Already Sent It ✓
                        </Button>
                    )}

                    <button
                        onClick={() => { waOpenedRef.current = false; setWaOpened(false); setError(''); }}
                        className="w-full text-gray-400 text-sm text-center py-1"
                    >
                        Change number
                    </button>
                </>
            )}

            <button onClick={onBack} disabled={loading} className="w-full text-gray-400 text-sm text-center">
                Back
            </button>
        </div>
    );
};


const WhatsAppOTPVerification = ({ formData, onBack, onComplete, selectedSubscription }: {
    formData: any;
    onBack: () => void;
    onComplete: () => void;
    selectedSubscription?: string;
}) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [autoValidating, setAutoValidating] = useState(true);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Auto-validate OTP when component mounts (user returned from WhatsApp)
    useEffect(() => {
        const autoValidate = async () => {
            try {
                const { autoValidateOTP } = await import('../services/whatsappService');
                const result = await autoValidateOTP(formData.phone);

                if (result.success && result.otp) {
                    // Auto-fill OTP
                    const otpDigits = result.otp.split('');
                    setOtp(otpDigits);

                    // Auto-verify after a short delay
                    setTimeout(async () => {
                        const { apiVerifyWhatsAppOTP } = await import('../services/api');
                        const verifyResult = await apiVerifyWhatsAppOTP(formData.phone, result.otp!);

                        if (verifyResult.success) {
                            onComplete();
                        } else {
                            setError('Auto-validation failed. Please enter code manually.');
                        }
                        setAutoValidating(false);
                    }, 1000);
                } else {
                    setAutoValidating(false);
                }
            } catch (err) {
                console.error('Auto-validation error:', err);
                setAutoValidating(false);
            }
        };

        autoValidate();
    }, [formData.phone, onComplete]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer(t => t - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        setLoading(true);
        setError('');

        try {
            const otpCode = otp.join('');
            const { apiVerifyWhatsAppOTP } = await import('../services/api');
            const data = await apiVerifyWhatsAppOTP(formData.phone, otpCode);

            if (data.success) {
                // ✅ OTP verified, proceed to success screen
                onComplete();
            } else {
                setError((data as any).error || 'Invalid verification code');
            }
        } catch (err) {
            setError('Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setTimer(60);
        setCanResend(false);
        setError('');

        try {
            const { apiSendWhatsAppOTP } = await import('../services/api');
            await apiSendWhatsAppOTP(formData.phone);
        } catch (err) {
            // Handle error silently
        }
    };

    return (
        <div className="space-y-8">
            {/* WhatsApp Icon */}
            <div className="flex justify-center">
                <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center">
                    <MessageSquare size={48} className="text-green-500" />
                </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800 text-center">
                {autoValidating ? 'Validating...' : 'Verify code'}
            </h2>

            {/* Description */}
            <p className="text-base text-gray-600 text-center">
                {autoValidating
                    ? 'Please wait while we validate your code...'
                    : `Enter six-digit verification code sent to ${formData.phone}`
                }
            </p>

            {/* OTP Input Boxes */}
            <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        disabled={autoValidating}
                        className="w-12 h-12 text-center text-lg font-semibold border-2 border-green-300 rounded-xl focus:outline-none focus:border-green-500 bg-white disabled:bg-gray-100"
                    />
                ))}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                    <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
            )}

            {autoValidating && (
                <div className="flex justify-center">
                    <div className="w-6 h-6 border-3 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <Button
                onClick={handleVerify}
                variant="primary"
                size="md"
                className="w-full rounded-full font-semibold shadow-lg hover:shadow-xl"
                disabled={loading || otp.some(digit => !digit) || autoValidating}
                isLoading={loading}
            >
                {loading ? 'Verifying...' : 'Verify'}
            </Button>

            {/* Resend Section */}
            <div className="text-center space-y-2">
                <p className="text-gray-600">
                    Haven't received the verification code?
                </p>
                <button
                    onClick={handleResend}
                    disabled={!canResend || loading}
                    className="text-green-500 font-semibold hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                    {canResend ? 'Resend' : 'Resend'}
                </button>
                {!canResend && (
                    <p className="text-gray-500 text-sm">{timer}s</p>
                )}
            </div>
        </div>
    );
};

export default RegistrationScreen;
