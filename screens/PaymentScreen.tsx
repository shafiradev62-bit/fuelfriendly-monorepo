import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import AnimatedPage from '../components/AnimatedPage';
import { useAppContext } from '../context/AppContext';
import TapEffectButton from '../components/TapEffectButton';
import ConfettiEffect from '../components/ConfettiEffect';

const PaymentScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useAppContext();

    // Debug logging
    console.log('🔍 PaymentScreen - Component mounted');
    console.log('🔍 PaymentScreen - isAuthenticated:', isAuthenticated);
    console.log('🔍 PaymentScreen - user:', user);
    console.log('🔍 PaymentScreen - location.state:', location.state);
    const [selectedPayment, setSelectedPayment] = useState('card');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [trackingId, setTrackingId] = useState('');
    const [isPaying, setIsPaying] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [cardHolderName, setCardHolderName] = useState('Loreum ipsum');
    const [cardNumber, setCardNumber] = useState('******** *');
    const [expiryDate, setExpiryDate] = useState('oct 2025');
    const [cvvCode, setCvvCode] = useState('CVV code');
    const [saveCardInformation, setSaveCardInformation] = useState(true);
    const safeParse = (value: string | null) => {
        if (!value) return {};
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === 'object' ? parsed : {};
        } catch {
            return {};
        }
    };
    const checkoutDraft = safeParse(localStorage.getItem('checkoutDraft'));
    const checkoutSession = safeParse(sessionStorage.getItem('checkoutSession'));

    const sourceData = (location.state && typeof location.state === 'object')
        ? location.state as any
        : (checkoutSession && typeof checkoutSession === 'object')
            ? checkoutSession as any
            : (checkoutDraft && typeof checkoutDraft === 'object')
                ? checkoutDraft as any
                : {};

    const {
        formData,
        station,
        cartItems = [],
        selectedFuelFriend,
        breakdown
    } = sourceData;

    // Safety check - redirect if not authenticated
    if (!isAuthenticated) {
        console.log('🔍 PaymentScreen - Not authenticated, redirecting to login');
        localStorage.setItem('redirectAfterLogin', '/payment');
        navigate('/login', { replace: true });
        return null;
    }

    // Safety check - redirect if no state data
    if (!location.state && !checkoutSession?.formData && !checkoutDraft?.formData) {
        console.log('🔍 PaymentScreen - No state data, redirecting to checkout');
        navigate('/checkout', { replace: true });
        return null;
    }

    // Fallback data to prevent blank screen
    const fallbackData = {
        station: station || {
            id: 'default-station',
            name: 'Fuel Station',
            address: 'Station Address',
            fuelPrices: { regular: 3.29, premium: 3.79, diesel: 3.59 },
            regularPrice: 3.29,
            deliveryTime: '15-20 mins',
            rating: 4.5,
            reviewCount: 128,
            imageUrl: '/brand1.png',
            bannerUrl: '/brand1.png',
            logoUrl: '/logo-green.png',
            groceries: [],
            fuelFriends: []
        },
        cartItems: Array.isArray(cartItems) ? cartItems : [],
        selectedFuelFriend: selectedFuelFriend || {
            id: 'default-friend',
            name: 'Fuel Friend',
            avatarUrl: '/fuel friend.png'
        },
        breakdown: breakdown || {
            fuelCost: 32.90,
            convenienceItemsCost: 0,
            serviceFee: 2.99,
            subscriptionCost: 0,
            vat: 7.18,
            tip: 0,
            total: 43.07
        }
    };

    const handlePayNow = async () => {
        if (!user) {
            localStorage.setItem('redirectAfterLogin', '/payment');
            alert('Please login to complete your order');
            navigate('/login');
            return;
        }

        if (!station?.id) {
            alert('Station information missing.');
            navigate('/home');
            return;
        }
        setIsPaying(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 900));
            const mockOrderResult = {
                orderId: `mock-order-${Date.now()}`,
                trackingNumber: `FF-${Math.floor(100000 + Math.random() * 900000)}`,
                status: 'confirmed',
                estimatedDelivery: '15-20 mins',
                station: fallbackData.station,
                cartItems: fallbackData.cartItems,
                selectedFuelFriend: fallbackData.selectedFuelFriend,
                formData,
                breakdown: fallbackData.breakdown,
                totalAmount: fallbackData.breakdown.total,
                paymentMethod: selectedPayment
            };
            setTrackingId(mockOrderResult.trackingNumber);
            sessionStorage.setItem('lastOrder', JSON.stringify(mockOrderResult));
            sessionStorage.removeItem('checkoutSession');
            setShowSuccessModal(true);
            setShowConfetti(true);
        } catch (error: any) {
            alert(error.message || 'Failed to create order.');
        } finally {
            setIsPaying(false);
        }
    };

    return (
        <AnimatedPage>
            <div className="bg-white min-h-screen pb-32">
                <div className="flex items-center justify-between px-4 pt-5 pb-3">
                    <TapEffectButton onClick={() => navigate('/order-summary')} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center">
                        <img src="/Back.png" alt="Back" className="w-4 h-4" />
                    </TapEffectButton>
                    <h1 className="text-3xl leading-none font-semibold text-[#3F4249] tracking-tight">Checkout</h1>
                    <div className="w-8 h-8" />
                </div>

                <div className="px-4 pt-2 pb-5">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#3AC36C] text-white flex items-center justify-center">
                            <Check className="w-5 h-5" />
                        </div>
                        <div className="flex-1 h-[2px] border-t border-dotted border-[#3AC36C] mx-2" />
                        <div className="w-10 h-10 rounded-full bg-[#3AC36C] text-white flex items-center justify-center">
                            <Check className="w-5 h-5" />
                        </div>
                        <div className="flex-1 h-[2px] border-t border-dotted border-[#3AC36C] mx-2" />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${showSuccessModal ? 'bg-[#3AC36C] border-[#3AC36C] text-white' : 'bg-white border-[#3AC36C] text-[#3AC36C]'}`}>
                            {showSuccessModal ? <Check className="w-5 h-5" /> : <span className="font-semibold">3</span>}
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 px-0.5 text-sm leading-none text-[#3F4249]">
                        <span>Order</span>
                        <span>Order summary</span>
                        <span>Payment</span>
                    </div>
                </div>

                <div className="px-4 grid grid-cols-3 gap-3 mb-4">
                    <button onClick={() => setSelectedPayment('card')} className={`rounded-xl border bg-white p-3 text-left ${selectedPayment === 'card' ? 'border-[#3AC36C] shadow-[0_0_0_1px_rgba(58,195,108,0.15)]' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <img src="/Visa.png" alt="Visa" className="h-4 w-auto" />
                        </div>
                        <div className="text-xl leading-none text-[#3F4249]">Credit card</div>
                    </button>
                    <button onClick={() => setSelectedPayment('paypal')} className={`rounded-xl border bg-white p-3 text-left ${selectedPayment === 'paypal' ? 'border-[#3AC36C] shadow-[0_0_0_1px_rgba(58,195,108,0.15)]' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <img src="/paypal.png" alt="PayPal" className="h-4 w-auto" />
                        </div>
                        <div className="text-xl leading-none text-[#3F4249]">Paypal</div>
                    </button>
                    <button onClick={() => setSelectedPayment('apple')} className={`rounded-xl border bg-white p-3 text-left ${selectedPayment === 'apple' ? 'border-[#3AC36C] shadow-[0_0_0_1px_rgba(58,195,108,0.15)]' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <img src="/apple.svg" alt="Apple Pay" className="h-4 w-auto" />
                        </div>
                        <div className="text-xl leading-none text-[#3F4249]">Apple Pay</div>
                    </button>
                </div>

                <div className={`mx-4 mb-6 rounded-3xl p-5 text-white relative overflow-hidden ${selectedPayment === 'card' ? 'bg-gradient-to-br from-[#4d5670] to-[#273355]' : selectedPayment === 'paypal' ? 'bg-gradient-to-br from-[#0e4f92] to-[#1172c8]' : 'bg-gradient-to-br from-[#12a6ff] to-[#007ad6]'}`}>
                    <div className="absolute right-5 top-5 flex">
                        <div className="w-9 h-9 rounded-full bg-[#f79e1b]/90" />
                        <div className="w-9 h-9 rounded-full bg-[#eb001b]/90 -ml-3" />
                    </div>
                    <div className="text-xl leading-none font-semibold mb-8">{selectedPayment === 'card' ? 'BANK NAME' : selectedPayment === 'paypal' ? 'PayPal' : 'Apple Pay'}</div>
                    <div className="text-base leading-none opacity-90 mb-2">Card Number</div>
                    <div className="text-3xl leading-none tracking-[0.06em] mb-4">{selectedPayment === 'apple' ? '•••• 2227' : '1844 444 7860'}</div>
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-base leading-none opacity-90">Holder Name</div>
                            <div className="text-2xl leading-none mt-2">{cardHolderName || 'Loreum Ipsum'}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-base leading-none opacity-90">Exp. Date</div>
                            <div className="text-2xl leading-none mt-2">10/28</div>
                        </div>
                    </div>
                </div>

                <div className="px-4 space-y-5">
                    <div>
                        <label className="block text-xl leading-none text-[#3F4249] mb-2">Card holder name</label>
                        <input value={cardHolderName} onChange={(e) => setCardHolderName(e.target.value)} className="w-full h-12 rounded-full border border-gray-400 px-5 text-xl text-[#3F4249] focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-xl leading-none text-[#3F4249] mb-2">Card Number</label>
                        <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="w-full h-12 rounded-full border border-gray-400 px-5 text-xl text-[#3F4249] focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xl leading-none text-[#3F4249] mb-2">Expiry Date</label>
                            <input value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full h-12 rounded-full border border-gray-400 px-5 text-xl text-[#3F4249] focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-xl leading-none text-[#3F4249] mb-2">CVV Code</label>
                            <input value={cvvCode} onChange={(e) => setCvvCode(e.target.value)} className="w-full h-12 rounded-full border border-gray-400 px-5 text-xl text-[#3F4249] focus:outline-none" />
                        </div>
                    </div>
                    <button onClick={() => setSaveCardInformation((prev) => !prev)} className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-md border flex items-center justify-center ${saveCardInformation ? 'bg-[#3AC36C] border-[#3AC36C]' : 'bg-white border-gray-300'}`}>
                            {saveCardInformation && <Check className="w-4 h-4 text-white" />}
                        </span>
                        <span className="text-2xl leading-none text-[#3F4249]">Save card Information</span>
                    </button>
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white">
                    <TapEffectButton onClick={handlePayNow} disabled={isPaying} className="w-full h-14 rounded-full bg-[#3AC36C] text-white text-2xl leading-none font-semibold disabled:opacity-70">
                        {isPaying ? 'Processing...' : 'Pay Now'}
                    </TapEffectButton>
                </div>

                {showSuccessModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl w-full max-w-sm px-6 py-8 relative text-center">
                            <button onClick={() => setShowSuccessModal(false)} className="absolute right-4 top-4 w-8 h-8 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center">
                                <X className="w-4 h-4" />
                            </button>
                            <div className="w-24 h-24 rounded-full border-[6px] border-[#3AC36C] mx-auto flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(58,195,108,0.3)]">
                                <Check className="w-12 h-12 text-[#3AC36C]" />
                            </div>
                            <h2 className="text-3xl leading-tight font-semibold text-[#3F4249] mb-3">Your payment has Been made Successfully</h2>
                            <p className="text-2xl leading-none font-semibold text-[#3F4249] mb-8">Tracking ID No: {trackingId || '#12345'}</p>
                            <button onClick={() => navigate('/track')} className="w-full h-14 rounded-full bg-[#3AC36C] text-white text-2xl leading-none font-semibold mb-4">Track Order</button>
                            <button onClick={() => navigate('/home')} className="text-[#3AC36C] text-2xl leading-none underline font-semibold">Back To Home</button>
                        </div>
                    </div>
                )}

                <ConfettiEffect show={showConfetti} />
            </div>
        </AnimatedPage>
    );
};

export default PaymentScreen;
