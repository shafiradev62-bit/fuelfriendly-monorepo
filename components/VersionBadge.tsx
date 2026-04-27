import React from 'react';
import { motion } from 'framer-motion';
import { getAppVersion, APP_VERSION, VERSION_CONFIG } from '../utils/versionConfig';
import { getValidationRequirements } from '../utils/validationRules';

const VersionBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  const version = getAppVersion();
  const config = VERSION_CONFIG[version];
  const requirements = getValidationRequirements();
  
  const isStrict = version === APP_VERSION.UK_US;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-4 right-4 z-50 ${className}`}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`
          px-4 py-2 rounded-full text-xs font-semibold
          backdrop-blur-lg shadow-lg
          ${isStrict 
            ? 'bg-blue-500/90 text-white border border-blue-400' 
            : 'bg-green-500/90 text-white border border-green-400'
          }
          ios-blur
        `}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isStrict ? 'bg-blue-200' : 'bg-green-200'} animate-pulse`} />
          <span>
            {isStrict ? '🇬🇧 UK/US Strict' : '🌍 Global'}
          </span>
        </div>
      </motion.div>
      
      {/* Tooltip on hover */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        whileHover={{ opacity: 1, scale: 1, y: 0 }}
        className="absolute top-full right-0 mt-2 w-64 p-3 bg-white rounded-xl shadow-xl border border-gray-200 text-xs"
      >
        <div className="space-y-2">
          <div className="font-semibold text-gray-900 border-b pb-2">
            Active Validations
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Email Verification</span>
              <span className={requirements.requireEmailVerification ? 'text-green-600' : 'text-gray-400'}>
                {requirements.requireEmailVerification ? '✓ Required' : '○ Optional'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Phone Verification</span>
              <span className={requirements.requirePhoneVerification ? 'text-green-600' : 'text-gray-400'}>
                {requirements.requirePhoneVerification ? '✓ Required' : '○ Optional'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Payment Validation</span>
              <span className={requirements.paymentValidation ? 'text-green-600' : 'text-gray-400'}>
                {requirements.paymentValidation ? '✓ Enabled' : '○ Disabled'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Password Length</span>
              <span className="text-gray-900 font-medium">
                {requirements.passwordMinLength}+ chars
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Special Characters</span>
              <span className={requirements.passwordRequireSpecial ? 'text-green-600' : 'text-gray-400'}>
                {requirements.passwordRequireSpecial ? '✓ Required' : '○ Optional'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Minimum Age</span>
              <span className="text-gray-900 font-medium">
                {requirements.minAge}+ years
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Currency</span>
              <span className="text-gray-900 font-medium">
                {config.currency}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VersionBadge;
