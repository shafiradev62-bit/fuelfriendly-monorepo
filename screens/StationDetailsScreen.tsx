import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, Star, Plus, Minus, Trash2, Check, User } from 'lucide-react';
import anime from 'animejs';
import { Station, FuelFriend } from '../types';
import { apiGetStationDetails } from '../services/api';
import AnimatedPage from '../components/AnimatedPage';
import TapEffectButton from '../components/TapEffectButton';

interface ExtendedFuelFriend extends FuelFriend {
  price?: number;
  location?: string;
  reviews?: number;
  phone?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const curatedSnackMenu = [
  { id: 'snack-1', name: 'Honey Butter Chips', price: 4.99, description: 'Sweet-salty Korean potato chips', imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f35f.png' },
  { id: 'snack-2', name: 'Matcha Almond Cookies', price: 5.49, description: 'Crunchy green-tea cookies', imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f36a.png' },
  { id: 'snack-3', name: 'Truffle Popcorn', price: 6.25, description: 'Buttery popcorn with truffle aroma', imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f37f.png' },
  { id: 'snack-4', name: 'Sea Salt Pretzel Bites', price: 4.75, description: 'Mini pretzel bites with sea salt', imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f968.png' },
  { id: 'snack-5', name: 'Chili Lime Cashews', price: 6.99, description: 'Roasted cashews with chili-lime kick', imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f95c.png' },
  { id: 'snack-6', name: 'Dark Choco Rice Crisps', price: 5.89, description: 'Crispy rice puffs coated in dark chocolate', imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f36b.png' },
  { id: 'snack-7', name: 'Wasabi Peas Deluxe', price: 4.39, description: 'Spicy crunchy peas with wasabi', imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1fadb.png' },
  { id: 'snack-8', name: 'Caramel Sesame Crackers', price: 4.95, description: 'Sweet sesame crackers with caramel glaze', imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f9c7.png' },
  { id: 'snack-9', name: 'Berry Yogurt Gummies', price: 3.99, description: 'Mixed berry gummies with yogurt center', imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f353.png' },
  { id: 'snack-10', name: 'Smoky Corn Ribbons', price: 4.69, description: 'Thin crispy corn strips, smoky flavor', imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f33d.png' }
];

const snackImageByKeyword = [
  { keywords: ['coffee', 'latte', 'cappuccino', 'espresso', 'americano', 'mocha'], imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2615.png' },
  { keywords: ['tea'], imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f375.png' },
  { keywords: ['water'], imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4a7.png' },
  { keywords: ['juice', 'smoothie'], imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f9c3.png' },
  { keywords: ['drink', 'soda', 'cola', 'slurpee', 'icee', 'electrolyte'], imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f964.png' },
  { keywords: ['sandwich', 'hoagie', 'panini', 'sub', 'wrap', 'bap'], imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f96a.png' },
  { keywords: ['pizza'], imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f355.png' },
  { keywords: ['burger'], imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f354.png' },
  { keywords: ['taco', 'taquito', 'quesadilla', 'burrito'], imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f32e.png' },
  { keywords: ['hot dog', 'dino dog'], imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f32d.png' },
  { keywords: ['cookie', 'biscuit', 'shortbread', 'cracker', 'flapjack'], imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f36a.png' },
  { keywords: ['chips', 'crisps', 'popcorn', 'nacho'], imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f35f.png' },
  { keywords: ['pretzel'], imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f968.png' },
  { keywords: ['chocolate', 'brownie'], imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f36b.png' },
  { keywords: ['donut', 'doughnut'], imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f369.png' },
  { keywords: ['muffin', 'croissant', 'pastry', 'bake', 'baguette'], imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f950.png' },
  { keywords: ['yogurt', 'ice cream', 'sundae'], imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f368.png' },
  { keywords: ['nuts', 'cashew', 'peanut', 'trail mix', 'granola', 'protein bar', 'energy bar', 'jerky'], imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f95c.png' }
];

const getSnackImageUrl = (item: any) => {
  if (item?.imageUrl) return item.imageUrl;
  const haystack = `${item?.name || ''} ${item?.description || ''}`.toLowerCase();
  const matched = snackImageByKeyword.find((entry) => entry.keywords.some((keyword) => haystack.includes(keyword)));
  return matched?.imageUrl || 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f9c1.png';
};

const StationDetailsScreen = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [station, setStation] = useState<Station | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedFuelFriend, setSelectedFuelFriend] = useState<ExtendedFuelFriend | null>(null);
  const [isAutoAssigningFuelFriend, setIsAutoAssigningFuelFriend] = useState(false);
  const [showAllFuelFriends, setShowAllFuelFriends] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('stationSharedTransition');
    if (!raw) return;
    try {
      const transition = JSON.parse(raw);
      const clone = document.createElement('div');
      clone.style.position = 'fixed';
      clone.style.left = `${transition.x}px`;
      clone.style.top = `${transition.y}px`;
      clone.style.width = `${transition.width}px`;
      clone.style.height = `${transition.height}px`;
      clone.style.borderRadius = '24px';
      clone.style.overflow = 'hidden';
      clone.style.zIndex = '9999';
      clone.style.boxShadow = '0 18px 40px rgba(0,0,0,0.24)';
      clone.innerHTML = `<img src="${transition.image}" style="width:100%;height:100%;object-fit:cover;" />`;
      document.body.appendChild(clone);
      anime({
        targets: clone,
        left: 16,
        top: 56,
        width: window.innerWidth - 32,
        height: 176,
        borderRadius: 16,
        duration: 400,
        easing: 'easeInOutQuad',
        complete: () => {
          clone.remove();
          sessionStorage.removeItem('stationSharedTransition');
        }
      });
    } catch (error) {
      sessionStorage.removeItem('stationSharedTransition');
    }
  }, []);

  // Generate real station logo based on station name
  const getStationLogo = (stationName) => {
    const name = stationName?.toLowerCase() || '';
    console.log('Station name for logo:', name); // Debug

    if (name.includes('shell') || name.includes('turbofuel')) {
      return 'https://logos-world.net/wp-content/uploads/2020/04/Shell-Logo.png';
    }
    if (name.includes('bp') || name.includes('british petroleum')) {
      return 'https://logos-world.net/wp-content/uploads/2020/04/BP-Logo.png';
    }
    if (name.includes('exxon') || name.includes('mobil')) {
      return 'https://logos-world.net/wp-content/uploads/2020/04/ExxonMobil-Logo.png';
    }
    if (name.includes('chevron')) {
      return 'https://logos-world.net/wp-content/uploads/2020/04/Chevron-Logo.png';
    }
    if (name.includes('total')) {
      return 'https://logos-world.net/wp-content/uploads/2020/04/Total-Logo.png';
    }
    if (name.includes('ecofuel') || name.includes('eco')) {
      return 'https://logos-world.net/wp-content/uploads/2020/04/BP-Logo.png';
    }
    if (name.includes('quickstop') || name.includes('quick')) {
      return 'https://logos-world.net/wp-content/uploads/2020/04/Chevron-Logo.png';
    }
    if (name.includes('premium') || name.includes('fuel hub')) {
      return 'https://logos-world.net/wp-content/uploads/2020/04/ExxonMobil-Logo.png';
    }

    // Default to Shell
    return 'https://logos-world.net/wp-content/uploads/2020/04/Shell-Logo.png';
  };

  // Check if fuel friend was selected from FuelFriendDetailsScreen
  useEffect(() => {
    if (location.state?.selectedFuelFriend) {
      setSelectedFuelFriend(location.state.selectedFuelFriend);
    }
    // Restore cart from location state if available
    if (location.state?.cartItems) {
      setCart(location.state.cartItems);
    }
  }, [location.state]);

  const groceries = ((Array.isArray(station?.groceries) && station.groceries.length > 0
    ? station.groceries
    : curatedSnackMenu) as any[]).map((item, index) => ({
      ...item,
      id: item?.id || `snack-fallback-${index}`,
      imageUrl: getSnackImageUrl(item)
    }));
  const fuelFriends = station?.fuelFriends || [];

  useEffect(() => {
    if (selectedFuelFriend || fuelFriends.length === 0) return;
    setIsAutoAssigningFuelFriend(true);
    const timer = window.setTimeout(() => {
      const autoAssigned = [...fuelFriends].sort((a: any, b: any) => (b?.rating || 0) - (a?.rating || 0))[0];
      setSelectedFuelFriend(autoAssigned as ExtendedFuelFriend);
      setIsAutoAssigningFuelFriend(false);
    }, 1200);
    return () => {
      window.clearTimeout(timer);
      setIsAutoAssigningFuelFriend(false);
    };
  }, [fuelFriends, selectedFuelFriend]);

  useEffect(() => {
    if (!isAutoAssigningFuelFriend) return;
    anime({
      targets: '.fuel-friend-loading-dot',
      translateY: [0, -4, 0],
      delay: anime.stagger(120),
      duration: 550,
      loop: true,
      easing: 'easeInOutQuad'
    });
  }, [isAutoAssigningFuelFriend]);

  const handleSnackClick = (itemId: string) => {
    anime({
      targets: `.snack-card-${itemId}`,
      scale: [1, 0.985, 1],
      duration: 180,
      easing: 'easeInOutQuad'
    });
    updateCartQuantity(itemId, 1);
  };

  useEffect(() => {
    if (location.state?.selectedFuelFriend) {
      setIsAutoAssigningFuelFriend(false);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchStationDetails = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        // Use quick data from HomeScreen first, then enrich from detail API
        if (location.state?.station) {
          console.log('Using station data from HomeScreen:', location.state.station);
          setStation(location.state.station);
        }

        // Always try to fetch detail data (includes groceries + fuel friends)
        const data = await apiGetStationDetails(id);
        setStation((prev) => ({
          ...(prev || {}),
          ...data,
          groceries: data?.groceries || prev?.groceries || [],
          fuelFriends: data?.fuelFriends || prev?.fuelFriends || []
        }));
      } catch (err: any) {
        console.error('Error fetching station details:', err);
        setError(err.message);

        // Only use fallback if no station data was passed from HomeScreen
        if (!location.state?.station) {
          console.warn('No station data from HomeScreen, using fallback data');

          // Realistic US station names
          const usStations = [
            { name: 'Shell Gas Station', tag: '24/7', description: 'Convenient Shell location offering premium gasoline, diesel, and quick service. Located at 1234 Highway 1, Nashville, TN 37201. Features clean restrooms, ATM, and car wash facilities.' },
            { name: 'BP Connect', tag: 'BP', description: 'BP Connect station with premium fuels and convenience store. Address: 5678 Interstate Drive, Atlanta, GA 30301. Open 24/7 with coffee bar and fresh food options.' },
            { name: 'Exxon Select', tag: 'EXXON', description: 'Exxon Select fuel station featuring Synergy Supreme+ gasoline. Located at 9012 Petroleum Blvd, Dallas, TX 75201. Offers loyalty rewards and premium car care products.' },
            { name: 'Chevron Extra Mile', tag: 'CHEVRON', description: 'Chevron Extra Mile station with Techron fuel additive. Address: 3456 Energy Lane, Phoenix, AZ 85001. Features diesel exhaust fluid and fleet services.' },
            { name: '7-Eleven Fuel', tag: '7/11', description: '7-Eleven Fuel Center offering Slurpee drinks and fresh food. Located at 789 Convenience Ave, Miami, FL 33101. Open 24 hours with EV charging stations.' },
            { name: 'Wawa Fuel', tag: 'WAWA', description: 'Wawa Fuel location famous for fresh coffee and hoagies. Address: 1123 Travel Plaza, Philadelphia, PA 19101. Features Wawa App pay and premium fuel options.' }
          ];

          // Realistic UK station names
          const ukStations = [
            { name: 'Tesco Fuel Station', tag: 'TESCO', description: 'Tesco petrol station offering supermarket fuel with Clubcard points. Located at 456 High Street, London SW1A 1AA. Features Tesco Express shop and car wash facilities.' },
            { name: 'Shell Service Station', tag: 'SHELL', description: 'Shell service station with V-Power fuels and convenience store. Address: 789 Oxford Street, London W1D 1BS. Open 24/7 with coffee shop and ATMs.' },
            { name: 'BP Garage', tag: 'BP', description: 'BP garage featuring Ultimate fuels and Wild Bean Café. Located at 123 Regent Street, London W1B 4HY. Offers loyalty cards and premium car care services.' },
            { name: 'Esso Express', tag: 'ESSO', description: 'Esso Express station with Synergy Supreme+ fuels. Address: 567 Kings Road, London SW3 4UT. Features forecourt shop and professional car cleaning services.' },
            { name: 'Sainsburys Local Fuel', tag: 'SAINSBURYS', description: 'Sainsburys Local fuel station with Nectar points. Located at 890 High Holborn, London WC1V 7RA. Open late with fresh food and grocery essentials.' },
            { name: 'Morrisons Daily', tag: 'MORRISONS', description: 'Morrisons Daily petrol station with quality fuels and fresh food. Address: 234 Tottenham Court Road, London W1T 2BF. Features Morrisons café and loyalty rewards.' }
          ];

          // Determine if this should be UK or US station based on ID or random
          const isUK = Math.random() > 0.5; // Random for demo purposes
          const stationPool = isUK ? ukStations : usStations;

          const stationIndex = parseInt(id?.replace(/\D/g, '') || '0') % stationPool.length;
          const stationType = stationPool[stationIndex];

          // Fallback groceries data - diverse and interesting variety
          const fallbackGroceries = [
            // Beverages - International variety
            {
              id: 'grocery-1',
              name: 'Premium Coffee Beans',
              price: 12.99,
              description: 'Ethiopian single-origin coffee beans',
              category: 'beverages',
              icon: '☕',
              imageUrl: '/coffee-beans.jpg'
            },
            {
              id: 'grocery-2',
              name: 'Craft Beer Selection',
              price: 8.99,
              description: 'Local craft brewery variety pack',
              category: 'beverages',
              icon: '🍺',
              imageUrl: '/craft-beer.jpg'
            },
            {
              id: 'grocery-3',
              name: 'Sparkling Water',
              price: 2.49,
              description: 'Natural mineral sparkling water',
              category: 'beverages',
              icon: '🥤',
              imageUrl: '/sparkling-water.jpg'
            },
            {
              id: 'grocery-4',
              name: 'Fresh Coconut Water',
              price: 3.99,
              description: '100% pure coconut water',
              category: 'beverages',
              icon: '🥥',
              imageUrl: '/coconut-water.jpg'
            },

            // Snacks - Premium and international
            {
              id: 'grocery-5',
              name: 'Gourmet Truffle Chips',
              price: 6.99,
              description: 'Artisan truffle-flavored potato chips',
              category: 'snacks',
              icon: '🍟',
              imageUrl: '/truffle-chips.jpg'
            },
            {
              id: 'grocery-6',
              name: 'International Chocolate Box',
              price: 14.99,
              description: 'Assorted premium chocolates from around the world',
              category: 'snacks',
              icon: '🍫',
              imageUrl: '/chocolate-box.jpg'
            },
            {
              id: 'grocery-7',
              name: 'Korean Kimchi Snacks',
              price: 4.49,
              description: 'Authentic Korean spicy kimchi-flavored crisps',
              category: 'snacks',
              icon: '🌶️',
              imageUrl: '/kimchi-snacks.jpg'
            },
            {
              id: 'grocery-8',
              name: 'Japanese Seaweed Snacks',
              price: 3.99,
              description: 'Roasted nori seaweed sheets',
              category: 'snacks',
              icon: '🍣',
              imageUrl: '/seaweed-snacks.jpg'
            },

            // Fresh Food - Quality items
            {
              id: 'grocery-9',
              name: 'Artisan Sourdough Bread',
              price: 5.99,
              description: 'Freshly baked sourdough loaf',
              category: 'fresh-food',
              icon: '🍞',
              imageUrl: '/sourdough-bread.jpg'
            },
            {
              id: 'grocery-10',
              name: 'Gourmet Cheese Board',
              price: 18.99,
              description: 'Selection of aged cheeses with crackers',
              category: 'fresh-food',
              icon: '🧀',
              imageUrl: '/cheese-board.jpg'
            },
            {
              id: 'grocery-11',
              name: 'Fresh Avocados',
              price: 2.49,
              description: 'Ripe Hass avocados, pack of 3',
              category: 'fresh-food',
              icon: '🥑',
              imageUrl: '/avocados.jpg'
            },
            {
              id: 'grocery-12',
              name: 'Organic Mixed Berries',
              price: 7.99,
              description: 'Seasonal organic berry mix',
              category: 'fresh-food',
              icon: '🫐',
              imageUrl: '/mixed-berries.jpg'
            },

            // Prepared Foods - Gourmet options
            {
              id: 'grocery-13',
              name: 'Gourmet Sushi Box',
              price: 15.99,
              description: 'Chef-prepared sushi assortment',
              category: 'prepared-food',
              icon: '🍱',
              imageUrl: '/sushi-box.jpg'
            },
            {
              id: 'grocery-14',
              name: 'Gourmet Sandwich Collection',
              price: 9.99,
              description: 'Artisan sandwiches with premium ingredients',
              category: 'prepared-food',
              icon: '🥪',
              imageUrl: '/sandwich-collection.jpg'
            },
            {
              id: 'grocery-15',
              name: 'Fresh Soup of the Day',
              price: 6.49,
              description: 'Chef\'s daily soup selection',
              category: 'prepared-food',
              icon: '🍲',
              imageUrl: '/soup-of-day.jpg'
            },

            // Health & Wellness
            {
              id: 'grocery-16',
              name: 'Protein Shake Mix',
              price: 11.99,
              description: 'Premium whey protein powder',
              category: 'health',
              icon: '💪',
              imageUrl: '/protein-shake.jpg'
            },
            {
              id: 'grocery-17',
              name: 'Organic Energy Bars',
              price: 2.99,
              description: 'All-natural energy bars, pack of 5',
              category: 'health',
              icon: '🔋',
              imageUrl: '/energy-bars.jpg'
            },
            {
              id: 'grocery-18',
              name: 'Cold-Pressed Juice',
              price: 5.99,
              description: 'Fresh vegetable and fruit juice blend',
              category: 'health',
              icon: '🧃',
              imageUrl: '/cold-pressed-juice.jpg'
            },

            // International Specialties
            {
              id: 'grocery-19',
              name: 'Italian Pasta Selection',
              price: 4.99,
              description: 'Authentic Italian pasta varieties',
              category: 'international',
              icon: '🍝',
              imageUrl: '/italian-pasta.jpg'
            },
            {
              id: 'grocery-20',
              name: 'Middle Eastern Spice Set',
              price: 8.99,
              description: 'Premium spice collection for cooking',
              category: 'international',
              icon: '🧂',
              imageUrl: '/spice-set.jpg'
            },
            {
              id: 'grocery-21',
              name: 'Mexican Street Corn Kit',
              price: 7.49,
              description: 'Authentic Mexican street corn seasoning kit',
              category: 'international',
              icon: '🌽',
              imageUrl: '/mexican-corn-kit.jpg'
            },
            {
              id: 'grocery-22',
              name: 'French Macarons',
              price: 12.99,
              description: 'Delicate French almond meringue cookies',
              category: 'international',
              icon: '🍪',
              imageUrl: '/french-macarons.jpg'
            },

            // Premium Items
            {
              id: 'grocery-23',
              name: 'Wagyu Beef Sliders',
              price: 24.99,
              description: 'Premium Japanese Wagyu beef mini burgers',
              category: 'premium',
              icon: '🍔',
              imageUrl: '/wagyu-sliders.jpg'
            },
            {
              id: 'grocery-24',
              name: 'Caviar Tin',
              price: 45.99,
              description: 'Premium Russian sturgeon caviar',
              category: 'premium',
              icon: '🦪',
              imageUrl: '/caviar-tin.jpg'
            },
            {
              id: 'grocery-25',
              name: 'Champagne Bottle',
              price: 29.99,
              description: 'Premium French champagne',
              category: 'premium',
              icon: '🍾',
              imageUrl: '/champagne-bottle.jpg'
            }
          ];

          // Fallback fuel friends data - UK and US specific
          const fallbackFuelFriendsUK = [
            {
              id: 'friend-uk-1',
              name: 'James Mitchell',
              rating: 4.8,
              reviewCount: 156,
              avatarUrl: '/fuel-friend-avatar.svg',
              location: '0.5 miles away',
              rate: 4.99,
              phone: '+447712345678'
            },
            {
              id: 'friend-uk-2',
              name: 'Emma Thompson',
              rating: 4.9,
              reviewCount: 203,
              avatarUrl: '/fuel-friend-avatar.svg',
              location: '0.3 miles away',
              rate: 5.49,
              phone: '+447712345679'
            }
          ];

          const fallbackFuelFriendsUS = [
            {
              id: 'friend-us-1',
              name: 'David Johnson',
              rating: 4.8,
              reviewCount: 156,
              avatarUrl: '/fuel-friend-avatar.svg',
              location: '0.5 miles away',
              rate: 5.99,
              phone: '+12125551234'
            },
            {
              id: 'friend-us-2',
              name: 'Jennifer Smith',
              rating: 4.9,
              reviewCount: 203,
              avatarUrl: '/fuel-friend-avatar.svg',
              location: '0.3 miles away',
              rate: 6.99,
              phone: '+12125551235'
            }
          ];

          // Check if station is in UK or US
          const isUKStation = station?.address?.toLowerCase().includes('uk') ||
            station?.address?.toLowerCase().includes('london') ||
            (station?.lat && station.lat > 49 && station.lat < 60 && station?.lon && station.lon > -10 && station.lon < 2);

          const fallbackFuelFriends = isUKStation ? fallbackFuelFriendsUK : fallbackFuelFriendsUS;

          setStation({
            id: id,
            name: stationType.name,
            address: isUK ? '123 High Street, London SW1A 1AA' : '1234 Highway 1, Nashville, TN 37201',
            distance: '2.7 miles away',
            deliveryTime: '30 minutes',
            rating: 4.7,
            reviews: 146,
            image: '/brand1.png',
            description: stationType.description,
            fuelPrices: {
              regular: 1.23,
              premium: 1.75,
              diesel: 2.14
            },
            groceries: fallbackGroceries,
            fuelFriends: fallbackFuelFriends
          });
        } else if (location.state?.station) {
          // Ensure station from HomeScreen has groceries and fuel friends
          const stationFromHome = location.state.station;
          if (!stationFromHome.groceries || stationFromHome.groceries.length === 0) {
            // Diverse grocery selection based on station type (like real AWS API data)
            const isUKStation = stationFromHome?.address?.toLowerCase().includes('uk') ||
              stationFromHome?.address?.toLowerCase().includes('london');
            
            // Different grocery assortments for different stations (realistic variety)
            const groceryAssortments = [
              // Convenience Store Assortment
              [
                { id: `groc-${Date.now()}-1`, name: 'Bottled Water', price: isUKStation ? 1.20 : 2.50, description: 'Pure drinking water 500ml' },
                { id: `groc-${Date.now()}-2`, name: 'Energy Drink', price: isUKStation ? 2.50 : 3.99, description: 'Red Bull or Monster' },
                { id: `groc-${Date.now()}-3`, name: 'Potato Chips', price: isUKStation ? 1.80 : 4.99, description: 'Walkers/Lays crisps' },
                { id: `groc-${Date.now()}-4`, name: 'Coffee', price: isUKStation ? 3.20 : 5.99, description: 'Barista hot coffee' },
                { id: `groc-${Date.now()}-5`, name: 'Fresh Sandwich', price: isUKStation ? 4.50 : 7.99, description: 'Made fresh daily' },
                { id: `groc-${Date.now()}-6`, name: 'Chocolate Bar', price: isUKStation ? 1.20 : 2.99, description: 'Cadbury/Snickers' }
              ],
              // Grocery Store Assortment
              [
                { id: `groc-${Date.now()}-7`, name: 'Fresh Milk', price: isUKStation ? 1.10 : 4.25, description: 'Whole milk 1 gallon/4 pint' },
                { id: `groc-${Date.now()}-8`, name: 'Bread Loaf', price: isUKStation ? 1.20 : 3.49, description: 'Fresh baked white/brown' },
                { id: `groc-${Date.now()}-9`, name: 'Fresh Eggs', price: isUKStation ? 2.80 : 5.99, description: 'Free range 12-pack' },
                { id: `groc-${Date.now()}-10`, name: 'Bananas', price: isUKStation ? 0.90 : 1.29, description: 'Fresh organic per lb' },
                { id: `groc-${Date.now()}-11`, name: 'Orange Juice', price: isUKStation ? 2.50 : 4.99, description: 'Tropicana 52oz' },
                { id: `groc-${Date.now()}-12`, name: 'Cereal Box', price: isUKStation ? 3.50 : 5.49, description: 'Kellogg\'s variety' }
              ],
              // Snack & Drinks Assortment
              [
                { id: `groc-${Date.now()}-13`, name: 'Soft Drink', price: isUKStation ? 1.50 : 2.99, description: 'Coke/Pepsi 500ml' },
                { id: `groc-${Date.now()}-14`, name: 'Protein Bar', price: isUKStation ? 1.80 : 3.49, description: 'Quest/Grenade' },
                { id: `groc-${Date.now()}-15`, name: 'Nuts Mix', price: isUKStation ? 2.20 : 4.99, description: 'Planters mixed nuts' },
                { id: `groc-${Date.now()}-16`, name: 'Ice Cream', price: isUKStation ? 3.50 : 6.99, description: 'Magnum/Ben & Jerry\'s' },
                { id: `groc-${Date.now()}-17`, name: 'Cookies Pack', price: isUKStation ? 2.80 : 4.49, description: 'Oreo/Chips Ahoy' }
              ]
            ];
            
            // Select assortment based on station hash (consistent per station)
            const assortmentIndex = stationFromHome.id.charCodeAt(0) % groceryAssortments.length;
            stationFromHome.groceries = groceryAssortments[assortmentIndex];
          }

          if (!stationFromHome.fuelFriends || stationFromHome.fuelFriends.length === 0) {
            // Check if station is in UK or US
            const isUKStation = stationFromHome?.address?.toLowerCase().includes('uk') ||
              stationFromHome?.address?.toLowerCase().includes('london') ||
              (stationFromHome?.lat && stationFromHome.lat > 49 && stationFromHome.lat < 60 && stationFromHome?.lon && stationFromHome.lon > -10 && stationFromHome.lon < 2);

            // Diverse Fuel Friend names (like real AWS API - different per station)
            const ukFuelFriends = [
              { name: 'James Mitchell', phone: '+447712345678' },
              { name: 'Emma Thompson', phone: '+447712345679' },
              { name: 'Oliver Harris', phone: '+447712345680' },
              { name: 'Sophie Anderson', phone: '+447712345681' },
              { name: 'George Wilson', phone: '+447712345682' },
              { name: 'Charlotte Brown', phone: '+447712345683' },
              { name: 'Harry Taylor', phone: '+447712345684' },
              { name: 'Amelia Davies', phone: '+447712345685' }
            ];
            
            const usFuelFriends = [
              { name: 'Michael Rodriguez', phone: '+12125551234' },
              { name: 'Jessica Martinez', phone: '+12125551235' },
              { name: 'Christopher Lee', phone: '+12125551236' },
              { name: 'Amanda Garcia', phone: '+12125551237' },
              { name: 'Daniel Thompson', phone: '+12125551238' },
              { name: 'Ashley White', phone: '+12125551239' },
              { name: 'Matthew Harris', phone: '+12125551240' },
              { name: 'Sarah Clark', phone: '+12125551241' },
              { name: 'Andrew Lewis', phone: '+12125551242' },
              { name: 'Emily Walker', phone: '+12125551243' }
            ];

            // Select different friends for different stations (deterministic based on station ID)
            const allFriends = isUKStation ? ukFuelFriends : usFuelFriends;
            const startIndex = stationFromHome.id.charCodeAt(0) % (allFriends.length - 1);
            const selectedFriends = allFriends.slice(startIndex, startIndex + 2);
            
            stationFromHome.fuelFriends = selectedFriends.map((friend, idx) => ({
              id: `friend-${stationFromHome.id}-${idx}`,
              name: friend.name,
              rating: (4.7 + Math.random() * 0.3).toFixed(1),
              reviewCount: Math.floor(100 + Math.random() * 200),
              avatarUrl: '/fuel-friend-avatar.svg',
              location: `${(0.2 + Math.random() * 0.8).toFixed(1)} miles away`,
              rate: (isUKStation ? 4.99 : 5.99) + (idx * 0.5),
              phone: friend.phone,
              vehicle: ['Toyota Camry', 'Honda Civic', 'Ford Focus', 'Nissan Altima'][Math.floor(Math.random() * 4)],
              eta: Math.floor(15 + Math.random() * 20)
            }));
          }

          setStation(stationFromHome);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStationDetails();
  }, [id, location.state]);

  const updateCartQuantity = (itemId: string, change: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId);

      if (existingItem) {
        if (existingItem.quantity + change <= 0) {
          return prevCart.filter(item => item.id !== itemId);
        }
        return prevCart.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + change }
            : item
        );
      } else if (change > 0) {
        const grocery = groceries.find(g => g.id === itemId);
        if (grocery) {
          return [...prevCart, {
            id: itemId,
            name: grocery.name,
            price: grocery.price,
            quantity: 1
          }];
        }
      }

      return prevCart;
    });
  };

  const getItemQuantity = (itemId: string) => {
    const item = cart.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const toNumber = (value: any) => {
    const num = Number(value);
    return Number.isFinite(num) && num > 0 ? num : null;
  };

  const isUKStation =
    (station?.address || '').toLowerCase().includes('uk') ||
    (station?.address || '').toLowerCase().includes('london');

  const regularPrice =
    toNumber((station as any)?.fuelPrices?.regular) ??
    toNumber((station as any)?.regularPrice) ??
    toNumber((station as any)?.regular) ??
    (isUKStation ? 1.45 : 3.29);

  const premiumPrice =
    toNumber((station as any)?.fuelPrices?.premium) ??
    toNumber((station as any)?.premiumPrice) ??
    toNumber((station as any)?.premium) ??
    (isUKStation ? 1.72 : 3.79);

  const dieselPrice =
    toNumber((station as any)?.fuelPrices?.diesel) ??
    toNumber((station as any)?.dieselPrice) ??
    toNumber((station as any)?.diesel) ??
    (isUKStation ? 1.59 : 3.59);

  const currencySymbol = isUKStation ? '£' : '$';

  const assignedFuelFriendName =
    (selectedFuelFriend as any)?.name ||
    (selectedFuelFriend as any)?.fullName ||
    'Fuel Friend';
  const assignedFuelFriendRate =
    toNumber((selectedFuelFriend as any)?.rate) ??
    toNumber((selectedFuelFriend as any)?.price) ??
    (isUKStation ? 5.49 : 6.99);
  const assignedFuelFriendRating =
    toNumber((selectedFuelFriend as any)?.rating) ?? 4.8;

  if (isLoading) {
    return (
      <AnimatedPage>
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-8 h-8 border-4 border-[#3AC36C] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AnimatedPage>
    );
  }

  if (error && !station) {
    return (
      <AnimatedPage>
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-red-500">{error}</p>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="bg-white min-h-screen pb-24">
        {/* Sticky Header Bar - same as Checkout */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white sticky top-0 z-20">
          <TapEffectButton
            onClick={() => navigate(-1)}
            className="p-2 -ml-2"
          >
            <img
              src="/Back.png"
              alt="Back"
              className="w-5 h-5"
              onError={(e) => {
                // fallback arrow if image missing
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) parent.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>';
              }}
            />
          </TapEffectButton>
          <h1 className="text-lg font-semibold text-gray-900">Station Details</h1>
          <div className="w-9" />
        </div>

        {/* Banner Image */}
        <div className="relative">
          <div className="h-44 bg-gradient-to-r from-orange-400 to-pink-400 relative overflow-hidden">
            <img
              src="/image-card-1.png"
              alt="Station"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Station Logo */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="w-20 h-20 bg-white rounded-full p-2.5 shadow-lg">
              <img
                src={getStationLogo(station?.name)}
                alt={station?.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = 'https://logos-world.net/wp-content/uploads/2020/04/Shell-Logo.png';
                }}
              />
            </div>
          </div>
        </div>

        {/* Station Info */}
        <div className="px-4 pt-12 pb-5 text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">{station?.name}</h1>
          <div className="flex items-center justify-center text-gray-600 mb-3">
            <img src="/pinpoint.png" alt="Location" className="w-4 h-4 mr-1" />
            <span className="text-sm">{station?.address}</span>
          </div>

          {/* About Section */}
          {station?.description && (
            <div className="mt-6 text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {station.description}
              </p>
            </div>
          )}
        </div>

        {/* Fuel Prices */}
        <div className="mx-4 mb-5">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Fuel Prices</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-700">Regular</span>
                <span className="font-semibold">{currencySymbol}{regularPrice.toFixed(2)} per liter</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-700">Premium</span>
                <span className="font-semibold">{currencySymbol}{premiumPrice.toFixed(2)} per liter</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-700">Diesel</span>
                <span className="font-semibold">{currencySymbol}{dieselPrice.toFixed(2)} per liter</span>
              </div>
            </div>
          </div>
        </div>

        {/* Station Stats */}
        <div className="px-4 mb-6 space-y-2.5">
          <div className="flex items-center text-gray-600">
            <img src="/pinpoint.png" alt="Location" className="w-4 h-4 mr-2" />
            <span className="text-sm">Distance: {station?.distance || '2.7 miles away'}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm">Average Delivery time: {station?.deliveryTime || '30 mins'}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-600">
              <Star className="w-4 h-4 mr-2 text-yellow-500 fill-current" />
              <span className="text-sm">{station?.rating} Rating </span>
              <span className="text-sm text-green-600">({(station as any)?.reviewCount} reviews)</span>
            </div>
            <button
              onClick={() => navigate(`/station/${id}/reviews`)}
              className="text-green-600 text-sm font-medium hover:underline"
            >
              See all reviews
            </button>
          </div>
        </div>

        {/* Groceries */}
        <div className="px-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Snacks Menu (10)</h2>
          </div>
          {isLoading ? (
            /* Groceries Skeleton */
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-4 border-[#3AC36C] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : groceries.length > 0 ? (
            <div className="space-y-3">
              {groceries.map((item) => {
                const quantity = getItemQuantity(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSnackClick(item.id)}
                    className={`snack-card-${item.id} flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-200 shadow-sm cursor-pointer transition-transform`}
                  >
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f355.png';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 leading-tight">{item.name}</h3>
                      <p className="text-sm text-gray-800 font-medium">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCartQuantity(item.id, -1);
                          }}
                          disabled={quantity === 0}
                          className="w-8 h-8 bg-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCartQuantity(item.id, 1);
                          }}
                          className="w-8 h-8 bg-white flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCartQuantity(item.id, 1);
                        }}
                        className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold min-w-[64px]"
                      >
                        Add
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromCart(item.id);
                        }}
                        disabled={quantity === 0}
                        className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No groceries available at this station</p>
            </div>
          )}
        </div>

        {/* Fuel Friends */}
        <div className="px-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Fuel friend (Auto Assigned)</h2>
          </div>

          {selectedFuelFriend ? (
            /* Selected Fuel Friend Display */
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={selectedFuelFriend.avatarUrl || '/fuel-friend-avatar.svg'}
                      alt={selectedFuelFriend.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/fuel-friend-avatar.svg';
                      }}
                    />
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{assignedFuelFriendName}</h3>
                    <p className="text-sm text-gray-600">{currencySymbol}{assignedFuelFriendRate.toFixed(2)}</p>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-gray-600">{assignedFuelFriendRating.toFixed(1)}</span>
                      <Check className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-gray-600 font-medium">Assigned</span>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-700 font-semibold bg-gray-100 px-2 py-1 rounded-full">Assigned</span>
              </div>
            </div>
          ) : isLoading || isAutoAssigningFuelFriend ? (
            /* Fuel Friends Skeleton */
            <div className="flex flex-col justify-center items-center py-8 gap-3">
              <div className="w-9 h-9 border-4 border-[#3AC36C] border-t-transparent rounded-full animate-spin"></div>
              <div className="flex items-center gap-1 text-sm text-gray-600 font-medium">
                <span>Sweet loading</span>
                <span className="fuel-friend-loading-dot">.</span>
                <span className="fuel-friend-loading-dot">.</span>
                <span className="fuel-friend-loading-dot">.</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-gray-500">
              Menyiapkan auto assignment fuel friend...
            </div>
          )}
        </div>

        {/* Order Now Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <button
            onClick={() => {
              console.log('StationDetails - Order Now clicked');
              console.log('StationDetails - station:', station);
              console.log('StationDetails - cart:', cart);
              console.log('StationDetails - selectedFuelFriend:', selectedFuelFriend);

              // Defensive navigation with fallback data
              const navigationState = {
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
                cartItems: cart || [],
                selectedFuelFriend: selectedFuelFriend || null,
                totalItems: (cart?.length || 0) + (selectedFuelFriend ? 1 : 0)
              };

              console.log('StationDetails - navigation state:', navigationState);

              try {
                navigate('/checkout', {
                  state: navigationState
                });
              } catch (error) {
                console.error('Navigation error:', error);
                // Fallback navigation
                navigate('/checkout');
              }
            }}
            // Allow navigation even with empty cart/fuel friend for better UX
            // disabled={cart.length === 0 && !selectedFuelFriend}
            className="w-full bg-green-500 text-white py-4 rounded-full text-lg font-semibold hover:bg-green-600 transition-colors"
          >
            {`Order Now${cart.length > 0 || selectedFuelFriend ? ` (${cart.length + (selectedFuelFriend ? 1 : 0)} items)` : ''}`}
          </button>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default StationDetailsScreen;
