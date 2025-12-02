"use client"
import { useState, useRef, ChangeEvent } from 'react';
import { _m1 } from '@/latest/utils'; 

export default function ReaderPage() {
  const [log, setLog] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addToLog = (msg: string) => setLog(prev => [...prev, `> ${msg}`]);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLog([]);
    addToLog("Initializing Neural Decoder...");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => processImage(img);
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const processImage = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      addToLog("Error: Canvas context failed.");
      return;
    }

    addToLog(`Image loaded: ${img.width}x${img.height}px`);
    ctx.drawImage(img, 0, 0);

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;

      let binaryString = "";
      let foundTerminator = false;
      const midFreqIndex = 35;

      addToLog("Scanning frequency domain (DCT)...");

      outerLoop:
      for (let y = 0; y < height; y += 8) {
        for (let x = 0; x < width; x += 8) {
          
          let blueBlock: number[] = [];
          for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
              const pixelIndex = ((y + i) * width + (x + j)) * 4;
              if (pixelIndex + 2 < data.length) {
                blueBlock.push(data[pixelIndex + 2] - 128);
              } else {
                blueBlock.push(0);
              }
            }
          }

          const dctCoeffs = _m1(blueBlock);
          const val = dctCoeffs[midFreqIndex];
          const quant = Math.floor(val / 10);
          
          const bit = (quant % 2 !== 0) ? "1" : "0";
          binaryString += bit;

          if (binaryString.length % 8 === 0) {
            const currentByte = binaryString.slice(-8);
            if (currentByte === "00000000") {
              foundTerminator = true;
              break outerLoop;
            }
            
            if (binaryString.length > 2000) {
                addToLog("Warning: Signal noise too high or no signature found.");
                break outerLoop;
            }
          }
        }
      }

      if (foundTerminator) {
        const cleanBinary = binaryString.slice(0, -8);
        let decodedText = "";
        
        for (let i = 0; i < cleanBinary.length; i += 8) {
          const byte = cleanBinary.substr(i, 8);
          decodedText += String.fromCharCode(parseInt(byte, 2));
        }

        addToLog("Signature Found!");
        addToLog("--------------------------------");
        addToLog(decodedText);
        
        const parts = decodedText.split("|");
        if (parts.length >= 3) {
            const ts = parseInt(parts[parts.length - 1].trim());
            if (!isNaN(ts)) {
                addToLog(`Timestamp: ${new Date(ts).toLocaleString()}`);
            }
        }
        addToLog("--------------------------------");

      } else {
        addToLog("No valid LUNAIREFINE signature detected.");
      }

    } catch (err) {
      console.error(err);
      addToLog("Decryption error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-8 flex flex-col gap-6">
      <div className="border-b border-green-800 pb-4">
        <h1 className="text-2xl font-bold">LUNAIREFINE // SPECTRAL_READER</h1>
        <p className="text-xs text-green-800 mt-1">DCT Steganography Decoder</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        <div className="flex-1 flex flex-col gap-4">
          <div className="border border-green-900 border-dashed p-8 text-center hover:bg-green-900/10 transition cursor-pointer relative">
            <input 
              type="file" 
              accept="image/png" 
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <p>{isLoading ? "PROCESSING..." : "DROP ARTIFACT HERE (.PNG)"}</p>
          </div>
          
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="bg-black border border-green-800 p-4 h-64 overflow-y-auto font-mono text-sm shadow-[0_0_10px_rgba(0,255,0,0.1)]">
            {log.map((l, i) => (
              <div key={i} className="mb-1 opacity-80">{l}</div>
            ))}
            {log.length === 0 && <span className="opacity-30">Waiting for input...</span>}
          </div>
        </div>

      </div>
    </div>
  );
}