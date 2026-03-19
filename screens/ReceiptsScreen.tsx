import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Printer } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import AnimatedPage from '../components/AnimatedPage';
import TapEffectButton from '../components/TapEffectButton';
import Receipt from '../components/Receipt';
import { downloadReceiptPdf } from '../utils/receiptPdf';

const ReceiptsScreen = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    // Load saved receipts from localStorage
    if (user?.id) {
      const savedReceipts = JSON.parse(localStorage.getItem(`userReceipts_${user.id}`) || '[]');
      setReceipts(savedReceipts);
    }
  }, [user?.id]);

  const saveReceipt = (order: any) => {
    if (user?.id) {
      const receiptData = {
        ...order,
        id: `receipt_${Date.now()}`,
        savedAt: new Date().toISOString()
      };
      
      const existingReceipts = JSON.parse(localStorage.getItem(`userReceipts_${user.id}`) || '[]');
      existingReceipts.unshift(receiptData);
      localStorage.setItem(`userReceipts_${user.id}`, JSON.stringify(existingReceipts));
      setReceipts(existingReceipts);
    }
  };

  const handleDownload = (receipt: any) => {
    downloadReceiptPdf(receipt);
  };

  const handlePrint = (receipt: any) => {
    const printContent = generateReceiptHTML(receipt);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateReceiptText = (receipt: any) => {
    return `
FUELFRIENDLY RECEIPT
====================
Order ID: ${receipt.trackingNumber}
Date: ${new Date(receipt.createdAt).toLocaleString()}
Fuel Friend: ${receipt.driverName}

ORDER DETAILS:
${receipt.fuelType} Fuel (${receipt.fuelQuantity}) - ${receipt.currency}${receipt.fuelCost.toFixed(2)}
${receipt.cartItems?.filter((item: any) => !item.name.toLowerCase().includes('fee'))
    .map((item: any) => `${item.name} (x${item.quantity}) - ${receipt.currency}${(item.price * item.quantity).toFixed(2)}`)
    .join('\n') || ''}

Service Fee: ${receipt.currency}${receipt.serviceFee.toFixed(2)}
TOTAL: ${receipt.currency}${receipt.totalAmount.toFixed(2)}

Station: ${receipt.stationName}
Pickup Location: ${receipt.deliveryAddress}

Thank you for choosing FuelFriendly!
    `;
  };

  const generateReceiptHTML = (receipt: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${receipt.trackingNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .info { margin-bottom: 20px; }
          .items { margin-bottom: 20px; }
          .item { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .total { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .location { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FUELFRIENDLY RECEIPT</h1>
          <p>Thank you for your purchase!</p>
        </div>
        
        <div class="info">
          <p><strong>Order ID:</strong> ${receipt.trackingNumber}</p>
          <p><strong>Date:</strong> ${new Date(receipt.createdAt).toLocaleString()}</p>
          <p><strong>Fuel Friend:</strong> ${receipt.driverName}</p>
        </div>
        
        <div class="items">
          <h3>Order Details</h3>
          <div class="item">
            <span>${receipt.fuelType} Fuel (${receipt.fuelQuantity})</span>
            <span>${receipt.currency}${receipt.fuelCost.toFixed(2)}</span>
          </div>
          ${receipt.cartItems?.filter((item: any) => !item.name.toLowerCase().includes('fee'))
            .map((item: any) => `
              <div class="item">
                <span>${item.name} (x${item.quantity})</span>
                <span>${receipt.currency}${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('') || ''}
          <div class="item">
            <span>Service Fee</span>
            <span>${receipt.currency}${receipt.serviceFee.toFixed(2)}</span>
          </div>
        </div>
        
        <div class="total">
          <div class="item">
            <strong>TOTAL</strong>
            <strong>${receipt.currency}${receipt.totalAmount.toFixed(2)}</strong>
          </div>
        </div>
        
        <div class="location">
          <p><strong>Station:</strong> ${receipt.stationName}</p>
          <p><strong>Pickup Location:</strong> ${receipt.deliveryAddress}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666;">
          <p>FuelFriendly - Your trusted fuel delivery service</p>
        </div>
      </body>
      </html>
    `;
  };

  if (showReceiptModal && selectedReceipt) {
    return (
      <AnimatedPage>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="flex items-center mb-6">
            <TapEffectButton 
              onClick={() => {
                setShowReceiptModal(false);
                setSelectedReceipt(null);
              }}
              className="p-2 -ml-2"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </TapEffectButton>
            <h1 className="text-lg font-semibold text-gray-900 flex-1 text-center -ml-10">Receipt Details</h1>
          </div>
          
          <Receipt
            order={selectedReceipt}
            onDownload={() => handleDownload(selectedReceipt)}
            onPrint={() => handlePrint(selectedReceipt)}
          />
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-gray-50">
        {/* iOS-style Header */}
        <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center p-4">
            <TapEffectButton 
              onClick={() => navigate('/home')}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-900" />
            </TapEffectButton>
            <h1 className="text-lg font-bold text-gray-900 flex-1 text-center -ml-10">My Receipts</h1>
            <div className="w-9"></div> {/* Spacer for centering */}
          </div>
        </div>

        <div className="p-4">
          {receipts.length === 0 ? (
            <div className="text-center py-16 animate-fade-in">
              <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <FileText className="w-14 h-14 text-gray-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Receipts Yet</h3>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                Your receipts will appear here after completing orders.
              </p>
              <button
                onClick={() => navigate('/home')}
                className="bg-[#3AC36C] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#2ea85a] transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                Start Ordering
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {receipts.map((receipt, index) => (
                <div 
                  key={receipt.id}
                  onClick={() => {
                    setSelectedReceipt(receipt);
                    setShowReceiptModal(true);
                  }}
                  className={`bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98] border border-gray-100 animate-slide-in-up stagger-${Math.min(index + 1, 8)}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <h3 className="font-bold text-gray-900">Order #{receipt.trackingNumber}</h3>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        {new Date(receipt.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#3AC36C]">
                        {receipt.currency}{receipt.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 font-medium">Total Amount</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{receipt.stationName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <Download className="w-4 h-4" />
                      <Printer className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default ReceiptsScreen;
