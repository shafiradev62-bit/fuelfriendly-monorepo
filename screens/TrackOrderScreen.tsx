import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { MessageCircle, Phone, User, Truck, CheckCircle, MapPin, Clock, Package, Plus, Minus, Settings, Layers, QrCode } from 'lucide-react';
import anime from 'animejs';
import { useAppContext } from '../context/AppContext';
import { apiGetOrders, apiGetOrderDetail, apiGetRouteDirections } from '../services/api';
import AnimatedPage from '../components/AnimatedPage';
import CallModal from '../components/CallModal';
import ChatModal from '../components/ChatModal';
import QRScannerModal from '../components/QRScannerModal';
import TapEffectButton from '../components/TapEffectButton';
import MobileButton from '../components/MobileButton';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../styles/timeline-animations.css';
import { toast } from 'sonner';
import { buildReceiptData, openReceiptPdfInNewTab, saveReceiptForUser } from '../utils/receiptPdf';

// Set Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
const jawgToken = import.meta.env.VITE_JAWG_ACCESS_TOKEN || '';

const getJawgStyle = () => ({
  version: 8,
  sources: {
    jawg: {
      type: 'raster',
      tiles: [`https://tile.jawg.io/jawg-streets/{z}/{x}/{y}.png?access-token=${jawgToken}`],
      tileSize: 256
    }
  },
  layers: [
    {
      id: 'jawg-layer',
      type: 'raster',
      source: 'jawg'
    }
  ],
  glyphs: "https://fonts.jawg.io/{fontstack}/{range}.pbf?access-token=${jawgToken}",
  sprite: `https://sprite.jawg.io/jawg-streets?access-token=${jawgToken}`
});

// Fallback route coordinates
const sampleGasToUserRoute = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { routeName: 'Gas Station to User' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-90.0578, 35.1465],
          [-90.0544, 35.1457],
          [-90.0503, 35.1449],
          [-90.0465, 35.1437],
          [-90.0422, 35.1418],
          [-90.0381, 35.1397],
          [-90.0336, 35.1371]
        ]
      }
    }
  ]
};

