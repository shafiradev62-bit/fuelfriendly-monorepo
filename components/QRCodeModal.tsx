import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import anime from 'animejs';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackingNumber: string;
  orderData?: any;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, trackingNumber, orderData }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      anime({
        targets: modalRef.current,
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 300,
        easing: 'easeOutQuad'
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      generateQRCode(trackingNumber);
    }
  }, [isOpen, trackingNumber]);

  const generateQRCode = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = 280;
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Simple QR code pattern generator
    const moduleCount = 25; // QR code grid size
    const moduleSize = size / moduleCount;

    // Generate pseudo-random pattern based on tracking number
    const seed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (x: number, y: number) => {
      const value = Math.sin(seed + x * 12.9898 + y * 78.233) * 43758.5453;
      return value - Math.floor(value);
    };

    // Draw QR code pattern
    ctx.fillStyle = '#000000';
    
    // Position markers (3 corners)
    const drawPositionMarker = (x: number, y: number) => {
      // Outer square
      ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize * 7, moduleSize * 7);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, moduleSize * 5, moduleSize * 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, moduleSize * 3, moduleSize * 3);
    };

    // Draw position markers
    drawPositionMarker(0, 0); // Top-left
    drawPositionMarker(moduleCount - 7, 0); // Top-right
    drawPositionMarker(0, moduleCount - 7); // Bottom-left

    // Draw data modules
    for (let y = 0; y < moduleCount; y++) {
      for (let x = 0; x < moduleCount; x++) {
        // Skip position markers
        if ((x < 8 && y < 8) || (x >= moduleCount - 8 && y < 8) || (x < 8 && y >= moduleCount - 8)) {
          continue;
        }

        // Draw module based on pseudo-random pattern
        if (random(x, y) > 0.5) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    // Add FuelFriendly branding in center
    const centerX = size / 2;
    const centerY = size / 2;
    const logoSize = size * 0.15;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(centerX - logoSize / 2, centerY - logoSize / 2, logoSize, logoSize);
    
    ctx.fillStyle = '#6B7280';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FF', centerX, centerY);
  };

  const handleClose = () => {
    if (modalRef.current) {
      anime({
        targets: modalRef.current,
        opacity: [1, 0],
        scale: [1, 0.9],
        duration: 200,
        easing: 'easeInQuad',
        complete: onClose
      });
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative"
        style={{ opacity: 0 }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Order QR Code</h2>
          <p className="text-sm text-gray-600">Show this at self pickup check-in</p>
        </div>

        {/* QR Code */}
        <div className="bg-white p-4 rounded-2xl border-2 border-gray-200 mb-4">
          <canvas
            ref={canvasRef}
            className="w-full h-auto"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>

        {/* Tracking Number */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-500 mb-1 text-center">Tracking Number</p>
          <p className="text-lg font-bold text-gray-900 text-center tracking-wider">
            {trackingNumber}
          </p>
        </div>

        {/* Order Details */}
        {orderData && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Fuel Type:</span>
              <span className="font-semibold text-gray-900">{orderData.fuelType || 'Regular'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Quantity:</span>
              <span className="font-semibold text-gray-900">{orderData.fuelQuantity || '10L'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-gray-600">On the way</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default QRCodeModal;
