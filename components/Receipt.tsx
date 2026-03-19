import React from 'react';
import { Download, Printer, CheckCircle, Share2 } from 'lucide-react';

interface ReceiptProps {
  order: {
    id: string;
    trackingNumber: string;
    fuelType: string;
    fuelQuantity: string;
    fuelCost: number;
    serviceFee: number;
    cartItems?: Array<{
      name: string;
      price: number;
      quantity: number;
    }>;
    totalAmount: number;
    currency: string;
    deliveryAddress: string;
    stationName: string;
    createdAt: string;
    driverName: string;
    driverPhone: string;
  };
  onDownload: () => void;
  onPrint: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ order, onDownload, onPrint }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateSubtotal = () => {
    let subtotal = order.fuelCost;
    
    if (order.cartItems) {
      order.cartItems.forEach(item => {
        if (!item.name.toLowerCase().includes('fee')) {
          subtotal += item.price * item.quantity;
        }
      });
    }
    
    return subtotal;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receipt - ${order.trackingNumber}`,
          text: `FuelFriendly Receipt\nOrder: ${order.trackingNumber}\nTotal: ${order.currency}${order.totalAmount.toFixed(2)}`,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md mx-auto animate-scale-in">
      {/* iOS-style Header with gradient */}
      <div className="bg-gradient-to-br from-[#3AC36C] to-[#2ea85a] text-white p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-scale-in stagger-1">
            <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold mb-2 animate-slide-in-down stagger-2">Payment Successful</h2>
          <p className="text-white/90 text-sm animate-slide-in-down stagger-3">Thank you for your order!</p>
        </div>
      </div>

      <div className="p-6">
        {/* Order Info Card - iOS style */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 animate-slide-in-up stagger-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-500">Order ID</span>
            <span className="font-semibold text-gray-900 text-sm">{order.trackingNumber}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-500">Date & Time</span>
            <span className="font-semibold text-gray-900 text-sm">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Fuel Friend</span>
            <span className="font-semibold text-gray-900 text-sm">{order.driverName}</span>
          </div>
        </div>

        {/* Items - Clean iOS list style */}
        <div className="mb-6 animate-slide-in-up stagger-5">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Order Summary</h3>
          
          <div className="space-y-3">
            {/* Fuel Item */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div className="flex-1">
                <p className="text-gray-900 font-medium">{order.fuelType} Fuel</p>
                <p className="text-sm text-gray-500">{order.fuelQuantity}</p>
              </div>
              <span className="font-semibold text-gray-900 ml-4">
                {order.currency}{order.fuelCost.toFixed(2)}
              </span>
            </div>

            {/* Cart Items */}
            {order.cartItems?.filter(item => !item.name.toLowerCase().includes('fee')).map((item, index) => (
              <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100">
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold text-gray-900 ml-4">
                  {order.currency}{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            {/* Service Fee */}
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-700 font-medium">Service Fee</span>
              <span className="font-semibold text-gray-900">
                {order.currency}{order.serviceFee.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Total - iOS style card */}
        <div className="bg-gradient-to-br from-[#3AC36C]/10 to-[#2ea85a]/10 rounded-2xl p-5 mb-6 border border-[#3AC36C]/20 animate-slide-in-up stagger-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-[#3AC36C]">
              {order.currency}{order.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Location Info - iOS style */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3 animate-slide-in-up stagger-7">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Station</p>
            <p className="font-semibold text-gray-900 text-sm">{order.stationName}</p>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <p className="text-xs font-medium text-gray-500 mb-1">Delivery Location</p>
            <p className="font-semibold text-gray-900 text-sm">{order.deliveryAddress}</p>
          </div>
        </div>

        {/* Action Buttons - iOS style */}
        <div className="space-y-3 animate-slide-in-up stagger-8">
          <button
            onClick={onDownload}
            className="w-full flex items-center justify-center gap-3 py-4 bg-[#3AC36C] text-white rounded-2xl font-semibold hover:bg-[#2ea85a] transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            <Download className="w-5 h-5" strokeWidth={2.5} />
            Download Receipt
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onPrint}
              className="flex items-center justify-center gap-2 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-200 active:scale-[0.98]"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
            
            {navigator.share && (
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 py-3.5 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-200 active:scale-[0.98]"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium">
            FuelFriendly - Your trusted fuel delivery service
          </p>
        </div>
      </div>
    </div>
  );
};

export default Receipt;