const TrackOrderScreen = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  // Get selected order from navigation state (Moved up for initialization)
  const location = useLocation();
  const { user, token, isAuthenticated } = useAppContext();
  const selectedOrder = location.state?.selectedOrder;

  // Safety check - redirect if not authenticated (with a small delay to allow state restoration)
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!isAuthenticated && !storedToken) {
      console.log('🔍 TrackOrderScreen - Not authenticated, redirecting to login');
      localStorage.setItem('redirectAfterLogin', '/track');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Get tracking ID from session storage
  const lastOrderData = (() => {
    try {
      const lastOrder = sessionStorage.getItem('lastOrder');
      if (lastOrder && lastOrder !== 'undefined') {
        return JSON.parse(lastOrder);
      }
    } catch (e) {
      console.error('Error parsing lastOrder from sessionStorage:', e);
    }
    return null;
  })();

  // INITIALIZE IMMEDIATELY - Don't wait for useEffect
  // This ensures UI appears ALWAYS, even with bad connection
  const [order, setOrder] = useState(selectedOrder || lastOrderData || null);

  // Only loading if we truly have NO data
  const [isLoading, setIsLoading] = useState(!selectedOrder && !lastOrderData);

  // Notification states
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'pickup' | 'promo';
    title: string;
    message: string;
    icon: string;
  }>>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<any>(null);

  // Notification data based on UK/US
  const getNotificationData = (isUK: boolean) => {
    const pickupNotifications = isUK ? [
      {
        type: 'pickup' as const,
        title: 'Self-Pickup Available',
        message: 'Save £2.50 on fees. Collect from our London station in 10 mins.',
        icon: '🚗'
      },
      {
        type: 'pickup' as const,
        title: 'Quick Collection Ready',
        message: 'Your order is ready for pickup at Manchester Central. No queue!',
        icon: '⚡'
      },
      {
        type: 'pickup' as const,
        title: 'Express Pickup',
        message: 'Fast collection available. Drive up and collect in under 5 minutes.',
        icon: '🏃'
      }
    ] : [
      {
        type: 'pickup' as const,
        title: 'Self-Pickup Available',
        message: 'Save $3.00 on fees. Collect from our station in 10 mins.',
        icon: '🚗'
      },
      {
        type: 'pickup' as const,
        title: 'Express Pickup Ready',
        message: 'Your order is ready for pickup at our New York location. Fast & easy!',
        icon: '⚡'
      },
      {
        type: 'pickup' as const,
        title: 'Drive-Through Pickup',
        message: 'No need to leave your car. Quick pickup service available now.',
        icon: '🏃'
      }
    ];

    const promoNotifications = isUK ? [
      {
        type: 'promo' as const,
        title: '20% Off Next Order',
        message: 'Use code FUEL20 on your next pickup. Valid for 48 hours.',
        icon: '🎉'
      },
      {
        type: 'promo' as const,
        title: 'Free Service This Weekend',
        message: 'No service fees this Saturday & Sunday. Order now!',
        icon: '🎁'
      },
      {
        type: 'promo' as const,
        title: 'Loyalty Reward Unlocked',
        message: 'You\'ve earned £5 credit! Applied automatically to your next order.',
        icon: '⭐'
      },
      {
        type: 'promo' as const,
        title: 'Premium Fuel Upgrade',
        message: 'Get premium fuel at regular price today only. Limited time offer!',
        icon: '💎'
      }
    ] : [
      {
        type: 'promo' as const,
        title: '20% Off Next Order',
        message: 'Use code FUEL20 on your next pickup. Valid for 48 hours.',
        icon: '🎉'
      },
      {
        type: 'promo' as const,
        title: 'Free Service This Weekend',
        message: 'No service fees this Saturday & Sunday. Order now!',
        icon: '🎁'
      },
      {
        type: 'promo' as const,
        title: 'Loyalty Reward Unlocked',
        message: 'You\'ve earned $5 credit! Applied automatically to your next order.',
        icon: '⭐'
      },
      {
        type: 'promo' as const,
        title: 'Premium Fuel Upgrade',
        message: 'Get premium fuel at regular price today only. Limited time offer!',
        icon: '💎'
      }
    ];

    return [...pickupNotifications, ...promoNotifications];
  };

  // Show random notifications
  useEffect(() => {
    const userCity = user?.city?.toLowerCase() || '';
    const isUK = userCity.includes('london') || 
                 userCity.includes('uk') || 
                 userCity.includes('england');

    const allNotifications = getNotificationData(isUK);
    
    // Show first notification after 3 seconds
    const firstTimeout = setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * allNotifications.length);
      const notification = {
        ...allNotifications[randomIndex],
        id: `notif-${Date.now()}`
      };
      setCurrentNotification(notification);
      setShowNotification(true);

      // Animate notification entrance
      setTimeout(() => {
        anime({
          targets: '.ios-notification',
          scale: [0.9, 1],
          opacity: [0, 1],
          translateY: [-20, 0],
          duration: 400,
          easing: 'easeOutBack'
        });
      }, 50);

      // Auto hide after 5 seconds with animation
      setTimeout(() => {
        anime({
          targets: '.ios-notification',
          scale: [1, 0.9],
          opacity: [1, 0],
          translateY: [0, -20],
          duration: 300,
          easing: 'easeInBack',
          complete: () => {
            setShowNotification(false);
          }
        });
      }, 5000);
    }, 3000);

    // Show random notifications at random intervals (between 15-30 seconds)
    const showRandomNotification = () => {
      const randomIndex = Math.floor(Math.random() * allNotifications.length);
      const notification = {
        ...allNotifications[randomIndex],
        id: `notif-${Date.now()}`
      };
      setCurrentNotification(notification);
      setShowNotification(true);

      // Animate notification entrance
      setTimeout(() => {
        anime({
          targets: '.ios-notification',
          scale: [0.9, 1],
          opacity: [0, 1],
          translateY: [-20, 0],
          duration: 400,
          easing: 'easeOutBack'
        });
      }, 50);

      // Auto hide after 5 seconds with animation
      setTimeout(() => {
        anime({
          targets: '.ios-notification',
          scale: [1, 0.9],
          opacity: [1, 0],
          translateY: [0, -20],
          duration: 300,
          easing: 'easeInBack',
          complete: () => {
            setShowNotification(false);
          }
        });
      }, 5000);

      // Schedule next notification (15-30 seconds)
      const nextDelay = 15000 + Math.random() * 15000;
      setTimeout(showRandomNotification, nextDelay);
    };

    // Start random notifications after 20 seconds
    const randomTimeout = setTimeout(showRandomNotification, 20000);

    return () => {
      clearTimeout(firstTimeout);
      clearTimeout(randomTimeout);
    };
  }, [user]);

  // Restore missing states
  const [showCallModal, setShowCallModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showQRScannerModal, setShowQRScannerModal] = useState(false);
  const [showDeliveredModal, setShowDeliveredModal] = useState(false);
  const receiptHandledRef = useRef(false);
  
  // Debug logging
  console.log('TrackOrderScreen render - showChatModal:', showChatModal, 'showCallModal:', showCallModal);
  const [sheetHeight, setSheetHeight] = useState(60);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(60);
  const sheetRef = useRef(null);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Helper functions - MUST be defined BEFORE usage
  // Function to get a random real phone number based on location
  const getRandomRealPhoneNumber = (isUK) => {
    if (isUK) {
      const ukNumbers = [
        '+44 7723 489201', '+44 7845 167392', '+44 7398 521047', '+44 7561 834729',
        '+44 7924 605813', '+44 7481 932650', '+44 7650 271846', '+44 7136 849502'
      ];
      return ukNumbers[Math.floor(Math.random() * ukNumbers.length)];
    } else {
      const usNumbers = [
        '+1 (347) 823-4916', '+1 (619) 357-8204', '+1 (415) 902-7531', '+1 (713) 648-2905',
        '+1 (212) 579-3648', '+1 (310) 846-1729', '+1 (404) 731-9652', '+1 (512) 284-6037'
      ];
      return usNumbers[Math.floor(Math.random() * usNumbers.length)];
    }
  };

  const getDriverData = (currentOrderData) => {
    console.log('getDriverData called with:', currentOrderData);
    
    // Safely determine if user is in UK
    const userCity = user?.city?.toLowerCase() || '';
    const isUK = userCity.includes('london') || 
                 userCity.includes('uk') || 
                 userCity.includes('england');

    const fuelFriendName = currentOrderData?.fuelfriend?.name || 'FuelFriend';

    // Try to get fuelfriend data from order
    if (currentOrderData?.fuelfriend) {
      return {
        name: fuelFriendName,
        location: currentOrderData.fuelfriend.location || `On the way to ${currentOrderData.deliveryAddress || 'you'}`,
        phone: currentOrderData.fuelfriend.phone || getRandomRealPhoneNumber(isUK),
        avatar: currentOrderData.fuelfriend.avatarUrl || currentOrderData.fuelfriend.avatar || '/fuel friend.png'
      };
    }

    return {
      name: fuelFriendName,
      location: currentOrderData?.deliveryAddress || 'Waiting for pickup',
      phone: getRandomRealPhoneNumber(isUK),
      avatar: '/fuel friend.png'
    };
  };

  // Use actual order items from session storage instead of mock data
  const getOrderItems = (orderData) => {
    if (!orderData) return [];

    const items = [];

    // Add fuel item
    if (orderData.fuelQuantity && orderData.fuelCost) {
      items.push({
        name: `${orderData.fuelQuantity} Liters Fuel`,
        price: `${orderData.currency === 'GBP' ? '£' : '$'}${parseFloat(orderData.fuelCost).toFixed(2)}`
      });
    }

    // Add cart items
    if (orderData.cartItems && Array.isArray(orderData.cartItems)) {
      orderData.cartItems.forEach(item => {
        items.push({
          name: `${item.quantity}x ${item.name}`,
          price: `${orderData.currency === 'GBP' ? '£' : '$'}${(parseFloat(item.price) * item.quantity).toFixed(2)}`
        });
      });
    }

    return items;
  };

  // Get the order data (prioritize lastOrderData for guest tracking after payment)
  const currentOrder = order || lastOrderData || selectedOrder;
  const driverData = getDriverData(currentOrder);

  const completeOrderWithReceipt = (baseOrder: any) => {
    if (!baseOrder || receiptHandledRef.current) {
      setTimeout(() => setShowDeliveredModal(true), 500);
      return;
    }
    receiptHandledRef.current = true;
    const deliveredOrder = { ...baseOrder, status: 'delivered' };
    setOrder(deliveredOrder);
    sessionStorage.setItem('lastOrder', JSON.stringify(deliveredOrder));
    const receiptData = buildReceiptData(deliveredOrder, {
      name: driverData.name,
      phone: driverData.phone
    });
    const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
    if (currentUser?.id) {
      saveReceiptForUser(currentUser.id, receiptData);
    }
    toast.success('Tracking completed, receipt PDF opened');
    openReceiptPdfInNewTab(receiptData);
    setTimeout(() => setShowDeliveredModal(true), 500);
  };

  const handleStationQrScanned = (decodedText: string) => {
    const trackingNumber = String(currentOrder?.trackingNumber || '').trim();
    const scanned = String(decodedText || '').trim();
    const isMatch =
      !!trackingNumber &&
      (scanned.includes(trackingNumber) ||
        scanned.toLowerCase().includes(`order:${trackingNumber.toLowerCase()}`) ||
        scanned.toLowerCase().includes(`tracking:${trackingNumber.toLowerCase()}`));
    if (!isMatch) {
      toast.error('QR does not match this order');
      return;
    }
    setShowQRScannerModal(false);
    toast.success('QR valid, completing order...');
    completeOrderWithReceipt(currentOrder);
  };

  // Debug log for troubleshooting navigation issues
  useEffect(() => {
    console.log('🔍 TrackOrderScreen mounted');
    console.log('🔍 orderId:', orderId);
    console.log('🔍 isAuthenticated:', isAuthenticated);
    console.log('🔍 order found:', !!currentOrder);
  }, []);



  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setStartHeight(sheetHeight);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const deltaY = startY - currentY;
    const screenHeight = window.innerHeight;
    const deltaPercent = (deltaY / screenHeight) * 100;

    let newHeight = startHeight + deltaPercent;
    newHeight = Math.max(20, Math.min(85, newHeight));

    setSheetHeight(newHeight);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (sheetHeight < 35) {
      setSheetHeight(20);
    } else if (sheetHeight > 70) {
      setSheetHeight(85);
    } else {
      setSheetHeight(60);
    }
  };

  useEffect(() => {
    // Auto-save order to My Orders when tracking begins
    const autoSaveOrder = () => {
      if (lastOrderData && user?.id) {
        // Get existing orders from localStorage
        const existingOrders = JSON.parse(localStorage.getItem(`userOrders_${user.id}`) || '[]');

        // Check if this order already exists
        const orderExists = existingOrders.some(order =>
          order.trackingNumber === lastOrderData.trackingNumber
        );

        if (!orderExists) {
          // Add the new order
          const orderToSave = {
            ...lastOrderData,
            id: lastOrderData.orderId || `order_${Date.now()}`,
            status: 'ongoing', // Mark as ongoing when tracking
            createdAt: new Date().toISOString()
          };

          existingOrders.unshift(orderToSave); // Add to beginning of array
          localStorage.setItem(`userOrders_${user.id}`, JSON.stringify(existingOrders));
          console.log('✅ Order auto-saved to My Orders:', orderToSave.trackingNumber);
        }
      }
    };

    autoSaveOrder();

    // Determine location based on user data
    const userCity = user?.city?.toLowerCase() || '';
    const isUK = userCity.includes('london') || 
                 userCity.includes('uk') || 
                 userCity.includes('england') ||
                 userCity.includes('scotland') ||
                 userCity.includes('manchester') ||
                 userCity.includes('birmingham') ||
                 userCity.includes('ireland');

    const defaultLocation = isUK ? 'London, UK' : 'New York, USA';
    const defaultStation = isUK ? 'Shell Station London' : 'Shell Station New York';
    const currency = isUK ? '£' : '$';
    const fuelPrice = isUK ? 28.50 : 32.90; // GBP vs USD

    const fetchOrderData = async () => {
      try {
        // Priority 1: If order is passed from MyOrdersScreen, use it directly
        if (selectedOrder) {
          console.log('🔍 Using selectedOrder from navigation state');
          setOrder(selectedOrder);
          setIsLoading(false);
          return;
        }

        // Priority 2: If we have last order data from session (guest tracking after payment)
        if (lastOrderData) {
          console.log('🔍 Using lastOrderData from sessionStorage');
          console.log('🔍 lastOrderData contents:', lastOrderData);
          setOrder(lastOrderData);
          setIsLoading(false);
          return;
        }

        // Priority 3: If user is logged in, fetch from API
        if (token && user) {
          console.log('🔍 Fetching orders from API');
          const orders = await apiGetOrders(token);
          if (orders && orders.length > 0) {
            // Find the most recent order or match by orderId if provided
            const matchingOrder = orderId
              ? orders.find(o => o.id === orderId || o.trackingNumber === orderId)
              : orders[0]; // Most recent order

            if (matchingOrder) {
              console.log('🔍 Found matching order:', matchingOrder);
              setOrder(matchingOrder);
              setIsLoading(false);
              return;
            }
          }
        }

        // If no order found, set loading to false to show appropriate screen
        console.log('🔍 No order data found, showing appropriate screen');
        
        // Generate dynamic tracking number based on current date (FF + YYYYMMDDHHMMSS)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const dynamicTrackingNumber = `FF-${year}${month}${day}${hours}${minutes}${seconds}`;
        
        // Set a default order to prevent blank screen
        setOrder({
          id: 'default-order',
          trackingNumber: dynamicTrackingNumber,
          status: 'on_the_way',
          deliveryAddress: defaultLocation,
          fuelfriend: {
            name: 'FuelFriend',
            location: `On the way to ${defaultLocation}`,
            phone: isUK ? '+44-20-1234-5678' : '+1-555-123-4567',
            avatar: '/fuel friend.png'
          },
          cartItems: [
            { id: '1', name: 'Regular Fuel', price: fuelPrice, quantity: 1 },
            { id: '2', name: 'Service Fee', price: isUK ? 2.49 : 2.99, quantity: 1 }
          ],
          fuelQuantity: '10 liters',
          fuelType: 'Regular',
          stationName: defaultStation,
          currency: currency,
          fuelCost: fuelPrice,
          serviceFee: isUK ? 2.49 : 2.99
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching order data:', error);
        setIsLoading(false);
      }
    };



    console.log('🔍 fetchOrderData effect running');

    // Only fetch if we don't have an order yet
    if (!order) {
      // Don't fetch on every render, use a ref to track if we've already tried
      fetchOrderData();
    } else {
      setIsLoading(false);
    }
  }, [orderId, token, user, selectedOrder, lastOrderData]);

  // Initialize map with better error handling
  useEffect(() => {
    // Skip if loading or map already exists
    if (isLoading || map.current) return;

    // Force a small delay to ensure DOM is fully ready
    const timer = setTimeout(() => {
      if (!mapContainer.current) {
        console.log('❌ Map container ref not available yet');
        setMapLoaded(true); // Show content even if map fails
        return;
      }

      console.log('✅ Initializing Mapbox map...');
      console.log('🗺️ Mapbox token:', mapboxgl.accessToken ? 'Available' : 'Missing');

      try {
        // Check if Mapbox is available
        if (!mapboxgl || !mapboxgl.Map) {
          throw new Error('Mapbox GL library not available');
        }

        // Initialize map centered on Memphis area with optimal zoom for tracking
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: (jawgToken ? getJawgStyle() : 'mapbox://styles/mapbox/streets-v12') as any,
          center: [-90.0490, 35.1495], // Memphis coordinates
          zoom: 15, // Better zoom for 3D view
          pitch: 60, // 3D tilt angle
          bearing: -17.6, // Slight rotation for dynamic view
          antialias: true,
          attributionControl: false,
          failIfMajorPerformanceCaveat: false, // Allow fallback for low-end devices
          preserveDrawingBuffer: true // Better for mobile WebView
        });

        console.log('✅ Map instance created');

        // Add error handling for map events
        map.current.on('error', (e) => {
          console.error('❌ Map error:', e);
          setMapLoaded(true); // Show content even if map has errors
        });

        map.current.on('style.error', (e) => {
          console.error('❌ Map style error:', e);
        setMapLoaded(true); // Show content even if style fails
        });

        map.current.on('load', () => {
          console.log('✅ Map loaded successfully');
          map.current?.resize(); // Ensure map resizes correctly
          map.current?.easeTo({
            center: [-90.044, 35.145],
            zoom: 14,
            pitch: 60,
            bearing: -28,
            duration: 1200
          });
          setMapLoaded(true);

          // Prevent race conditions by checking if style is actually loaded
          if (!map.current?.isStyleLoaded()) {
            map.current?.once('style.load', () => {
              if (map.current) {
                console.log('✅ Map style loaded, setting up layers');
                setupMapLayers(map.current);
              }
            });
          } else if (map.current) {
            console.log('✅ Map style already loaded, setting up layers');
            setupMapLayers(map.current);
          }
        });

        map.current.addControl(new mapboxgl.NavigationControl({ showCompass: true, visualizePitch: true }), 'top-right');
        map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
        map.current.addControl(new mapboxgl.ScaleControl({ maxWidth: 100, unit: 'imperial' }), 'bottom-right');
        map.current.addControl(new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showAccuracyCircle: true
        }), 'top-right');
        map.current.dragRotate.enable();
        map.current.touchZoomRotate.enableRotation();
        map.current.touchPitch.enable();

      } catch (error) {
        console.error('❌ Map initialization error:', error);
        setMapLoaded(true); // Still set to loaded to show content even if map fails
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      if (map.current) {
        try {
          map.current.remove();
          map.current = null;
          console.log('✅ Map removed');
        } catch (error) {
          console.warn('⚠️ Error removing map:', error);
        }
      }
    };
  }, [isLoading]);

  // Helper to setup map layers with realistic route
  async function setupMapLayers(mapInstance: mapboxgl.Map) {
    console.log('🗺️ Setting up map layers with curved route...');

    // Driver location → User location (Uber style direction)
    const routeStart = (currentOrder?.driverLocation?.coordinates ||
      currentOrder?.driverCoordinates ||
      currentOrder?.courierCoordinates ||
      [-90.0490, 35.1495]) as [number, number];
    const routeEnd = (currentOrder?.destinationLocation?.coordinates ||
      currentOrder?.deliveryCoordinates ||
      currentOrder?.dropoffCoordinates ||
      [-90.0290, 35.1295]) as [number, number];

    try {
      // Create timeout for API request to prevent waiting too long
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout (Reduced for faster fallback)

      // Fetch real route from Mapbox Directions API - DRIVER → USER (Uber style)
      const response = await apiGetRouteDirections(routeStart as [number, number], routeEnd as [number, number], mapboxgl.accessToken);
      clearTimeout(timeoutId);
      const data = response;

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0].geometry;
        console.log('✅ Got curved route from Mapbox Directions API');

        // Add route source
        if (!mapInstance.getSource('route')) {
          mapInstance.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route
            }
          });
        }

        // Add route layer - thick green line like screenshot
        if (!mapInstance.getLayer('route')) {
          mapInstance.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3AC36C',
              'line-width': 8, // Thicker line like screenshot
              'line-opacity': 0.9
            }
          });
        }
        
        // Add route outline for depth
        if (!mapInstance.getLayer('route-outline')) {
          mapInstance.addLayer({
            id: 'route-outline',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#2ea85a',
              'line-width': 10, // Slightly wider outline
              'line-opacity': 0.3
            }
          }, 'route');
        }
        
        // Add arrows along the route
        if (!mapInstance.getSource('arrows')) {
          mapInstance.addSource('arrows', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [] // Will populate with arrow features
            }
          });
        }
        
        if (!mapInstance.getLayer('arrows')) {
          mapInstance.addLayer({
            id: 'arrows',
            type: 'symbol',
            source: 'arrows',
            layout: {
              'symbol-placement': 'line',
              'symbol-spacing': 50, // Place arrows every 50 pixels
              'icon-image': 'arrow-forward',
              'icon-rotate': ['get', 'angle'],
              'icon-allow-overlap': true,
              'icon-ignore-placement': true,
              'icon-size': 0.6
            }
          });
        }


        // Auto-fit map to route bounds for better tracking view
        const coordinates = route.coordinates;
        const bounds = coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord as [number, number]);
        }, new mapboxgl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number]));

        mapInstance.fitBounds(bounds, {
          padding: 80, // Add padding around route
          maxZoom: 14, // Prevent over-zooming (adjusted from 15)
          duration: 1000 // Smooth animation
        });

        // Animate car along the route
        let currentIndex = 0;

        // Create lightweight Jawg.io style car marker with navigation icon
        const carMarker = document.createElement('div');
        carMarker.className = 'car-marker';
        carMarker.style.cssText = 'position: relative; width: 48px; height: 48px; filter: drop-shadow(0 4px 8px rgba(58, 195, 108, 0.4));';
               
        // Alternate between two car PNGs
       const carImages= ['/mobil tracking.png', '/mobil tracking 1.png'];
       const randomCarImage = carImages[Math.floor(Math.random() * carImages.length)];
               
       carMarker.innerHTML = `
         <div style="
           position: absolute;
           top: 0;
           left: 0;
           width: 100%;
           height: 100%;
           display: flex;
           align-items: center;
           justify-content: center;
           z-index: 50;
         ">
           <img src="${randomCarImage}" alt="Tracking Car" style="
             width: 100%;
             height: 100%;
             object-fit: contain;
           " />
         </div>
       `;

        const marker = new mapboxgl.Marker({
          element: carMarker,
          anchor: 'center'
        })
          .setLngLat(coordinates[0])
          .addTo(mapInstance);
          
        console.log('✅ Car marker created and added to map');
        anime({
          targets: carMarker,
          scale: [1, 1.06, 1],
          duration: 900,
          loop: true,
          easing: 'easeInOutSine'
        });

        // Animate car movement (Smooth Interpolation)
        let isActive = true;
        let currentHeading = 0; // Track current heading for rotation

        const smoothAnimateCar = () => {
          if (!isActive) return;

          let index = 0;
          const startTime = performance.now();
          const totalDuration = 60000; // 1 minute total
                  
          // Calculate total distance to determine speed
          let totalDistance = 0;
          for (let i = 1; i < coordinates.length; i++) {
            const prev = coordinates[i - 1] as [number, number];
            const curr = coordinates[i] as [number, number];
            const dx = curr[0] - prev[0];
            const dy = curr[1] - prev[1];
            totalDistance += Math.sqrt(dx * dx + dy * dy);
          }
          
          const animateFrame = (timestamp: number) => {
            if (!isActive) return;
                    
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / totalDuration, 1);
                    
            if (progress < 1) {
              // Find the position along the route based on progress
              // Calculate which segment we're currently on
              let distanceSoFar = progress * totalDistance;
              let accumulatedDistance = 0;
              let segmentIndex = 0;
                      
              // Find which segment the car should be on
              for (let i = 0; i < coordinates.length - 1; i++) {
                const startCoord = coordinates[i] as [number, number];
                const endCoord = coordinates[i + 1] as [number, number];
                const dx = endCoord[0] - startCoord[0];
                const dy = endCoord[1] - startCoord[1];
                const segmentLength = Math.sqrt(dx * dx + dy * dy);
                        
                if (distanceSoFar <= accumulatedDistance + segmentLength) {
                  segmentIndex = i;
                  distanceSoFar -= accumulatedDistance;
                  break;
                }
                accumulatedDistance += segmentLength;
              }
                      
              // Calculate the exact position within the current segment
              const startCoord = coordinates[segmentIndex] as [number, number];
              const endCoord = coordinates[segmentIndex + 1] as [number, number];
              const dx = endCoord[0] - startCoord[0];
              const dy = endCoord[1] - startCoord[1];
              const segmentLength = Math.sqrt(dx * dx + dy * dy);
              const segmentProgress = segmentLength > 0 ? distanceSoFar / segmentLength : 0;
                      
              const lng = startCoord[0] + dx * segmentProgress;
              const lat = startCoord[1] + dy * segmentProgress;
              
              // Safety check to prevent blank/invalid positions
              if (!isFinite(lng) || !isFinite(lat) || isNaN(lng) || isNaN(lat)) {
                console.warn('⚠️ Invalid coordinates detected, skipping frame');
                requestAnimationFrame(animateFrame);
                return;
              }
              
              const nextPos = [lng, lat] as [number, number];
          
              marker.setLngLat(nextPos);
                              // Kept lightweight bounds via normal means without constant camera movement

                            
              // Calculate bearing for smooth rotation (no flip)
              const nextIndex = Math.min(segmentIndex + 1, coordinates.length - 1);
              const currentCoord = coordinates[segmentIndex] as [number, number];
              const nextCoord = coordinates[nextIndex] as [number, number];
              
              const deltaLng = nextCoord[0] - currentCoord[0];
              const deltaLat = nextCoord[1] - currentCoord[1];
              
              // Calculate bearing in degrees (0° = North, 90° = East)
              // Using atan2 for proper quadrant handling
              let bearing = Math.atan2(deltaLng, deltaLat) * (180 / Math.PI);
              
              // Normalize to 0-360 range
              bearing = (bearing + 360) % 360;
              
              // Smooth transition - prevent sudden 180° flips
              if (currentHeading !== 0) {
                let diff = bearing - currentHeading;
                // Normalize difference to -180 to 180 range
                while (diff > 180) diff -= 360;
                while (diff < -180) diff += 360;
                // Apply smooth interpolation
                bearing = currentHeading + diff * 0.15; // 15% interpolation for ultra smooth
              }
              
              currentHeading = bearing;
              
              const rotateContainer = carMarker.querySelector('img') as HTMLElement;
              if (rotateContainer) {
                // Apply smooth rotation with CSS transition
                rotateContainer.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                rotateContainer.style.transform = `rotate(${bearing}deg)`;
              }
                      
              requestAnimationFrame(animateFrame);
            } else {
              // ARRIVED
              console.log('🎉 Car arrived at destination!');
              completeOrderWithReceipt(currentOrder);
            }
          };

          requestAnimationFrame(animateFrame);
        };

        // Start animation automatically
        console.log('🚗 Starting smooth car animation for 1 minute...');
        requestAnimationFrame(smoothAnimateCar);

      } else {
        console.warn('⚠️ No route found from API, using fallback');
        useFallbackRoute(mapInstance, routeStart, routeEnd);
      }
    } catch (error) {
      console.error('❌ Error fetching route or timeout:', error);
      console.log('⚠️ Switching to fallback route due to error/timeout');
      useFallbackRoute(mapInstance, routeStart, routeEnd);
    }

    // Add destination marker
    const destMarker = document.createElement('div');
    destMarker.className = 'destination-marker';
    destMarker.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
      ">
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M 20 5 C 14 5 9 10 9 16 C 9 24 20 35 20 35 C 20 35 31 24 31 16 C 31 10 26 5 20 5 Z" fill="#EF4444"/>
          <circle cx="20" cy="16" r="5" fill="white"/>
        </svg>
      </div>
    `;

    new mapboxgl.Marker(destMarker)
      .setLngLat(routeEnd as [number, number])
      .addTo(mapInstance);
  }

  // Fallback route function - DRIVER → USER
  function useFallbackRoute(mapInstance: mapboxgl.Map, routeStart: number[], routeEnd: number[]) {
    // Create a curvy route with intermediate waypoints
    const midPoint = [(routeStart[0] + routeEnd[0]) / 2, (routeStart[1] + routeEnd[1]) / 2];
    
    // Add some variation to make the route curvy
    const curveFactor = 0.02; // Adjust for more or less curvature
    const controlPoint1 = [midPoint[0] + curveFactor, midPoint[1] + curveFactor * 0.5];
    const controlPoint2 = [midPoint[0] - curveFactor * 0.5, midPoint[1] - curveFactor];
    
    // Create a curved path using multiple intermediate points
    const routeCoordinates = [];
    
    // Generate points along a curved path using cubic Bezier interpolation
    for (let i = 0; i <= 1; i += 0.05) { // Increase resolution for smoother curve
      const t = i;
      // Cubic Bezier curve formula
      const x = Math.pow(1 - t, 3) * routeStart[0] + 
               3 * Math.pow(1 - t, 2) * t * controlPoint1[0] + 
               3 * (1 - t) * Math.pow(t, 2) * controlPoint2[0] + 
               Math.pow(t, 3) * routeEnd[0];
      
      const y = Math.pow(1 - t, 3) * routeStart[1] + 
               3 * Math.pow(1 - t, 2) * t * controlPoint1[1] + 
               3 * (1 - t) * Math.pow(t, 2) * controlPoint2[1] + 
               Math.pow(t, 3) * routeEnd[1];
      
      routeCoordinates.push([x, y]);
    }
    
    if (!mapInstance.getSource('route')) {
      mapInstance.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
          }
        }
      });
    }

    if (!mapInstance.getLayer('route')) {
      mapInstance.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3AC36C',
          'line-width': 6
        }
      });
    }

  // Add lightweight Jawg.io style car marker for fallback route
    const carMarker = document.createElement('div');
    carMarker.className= 'car-marker';
    carMarker.style.cssText = 'position: relative; width: 48px; height: 48px; filter: drop-shadow(0 4px 8px rgba(58, 195, 108, 0.4));';
      
    // Alternate between two car PNGs
   const carImages= ['/mobil tracking.png', '/mobil tracking 1.png'];
   const randomCarImage = carImages[Math.floor(Math.random() * carImages.length)];
      
   carMarker.innerHTML = `
     <div style="
       position: absolute;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
       display: flex;
       align-items: center;
       justify-content: center;
       z-index: 50;
     ">
       <img src="${randomCarImage}" alt="Tracking Car" style="
         width: 100%;
         height: 100%;
         object-fit: contain;
       " />
     </div>
   `;

    const marker = new mapboxgl.Marker({
      element: carMarker,
      anchor: 'center'
    })
      .setLngLat(start as [number, number])
      .addTo(mapInstance);
      
    console.log('✅ Fallback car marker created and added to map');

    // Smooth animation from start to end over 1 minute
    const startTime = performance.now();
    const totalDuration = 60000; // 1 minute in milliseconds
    let lastBearing = 0; // Track last bearing for smooth transitions

    const animateFallback = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      let progress = elapsed / totalDuration;
      
      if (progress < 1) {
        // Use smoother easing function
        progress = 0.5 - 0.5 * Math.cos(progress * Math.PI); // Smooth ease-in-out
        
        const lng = start[0] + (end[0] - start[0]) * progress;
        const lat = start[1] + (end[1] - start[1]) * progress;

        // Calculate bearing from current position to destination
        const deltaLng = end[0] - lng;
        const deltaLat = end[1] - lat;
        
        // Calculate bearing in degrees (0° = North, 90° = East)
        let bearing = Math.atan2(deltaLng, deltaLat) * (180 / Math.PI);
        
        // Normalize to 0-360 range
        bearing = (bearing + 360) % 360;
        
        // Smooth transition - prevent sudden flips
        if (lastBearing !== 0) {
          let diff = bearing - lastBearing;
          // Normalize difference to -180 to 180 range
          while (diff > 180) diff -= 360;
          while (diff < -180) diff += 360;
          // Apply smooth interpolation
          bearing = lastBearing + diff * 0.15;
        }
        
        lastBearing = bearing;
        
        // Apply rotation to the container inside the marker
        const rotateContainer = carMarker.querySelector('img') as HTMLElement;
        if (rotateContainer) {
          rotateContainer.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
          rotateContainer.style.transform = `rotate(${bearing}deg)`;
        }

        marker.setLngLat([lng, lat]);

        // Lightweight marker movement without continuous camera panning

        requestAnimationFrame(animateFallback);
      } else {
        // Arrived
        console.log('🎉 Car arrived (fallback)!');
        completeOrderWithReceipt(currentOrder);
      }
    };

    // Start animation
    requestAnimationFrame(animateFallback);
  }

  // Map loading safety timeout
  useEffect(() => {
    if (!mapLoaded) {
      const timer = setTimeout(() => {
        console.log('Map loading timed out, force showing content');
        setMapLoaded(true);
      }, 1500); // 1.5 seconds timeout (Reduced from 5s) to show content FAST
      return () => clearTimeout(timer);
    }
  }, [mapLoaded]);

  // Show loading state with timeout to prevent infinite loading
  const [showTimeoutError, setShowTimeoutError] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('🔍 Loading timeout reached, forcing loading to false');
        setIsLoading(false);
        setShowTimeoutError(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  console.log('Driver data:', driverData);
  console.log('Current order:', currentOrder);

  // Car starts from driver/station location and goes TO user location (like Uber)
  const routeEnd = (currentOrder?.destinationLocation?.coordinates ||
    currentOrder?.deliveryCoordinates ||
    currentOrder?.dropoffCoordinates ||
    sampleGasToUserRoute.features[0].geometry.coordinates[sampleGasToUserRoute.features[0].geometry.coordinates.length - 1]) as [number, number];
  const routeStart = (currentOrder?.driverLocation?.coordinates ||
    currentOrder?.driverCoordinates ||
    currentOrder?.courierCoordinates ||
    sampleGasToUserRoute.features[0].geometry.coordinates[0]) as [number, number];
  const routeMid1: [number, number] = [
    routeStart[0] + (routeEnd[0] - routeStart[0]) * 0.35 - 0.0042,
    routeStart[1] + (routeEnd[1] - routeStart[1]) * 0.35 + 0.0027
  ];
  const routeMid2: [number, number] = [
    routeStart[0] + (routeEnd[0] - routeStart[0]) * 0.68 + 0.0031,
    routeStart[1] + (routeEnd[1] - routeStart[1]) * 0.68 - 0.0018
  ];
  const trackingRouteGeoJson = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { routeName: 'Live tracking route' },
        geometry: {
          type: 'LineString',
          coordinates: [routeStart, routeMid1, routeMid2, routeEnd]
        }
      }
    ]
  };

  // Define order status based on order data
  // Fixed: 3 steps timeline (Order -> On the Way -> Delivered)
  const orderStatus = {
    progress: currentOrder?.status === 'completed' || currentOrder?.status === 'delivered' ? 100 :
      currentOrder?.status === 'on_the_way' ? 50 :  // Changed from 75 to 50 for smooth transition
        currentOrder?.status === 'preparing' ? 50 :  // Preparing = On the Way
          currentOrder?.status === 'pending' ? 0 : 33,  // Pending = just started
    status: currentOrder?.status || 'pending',
    step: currentOrder?.status === 'completed' || currentOrder?.status === 'delivered' ? 4 :
      currentOrder?.status === 'on_the_way' ? 3 :
        currentOrder?.status === 'preparing' ? 3 :  // Preparing = step 3 (On the Way)
          currentOrder?.status === 'pending' ? 1 : 1
  };

  if (isLoading) {
    return (
      <AnimatedPage>
        <div className="min-h-screen flex flex-col bg-white">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Preparing Tracking...</p>
            </div>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  // Safety check to ensure we don't crash if currentOrder is still null
  if (!currentOrder) {
    return (
      <div className="min-h-screen flex flex-col bg-white items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Truck className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Finding Your Order...</h2>
        <p className="text-gray-600 mb-8">We couldn't find an active order to track right now.</p>
        <button
          onClick={() => navigate('/home')}
          className="w-full max-w-xs py-4 bg-[#3AC36C] text-white rounded-full font-bold shadow-lg hover:bg-[#2da85a] transition-all active:scale-95"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  console.log('🔍 TrackOrderScreen data:', {
    order: !!order,
    lastOrderData: !!lastOrderData,
    currentOrder: !!currentOrder,
    token: !!token,
    user: !!user
  });

  // Animate UI elements on mount
  useEffect(() => {
    // Animate header with slide and bounce
    anime({
      targets: '.track-header',
      translateY: [-40, 0],
      opacity: [0, 1],
      duration: 800,
      easing: 'easeOutElastic(1, .8)'
    });

    // Animate bottom sheet with dramatic entrance
    anime({
      targets: '.bottom-sheet',
      translateY: [200, 0],
      opacity: [0, 1],
      scale: [0.95, 1],
      duration: 1000,
      delay: 300,
      easing: 'easeOutElastic(1, .7)'
    });

    // Animate driver info with pop effect
    anime({
      targets: '.driver-info',
      scale: [0.7, 1.1, 1],
      opacity: [0, 1],
      rotate: [-5, 5, 0],
      duration: 800,
      delay: 600,
      easing: 'easeOutElastic(1, .6)'
    });

    // Animate action buttons with stagger bounce
    anime({
      targets: '.action-button',
      scale: [0, 1.2, 1],
      opacity: [0, 1],
      rotate: [180, 0],
      duration: 700,
      delay: anime.stagger(150, {start: 800}),
      easing: 'easeOutElastic(1, .7)'
    });



    // Animate order details with slide and fade
    anime({
      targets: '.order-detail-item',
      translateX: [-50, 0],
      opacity: [0, 1],
      scale: [0.95, 1],
      duration: 600,
      delay: anime.stagger(100, {start: 1200}),
      easing: 'easeOutCubic'
    });
  }, []);

  return (
    <>
      {/* iOS Style Notification */}
      {showNotification && currentNotification && (
        <div 
          className="ios-notification fixed top-4 left-4 right-4 z-[9999]"
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-4 flex items-start gap-3 backdrop-blur-xl"
            style={{
              boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1)',
              border: '0.5px solid rgba(0,0,0,0.04)'
            }}
            onClick={() => {
              anime({
                targets: '.ios-notification',
                scale: [1, 0.95, 1],
                duration: 200,
                easing: 'easeInOutQuad'
              });
            }}
          >
            {/* Icon */}
            <div className="text-3xl flex-shrink-0 mt-0.5">
              {currentNotification.icon}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">
                    {currentNotification.title}
                  </h3>
                  <p className="text-gray-600 text-xs leading-snug">
                    {currentNotification.message}
                  </p>
                </div>
                
                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    anime({
                      targets: '.ios-notification',
                      scale: [1, 0.9],
                      opacity: [1, 0],
                      translateY: [0, -20],
                      duration: 300,
                      easing: 'easeInBack',
                      complete: () => {
                        setShowNotification(false);
                      }
                    });
                  }}
                  className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <span className="text-gray-500 text-xs">✕</span>
                </button>
              </div>
              
              {/* Time indicator */}
              <div className="text-[10px] text-gray-400 mt-1">
                now
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatedPage>
        {/* Force visibility of markers */}
        <style>{`
          .car-marker, .mapboxgl-marker {
            z-index: 999 !important;
            opacity: 1 !important;
            display: block !important;
          }
          .destination-marker {
            z-index: 998 !important;
          }
          
          /* Pulse ring animation for Jawg.io style navigation */
          @keyframes pulse-ring {
            0% {
              transform: translate(-50%, -50%) scale(0.8);
              opacity: 1;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.2);
              opacity: 0.5;
            }
            100% {
              transform: translate(-50%, -50%) scale(1.5);
              opacity: 0;
            }
          }
          
          /* Smooth rotation for navigation icon */
          .car-rotate-container {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: transform;
          }
        `}</style>
        <div className="bg-white min-h-screen flex flex-col">
          {/* Header */}
          <div className="track-header flex items-center px-4 py-4 bg-white absolute top-0 left-0 right-0 z-[3000] shadow-sm">
            <TapEffectButton
              onClick={() => {
                anime({
                  targets: '.track-header',
                  scale: [1, 0.95, 1],
                  duration: 300,
                  easing: 'easeInOutQuad'
                });
                navigate('/home');
              }}
              className="p-2 -ml-2"
            >
              <img 
                src="/Back.png" 
                alt="Back" 
                className="w-5 h-5"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-gray-900 text-xl">←</span>';
                  }
                }}
              />
            </TapEffectButton>
            <h1 className="text-lg font-bold text-gray-900 flex-1 text-center -ml-10">Track Your Order</h1>
          </div>

          {/* Map Container with Rounded Corners - Reconnected to Mapbox GL Logic */}
          <div 
            ref={mapContainer}
            className="flex-1 relative w-full h-full min-h-[50vh] rounded-3xl overflow-hidden"
            style={{ width: '100%', height: '100%' }}
          />

          {/* Bottom Sheet */}
          <div
            ref={sheetRef}
            className="bottom-sheet bg-white rounded-t-3xl shadow-2xl absolute bottom-0 left-0 right-0 z-[3000]"
            style={{ height: `${sheetHeight}%`, transform: `translateY(${100 - sheetHeight}%)` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Drag Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>

            <div className="px-4 pb-20 overflow-y-auto" style={{ maxHeight: '80vh' }}>
              {/* Driver Information */}
              <div className="driver-info flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={driverData.avatar}
                      alt={driverData.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Avatar failed to load, using fallback');
                        e.currentTarget.src = '/fuel friend.png';
                        e.currentTarget.onerror = () => {
                          // Second fallback - show placeholder div
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent && !parent.querySelector('.avatar-fallback')) {
                            const fallbackDiv = document.createElement('div');
                            fallbackDiv.className = 'avatar-fallback w-full h-full flex items-center justify-center bg-[#3AC36C] text-white font-bold text-lg';
                            fallbackDiv.textContent = driverData.name.charAt(0);
                            parent.appendChild(fallbackDiv);
                          }
                        };
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{driverData.name}</h3>
                    <p className="text-sm text-gray-600">{driverData.location}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      anime({
                        targets: e.currentTarget,
                        scale: [1, 0.9, 1],
                        duration: 300,
                        easing: 'easeInOutQuad'
                      });
                      console.log('Message button clicked!');
                      setShowChatModal(true);
                    }}
                    className="action-button p-3 bg-[#3AC36C] rounded-full w-12 h-12 flex items-center justify-center shadow-md hover:bg-[#2da85a] transition-all active:scale-95 touch-manipulation"
                    aria-label="Message Agent"
                  >
                    <MessageCircle className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      anime({
                        targets: e.currentTarget,
                        scale: [1, 0.9, 1],
                        duration: 300,
                        easing: 'easeInOutQuad'
                      });
                      setShowCallModal(true);
                    }}
                    className="action-button p-3 bg-[#3AC36C] rounded-full w-12 h-12 flex items-center justify-center shadow-md hover:bg-[#2da85a] transition-all active:scale-95 touch-manipulation"
                    aria-label="Call Agent"
                  >
                    <Phone className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      anime({
                        targets: e.currentTarget,
                        scale: [1, 0.9, 1],
                        duration: 300,
                        easing: 'easeInOutQuad'
                      });
                      setShowQRScannerModal(true);
                    }}
                    className="action-button p-3 bg-[#3AC36C] rounded-full w-12 h-12 flex items-center justify-center shadow-md hover:bg-[#2da85a] transition-all active:scale-95 touch-manipulation"
                    aria-label="Scan QR Code"
                  >
                    <QrCode className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Delivery Time - Clean Design (No Green Background) */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 text-lg mb-1">Your Pickup Time</h4>
                <p className="text-gray-500 text-sm mb-4">
                  {String(currentOrder?.deliveryTime || 'Estimated 15-20 mins').replace(/delivery/gi, 'pickup').replace(/deliver/gi, 'pickup')}
                </p>

                {/* Clean Progress Bar (No Icons) */}
                <div className="relative py-4">
                  {/* Progress Track */}
                  <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full transform -translate-y-1/2"></div>
                  
                  {/* Active Progress */}
                  <div 
                    className="absolute top-1/2 left-0 h-2 bg-green-500 rounded-full transform -translate-y-1/2 transition-all duration-500"
                    style={{ 
                      width: currentOrder?.status === 'completed' || currentOrder?.status === 'delivered' ? '100%' :
                             currentOrder?.status === 'on_the_way' ? '66%' :
                             currentOrder?.status === 'preparing' ? '33%' : '0%'
                    }}
                  ></div>
                  
                  {/* Status Indicators (Dots Only, No Icons) */}
                  <div className="relative flex items-center justify-between">
                    {/* Start Point */}
                    <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
                    
                    {/* Middle Point */}
                    <div className={`w-4 h-4 rounded-full border-2 shadow ${
                      currentOrder?.status === 'on_the_way' || currentOrder?.status === 'preparing' 
                        ? 'bg-green-500 border-white' 
                        : 'bg-gray-300 border-gray-200'
                    }`}></div>
                    
                    {/* End Point */}
                    <div className={`w-4 h-4 rounded-full border-2 shadow ${
                      currentOrder?.status === 'completed' || currentOrder?.status === 'delivered'
                        ? 'bg-green-500 border-white' 
                        : 'bg-gray-300 border-gray-200'
                    }`}></div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Order Details</h4>
                <div className="space-y-3">
                  {/* Fuel Item */}
                  <div className="order-detail-item flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <span className="text-gray-700 font-medium">
                        {currentOrder?.fuelType || 'Regular'} Fuel
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({currentOrder?.fuelQuantity || '10 liters'})
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {currentOrder?.currency || '$'}{typeof currentOrder?.fuelCost === 'number' ? currentOrder.fuelCost.toFixed(2) : (currentOrder?.fuelCost || '32.90')}
                    </span>
                  </div>

                  {/* Cart Items (Convenience items) */}
                  {currentOrder?.cartItems?.filter(item => item?.name && typeof item.name === 'string' && item.name.toLowerCase().includes('fee') === false).map((item, index) => (
                    <div key={item?.id || index} className="order-detail-item flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <span className="text-gray-700">{item?.name || 'Item'}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          (x{item?.quantity || 1})
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {currentOrder?.currency || '$'}{typeof item?.price === 'number' ? item.price.toFixed(2) : (item?.price || '0.00')}
                      </span>
                    </div>
                  ))}

                  {/* Service Fee */}
                  {currentOrder?.serviceFee && typeof currentOrder.serviceFee === 'number' && (
                    <div className="order-detail-item flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-700">Service Fee</span>
                      <span className="font-medium text-gray-900">
                        {currentOrder?.currency || '$'}{currentOrder.serviceFee.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Station Info */}
                  <div className="order-detail-item flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700 text-sm">Station</span>
                    <span className="font-medium text-gray-900 text-sm">
                      {currentOrder?.stationName || 'Fuel Station'}
                    </span>
                  </div>

                  {/* Location Info */}
                  <div className="order-detail-item flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700 text-sm">Pickup Location</span>
                    <span className="font-medium text-gray-900 text-sm">
                      {currentOrder?.deliveryAddress || 'Location'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call Modal */}
        {showCallModal && (
          <CallModal
            isOpen={showCallModal}
            onClose={() => setShowCallModal(false)}
            driverName={driverData.name}
            phoneNumber={driverData.phone || getRandomRealPhoneNumber((user?.city || '').toLowerCase().includes('london') || (user?.city || '').toLowerCase().includes('uk') || (user?.city || '').toLowerCase().includes('england'))}
          />
        )}

        {/* Delivery Completed Modal (UK/US style) */}
        {showDeliveredModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[5000] p-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-in">
              {/* Success Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-gray-500" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Completed!</h2>
                <p className="text-gray-600">Your order has been completed successfully.</p>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Order ID</span>
                  <span className="text-sm font-medium text-gray-900">{currentOrder?.trackingNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">FuelFriend</span>
                  <span className="text-sm font-medium text-gray-900">{driverData.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-sm font-bold text-gray-600">
                    {currentOrder?.currency || '$'}{(parseFloat(currentOrder?.grandTotal || currentOrder?.totalAmount) || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowDeliveredModal(false);
                    navigate('/home');
                  }}
                  className="w-full py-3 bg-[#3AC36C] text-white rounded-full font-semibold hover:bg-[#2da85a] transition-all duration-200"
                >
                  Back to Home
                </button>
                <button
                  onClick={() => {
                    setShowDeliveredModal(false);
                    navigate('/orders');
                  }}
                  className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-full font-semibold hover:border-gray-500 hover:text-gray-500 transition-all duration-200"
                >
                  View All Orders
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatedPage>

      {/* Chat Modal - Outside AnimatedPage to ensure full screen coverage */}
      {showChatModal && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          driverName={driverData.name}
          driverAvatar={driverData.avatar}
          driverPhone={driverData.phone || '+1234567890'}
          onCall={() => {
            setShowChatModal(false);
            // Navigate to in-app calling screen
            const userCity = (user?.city || '').toLowerCase();
            const isUK = userCity.includes('london') || userCity.includes('uk') || userCity.includes('england');
            const fallbackPhone = getRandomRealPhoneNumber(isUK);
            navigate(`/call/${driverData.name}/${orderId}`);
          }}
        />
      )}

      {showQRScannerModal && (
        <QRScannerModal
          isOpen={showQRScannerModal}
          onClose={() => setShowQRScannerModal(false)}
          onScanSuccess={handleStationQrScanned}
        />
      )}
    </>
  );
};

export default TrackOrderScreen;
