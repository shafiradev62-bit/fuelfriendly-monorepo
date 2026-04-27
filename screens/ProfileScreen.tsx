import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, LogOut, Camera, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { apiUpdateProfile } from '../services/api';
import { User } from '../types';
import AnimatedPage from '../components/AnimatedPage';
import LogoutModal from '../components/LogoutModal';
import TapEffectButton from '../components/TapEffectButton';

const ProfileInput = ({ label, value, name, onChange, type = "text", disabled = false }: { label: string, value: string, name: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, disabled?: boolean }) => (
    <div>
        <label className="text-sm text-gray-500 dark:text-gray-400">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full mt-1 px-4 py-3 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent disabled:opacity-70"
        />
    </div>
);

const ProfileScreen = () => {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<User | null>(user);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showGenderDropdown, setShowGenderDropdown] = useState(false);

    // Animate on mount
    useEffect(() => {
        // Animate header with bounce
        anime({
            targets: '.profile-header',
            translateY: [-40, 0],
            opacity: [0, 1],
            duration: 700,
            easing: 'easeOutElastic(1, .8)'
        });

        // Animate avatar with dramatic pop
        anime({
            targets: '.profile-avatar',
            scale: [0.5, 1.3, 1],
            opacity: [0, 1],
            rotate: [180, 0],
            duration: 1000,
            delay: 300,
            easing: 'easeOutElastic(1, .6)'
        });
        
        // Add pulsing glow to avatar
        anime({
            targets: '.profile-avatar',
            boxShadow: [
                '0 0 0 0 rgba(58, 195, 108, 0)',
                '0 0 30px 10px rgba(58, 195, 108, 0.4)',
                '0 0 0 0 rgba(58, 195, 108, 0)'
            ],
            duration: 2000,
            delay: 800,
            loop: true,
            easing: 'easeInOutQuad'
        });

        // Animate profile fields with stagger slide
        anime({
            targets: '.profile-field',
            translateX: [-60, 0],
            opacity: [0, 1],
            scale: [0.95, 1],
            duration: 600,
            delay: anime.stagger(80, {start: 600}),
            easing: 'easeOutCubic'
        });

        // Animate buttons with bounce
        anime({
            targets: '.profile-button',
            scale: [0.7, 1.15, 1],
            opacity: [0, 1],
            rotate: [-10, 10, 0],
            duration: 800,
            delay: 1000,
            easing: 'easeOutElastic(1, .6)'
        });
    }, []);

    useEffect(() => {
        // ✅ User sudah di-load dari App.tsx via /auth/me
        // Tidak perlu cek localStorage lagi
        if (user) {
            setIsLoggedIn(true);
            setFormData(user);
        } else {
            setIsLoggedIn(false);
        }
    }, [user]);

    // Show login prompt if not logged in
    if (!isLoggedIn) {
        return (
            <AnimatedPage>
                <div className="min-h-screen flex flex-col bg-white">
                    <header className="p-4 flex items-center sticky top-0 bg-white z-10 shadow-sm">
                        <TapEffectButton onClick={() => navigate('/home')} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <img src="/Back.png" alt="Back" className="w-5 h-5" />
                        </TapEffectButton>
                        <h2 className="text-xl font-bold text-center flex-grow -ml-10 text-[#3F4249]">My Profile</h2>
                    </header>

                    <div className="flex-1 flex flex-col items-center justify-center px-4">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Login Required</h3>
                            <p className="text-gray-600 mb-8 max-w-sm">
                                Please login to view and edit your profile information.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="bg-[#3AC36C] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#2ea85a] transition-colors"
                            >
                                Login Now
                            </button>
                        </div>
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    if (!formData) {
        return <div>Loading profile...</div>; // Or a proper loader
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name.startsWith('vehicle.')) {
            const vehicleField = name.split('.')[1];
            setFormData(prev => {
                if (!prev) return null;
                const updatedVehicles = [...(prev.vehicles || [])];
                if (updatedVehicles.length === 0) {
                    updatedVehicles.push({ brand: '', color: '', licenseNumber: '', fuelType: 'Petrol' });
                }
                (updatedVehicles[0] as any)[vehicleField] = value;
                return { ...prev, vehicles: updatedVehicles };
            });
        } else {
            setFormData(prev => prev ? { ...prev, [name]: value } : null);
        }
    };

    const handleSave = async () => {
        if (!formData) return;

        setLoading(true);
        setError('');

        try {
            const profileData = {
                customerId: user?.id,
                fullName: formData.fullName,
                email: formData.email,
                phoneNumber: formData.phone,
                city: formData.city,
                gender: formData.gender,
                vehicle: {
                    brand: vehicle.brand,
                    color: vehicle.color,
                    licenseNumber: vehicle.licenseNumber
                }
            };

            const updatedData = await apiUpdateProfile(profileData);

            // ✅ Update user in context only (no localStorage)
            const updatedUser = {
                ...user,
                ...updatedData.customer,
                vehicles: updatedData.vehicles
            };

            updateUser(updatedUser);
            setFormData(updatedUser);
            setIsEditing(false);

        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData(user);
        setIsEditing(false);
    }

    const vehicle = formData.vehicles?.[0] || {};

    return (
        <AnimatedPage>
            <div className="min-h-screen bg-white dark:bg-black">
                <header className="p-4 flex items-center justify-between sticky top-0 bg-white dark:bg-black z-10 shadow-sm border-b border-gray-100 dark:border-gray-800">
                    <TapEffectButton onClick={() => isEditing ? handleCancel() : navigate('/home')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <img src="/Back.png" alt="Back" className="w-5 h-5" />
                    </TapEffectButton>
                    <h2 className="text-xl font-bold text-[#3F4249] dark:text-white">My Profile</h2>
                    <button onClick={() => setIsEditing(!isEditing)} className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${isEditing ? 'text-[#3AC36C]' : 'text-gray-600 dark:text-gray-400'}`}>
                        <Edit size={24} />
                    </button>
                </header>

                <div className="p-4">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                            <p className="text-red-600 text-sm text-center">{error}</p>
                        </div>
                    )}

                    <div className="flex flex-col items-center space-y-4 mb-8">
                        <div className="relative">
                            <img
                                src={formData.avatarUrl}
                                alt="Profile"
                                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                                onError={(e) => {
                                    e.currentTarget.src = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none">
  <!-- Background Circle -->
  <circle cx="48" cy="48" r="48" fill="#f0fdf4"/>
  <!-- Face -->
  <circle cx="48" cy="40" r="20" fill="#fef3c7" stroke="#f59e0b" stroke-width="1"/>
  <!-- Eyes -->
  <circle cx="42" cy="38" r="2" fill="#1f2937"/>
  <circle cx="54" cy="38" r="2" fill="#1f2937"/>
  <!-- Smile -->
  <path d="M42 46 Q48 50 54 46" stroke="#1f2937" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <!-- Hat/Cap -->
  <ellipse cx="48" cy="28" rx="18" ry="8" fill="#22c55e" stroke="#16a34a" stroke-width="1"/>
  <rect x="35" y="28" width="26" height="8" rx="2" fill="#22c55e" stroke="#16a34a" stroke-width="1"/>
  <!-- Body/Shirt -->
  <rect x="35" y="55" width="26" height="25" rx="3" fill="#4ade80" stroke="#22c55e" stroke-width="1"/>
  <!-- Arms -->
  <rect x="28" y="60" width="8" height="15" rx="4" fill="#4ade80" stroke="#22c55e" stroke-width="1"/>
  <rect x="60" y="60" width="8" height="15" rx="4" fill="#4ade80" stroke="#22c55e" stroke-width="1"/>
</svg>`)}`;
                                }}
                            />
                            {isEditing && (
                                <button className="absolute bottom-0 right-0 p-2 bg-[#3AC36C] text-white rounded-full shadow-lg hover:bg-[#2ea85a] transition-colors">
                                    <Camera size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-lg text-[#3F4249] mb-4">Personal Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-3 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3AC36C] focus:border-[#3AC36C] disabled:bg-gray-50 disabled:text-gray-600"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">Gender</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => isEditing && setShowGenderDropdown(!showGenderDropdown)}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3AC36C] focus:border-[#3AC36C] disabled:bg-gray-50 disabled:text-gray-600 text-left flex items-center justify-between"
                                        >
                                            <span>{formData.gender || 'Male'}</span>
                                            {isEditing && <ChevronDown size={20} className="text-gray-400" />}
                                        </button>

                                        {showGenderDropdown && isEditing && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleChange({ target: { name: 'gender', value: 'Male' } } as any);
                                                        setShowGenderDropdown(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center"
                                                >
                                                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${formData.gender === 'Male' ? 'border-[#3AC36C]' : 'border-gray-300'
                                                        }`}>
                                                        {formData.gender === 'Male' && (
                                                            <div className="w-2 h-2 rounded-full bg-[#3AC36C]"></div>
                                                        )}
                                                    </div>
                                                    Male
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleChange({ target: { name: 'gender', value: 'Female' } } as any);
                                                        setShowGenderDropdown(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center"
                                                >
                                                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${formData.gender === 'Female' ? 'border-[#3AC36C]' : 'border-gray-300'
                                                        }`}>
                                                        {formData.gender === 'Female' && (
                                                            <div className="w-2 h-2 rounded-full bg-[#3AC36C]"></div>
                                                        )}
                                                    </div>
                                                    Female
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-3 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3AC36C] focus:border-[#3AC36C] disabled:bg-gray-50 disabled:text-gray-600"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-3 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3AC36C] focus:border-[#3AC36C] disabled:bg-gray-50 disabled:text-gray-600"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">City of Residence</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-3 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3AC36C] focus:border-[#3AC36C] disabled:bg-gray-50 disabled:text-gray-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg text-[#3F4249] mb-4">Vehicle Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">Vehicle Make and Model</label>
                                    <input
                                        type="text"
                                        name="vehicle.brand"
                                        value={vehicle.brand || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-3 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3AC36C] focus:border-[#3AC36C] disabled:bg-gray-50 disabled:text-gray-600"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">Vehicle Color</label>
                                    <input
                                        type="text"
                                        name="vehicle.color"
                                        value={vehicle.color || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-3 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3AC36C] focus:border-[#3AC36C] disabled:bg-gray-50 disabled:text-gray-600"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm text-gray-600 mb-2 block">License Number</label>
                                    <input
                                        type="text"
                                        name="vehicle.licenseNumber"
                                        value={vehicle.licenseNumber || ''}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full px-4 py-3 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#3AC36C] focus:border-[#3AC36C] disabled:bg-gray-50 disabled:text-gray-600"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 mb-20">
                        {isEditing ? (
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full bg-[#3AC36C] text-white py-4 rounded-full font-bold hover:bg-[#2ea85a] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Saving...' : 'Save'}
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowLogoutModal(true)}
                                className="w-full bg-red-500 text-white py-4 rounded-full font-bold hover:bg-red-600 transition-colors shadow-lg flex items-center justify-center"
                            >
                                <LogOut size={20} className="mr-2" />
                                Sign Out
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Logout Modal */}
            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
            />
        </AnimatedPage>
    );
};

export default ProfileScreen;
