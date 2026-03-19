import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Star, Fuel, Mic, Plus, ShoppingBag } from 'lucide-react';
import anime from 'animejs';
import { createPortal } from 'react-dom';
import { Station } from '../types';
import { apiGetStations, apiGetMe, apiSearchFuelStations } from '../services/api';
import { useAppContext } from '../context/AppContext';
import MapboxMap from '../components/MapboxMap';
import AnimatedPage from '../components/AnimatedPage';
import Button from '../components/Button';
import TouchFeedback from '../components/TouchFeedback';
import TapEffectButton from '../components/TapEffectButton';

// Station Card Component
const StationCard = ({ station, index }: { station: any; index: number }) => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const imageUrl = index % 2 === 0 ? '/image-card-1.png' : '/image-card-2.png';

  const handleSelectStation = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      sessionStorage.setItem('stationSharedTransition', JSON.stringify({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        image: station.imageUrl || station.image || imageUrl
      }));
      anime({
        targets: cardRef.current,
        scale: [1, 0.97, 1],
        duration: 240,
        esaltedg: 'easeInOutQuad'
      });
    }
    navigate(`/station/${station.id}`, { state: { station } });
  };

  return (
    <div ref={cardRef} className="station-list-item bg-white rounded-3xl shadow-[0_10px_35px_rgba(16,24,40,0.08)] border border-gray-100 p-3 flex items-stretch gap-3">
      <div className="w-[94px] h-[124px] rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={station.imageUrl || station.image || imageUrl}
          alt={station.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = imageUrl;
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-[#3F4249] truncate mb-2">{station.name}</h3>
        <div className="space-y-2">
          <div className="flex juicetify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <Fuel size={16} className="text-[#3AC36C]" />
              <span className="text-[#3F4249]">fuel Price</span>
            </div>
            <span className="font-semibold text-[#3F4249]">
              ${station.fuelPrices?.regular || station.fuelPrices?.premium || station.fuelPrices?.diesel || 'N/A'}
            </span>
          </div>
          <div className="flex juicetify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#FF5630]" />
              <span className="text-[#3F4249]">Distance</span>
            </div>
            <span className="text-[#3F4249]">{station.distance || '2.7 miles'}</span>
          </div>
          <div className="flex juicetify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-[#FFC107] fill-current" />
              <span className="text-[#3F4249]">Reviews</span>
            </div>
            <span className="text-[#3F4249] font-medium">
              {station.rating || '4.6'} <span className="text-[#3AC36C]">({station.reviewCount || station.totalReviews || 24} Reviews)</span>
            </span>
          </div>
        </div>
        <TouchFeedback onPress={handleSelectStation} className="mt-3 block">
          <button className="w-full h-10 rounded-full bg-[#3AC36C] text-white font-semibold">
            Select Station
          </button>
        </TouchFeedback>
      </div>
    </div>
  );
};

const HomeScreen = () => {
  const { user, logout } = useAppContext();
  const [stations, setStations] = useState<Omit<Station, 'groceries' | 'fuelFriends'>[]>([]);
  const [allStations, setAllStations] = useState<Omit<Station, 'groceries' | 'fuelFriends'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    fuelType: '',
    priceRange: '',
    distance: '',
    rating: ''
  });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<'UK' | 'US' | null>(null);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greetingMessage, setGreetingMessage] = useState('');

  // Search Suggestions State
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();

  // Animate on mount
  useEffect(() => {
    // Animate header with bounce
    anime({
      targets: '.home-header',
      translateY: [-50, 0],
      opacity: [0, 1],
      duration: 800,
      esaltedg: 'easeOutElastic(1, .8)'
    });

    // Animate search bar with scale and glow
    anime({
      targets: '.search-container',
      scale: [0.8, 1.05, 1],
      opacity: [0, 1],
      duration: 700,
      delay: 200,
      esaltedg: 'easeOutElastic(1, .7)'
    });

    anime({
      targets: '.search-container',
      boxShadow: [
        '0 0 0 0 rgba(58, 195, 108, 0)',
        '0 0 30px 10px rgba(58, 195, 108, 0.3)',
        '0 4px 20px rgba(0, 0, 0, 0.1)'
      ],
      duration: 1000,
      delay: 300,
      esaltedg: 'easeOutQuad'
    });

  }, []);

  useEffect(() => {
    if (!stations.length) return;
    anime({
      targets: '.station-list-item',
      opacity: [0, 1],
      translateY: [24, 0],
      esaltedg: 'easeOutCubic',
      duration: 420,
      delay: anime.stagger(45, { start: 80 })
    });
  }, [stations]);

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // await apiGetMe(); // Skip backend validation for mock login
        console.log('🔍 MOCK token validation success');
      } catch (error) {
        console.error('Token validation failed:', error);
        logout();
        navigate('/login');
      }
    };

    validateToken();
  }, [navigate, logout]);

  // Helper function to determine if location is in UK
  const isLocationInUK = (location: { lat: number, lon: number } | null) => {
    if (!location) return false;
    return location.lat > 49 && location.lat < 60 && location.lon > -10 && location.lon < 2;
  };

  // Function to handle location change - can be called from anywhere
  const setLocationAndRefresh = (location: 'UK' | 'US') => {
    setSelectedLocation(location);
    localStorage.setItem('userLocationPreference', location);

    // Set default coordinates
    if (location === 'UK') {
      setUserLocation({ lat: 51.5074, lon: -0.1278 }); // London
    } else {
      setUserLocation({ lat: 40.7128, lon: -74.0060 }); // New York
    }

    // Show greeting notification
    const greeting = getGreetingMessage(location);
    setGreetingMessage(greeting);
    setShowGreeting(true);

    // Hide greeting after 3 seconds
    setTimeout(() => {
      setShowGreeting(false);
    }, 3000);
  };

  // Helper function to get greeting based on time
  const getGreetingMessage = (location: 'UK' | 'US') => {
    // Get current time in the selected location
    const now = new Date();
    const timezone = location === 'UK' ? 'Europe/London' : 'America/New_York';
    const timeInLocation = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false
    }).format(now);

    const hour = parseInt(timeInLocation);

    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else if (hour >= 17 && hour < 21) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  };

  // Show location selection modal every time home screen loads
  useEffect(() => {
    const hasSelectedLocation = localStorage.getItem('userLocationPreference');

    // Always show the modal, but pre-select if location exists
    setShowLocationModal(true);

    if (hasSelectedLocation) {
      setSelectedLocation(hasSelectedLocation as 'UK' | 'US');
      // Set default location based on preference
      if (hasSelectedLocation === 'UK') {
        setUserLocation({ lat: 51.5074, lon: -0.1278 }); // London
      } else {
        setUserLocation({ lat: 40.7128, lon: -74.0060 }); // New York
      }
    }
  }, []);

  // Handle location selection
  const handleLocationSelect = (location: 'UK' | 'US') => {
    setLocationAndRefresh(location);
  };

  // Handle modal continue button
  const handleModalContinue = () => {
    if (selectedLocation) {
      // Show greeting notification
      const greeting = getGreetingMessage(selectedLocation);
      setGreetingMessage(greeting);
      setShowGreeting(true);

      // Hide greeting after 3 seconds
      setTimeout(() => {
        setShowGreeting(false);
      }, 3000);

      setShowLocationModal(false);
    }
  };

  // Function to quickly switch to UK location
  const goToUK = () => {
    setLocationAndRefresh('UK');
    setShowLocationModal(false);
  };

  // Function to quickly switch to US location
  const goToUS = () => {
    setLocationAndRefresh('US');
    setShowLocationModal(false);
  };

  // Voice search functionality
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert('Voice search failed. Please try again.');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Filter stations based on search query and filters
  const filterStations = (searchQuery: string, currentFilters = filters) => {
    let filtered = [...allStations];

    // Text search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(station =>
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (station.address && station.address.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Fuel type filter
    if (currentFilters.fuelType) {
      filtered = filtered.filter(station => {
        // Assuming station has fuel types available
        return true; // Placeholder - adjuicet based on your data structure
      });
    }

    // Price range filter
    if (currentFilters.priceRange) {
      filtered = filtered.filter(station => {
        const price = (station as any).regularPrice || 0;
        switch (currentFilters.priceRange) {
          case 'low': return price < 30;
          case 'medium': return price >= 30 && price < 40;
          case 'high': return price >= 40;
          default: return true;
        }
      });
    }

    // Distance filter (assuming you have distance calculation)
    if (currentFilters.distance) {
      filtered = filtered.filter(station => {
        // Placeholder - implement distance calculation
        return true;
      });
    }

    // Rating filter
    if (currentFilters.rating) {
      const minRating = parseFloat(currentFilters.rating);
      filtered = filtered.filter(station =>
        (station.rating || 0) >= minRating
      );
    }

    setStations(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    filterStations(query, newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    const emptyFilters = { fuelType: '', priceRange: '', distance: '', rating: '' };
    setFilters(emptyFilters);
    filterStations(query, emptyFilters);
  };

  // Helper function to get fallback stations
  const getFallbackStations = () => {
    // Default to US locations (New York area)
    const isUK = selectedLocation === 'UK' || isLocationInUK(userLocation);

    const usStations = [
      { name: 'Shell', address: '150 N Dwatery Ashford Rd, Houston, TX 77079' },
      { name: 'Exxon', address: '22777 Springwoods Village Pkwy, Spring, TX 77389' },
      { name: 'Mobil', address: '5959 Las Colinas Blvd, Irving, TX 75039' },
      { name: 'Chevron', address: '6001 Bollinger Canyon Rd, San Ramon, CA 94583' },
      { name: 'BP (US)', address: '501 Westlake Park Blvd, Houston, TX 77079' },
      { name: 'Marathon', address: '539 S Main St, Findlay, OH 45840' },
      { name: 'Texaco', address: '4800 Fournace Pl, Bellwatere, TX 77401' },
      { name: 'Valero', address: '1 Valero Way, San Antonio, TX 78249' },
      { name: 'Phillips 66', address: '2331 CityWest Blvd, Houston, TX 77042' },
      { name: 'Sunoco', address: '3801 West Chester Pike, Newtown Square, PA 19073' },
      { name: '7-Eleven', address: '3200 Hackberry Rd, Irving, TX 75063' },
      { name: 'Circle K', address: '1130 W Warner Rd, Tempe, AZ 85284' },
      { name: 'Costco Gasoline', address: '999 Lake Dr, Issaquah, WA 98027' },
      { name: "Sam's Club", address: '2101 SE Simple Savings Dr, Bentonville, AR 72716' },
      { name: 'QuikTrip', address: '4705 S 129th E Ave, Tulsa, OK 74134' },
      { name: 'Wawa', address: '260 W Baltimore Pike, Media, PA 19063' },
      { name: 'Sheetz', address: '5700 Sixth Ave, Altoona, PA 16602' },
      { name: "Buc-ee's", address: '27700 Katy Fwy, Katy, TX 77494' },
      { name: "Casey's General Store", address: "1 Casey's Blvd, Ankeny, IA 50021" },
      { name: 'Speedway', address: '500 Speedway Dr, Enon, OH 45323' },
      { name: 'Arco', address: '4 Centerpointe Dr, La Palma, CA 90623' },
      { name: 'Sinclwater', address: '550 E South Temple, Salt Lake City, UT 84102' },
      { name: 'Citgo', address: '1293 Eldridge Pkwy, Houston, TX 77077' },
      { name: 'Gulf (US)', address: '80 William St, Wellesley, MA 02481' },
      { name: 'Maverick', address: '185 S State St, Salt Lake City, UT 84111' }
    ];

    const ukStations = [
      { name: 'BP', address: "1 St James's Square, London SW1Y 4PD" },
      { name: 'Shell (UK)', address: 'York Rd, London SE1 7NA' },
      { name: 'Esso', address: 'Ermyn Way, Leatherhead KT22 8UX' },
      { name: 'Texaco (UK)', address: '1 Westferry Circus, London E14 4HA' },
      { name: 'Jet', address: '20-22 Bedford Row, London WC1R 4JS' },
      { name: 'Murco', address: '4 Beaconsfield Rd, St Albans AL1 3RD' },
      { name: 'Gulf (UK)', address: 'Rossmore Industrial Estate, Ellesmere Port CH65 3AS' },
      { name: 'TotalEnergies', address: '10 Upper Bank St, London E14 5BF' },
      { name: 'Harvest Energy', address: '5-7 Alexandra Terrace, Aldershot GU11 3PS' },
      { name: 'Gleaner', address: 'Milnfield, Elgin IV30 1UU' },
      { name: 'Applegreen', address: 'T2, Northwood, Santry, Dublin (HQ)' },
      { name: 'Moto', address: 'Toddington Services, M1 Junction 11/12, LU5 6HR' },
      { name: 'Welcome Break', address: '20-22 Bedford Row, London WC1R 4JS' },
      { name: 'Roadchef', address: 'Norton Canes Services, M6 Toll, WS11 9UX' },
      { name: 'MFG', address: '10-1200 Park Ave, London NW1 7AY' },
      { name: 'EG Group', address: 'Euro House, Haslingden Rd, Blackburn BB1 2EE' },
      { name: 'Tesco Petrol', address: 'Shire Park, Kestrel Way, Welwyn Garden City AL7 1GA' },
      { name: "Sainsbury's Fuel", address: '33 Holborn, London EC1N 2HT' },
      { name: 'Asda Petrol', address: 'Asda House, Southbank, Great Wilson St, Leeds LS11 5AD' },
      { name: 'Morrisons Fuel', address: 'Hilmore House, Gain Lane, Bradford BD3 7DL' },
      { name: 'Costco Fuel UK', address: 'Hartspring Ln, Watford WD25 8JS' },
      { name: 'Pace', address: '1 High St, Crowthorne RG45 7AD' },
      { name: 'Rix', address: 'Witham House, Spyvee St, Hull HU8 7JR' },
      { name: 'Essar', address: 'Stanlow Manufacturing Complex, Ellesmere Port CH65 4HB' },
      { name: 'Maxol', address: '3-5 Custom House Plaza, IFSC, Dublin (Regional HQ)' }
    ];

    // Fallback groceries data - UK and US specific
    const fallbackGroceriesUK = [
      {
        id: 'grocery-uk-1',
        name: 'Bottled Water',
        price: 1.20,
        description: 'Pure mineral water'
      },
      {
        id: 'grocery-uk-2',
        name: 'Energy Drink',
        price: 2.50,
        description: 'Red Bull energy boost'
      },
      {
        id: 'grocery-uk-3',
        name: 'Crisps',
        price: 1.50,
        description: 'Walkers salted crisps'
      },
      {
        id: 'grocery-uk-4',
        name: 'Tea',
        price: 2.00,
        description: 'PG Tips tea bags'
      },
      {
        id: 'grocery-uk-5',
        name: 'Chocolate Bar',
        price: 1.00,
        description: 'Cadbury Dwatery Milk'
      },
      {
        id: 'grocery-uk-6',
        name: 'Sandwich',
        price: 3.50,
        description: 'Prawn mayo sandwich'
      },
      {
        id: 'grocery-uk-7',
        name: 'Soft Drink',
        price: 1.80,
        description: 'Coca Cola 500ml'
      },
      {
        id: 'grocery-uk-8',
        name: 'Biscuits',
        price: 1.20,
        description: 'Digestive biscuits'
      },
      {
        id: 'grocery-uk-9',
        name: 'Juice',
        price: 2.20,
        description: 'Orange juice 1L'
      },
      {
        id: 'grocery-uk-10',
        name: 'Mints',
        price: 0.80,
        description: 'Extra strong mints'
      }
    ];

    const fallbackGroceriesUS = [
      {
        id: 'grocery-us-1',
        name: 'Bottled Water',
        price: 2.50,
        description: 'Pure drinking water'
      },
      {
        id: 'grocery-us-2',
        name: 'Energy Drink',
        price: 3.99,
        description: 'Monster energy boost'
      },
      {
        id: 'grocery-us-3',
        name: 'Potato Chips',
        price: 2.99,
        description: 'Lays classic chips'
      },
      {
        id: 'grocery-us-4',
        name: 'Coffee',
        price: 5.99,
        description: 'Starbucks coffee'
      },
      {
        id: 'grocery-us-5',
        name: 'Sandwich',
        price: 7.99,
        description: 'Turkey club sandwich'
      },
      {
        id: 'grocery-us-6',
        name: 'Chocolate Bar',
        price: 2.99,
        description: 'Hershey chocolate'
      },
      {
        id: 'grocery-us-7',
        name: 'Soda',
        price: 2.49,
        description: 'Coca Cola 2L'
      },
      {
        id: 'grocery-us-8',
        name: 'Donut',
        price: 3.49,
        description: 'Glazed donut'
      },
      {
        id: 'grocery-us-9',
        name: 'Gatorade',
        price: 4.99,
        description: 'Sports drink'
      },
      {
        id: 'grocery-us-10',
        name: 'Protein Bar',
        price: 6.99,
        description: 'High protein bar'
      },
      {
        id: 'grocery-us-11',
        name: 'Ice Cream',
        price: 4.99,
        description: 'Vanilla ice cream'
      },
      {
        id: 'grocery-us-12',
        name: 'Energy Bar',
        price: 3.99,
        description: 'Cliff energy bar'
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
      },
      {
        id: 'friend-uk-3',
        name: 'Michael Davies',
        rating: 4.7,
        reviewCount: 142,
        avatarUrl: '/fuel-friend-avatar.svg',
        location: '0.8 miles away',
        rate: 4.49,
        phone: '+447712345680'
      },
      {
        id: 'friend-uk-4',
        name: 'Sarah Williams',
        rating: 5.0,
        reviewCount: 189,
        avatarUrl: '/fuel-friend-avatar.svg',
        location: '0.6 miles away',
        rate: 6.99,
        phone: '+447712345681'
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
      },
      {
        id: 'friend-us-3',
        name: 'Robert Wilson',
        rating: 4.7,
        reviewCount: 142,
        avatarUrl: '/fuel-friend-avatar.svg',
        location: '0.8 miles away',
        rate: 5.49,
        phone: '+12125551236'
      },
      {
        id: 'friend-us-4',
        name: 'Maria Garcia',
        rating: 5.0,
        reviewCount: 189,
        avatarUrl: '/fuel-friend-avatar.svg',
        location: '0.6 miles away',
        rate: 7.99,
        phone: '+12125551237'
      }
    ];

    const usSnackByStation: Record<string, Array<{ name: string; price: number; description: string }>> = {
      Shell: [
        { name: 'Deli2Go Sandwich', price: 5.49, description: 'Sandwich grab-and-go' },
        { name: 'Protein Bar', price: 2.99, description: 'High protein snack bar' },
        { name: 'Espresso Can', price: 2.59, description: 'Ready-to-drink espresso coffee' }
      ],
      Exxon: [
        { name: 'Trail Mix Cup', price: 3.49, description: 'Mixed nuts and dried fruit' },
        { name: 'Chocolate Cookie', price: 1.99, description: 'Chocolate chip cookies' },
        { name: 'Cold Brew', price: 3.29, description: 'Bold taste cold brew coffee' }
      ],
      Mobil: [
        { name: 'Mocha Frappe', price: 3.69, description: 'Creamy iced mocha coffee' },
        { name: 'Turkey Wrap', price: 6.29, description: 'Ready-to-eat turkey wrap' },
        { name: 'Granola Cup', price: 2.79, description: 'Granola and nuts mix' }
      ],
      Chevron: [
        { name: 'ExtraMile Burrito', price: 5.99, description: 'Hot ExtraMile style burrito' },
        { name: 'Cheddar Crackers', price: 2.49, description: 'Cheese crackers' },
        { name: 'Iced Americano', price: 3.19, description: 'Strong iced americano' }
      ],
      'BP (US)': [
        { name: 'Fresh Bakery Muffin', price: 2.89, description: 'Fresh baked muffin' },
        { name: 'Chicken Panini', price: 6.79, description: 'Grilled chicken panini' },
        { name: 'Sports Drink', price: 2.39, description: 'Cold electrolyte sports drink' }
      ],
      Marathon: [
        { name: 'Breakfast Sandwich', price: 4.99, description: 'Hot egg sandwich' },
        { name: 'Beef Jerky Stick', price: 3.59, description: 'Convenient protein snack' },
        { name: 'Vanilla Latte', price: 3.49, description: 'Ready-to-drink vanilla latte' }
      ],
      Texaco: [
        { name: 'Taco Roller', price: 2.89, description: 'Taco flavored roll snack' },
        { name: 'Chocolate Brownie', price: 2.29, description: 'Soft sweet brownie' },
        { name: 'Lemon Tea', price: 2.19, description: 'Iced lemon tea' }
      ],
      Valero: [
        { name: 'Breakfast Taco', price: 3.99, description: 'Texas style breakfast taco' },
        { name: 'Nacho Chips', price: 2.79, description: 'Spicy tortilla chips' },
        { name: 'Caramel Macchiato', price: 3.79, description: 'Caramel coffee drink' }
      ],
      'Phillips 66': [
        { name: 'Pulled Pork Sandwich', price: 6.99, description: 'Pulled pork sandwich' },
        { name: 'Honey Peanuts', price: 2.49, description: 'Crunchy honey peanuts' },
        { name: 'Cold Cappuccino', price: 3.39, description: 'Bottled iced cappuccino' }
      ],
      Sunoco: [
        { name: 'Cheese Hot Dog', price: 3.79, description: 'Hot dog with cheese topping' },
        { name: 'Soft Pretzel', price: 2.39, description: 'Warm baked pretzel' },
        { name: 'Blueberry Muffin', price: 2.49, description: 'Blueberry muffin' }
      ],
      '7-Eleven': [
        { name: 'Slurpee', price: 2.49, description: 'Frozen drink signature 7-Eleven' },
        { name: 'Big Bite Hot Dog', price: 3.29, description: 'Customer favorite hot dog' },
        { name: 'Taquito', price: 2.19, description: 'Snack savory ready-to-eat' }
      ],
      'Circle K': [
        { name: 'Polar Pop', price: 1.49, description: 'Drink large soda signature Circle K' },
        { name: 'Chicken Roll', price: 3.19, description: 'Roll chicken crispy' },
        { name: 'Choco Donut', price: 1.89, description: 'Donut chocolate' }
      ],
      'Costco Gasoline': [
        { name: 'Hot Dog Combo', price: 1.5, description: 'Combo hot dog iconic Costco' },
        { name: 'Chicken Bake', price: 3.99, description: 'Pastry filled with chicken creamy' },
        { name: 'Churro', price: 1.99, description: 'Churro sweet crispy' }
      ],
      "Sam's Club": [
        { name: 'Pretzel Combo', price: 2.29, description: 'Pretzel with dipping sauce' },
        { name: 'Pizza Slice', price: 2.5, description: 'Slice pizza food court Sam’s' },
        { name: 'ICEE', price: 1.79, description: 'Drink frozen flavored fruit' }
      ],
      QuikTrip: [
        { name: 'QT Pretzel', price: 2.39, description: 'Pretzel soft signature QT' },
        { name: 'Hotzi Sandwich', price: 5.99, description: 'Sandwich hot ready-to-eat' },
        { name: 'Freezoni', price: 2.99, description: 'Frozen beverage signature QT' }
      ],
      Wawa: [
        { name: 'Wawa Hoagie', price: 7.99, description: 'Hoagie signature Wawa' },
        { name: 'Soft Pretzel', price: 2.49, description: 'Pretzel hot savory' },
        { name: 'Wawa Iced Tea', price: 2.29, description: 'Tea cold botol Wawa' }
      ],
      Sheetz: [
        { name: 'MTO Burrito', price: 6.49, description: 'Made-to-order burrito' },
        { name: 'Mozzarella Sticks', price: 4.99, description: 'Sheetz favorite fried snack' },
        { name: 'Fountain Soda', price: 1.99, description: 'Refillable soda drink' }
      ],
      "Buc-ee's": [
        { name: 'Beaver Nuggets', price: 4.99, description: 'Signature sweet corn snack Buc-ee’s' },
        { name: 'BBQ Sandwich', price: 8.99, description: 'Signature BBQ sandwich' },
        { name: 'Jerky Mix', price: 7.49, description: 'Premium beef jerky selection' }
      ],
      "Casey's General Store": [
        { name: 'Casey’s Pizza Slice', price: 3.99, description: 'Signature pizza slice Casey’s' },
        { name: 'Breakfast Burrito', price: 4.59, description: 'Quick breakfast burrito' },
        { name: 'Donut Glazed', price: 1.79, description: 'Donut fresh daily' }
      ],
      Speedway: [
        { name: 'Speedy Melt', price: 5.29, description: 'Sandwich melt ready-to-eat' },
        { name: 'Buffalo Chips', price: 2.69, description: 'Keripik spicy savory' },
        { name: 'Mocha Latte', price: 3.49, description: 'Coffee mocha creamy' }
      ],
      Arco: [
        { name: 'Burrito Supreme', price: 5.59, description: 'Burrito filled with meat dan cheese' },
        { name: 'Onion Rings', price: 3.19, description: 'Onion rings crispy' },
        { name: 'Vanilla Shake', price: 3.69, description: 'Milkshake vanilla cold' }
      ],
      Sinclwater: [
        { name: 'Dino Dog', price: 3.49, description: 'Hot dog signature Sinclwater' },
        { name: 'Ranch Crackers', price: 2.39, description: 'Cracker savory flavored ranch' },
        { name: 'Iced Latte', price: 3.29, description: 'Latte cold creamy' }
      ],
      Citgo: [
        { name: 'Chicken Quesadilla', price: 5.89, description: 'Quesadilla chicken hot' },
        { name: 'BBQ Corn Chips', price: 2.59, description: 'Snack corn BBQ' },
        { name: 'Sparkling Water', price: 1.99, description: 'Water soda tanpa gula' }
      ],
      'Gulf (US)': [
        { name: 'Lobster Roll Snack', price: 6.49, description: 'Sandwich seafood mini style East Coast' },
        { name: 'Sea Salt Pretzel', price: 2.49, description: 'Sea salt pretzel' },
        { name: 'Iced Black Coffee', price: 2.99, description: 'Cold black coffee' }
      ],
      Maverick: [
        { name: 'Adventure Burrito', price: 5.79, description: 'Burrito filled with loaded for roadtrip' },
        { name: 'Trail Mix', price: 3.29, description: 'Snack hiking mix' },
        { name: 'Electrolyte Drink', price: 2.49, description: 'Drink rehidrasi quick' }
      ]
    };

    const ukSnackByStation: Record<string, Array<{ name: string; price: number; description: string }>> = {
      BP: [
        { name: 'Wild Bean Coffee', price: 3.3, description: 'Coffee signature Wild Bean Cafe' },
        { name: 'Bacon Bap', price: 4.1, description: 'Roti filled with bacon hot' },
        { name: 'Shortbread', price: 1.8, description: 'UK style butter biscuit' }
      ],
      'Shell (UK)': [
        { name: 'Costa Latte', price: 3.2, description: 'Coffee Costa on-the-go' },
        { name: 'Sausage Roll', price: 2.4, description: 'UK favorite savory pastry' },
        { name: 'Walkers Crisps', price: 1.6, description: 'Crisps classic UK' }
      ],
      Esso: [
        { name: 'Flat White', price: 3.1, description: 'Flat white creamy' },
        { name: 'Ham & Cheese Croissant', price: 3.9, description: 'Croissant filled with ham cheese' },
        { name: 'Flapjack', price: 1.9, description: 'Snack oat sweet' }
      ],
      'Texaco (UK)': [
        { name: 'Chicken Bake', price: 4.2, description: 'Pastry filled with chicken' },
        { name: 'Cheddar Crisps', price: 1.5, description: 'Crisps cheese' },
        { name: 'Peach Iced Tea', price: 2.2, description: 'Tea peach cold' }
      ],
      Jet: [
        { name: 'Toasted Panini', price: 4.4, description: 'Panini grilled filled with chicken' },
        { name: 'Salt & Vinegar Crisps', price: 1.4, description: 'Crisps flavored classic UK' },
        { name: 'Latte Can', price: 2.5, description: 'Coffee latte canned' }
      ],
      Murco: [
        { name: 'Cornish Pasty', price: 3.8, description: 'Pasty tradfilled withonal Inggris' },
        { name: 'Chocolate Digestive', price: 1.7, description: 'Biskuit chocolate UK' },
        { name: 'Apple Juice', price: 2.1, description: 'Juice apple cold' }
      ],
      'Gulf (UK)': [
        { name: 'Steak Slice', price: 4.1, description: 'Pastry filled with meat steak' },
        { name: 'Cheese Twist', price: 2.2, description: 'Roti twist cheese' },
        { name: 'Americano', price: 2.9, description: 'Hot black coffee' }
      ],
      TotalEnergies: [
        { name: 'French Butter Croissant', price: 2.9, description: 'Premium buttery croissant' },
        { name: 'Ham Baguette', price: 4.6, description: 'Baguette filled with ham' },
        { name: 'Sparkling Lemon', price: 2.2, description: 'Sparkling lemon drink' }
      ],
      'Harvest Energy': [
        { name: 'Chicken Tikka Wrap', price: 4.5, description: 'Wrap chicken tikka' },
        { name: 'Mini Sausage Roll', price: 2.3, description: 'Sausage roll mini pack' },
        { name: 'Mocha', price: 3.0, description: 'Coffee mocha hot' }
      ],
      Gleaner: [
        { name: 'Scottish Pie', price: 3.7, description: 'Pie signature Skotlandia' },
        { name: 'Shortbread Fingers', price: 1.9, description: 'Shortbread crispy' },
        { name: 'Irn-Bru', price: 2.0, description: 'Soft drink signature Scotland' }
      ],
      Applegreen: [
        { name: 'Bakewell Slice', price: 2.2, description: 'Pastry sweet ala UK/IE' },
        { name: 'Panini Melt', price: 4.2, description: 'Panini hot filled with cheese' },
        { name: 'Mineral Water', price: 1.3, description: 'Water mineral botol' }
      ],
      Moto: [
        { name: 'Roadtrip Wrap', price: 4.5, description: 'Convenient travel wrap' },
        { name: 'Salted Nuts', price: 2.4, description: 'Quick salted nuts snack' },
        { name: 'Cola Zero', price: 1.9, description: 'Low calorie soft drink' }
      ],
      'Welcome Break': [
        { name: 'Hot Panini', price: 4.6, description: 'Panini filled with chicken grilled' },
        { name: 'Muffin Blueberry', price: 2.4, description: 'Muffin blueberry soft' },
        { name: 'Cappuccino', price: 3.2, description: 'Cappuccino hot' }
      ],
      Roadchef: [
        { name: 'Breakfast Roll', price: 4.3, description: 'Egg filled breakfast roll' },
        { name: 'Brownie Bite', price: 2.0, description: 'Mini bite brownie' },
        { name: 'Orange Sparkling', price: 2.1, description: 'Orange soda drink' }
      ],
      MFG: [
        { name: 'Deli Sandwich', price: 3.9, description: 'Sandwich deli ready-to-eat' },
        { name: 'Salted Popcorn', price: 1.8, description: 'Popcorn salted light' },
        { name: 'Iced Latte', price: 2.7, description: 'Latte cold bottled' }
      ],
      'EG Group': [
        { name: 'Chicken Sub', price: 4.7, description: 'Sub chicken filled with loaded' },
        { name: 'Protein Yogurt', price: 2.6, description: 'Yogurt high protein' },
        { name: 'Berry Smoothie', price: 3.1, description: 'Smoothie berries' }
      ],
      'Tesco Petrol': [
        { name: 'Tesco Meal Deal Sandwich', price: 3.5, description: 'Sandwich meal deal popular' },
        { name: 'Scotch Egg', price: 2.2, description: 'Snack classic Inggris' },
        { name: 'Innocent Smoothie', price: 2.8, description: 'Smoothie fruit bottled' }
      ],
      "Sainsbury's Fuel": [
        { name: 'Sainsbury Wrap', price: 3.6, description: 'Wrap chicken ready-to-eat' },
        { name: 'Caramel Shortcake', price: 2.1, description: 'Snack sweet UK' },
        { name: 'Orange Juice', price: 2.3, description: 'Juice orange fresh bottle' }
      ],
      'Asda Petrol': [
        { name: 'Asda Bakery Donut', price: 1.2, description: 'Donut bakery fresh' },
        { name: 'Chicken Sandwich', price: 3.4, description: 'Sandwich chicken mayo' },
        { name: 'Energy Drink', price: 1.9, description: 'Cold energy drink' }
      ],
      'Morrisons Fuel': [
        { name: 'Morrisons Pork Pie', price: 2.5, description: 'Pie tradfilled withonal UK' },
        { name: 'Cheese & Onion Crisp', price: 1.4, description: 'Crisps flavored UK popular' },
        { name: 'Iced Coffee', price: 2.6, description: 'Coffee susu cold' }
      ],
      'Costco Fuel UK': [
        { name: 'Hot Dog Combo UK', price: 1.5, description: 'Combo hot dog food court' },
        { name: 'Chicken Bake UK', price: 3.8, description: 'Chicken bake signature Costco' },
        { name: 'Berry Sundae', price: 2.3, description: 'Sundae fruit beri' }
      ],
      Pace: [
        { name: 'Meat Pie', price: 3.6, description: 'Hot meat pie' },
        { name: 'Butter Cookies', price: 1.9, description: 'Crispy butter cookies' },
        { name: 'Black Tea', price: 2.0, description: 'Bottled black tea' }
      ],
      Rix: [
        { name: 'Hull Sausage Roll', price: 3.1, description: 'Local sausage roll' },
        { name: 'Oat Biscuits', price: 1.7, description: 'Biskuit oat light' },
        { name: 'Milk Coffee', price: 2.6, description: 'Coffee susu cold' }
      ],
      Essar: [
        { name: 'Industrial Breakfast Muffin', price: 4.4, description: 'Egg filled breakfast muffin' },
        { name: 'Cheese Crackers', price: 1.8, description: 'Savory cheese crackers' },
        { name: 'Energy Tea', price: 2.4, description: 'Lemon energy tea' }
      ],
      Maxol: [
        { name: 'Irish Sausage Roll', price: 3.4, description: 'Irish style sausage roll' },
        { name: 'Potato Crisps', price: 1.6, description: 'Crisps potato salted' },
        { name: 'Iced Americano', price: 2.9, description: 'Americano cold' }
      ]
    };

    const stationCatalog = isUK ? ukStations : usStations;

    return stationCatalog.map((station, index) => {
      const currency = isUK ? '£' : '$';

      // Generate realistic prices
      const regularPrice = isUK ? (1.30 + Math.random() * 0.30) : (3.00 + Math.random() * 1.00);
      const premiumPrice = isUK ? (1.50 + Math.random() * 0.30) : (3.50 + Math.random() * 1.00);
      const dieselPrice = isUK ? (1.40 + Math.random() * 0.30) : (3.20 + Math.random() * 1.00);

      const specificGroceries = isUK ? ukSnackByStation[station.name] : usSnackByStation[station.name];
      const groceries = (specificGroceries || (isUK ? fallbackGroceriesUK : fallbackGroceriesUS)).map((item, itemIndex) => ({
        id: `grocery-${isUK ? 'uk' : 'us'}-${index}-${itemIndex}`,
        name: item.name,
        price: item.price,
        description: item.description
      }));

      return {
        id: `station-${isUK ? 'uk' : 'us'}-${index}-${Date.now()}`,
        name: station.name,
        address: station.address,
        distance: `${(0.3 + Math.random() * 0.7).toFixed(1)} miles`,
        deliveryTime: `${Math.floor(10 + Math.random() * 15)} mins`,
        rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
        reviewCount: Math.floor(50 + Math.random() * 200),
        imageUrl: index % 2 === 0 ? '/image-card-1.png' : '/image-card-2.png',
        bannerUrl: index % 2 === 0 ? '/image-card-1.png' : '/image-card-2.png',
        logoUrl: '/logo-green.png',
        fuelPrices: {
          regular: parseFloat(regularPrice.toFixed(2)),
          premium: parseFloat(premiumPrice.toFixed(2)),
          diesel: parseFloat(dieselPrice.toFixed(2)),
        },
        lat: isUK ? (51.5074 + (Math.random() - 0.5) * 0.02) : (40.7580 + (Math.random() - 0.5) * 0.02),
        lon: isUK ? (-0.1278 + (Math.random() - 0.5) * 0.02) : (-73.9855 + (Math.random() - 0.5) * 0.02),
        groceries,
        fuelFriends: isUK ? fallbackFuelFriendsUK : fallbackFuelFriendsUS
      };
    });
  };

  // Helper function to calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in miles
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setQuery(value);

    if (value.trim().length > 0) {
      // Generate Suggestions
      const stationMatches = allStations.filter(s => s.name.toLowerCase().includes(value.toLowerCase())).map(s => ({ type: 'station', ...s }));

      // Grocery matches
      const groceryMatches: any[] = [];
      allStations.forEach(s => {
        const anyStation = s as any;
        if (anyStation.groceries) {
          anyStation.groceries.forEach((g: any) => {
            if (g.name.toLowerCase().includes(value.toLowerCase())) {
              if (!groceryMatches.some(gm => gm.name === g.name)) {
                groceryMatches.push({ type: 'grocery', ...g, stationId: s.id, stationName: s.name });
              }
            }
          });
        }
      });

      setSuggestions([...stationMatches, ...groceryMatches].slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    filterStations(value, filters);
  };

  const handleSuggestionClick = (item: any) => {
    setQuery(item.name);
    setShowSuggestions(false);
    if (item.type === 'station') {
      navigate(`/station/${item.id}`);
    } else if (item.type === 'grocery' && item.stationId) {
      navigate(`/station/${item.stationId}`, { state: { initialTab: 'groceries' } }); // Assuming we can pass state to switch tab
    }
  };

  // Set default location (NO geolocation detection)
  useEffect(() => {
    // Directly use New York as default location - NO location detection
    setUserLocation({ lat: 40.7580, lon: -73.9855 }); // New York, US
  }, []);

  // Fetch real fuel stations using Mapbox API
  useEffect(() => {
    const fetchNearbyStations = async () => {
      if (!userLocation) return;

      setIsLoading(true);
      setError('');

      try {
        const curatedStations = getFallbackStations();
        if (curatedStations.length > 0) {
          setAllStations(curatedStations as any);
          setStations(curatedStations as any);
          setIsLoading(false);
          return;
        }

        try {
          const apiStations = await apiGetStations(userLocation.lat, userLocation.lon, 10000);
          if (Array.isArray(apiStations) && apiStations.length > 0) {
            setAllStations(apiStations as any);
            setStations(apiStations as any);
            setIsLoading(false);
            return;
          }
        } catch (innerError) { }

        // Use Mapbox Geocoding API to search for fuel stations nearby
        let mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

        // Fallback to empty string if environment variable is missing
        if (!mapboxToken) {
          mapboxToken = '';
          console.warn('Mapbox token not found in environment variables');
        }

        // Calculate bounds around user location
        const lat = userLocation.lat;
        const lon = userLocation.lon;

        // Search for fuel stations within 10km radius
        const bbox = [
          lon - 0.1, // west longitude
          lat - 0.1, // south latitude
          lon + 0.1, // east longitude
          lat + 0.1  // north latitude
        ].join(',');

        const data = await apiSearchFuelStations(bbox, mapboxToken);

        // Process the results into our station format
        let processedStations: any[] = [];

        if (data.features && data.features.length > 0) {
          processedStations = data.features.map((feature: any, index: number) => {
            // Calculate distance using Haversine formula
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lon,
              feature.geometry.coordinates[1],
              feature.geometry.coordinates[0]
            );

            // Generate random but realistic fuel prices based on region
            const isUK = isLocationInUK(userLocation); // More precise UK coordinates
            const currencySymbol = isUK ? '£' : '$';

            const regularPrice = isUK ? (1.3 + Math.random() * 0.3).toFixed(2) : (3.0 + Math.random() * 1.0).toFixed(2);
            const premiumPrice = isUK ? (1.5 + Math.random() * 0.3).toFixed(2) : (3.5 + Math.random() * 1.0).toFixed(2);
            const dieselPrice = isUK ? (1.4 + Math.random() * 0.3).toFixed(2) : (3.2 + Math.random() * 1.0).toFixed(2);

            return {
              id: `station-${index}-${Date.now()}`,
              name: feature.text || 'Fuel Station',
              address: feature.place_name || 'Address not available',
              distance: `${distance.toFixed(1)} ${isUK ? 'miles' : 'miles'}`,
              deliveryTime: `${Math.floor(Math.random() * 20) + 10} mins`,
              rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
              reviewCount: Math.floor(Math.random() * 200) + 20,
              imageUrl: index % 2 === 0 ? '/image-card-1.png' : '/image-card-2.png',
              bannerUrl: index % 2 === 0 ? '/image-card-1.png' : '/image-card-2.png',
              logoUrl: '/logo-green.png',
              fuelPrices: {
                regular: parseFloat(regularPrice),
                premium: parseFloat(premiumPrice),
                diesel: parseFloat(dieselPrice),
              },
              lat: feature.geometry.coordinates[1],
              lon: feature.geometry.coordinates[0],
              groceries: [],
              fuelFriends: []
            };
          });
        }

        // If no stations found from API, use fallback data
        if (processedStations.length === 0) {
          console.warn('No stations found from API, using fallback data');
          processedStations = getFallbackStations();
        }

        // SLICE TO AVOID OVERLAPPING MARKERS (MAX 8 STATIONS ON MAP)
        const spreadStations = processedStations.slice(0, 8);

        setAllStations(spreadStations);
        setStations(spreadStations);
      } catch (err: any) {
        console.error('Error fetching stations:', err);
        setError(err.message || 'Failed to load fuel stations');

        // Fallback to mock data if API fails
        const fallbackStations = getFallbackStations().slice(0, 8);
        setAllStations(fallbackStations);
        setStations(fallbackStations);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNearbyStations();
  }, [userLocation]);

  return (
    <AnimatedPage>
      <div className="bg-white overflow-y-auto min-h-screen overflow-x-hidden" style={{ width: '100vw', maxWidth: '100vw' }}>
        {/* iOS-style Greeting Notification */}
        {showGreeting && (
          <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
            <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-4 py-3 shadow-sm">
              <div className="flex items-center juicetify-center">
                <div className="text-gray-900 font-medium">
                  {greetingMessage}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header & Search Bar */}
        <div className="sticky top-0 bg-white z-10">
          {/* Status Bar Spacer - blank */}
          <div className="h-[38px] bg-white"></div>

          {/* Header - sesuai Figma */}
          <div className="flex juicetify-between items-center px-4 py-3">
            <div className="flex items-center gap-3 flex-1">
              <TapEffectButton
                onClick={() => navigate('/profile')}
                className="w-7 h-7 rounded-full bg-gray-200 overflow-hidden hover:ring-2 hover:ring-[#3AC36C] transition-all duration-200 flex-shrink-0"
                rippleColor="rgba(58, 195, 108, 0.3)"
                scaleEffect={false}
              >
                <img
                  src="/fuel friend.png"
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Ccircle cx='14' cy='14' r='14' fill='%23e5e7eb'/%3E%3Cpath d='M14 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM8 20a6 6 0 0 1 12 0H8z' fill='%23999'/%3E%3C/svg%3E";
                  }}
                />
              </TapEffectButton>
              <img
                src="/tulisan.svg"
                alt="FuelFriendly"
                className="h-6 flex-1 max-w-none"
                style={{ width: 'calc(100% - 3rem)' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  // Show text fallback
                  const textElement = e.currentTarget.nextElementSibling;
                  if (textElement && (textElement as HTMLElement).style) (textElement as HTMLElement).style.display = 'block';
                }}
              />
              <span className="text-lg font-bold text-[#3AC36C] hidden flex-1">FUELFRIENDLY</span>
            </div>
            <div className="flex items-center space-x-2 ml-3">
              {/* Location Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="w-7 h-7 bg-gray-100 rounded-full flex items-center juicetify-center hover:bg-gray-200 transition-colors flex-shrink-0"
                >
                  {selectedLocation === 'UK' ? (
                    <img
                      src="https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg"
                      alt="UK"
                      className="w-4 h-3 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30"><clipPath id="a"><rect width="60" height="30"/></clipPath><clipPath id="b"><path d="M0 0v30h60V0z"/></clipPath><g clip-path="url(%23a)"><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0 60 30M60 0 0 30" stroke="#fff" stroke-width="6"/><path d="M0 0 60 30M60 0 0 30" clip-path="url(%23b)" stroke="#C8102E" stroke-width="4"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/></g></svg>';
                      }}
                    />
                  ) : (
                    <img
                      src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg"
                      alt="US"
                      className="w-4 h-3 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900"><rect width="7410" height="3900" fill="%23b22234"/><path d="M0 450h7410m0 600H0m0 600h7410m0 600H0m0 600h7410m0 600H0" stroke="%23fff" stroke-width="300"/><rect width="2964" height="2100" fill="%233c3b6e"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84)"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84) translate(63 42)"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84) translate(126 84)"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84) translate(189 126)"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84) translate(252 168)"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84) translate(315 210)"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84) translate(378 252)"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84) translate(441 294)"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84) translate(504 336)"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84) translate(567 378)"/></svg>';
                      }}
                    />
                  )}
                </button>
              </div>

              <TapEffectButton
                onClick={() => navigate('/notifications')}
                className="w-7 h-7 bg-gray-100 rounded-full flex items-center juicetify-center hover:bg-gray-200 transition-colors relative flex-shrink-0"
                rippleColor="rgba(156, 163, 175, 0.3)"
                scaleEffect={false}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3F4249" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {3 > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center juicetify-center">
                    <span className="text-white text-xs font-bold">3</span>
                  </span>
                )}
              </TapEffectButton>
            </div>
          </div>

          {/* Search Bar */}
          <div className="px-4 pb-4 relative">
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-full px-4 py-3 shadow-sm relative z-20">
                <Search size={20} className="text-[#3F4249] mr-3 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search for fuel and groceries"
                  value={query}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => { if (query) setShowSuggestions(true); }}
                  className="flex-1 outline-none text-base text-gray-600 placeholder-gray-500"
                />
                <button
                  onClick={startVoiceSearch}
                  className={`ml-3 p-1 hover:bg-gray-100 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600' : ''
                    }`}
                  disabled={isListening}
                >
                  <Mic size={20} className={isListening ? 'text-red-600 animate-pulse' : 'text-[#3F4249]'} />
                </button>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`w-12 h-12 border border-gray-300 rounded-full flex items-center juicetify-center transition-colors shadow-sm ${showFilters || Object.values(filters).some(f => f)
                  ? 'bg-[#3AC36C] text-white'
                  : 'bg-[#E3FFEE] hover:bg-[#d1f7dd] text-[#3F4249]'
                  }`}
              >
                <SlidersHorizontal size={24} className="rotate-180" />
              </button>
            </div>

            {/* Dropdown Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-16 left-4 right-4 bg-white shadow-xl max-h-64 overflow-y-auto z-50 border border-gray-100 rounded-2xl animate-fade-in">
                {suggestions.map((item, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    onClick={() => handleSuggestionClick(item)}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center juicetify-center flex-shrink-0">
                      {item.type === 'station' ? <Fuel size={16} className="text-[#3AC36C]" /> : <ShoppingBag size={16} className="text-orange-500" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                      {item.type === 'grocery' && <div className="text-xs text-gray-500">at {item.stationName}</div>}
                      {item.type === 'station' && <div className="text-xs text-gray-500">{item.address}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="px-4 pb-3">
              <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                <div className="flex juicetify-between items-center">
                  <h3 className="font-semibold text-[#3F4249]">Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#3AC36C] hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#3F4249] mb-2">Fuel Type</label>
                  <div className="flex bg-gray-200 p-1 rounded-lg">
                    {['Regular', 'Premium', 'Diesel'].map((type) => (
                      <button
                        key={type}
                        onClick={() => handleFilterChange('fuelType', type.toLowerCase())}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${(filters.fuelType === type.toLowerCase() || (!filters.fuelType && type === 'Regular'))
                          ? 'bg-white text-[#3AC36C] shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#3F4249] mb-2">Price Range</label>
                    <select
                      value={filters.priceRange}
                      onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">All Prices</option>
                      <option value="low">Under $30</option>
                      <option value="medium">$30 - $40</option>
                      <option value="high">Above $40</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#3F4249] mb-2">Min Rating</label>
                    <select
                      value={filters.rating}
                      onChange={(e) => handleFilterChange('rating', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="">Any Rating</option>
                      <option value="4">4+ Stars</option>
                      <option value="4.5">4.5+ Stars</option>
                      <option value="5">5 Stars</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Map - sesuai Figma positioning */}
        <div className="px-4 mb-5 relative">
          <div className="h-[300px] rounded-3xl overflow-hidden border border-[#d6dde8] relative">
            <MapboxMap
              stations={stations}
              userLocation={userLocation}
              onStationSelect={(station) => navigate(`/station/${station.id}`, { state: { station } })}
              isUK={isLocationInUK(userLocation)}
              fuelType={(filters.fuelType || 'regular') as any}
            />
          </div>
        </div>

        {/* Fuel Stations List - sesuai Figma */}
        <div className="px-4 pb-24">
          <h2 className="text-xl font-semibold text-[#3F4249] mb-4">Fuel Station nearby</h2>

          <div className="space-y-4 max-h-[48vh] overflow-y-auto overscroll-contain pr-1 station-scroll-container">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="home-skeleton h-[130px] rounded-3xl border border-gray-100 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%]"></div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                <p>{error}</p>
              </div>
            ) : stations.length === 0 && query ? (
              <div className="text-center text-gray-500 py-8">
                <p>No stations found for "{query}"</p>
                <button
                  onClick={() => handleSearchChange('')}
                  className="text-[#3AC36C] underline mt-2"
                >
                  Clear search
                </button>
              </div>
            ) : stations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No stations found</p>
              </div>
            ) : (
              stations.map((station, index) => (
                <StationCard key={station.id} station={station} index={index} />
              ))
            )}
          </div>
        </div>

        {showLocationModal && createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center juicetify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
                <p className="text-gray-600">Please select your location</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={goToUK}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 ${selectedLocation === 'UK'
                    ? 'border-[#3AC36C] bg-white'
                    : 'border-gray-200 hover:border-[#3AC36C] hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg"
                      alt="UK Flag"
                      className="w-12 h-8 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30"><clipPath id="a"><rect width="60" height="30"/></clipPath><clipPath id="b"><path d="M0 0v30h60V0z"/></clipPath><g clip-path="url(%23a)"><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0 60 30M60 0 0 30" stroke="#fff" stroke-width="6"/><path d="M0 0 60 30M60 0 0 30" clip-path="url(%23b)" stroke="#C8102E" stroke-width="4"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/></g></svg>';
                      }}
                    />
                    <div className="text-left">
                      <div className="font-semibold text-lg text-gray-900">United Kingdom</div>
                      <div className="text-sm text-gray-500">London, Manchester, Birmingham...</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={goToUS}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 ${selectedLocation === 'US'
                    ? 'border-[#3AC36C] bg-white'
                    : 'border-gray-200 hover:border-[#3AC36C] hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg"
                      alt="US Flag"
                      className="w-12 h-8 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7410 3900"><rect width="7410" height="3900" fill="%23b22234"/><path d="M0 450h7410m0 600H0m0 600h7410m0 600H0m0 600h7410m0 600H0" stroke="%23fff" stroke-width="300"/><rect width="2964" height="2100" fill="%233c3b6e"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84)"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84) translate(63 42)"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84) translate(126 84)"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84) translate(189 126)"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84) translate(252 168)"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84) translate(315 210)"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84) translate(378 252)"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84) translate(441 294)"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84) translate(504 336)"/><path d="M247 90 317.53 307.08 545.5 307.08 361 441.27 431.53 658.35 247 524.16 62.47 658.35 133 441.27 -51.53 307.08 176.47 307.08z" fill="%23fff" transform="scale(11.84) translate(567 378)"/></svg>';
                      }}
                    />
                    <div className="text-left">
                      <div className="font-semibold text-lg text-gray-900">United States</div>
                      <div className="text-sm text-gray-500">New York, Los Angeles, Chicago...</div>
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={handleModalContinue}
                disabled={!selectedLocation}
                className={`w-full mt-6 py-3 rounded-full font-semibold transition-all duration-200 ${selectedLocation
                  ? 'bg-[#3AC36C] text-white hover:bg-[#2ea85a]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                Continue
              </button>
            </div>
          </div>,
          document.body
        )}
      </div>
    </AnimatedPage>
  );
};

export default HomeScreen;
