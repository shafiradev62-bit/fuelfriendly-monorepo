import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronDown, X, Zap, Clock, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import anime from 'animejs';
import { useAppContext } from '../context/AppContext';
import AnimatedPage from '../components/AnimatedPage';
import AddressAutocomplete from '../components/AddressAutocomplete';
import TapEffectButton from '../components/TapEffectButton';
import SubscriptionPlans from '../components/SubscriptionPlans';
import CheckoutBreakdownComponent from '../components/CheckoutBreakdown';
import TipSelector from '../components/TipSelector';
import { useCheckoutCalculation } from '../hooks/useCheckoutCalculation';
import { SubscriptionPlan, SUBSCRIPTION_PLANS } from '../types/subscription';

const CheckoutScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAppContext();

  // Debug logging
  console.log('🔍 CheckoutScreen - Component mounted');
  console.log('🔍 CheckoutScreen - isAuthenticated:', isAuthenticated);
  console.log('🔍 CheckoutScreen - user:', user);
  console.log('🔍 CheckoutScreen - location.state:', location.state);
  const [currentStep, setCurrentStep] = useState(1);
  const step1Ref = useRef<HTMLDivElement | null>(null);
  const step2Ref = useRef<HTMLDivElement | null>(null);
  const step3Ref = useRef<HTMLDivElement | null>(null);
  const line12Ref = useRef<HTMLDivElement | null>(null);
  const line23Ref = useRef<HTMLDivElement | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(16);
  const [selectedTime, setSelectedTime] = useState('12:45 am');
  const [currentMonth, setCurrentMonth] = useState('February');

  // Subscription and payment states
  const [selectedSubscriptionPlan, setSelectedSubscriptionPlan] = useState<SubscriptionPlan | undefined>();
  const [tip, setTip] = useState(0);
  const [additionalVehicles, setAdditionalVehicles] = useState(0);

  // Order Scheduling State
  const [showOrderTypeModal, setShowOrderTypeModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showFuelTypeModal, setShowFuelTypeModal] = useState(false);
  const [showVehicleColorModal, setShowVehicleColorModal] = useState(false);
  const [showVehicleBrandModal, setShowVehicleBrandModal] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [orderType, setOrderType] = useState<'instant' | 'schedule'>('instant');

  const handleOrderTypeSelect = (type: 'instant' | 'schedule') => {
    setOrderType(type);
    setShowOrderTypeModal(false);
    if (type === 'schedule') {
      setShowScheduleModal(true);
    } else {
      setFormData(prev => ({ ...prev, deliveryTime: 'Instant (15-20 mins)' }));
    }
  };

  const daysInMonth = Array.from({ length: 28 }, (_, i) => i + 1);
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const phoneOptions = Array.from(new Set([user?.phone, '923556688', '92300112233', '92311444555'].filter(Boolean)));
  const vehicleColors = ['White', 'Black', 'Gray', 'Silver', 'Blue', 'Red', 'Green'];
  const vehicleBrands = ['Toyota', 'Honda', 'Suzuki', 'Mitsubishi', 'Hyundai', 'Nissan', 'Kia'];
  const quantityOptions = ['5 liters', '10 liters', '15 liters', '20 liters', '25 liters'];

  // Determine if user is non-subscriber
  const isNonSubscriber = true; // Assuming all users start as non-subscribers for checkout

  const stateData = (location.state && typeof location.state === 'object') ? location.state as any : {};

  // Get data from location state with better fallbacks
  const station = (stateData.station && typeof stateData.station === 'object') ? stateData.station : {
    id: 'default-station',
    name: 'Default Fuel Station',
    address: 'Station Address',
    fuelPrices: { regular: 3.29, premium: 3.79, diesel: 3.59 },
    regularPrice: 3.29
  };
  const cartItems = Array.isArray(stateData.cartItems) ? stateData.cartItems : [];
  const selectedFuelFriend = (stateData.selectedFuelFriend && typeof stateData.selectedFuelFriend === 'object') ? stateData.selectedFuelFriend : {
    id: 'default-friend',
    name: 'Fuel Friend',
    avatarUrl: '/fuel friend.png'
  };

  // Debug logging
  console.log('CheckoutScreen - location.state:', location.state);
  console.log('CheckoutScreen - station:', station);
  console.log('CheckoutScreen - cartItems:', cartItems);
  console.log('CheckoutScreen - selectedFuelFriend:', selectedFuelFriend);

  // Form data state
  const [formData, setFormData] = useState({
    address: '',
    phoneNumber: '',
    vehicleColor: '',
    vehicleBrand: '',
    fuelType: 'Regular',
    quantity: '10 liters',
    deliveryTime: '15-20 mins',
    numberPlate: ''
  });

  // Fuel type label - must be after formData declaration
  const fuelTypeLabel = formData.fuelType === 'Regular' ? 'Petrol' : formData.fuelType;

  useEffect(() => {
    const activeRef = currentStep === 1 ? step1Ref : currentStep === 2 ? step2Ref : step3Ref;
    if (activeRef.current) {
      anime({
        targets: activeRef.current,
        scale: [1, 1.08, 1],
        duration: 520,
        easing: 'easeInOutQuad'
      });
    }
    if (line12Ref.current) {
      anime({
        targets: line12Ref.current,
        width: currentStep >= 2 ? ['0%', '100%'] : '0%',
        duration: 420,
        easing: 'easeInOutQuad'
      });
    }
    if (line23Ref.current) {
      anime({
        targets: line23Ref.current,
        width: currentStep >= 3 ? ['0%', '100%'] : '0%',
        duration: 420,
        easing: 'easeInOutQuad'
      });
    }
  }, [currentStep]);

  // Calculate costs with better error handling
  const fuelCost = station ? (parseFloat(station.fuelPrices?.regular || station.regularPrice || '3.29') * parseFloat(formData?.quantity?.replace(' liters', '') || '10')) : 32.90;
  const convenienceItemsCost = cartItems.reduce((total, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return total + (isNaN(price) ? 0 : price * item.quantity);
  }, 0);
  const vehicleType: 'car' | 'suv' = formData.fuelType?.toLowerCase().includes('suv') || formData.fuelType?.toLowerCase().includes('truck') ? 'suv' : 'car';

  // Calculate checkout breakdown
  const breakdown = useCheckoutCalculation({
    fuelCost,
    convenienceItemsCost,
    vehicleType,
    subscriptionPlan: selectedSubscriptionPlan,
    additionalVehicles,
    tip,
    isNonSubscriber
  });

  useEffect(() => {
    const checkoutPayload = {
      formData,
      station,
      cartItems,
      selectedFuelFriend,
      user,
      subscriptionPlan: selectedSubscriptionPlan,
      tip,
      additionalVehicles,
      breakdown
    };
    localStorage.setItem('checkoutDraft', JSON.stringify(checkoutPayload));
    sessionStorage.setItem('checkoutSession', JSON.stringify(checkoutPayload));
  }, [formData, station, cartItems, selectedFuelFriend, user, selectedSubscriptionPlan, tip, additionalVehicles, breakdown]);

  // Handle subscription plan selection
  const handlePlanSelect = (plan: SubscriptionPlan) => {
    setSelectedSubscriptionPlan(plan);
  };

  // Handle tip change
  const handleTipChange = (amount: number) => {
    setTip(amount);
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    console.log('🔍 CheckoutScreen - Auth check - isAuthenticated:', isAuthenticated);
    if (!isAuthenticated) {
      console.log('🔍 CheckoutScreen - Not authenticated, redirecting to login');
      // Store the intended destination
      localStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  // Load real user data on component mount
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        address: user?.address || user?.city || '',
        phoneNumber: user?.phone || ''
      }));
    }
  }, [user]);

  // Animate on mount
  useEffect(() => {
    // Animate header with bounce
    anime({
      targets: '.checkout-header',
      translateY: [-40, 0],
      opacity: [0, 1],
      duration: 700,
      easing: 'easeOutElastic(1, .8)'
    });

    // Animate stepper with scale and glow
    anime({
      targets: '.checkout-stepper',
      scale: [0.7, 1.1, 1],
      opacity: [0, 1],
      duration: 800,
      delay: 300,
      easing: 'easeOutElastic(1, .7)'
    });

    // Animate form fields with stagger slide
    anime({
      targets: '.form-field',
      translateX: [-60, 0],
      opacity: [0, 1],
      scale: [0.95, 1],
      duration: 600,
      delay: anime.stagger(100, {start: 500}),
      easing: 'easeOutCubic'
    });

    // Animate buttons with bounce
    anime({
      targets: '.checkout-button',
      scale: [0.8, 1.15, 1],
      opacity: [0, 1],
      rotate: [-10, 0],
      duration: 700,
      delay: 1000,
      easing: 'easeOutElastic(1, .6)'
    });
  }, []);

  // Save and continue
  const handleSaveAndContinue = () => {
    console.log('🔍 Checkout - Save & Continue clicked');
    console.log('🔍 Checkout - formData:', formData);
    console.log('🔍 Checkout - station:', station);
    console.log('🔍 Checkout - cartItems:', cartItems);
    console.log('🔍 Checkout - selectedFuelFriend:', selectedFuelFriend);
    console.log('🔍 Checkout - user:', user);

    // Validate required fields
    if (!formData.address || formData.address.trim() === '') {
      alert('Please enter your delivery address');
      return;
    }

    if (!formData.phoneNumber || formData.phoneNumber.trim() === '') {
      alert('Please enter your phone number');
      return;
    }

    const checkoutState = {
      formData,
      station,
      cartItems,
      selectedFuelFriend,
      user,
      subscriptionPlan: selectedSubscriptionPlan,
      tip,
      additionalVehicles,
      breakdown
    };
    sessionStorage.setItem('checkoutSession', JSON.stringify(checkoutState));
    navigate('/order-summary', { state: checkoutState });
  };

  // Safety check - ensure we have required data
  if (!isAuthenticated) {
    return null;
  }

  return (
    <AnimatedPage>
      <div className="bg-white min-h-screen">


        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <TapEffectButton
            onClick={() => navigate(-1)}
            className="p-2 -ml-2"
          >
            <img src="/Back.png" alt="Back" className="w-5 h-5" />
          </TapEffectButton>
          <h1 className="text-lg font-semibold text-gray-900">Checkout</h1>
          <div className="w-10"></div>
        </div>

        {/* Progress Steps */}
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col items-center">
              <div ref={step1Ref} className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-400'}`}>
                {currentStep > 1 ? <Check className="w-6 h-6" /> : <span className="font-semibold">1</span>}
              </div>
              <span className="text-sm text-gray-600 mt-2">Order</span>
            </div>

            <div className="flex-1 h-0.5 mx-2 bg-gray-300 relative overflow-hidden">
              <div ref={line12Ref} className="h-full bg-green-500 w-0"></div>
            </div>

            <div className="flex flex-col items-center">
              <div ref={step2Ref} className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-400'}`}>
                <span className="font-semibold">2</span>
              </div>
              <span className="text-sm text-gray-600 mt-2">Order summary</span>
            </div>

            <div className="flex-1 h-0.5 mx-2 bg-gray-300 relative overflow-hidden">
              <div ref={line23Ref} className="h-full bg-green-500 w-0"></div>
            </div>

            <div className="flex flex-col items-center">
              <div ref={step3Ref} className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${currentStep >= 3 ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-400'}`}>
                <span className="font-semibold">3</span>
              </div>
              <span className="text-sm text-gray-600 mt-2">Payment</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-4 pb-32">
          <div className="mb-4">
            <label className="block text-lg leading-none font-semibold text-[#3F4249] mb-2">Address</label>
            <AddressAutocomplete
              value={formData.address}
              onChange={(value) => handleInputChange('address', value)}
              placeholder="Loreum ipsum"
              className="text-base text-gray-700"
            />
          </div>

          <div className="mb-4">
            <label className="block text-lg leading-none font-semibold text-[#3F4249] mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="Input phone number"
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base text-gray-700 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-lg leading-none font-semibold text-[#3F4249] mb-2">Vehicle Color</label>
              <TapEffectButton
                onClick={() => setShowVehicleColorModal(true)}
                className="w-full px-4 py-3 border border-gray-300 rounded-full text-left flex items-center justify-between"
              >
                <span className="text-base text-gray-700">{formData.vehicleColor || 'Select color'}</span>
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </TapEffectButton>
            </div>
            <div>
              <label className="block text-lg leading-none font-semibold text-[#3F4249] mb-2">Vehicle Brand</label>
              <TapEffectButton
                onClick={() => setShowVehicleBrandModal(true)}
                className="w-full px-4 py-3 border border-gray-300 rounded-full text-left flex items-center justify-between"
              >
                <span className="text-base text-gray-700">{formData.vehicleBrand || 'Select brand'}</span>
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </TapEffectButton>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-lg leading-none font-semibold text-[#3F4249] mb-2">Number Plate</label>
              <input
                type="text"
                value={formData.numberPlate}
                onChange={(e) => handleInputChange('numberPlate', e.target.value.toUpperCase())}
                placeholder="Input number plate"
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base text-gray-700 bg-white"
              />
            </div>
            <div>
              <label className="block text-lg leading-none font-semibold text-[#3F4249] mb-2">Fuel Type</label>
              <TapEffectButton
                onClick={() => setShowFuelTypeModal(true)}
                className="w-full px-4 py-3 border border-gray-300 rounded-full text-left flex items-center justify-between"
              >
                <span className="text-base text-gray-700">{fuelTypeLabel}</span>
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </TapEffectButton>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-lg leading-none font-semibold text-[#3F4249] mb-2">Quantity</label>
              <TapEffectButton
                onClick={() => setShowQuantityModal(true)}
                className="w-full px-4 py-3 border border-gray-300 rounded-full text-left flex items-center justify-between"
              >
                <span className="text-base text-gray-700">{formData.quantity}</span>
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </TapEffectButton>
            </div>
            <div>
              <label className="block text-lg leading-none font-semibold text-[#3F4249] mb-2">Delivery Time</label>
              <TapEffectButton
                onClick={() => setShowOrderTypeModal(true)}
                className="w-full px-4 py-3 border border-gray-300 rounded-full text-left flex items-center justify-between"
              >
                <span className="text-base text-gray-700">{orderType === 'schedule' ? `${selectedDate} Feb, ${selectedTime}` : 'Instant'}</span>
                <ChevronDown className="w-6 h-6 text-gray-500" />
              </TapEffectButton>
            </div>
          </div>
        </div>

        {/* Bottom Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <TapEffectButton
            onClick={() => {
              anime({
                targets: '.checkout-save-button',
                scale: [1, 0.95, 1],
                duration: 200,
                easing: 'easeInOutQuad'
              });
              handleSaveAndContinue();
            }}
            className="w-full bg-green-500 text-white py-4 rounded-full text-lg font-semibold hover:bg-green-600 transition-all duration-200 mobile-button haptic-button"
            style={{ borderRadius: '9999px' }}
          >
            <span className="checkout-save-button inline-block">Save & Continue</span>
          </TapEffectButton>
        </div>
      </div>
      {showVehicleColorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in" style={{ zIndex: 6004 }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-in relative">
            <button onClick={() => setShowVehicleColorModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-6">Select vehicle color</h3>
            <div className="space-y-3">
              {vehicleColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    handleInputChange('vehicleColor', color);
                    setShowVehicleColorModal(false);
                  }}
                  className={`w-full py-4 rounded-full font-semibold transition-all ${formData.vehicleColor === color ? 'bg-[#3AC36C] text-white' : 'bg-white border border-gray-200 text-gray-900'}`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {showVehicleBrandModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in" style={{ zIndex: 6004 }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-in relative">
            <button onClick={() => setShowVehicleBrandModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-6">Select vehicle brand</h3>
            <div className="space-y-3">
              {vehicleBrands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => {
                    handleInputChange('vehicleBrand', brand);
                    setShowVehicleBrandModal(false);
                  }}
                  className={`w-full py-4 rounded-full font-semibold transition-all ${formData.vehicleBrand === brand ? 'bg-[#3AC36C] text-white' : 'bg-white border border-gray-200 text-gray-900'}`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {showQuantityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in" style={{ zIndex: 6004 }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-in relative">
            <button onClick={() => setShowQuantityModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-6">Select quantity</h3>
            <div className="space-y-3">
              {quantityOptions.map((qty) => (
                <button
                  key={qty}
                  onClick={() => {
                    handleInputChange('quantity', qty);
                    setShowQuantityModal(false);
                  }}
                  className={`w-full py-4 rounded-full font-semibold transition-all ${formData.quantity === qty ? 'bg-[#3AC36C] text-white' : 'bg-white border border-gray-200 text-gray-900'}`}
                >
                  {qty}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Order Type Selection Modal */}
      {showFuelTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in" style={{ zIndex: 6002 }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-in relative">
            <button
              onClick={() => setShowFuelTypeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-6">Select fuel type</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  handleInputChange('fuelType', 'Regular');
                  setShowFuelTypeModal(false);
                }}
                className={`w-full py-4 rounded-full font-semibold transition-all ${formData.fuelType === 'Regular' ? 'bg-[#3AC36C] text-white' : 'bg-white border border-gray-200 text-gray-900'}`}
              >
                Petrol
              </button>
              <button
                onClick={() => {
                  handleInputChange('fuelType', 'Premium');
                  setShowFuelTypeModal(false);
                }}
                className={`w-full py-4 rounded-full font-semibold transition-all ${formData.fuelType === 'Premium' ? 'bg-[#3AC36C] text-white' : 'bg-white border border-gray-200 text-gray-900'}`}
              >
                Premium
              </button>
              <button
                onClick={() => {
                  handleInputChange('fuelType', 'Diesel');
                  setShowFuelTypeModal(false);
                }}
                className={`w-full py-4 rounded-full font-semibold transition-all ${formData.fuelType === 'Diesel' ? 'bg-[#3AC36C] text-white' : 'bg-white border border-gray-200 text-gray-900'}`}
              >
                Diesel
              </button>
            </div>
          </div>
        </div>
      )}

      {showOrderTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in" style={{ zIndex: 6000 }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-in relative">
            <button
              onClick={() => setShowOrderTypeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-6">Select order type</h3>

            <div className="space-y-4">
              <button
                onClick={() => handleOrderTypeSelect('instant')}
                className="w-full py-4 bg-[#3AC36C] text-white rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-[#2ea85a] transition-all shadow-md"
              >
                <Zap className="w-5 h-5 fill-white" />
                Instant order
              </button>

              <button
                onClick={() => handleOrderTypeSelect('schedule')}
                className="w-full py-4 bg-white border border-gray-200 text-gray-900 rounded-full font-semibold flex items-center justify-center gap-2 hover:border-[#3AC36C] hover:text-[#3AC36C] transition-all shadow-sm"
              >
                <Clock className="w-5 h-5" />
                Schedule Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Picker Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in" style={{ zIndex: 6001 }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-scale-in relative">
            <div className="flex items-center justify-between mb-6">
              <button className="p-1 rounded-full hover:bg-gray-100">
                <ChevronLeft className="w-5 h-5 text-[#3AC36C]" />
              </button>
              <h3 className="text-lg font-bold text-gray-900">February</h3>
              <button className="p-1 rounded-full hover:bg-gray-100">
                <ChevronRight className="w-5 h-5 text-[#3AC36C]" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="mb-6">
              <div className="grid grid-cols-7 mb-2">
                {weekDays.map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-500 py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-2">
                {/* Empty slots for start of month (assuming starts on Monday based on screenshot blank) */}
                <div></div>
                {daysInMonth.map(day => (
                  <div key={day} className="flex justify-center">
                    <button
                      onClick={() => setSelectedDate(day)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all ${selectedDate === day
                        ? 'bg-[#3AC36C] text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      {day}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-full text-gray-700 focus:outline-none focus:border-[#3AC36C] bg-white"
                >
                  <option>12:45 am</option>
                  <option>1:00 am</option>
                  <option>1:15 am</option>
                  <option>9:00 am</option>
                  <option>12:00 pm</option>
                  <option>3:00 pm</option>
                  <option>6:00 pm</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setFormData(prev => ({ ...prev, deliveryTime: `${selectedDate} Feb, ${selectedTime}` }));
                }}
                className="flex-1 bg-[#3AC36C] text-white font-semibold py-3 rounded-full hover:bg-[#2ea85a] transition-all shadow-md"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default CheckoutScreen;
