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
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const initScanner = async () => {
      try {
        setError('');
        setCameraReady(false);
        
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!isMounted) return;
        
        const scanner = new Html5Qrcode(scannerIdRef.current);
        scannerRef.current = scanner;

        // Optimized camera configuration for mobile APK/iOS
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          disableFlip: false,
          rememberLastUsedCamera: true,
        };

        // Request camera permissions explicitly for Capacitor
        try {
          // Use Capacitor Plugins if available (built-in, no package needed)
          if ((window as any).Capacitor && (window as any).Capacitor.Plugins?.Camera) {
            console.log('📷 Using Capacitor native camera');
            const cameraPlugin = (window as any).Capacitor.Plugins.Camera;
            // Check and request permissions using Capacitor native API
            try {
              const status = await cameraPlugin.checkPermissions();
              if (status.camera === 'prompt' || status.camera === 'denied') {
                await cameraPlugin.requestPermissions();
              }
            } catch (permErr) {
              console.log('Permission check skipped:', permErr);
            }
          } else {
            // Fallback to web API for browser/localhost
            console.log('📷 Using browser camera API');
            const stream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: { exact: 'environment' }, // Force back camera
                width: { ideal: 1920 },
                height: { ideal: 1080 },
              }
            });
            stream.getTracks().forEach(track => track.stop());
          }
        } catch (permError: any) {
          console.warn('Camera permission error:', permError);
          // Continue anyway - html5-qrcode handles permissions internally
        }

        // Get available cameras
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          // Find back camera (environment-facing)
          const backCamera = cameras.find(cam => 
            cam.label.toLowerCase().includes('back') || 
            cam.label.toLowerCase().includes('environment') ||
            cam.label.toLowerCase().includes('rear')
          ) || cameras[cameras.length - 1]; // Fallback to last camera
          
          console.log('📷 Selected camera:', backCamera.label);

          // Start scanner with explicit camera ID
          await scanner.start(
            backCamera.id,
            config,
            async (decodedText: string) => {
              if (!scannerRef.current) return;
              const current = scannerRef.current;
              scannerRef.current = null;
              await current.stop().catch(() => null);
              await current.clear().catch(() => null);
              setCameraReady(true);
              onScanSuccess(decodedText);
            },
            (errorMessage: string) => {
              console.log('Scanner message:', errorMessage);
            }
          );
          
          setCameraReady(true);
          console.log('✅ Camera started successfully');
        } else {
          throw new Error('No cameras found');
        }
      } catch (e: any) {
        console.error('❌ Scanner initialization error:', e);
        if (!isMounted) return;
        
        // User-friendly error messages
        let errorMessage = 'Camera access initialized. Point at QR code to scan.';
        if (e.name === 'NotAllowedError' || e.message?.includes('permission')) {
          errorMessage = 'Camera permission denied. Please enable camera access in Settings.';
        } else if (e.name === 'NotFoundError' || e.message?.includes('no camera')) {
          errorMessage = 'No camera found. Please ensure your device has a camera.';
        } else if (e.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported. Please update your device or app.';
        } else if (e.name === 'NotReadableError' || e.message?.includes('already in use')) {
          errorMessage = 'Camera in use. Close other apps using the camera.';
        } else if (e.message?.includes('secure context')) {
          errorMessage = 'Requires secure connection (HTTPS).';
        } else if (e.message?.includes('security error')) {
          errorMessage = 'Security restriction. Please restart the app.';
        }
        
        setError(errorMessage);
        setCameraReady(false);
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
      // Check if scanner is actually running before trying to stop
      if (typeof current.isScanning === 'function' && current.isScanning()) {
        current.stop().catch(() => null).finally(() => current.clear().catch(() => null));
      } else {
        current.clear().catch(() => null);
      }
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
        <p className="text-sm text-gray-500 text-center mb-4">
          {!cameraReady ? 'Initializing camera...' : 'Point camera at QR code to complete order'}
        </p>
        
        {/* Camera viewfinder */}
        <div className="relative w-full min-h-[260px] rounded-2xl overflow-hidden border border-gray-200 bg-black">
          <div id={scannerIdRef.current} className="w-full h-full" />
          
          {/* Scanning overlay */}
          <div className="absolute inset-0 border-2 border-green-500/50 rounded-2xl pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500/80 animate-pulse"></div>
          </div>
          
          {/* Corner markers */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-green-500 rounded-tl-lg"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-green-500 rounded-tr-lg"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-green-500 rounded-bl-lg"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-green-500 rounded-br-lg"></div>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className={`w-2 h-2 rounded-full ${cameraReady ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
          <span className="text-xs text-gray-600">
            {cameraReady ? 'Camera ready' : 'Starting camera...'}
          </span>
        </div>
        
        {error && (
          <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
            <p className="text-sm text-red-600 text-center font-medium">{error}</p>
            <p className="text-xs text-red-500 text-center mt-1">
              Tip: Allow camera access when prompted
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScannerModal;
