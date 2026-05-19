'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/src/components/primitives/Icon';

interface BarcodeScannerProps {
  onDetect: (upc: string, name?: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onDetect, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let detector: any = null;
    let raf: number;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setScanning(true);

        /* BarcodeDetector API (Chrome 83+, Safari 17.4+) */
        if ('BarcodeDetector' in window) {
          detector = new (window as any).BarcodeDetector({ formats: ['ean_13', 'upc_a', 'upc_e', 'code_128'] });
          const detect = async () => {
            if (!videoRef.current || videoRef.current.readyState < 2) {
              raf = requestAnimationFrame(detect);
              return;
            }
            try {
              const results = await detector.detect(videoRef.current);
              if (results.length > 0) {
                onDetect(results[0].rawValue);
                return;
              }
            } catch {}
            raf = requestAnimationFrame(detect);
          };
          detect();
        }
      } catch {
        setError('Enable camera in browser settings to scan barcodes.');
      }
    };

    start();
    return () => {
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onDetect]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-safe-top right-5 z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border-none cursor-pointer"
      >
        <Icon name="plus" size={20} color="#fff" />
      </button>

      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
          <p className="text-white text-[15px]">{error}</p>
          <button
            onClick={onClose}
            className="text-accent text-[15px] font-bold border-none bg-transparent cursor-pointer"
          >
            Enter manually
          </button>
        </div>
      ) : (
        <>
          {/* Camera preview */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Scan line animation */}
          {scanning && (
            <div
              className="absolute left-[10%] right-[10%] h-0.5 bg-accent"
              style={{
                top: '30%',
                animation: 'scan-line 1.8s linear infinite',
                boxShadow: '0 0 8px #DBA03A',
              }}
            />
          )}

          {/* Instruction */}
          <div className="absolute bottom-32 left-0 right-0 text-center">
            <p className="text-white/80 text-[14px] font-medium">
              Point at a product barcode
            </p>
            <button
              onClick={onClose}
              className="mt-3 text-accent text-[14px] font-bold border-none bg-transparent cursor-pointer"
            >
              Enter manually
            </button>
          </div>
        </>
      )}
    </div>
  );
}
