import { useRef, useEffect, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Result } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Camera, ScanLine } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function BarcodeScanner({ onScan, onClose, isOpen }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastScannedBarcodeRef = useRef<string | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen && !readerRef.current) {
      readerRef.current = new BrowserMultiFormatReader();
    }

    if (isOpen && videoRef.current && readerRef.current && !isScanning) {
      startScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  const startScanning = async () => {
    if (!videoRef.current || !readerRef.current) return;

    try {
      setIsScanning(true);
      setError(null);

      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error("No camera devices found");
      }

      // Prefer back camera if available
      const selectedDevice = videoInputDevices.find((device: MediaDeviceInfo) => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear')
      ) || videoInputDevices[0];

      await readerRef.current.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current,
        (result?: Result, err?: Error) => {
          if (result && !isProcessingRef.current) {
            const barcode = result.getText();
            
            // Prevent duplicate scans of the same barcode
            if (lastScannedBarcodeRef.current === barcode) {
              return;
            }
            
            console.log("Barcode detected:", barcode);
            lastScannedBarcodeRef.current = barcode;
            isProcessingRef.current = true;
            
            setIsScanning(false);
            stopScanning();
            onScan(barcode);
          }
          if (err && !err.message.includes('No MultiFormat Readers were able to detect the code')) {
            console.log("Scanning error:", err);
          }
        }
      );
    } catch (err) {
      console.error("Scanner error:", err);
      setError(err instanceof Error ? err.message : "Failed to start camera");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      try {
        // Stop the video stream
        const video = videoRef.current;
        if (video && video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          video.srcObject = null;
        }
        // Note: BrowserMultiFormatReader doesn't have a reset method
        // Resources are cleaned up when video stream is stopped
      } catch (e) {
        // Ignore errors when stopping
      }
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    // Reset scanning state when closing
    lastScannedBarcodeRef.current = null;
    isProcessingRef.current = false;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="w-5 h-5" />
            Scan Barcode
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            data-testid="button-close-scanner"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <div className="text-center space-y-4">
              <div className="text-red-500">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{error}</p>
              </div>
              <Button 
                onClick={startScanning} 
                variant="outline"
                data-testid="button-retry-scanner"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  data-testid="video-scanner"
                />
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-32 border-2 border-primary rounded-lg relative">
                      <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary animate-pulse" />
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                        <p className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                          Position barcode in the frame
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-center text-sm text-gray-600">
                <p>Hold your device steady and position the barcode within the frame.</p>
                <p>The barcode will be scanned automatically.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}