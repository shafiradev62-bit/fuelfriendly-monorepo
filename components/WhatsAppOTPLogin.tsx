import React, { useState } from 'react'
import { MessageCircle, Phone, Shield } from 'lucide-react'

interface WhatsAppOTPLoginProps {
  onLoginSuccess: (user: any) => void
}

export default function WhatsAppOTPLogin({ onLoginSuccess }: WhatsAppOTPLoginProps) {
  const [step, setStep] = useState<'phone' | 'confirm'>('phone')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '')
    
    // Add +62 if starts with 08
    if (digits.startsWith('08')) {
      return '+62' + digits.substring(1)
    }
    
    // Add + if not present
    if (!digits.startsWith('62') && !phone.startsWith('+')) {
      return '+62' + digits
    }
    
    return digits.startsWith('62') ? '+' + digits : phone
  }

  const sendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError('WhatsApp number is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber)
      const { startWhatsAppOneTapVerification } = await import('../services/whatsappService')
      await startWhatsAppOneTapVerification(formattedPhone)
      
      setStep('confirm')
      setCountdown(60)
      
      // Start countdown
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
        
    } catch (err: any) {
      setError(err.message || 'Failed to open WhatsApp')
    } finally {
      setLoading(false)
    }
  }

  const verifyFromWhatsApp = async () => {
    if (loading) return;
    setLoading(true)
    setError('')

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber)
      const { completeWhatsAppOneTapVerification } = await import('../services/whatsappService')
      const data = await completeWhatsAppOneTapVerification(formattedPhone)
      
      onLoginSuccess(data.user || {
        id: `user-${Date.now()}`,
        fullName: 'WhatsApp User',
        email: '',
        phone: formattedPhone,
        city: '',
        avatarUrl: 'https://ui-avatars.com/api/?name=WhatsApp+User&background=random',
        vehicles: []
      })
    } catch (err: any) {
      setError(err.message || 'WhatsApp verification is not completed yet')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep('phone')
    setError('')
  }

  const handleResend = () => {
    if (countdown === 0) {
      sendOTP()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Login WhatsApp OTP
          </h1>
          <p className="text-gray-600">
            {step === 'phone' 
              ? 'Enter your WhatsApp number for free verification'
              : 'Send the verification message in WhatsApp, then return to the app'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-3 mb-6">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {step === 'phone' ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+62812345678 or 08123456789"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Format: +62812345678 or 08123456789
              </p>
            </div>

            <button
              onClick={sendOTP}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-2xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Opening WhatsApp...
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5" />
                  Buka WhatsApp
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-700">
              WhatsApp is open with a prefilled message. After sending it, return to the app and tap verify.
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBack}
                disabled={loading}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-2xl font-medium hover:bg-gray-200 disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={verifyFromWhatsApp}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-2xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'I Already Sent It'}
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={handleResend}
                disabled={countdown > 0}
                className="text-sm text-green-600 hover:text-green-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {countdown > 0 
                  ? `Retry in ${countdown}s`
                  : 'Open WhatsApp Again'
                }
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4" />
            <span>100% Free • Unlimited • Secure</span>
          </div>
        </div>
      </div>
    </div>
  )
}
