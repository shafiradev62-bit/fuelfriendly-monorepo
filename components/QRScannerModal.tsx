import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (value: string) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const scannerRef = useRef<any>(null);
  const scannerIdRef = useRef(`qr-scanner-${Math.random().toString(36).slice(2)}`);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const initScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!isMounted) return;
        const scanner = new Html5Qrcode(scannerIdRef.current);
        scannerRef.current = scanner;

        // Simplified camera configuration for better real camera access on mobile
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
        };

        // First, request camera permissions explicitly
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { exact: 'environment' }, // Force back camera
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            }
          });
          // Stop the stream - just checking permissions
          stream.getTracks().forEach(track => track.stop());
        } catch (permError: any) {
          console.warn('Camera permission check failed:', permError);
          // Continue anyway - html5-qrcode might handle permissions differently
        }

        // Start scanner with explicit back camera constraint
        await scanner.start(
          { facingMode: 'environment' }, // Simple string format works better
          config,
          async (decodedText: string) => {
            if (!scannerRef.current) return;
            const current = scannerRef.current;
            scannerRef.current = null;
            await current.stop().catch(() => null);
            await current.clear().catch(() => null);
            onScanSuccess(decodedText);
          },
          () => null // Ignore errors during scanning
        );
      } catch (e: any) {
        console.error('Scanner initialization error:', e);
        if (!isMounted) return;
        
        // Provide more specific error messages
        let errorMessage = 'Camera cannot be accessed';
        if (e.name === 'NotAllowedError' || e.message?.includes('permission')) {
          errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
        } else if (e.name === 'NotFoundError' || e.message?.includes('no camera')) {
          errorMessage = 'No camera found on this device.';
        } else if (e.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported on this device or browser.';
        } else if (e.name === 'NotReadableError' || e.message?.includes('already in use')) {
          errorMessage = 'Camera is being used by another app. Please close other apps and try again.';
        } else if (e.message?.includes('secure context')) {
          errorMessage = 'Camera requires HTTPS. Please use a secure connection.';
        }
        
        setError(errorMessage);
      }
    };

    initScanner();

    return () => {
      isMounted = false;
      const current = scannerRef.current;
      scannerRef.current = null;
      if (current) {
        current.stop().catch(() => null).finally(() => current.clear().catch(() => null));
      }
    };
  }, [isOpen, onScanSuccess]);

  const closeModal = () => {
    const current = scannerRef.current;
    scannerRef.current = null;
    if (current) {
      current.stop().catch(() => null).finally(() => current.clear().catch(() => null));
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 bg-black/70">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-5 relative">
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">Scan QR Code</h2>
        <p className="text-sm text-gray-500 text-center mb-4">Point camera at QR code to complete order</p>
        <div id={scannerIdRef.current} className="w-full min-h-[260px] rounded-2xl overflow-hidden border border-gray-200" />
        {error && <p className="text-sm text-red-500 mt-3 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default QRScannerModal;
