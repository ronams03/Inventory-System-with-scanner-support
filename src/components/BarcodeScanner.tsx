import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Camera, Keyboard, Scan, X } from 'lucide-react';
import { toast } from 'sonner';
import { ScanResult } from '@/types/inventory';

interface BarcodeScannerProps {
  onScan: (result: ScanResult) => void;
  onClose: () => void;
  isOpen: boolean;
}

export default function BarcodeScanner({ onScan, onClose, isOpen }: BarcodeScannerProps) {
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('manual');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && scanMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, scanMode]);

  const startCamera = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Note: In a real implementation, you would use a barcode scanning library like:
      // - @zxing/library
      // - quagga2
      // - html5-qrcode
      toast.info('Camera activated. Point at barcode to scan');
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please use manual input.');
      setScanMode('manual');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.length >= 8) {
      onScan({
        barcode: manualInput,
        format: 'manual'
      });
      setManualInput('');
    } else {
      toast.error('Please enter a valid barcode (at least 8 digits)');
    }
  };

  const simulateBarcodeScan = (barcode: string) => {
    onScan({
      barcode,
      format: 'camera'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Scan Barcode</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={scanMode === 'camera' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScanMode('camera')}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-1" />
              Camera
            </Button>
            <Button
              variant={scanMode === 'manual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setScanMode('manual')}
              className="flex-1"
            >
              <Keyboard className="h-4 w-4 mr-1" />
              Manual
            </Button>
          </div>

          <Separator />

          {scanMode === 'camera' ? (
            <div className="space-y-4">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
                {isScanning ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Scan className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 border-2 border-red-500 rounded-lg pointer-events-none">
                  <div className="absolute inset-4 border border-red-300 rounded-lg"></div>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                Position barcode within the red frame
              </div>

              {/* Demo buttons for testing */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground text-center">Demo Barcodes:</div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {['123456789012', '987654321098', '456789123456'].map((barcode) => (
                    <Badge
                      key={barcode}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => simulateBarcodeScan(barcode)}
                    >
                      {barcode}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Enter Barcode</label>
                <Input
                  type="text"
                  placeholder="Enter barcode number..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-lg tracking-wider"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={manualInput.length < 8}>
                <Scan className="h-4 w-4 mr-2" />
                Scan Barcode
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}