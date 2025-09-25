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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-black/95 border-red-600/50 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-red-800/30">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="p-2 bg-gradient-to-r from-red-600 to-red-800 rounded-lg shadow-lg">
              <ScanLine className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">Professional Scanner</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            data-testid="button-close-scanner"
            className="text-gray-300 hover:text-white hover:bg-red-600/20 border border-red-800/30 hover:border-red-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {error ? (
            <div className="text-center space-y-6">
              <div className="bg-red-950/50 border border-red-800/50 rounded-lg p-6">
                <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-red-400" />
                </div>
                <p className="text-red-300 font-medium">{error}</p>
                <p className="text-gray-400 text-sm mt-2">Please check camera permissions and try again</p>
              </div>
              <Button 
                onClick={startScanning} 
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
                data-testid="button-retry-scanner"
              >
                <Camera className="w-4 h-4 mr-2" />
                Retry Scanner
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative bg-black rounded-xl overflow-hidden border-2 border-red-600/30 shadow-2xl" style={{ aspectRatio: '4/3' }}>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  data-testid="video-scanner"
                />
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Scanning Frame */}
                      <div className="w-56 h-36 border-2 border-red-500 rounded-lg relative shadow-lg">
                        {/* Corner decorations */}
                        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-red-400 rounded-tl-lg"></div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-red-400 rounded-tr-lg"></div>
                        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-red-400 rounded-bl-lg"></div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-red-400 rounded-br-lg"></div>
                        
                        {/* Scanning line */}
                        <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent animate-pulse shadow-lg" />
                        
                        {/* Pulsing glow effect */}
                        <div className="absolute inset-0 border-2 border-red-400/50 rounded-lg animate-ping"></div>
                      </div>
                      
                      {/* Instructions */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                        <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-red-600/30">
                          <p className="text-white text-sm font-medium whitespace-nowrap">
                            Position barcode within frame
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Status indicator */}
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-red-600/30">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-xs font-medium">SCANNING</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center bg-gray-900/50 rounded-lg p-4 border border-red-800/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ScanLine className="w-4 h-4 text-red-400" />
                  <span className="text-white font-semibold text-sm">Professional Barcode Scanner</span>
                </div>
                <p className="text-gray-300 text-sm mb-1">Hold device steady and ensure good lighting</p>
                <p className="text-gray-400 text-xs">Automatic detection • High precision scanning</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}