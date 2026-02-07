'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, ImageIcon, X, RotateCcw } from 'lucide-react';

interface ImageCaptureProps {
  onCapture: (blob: Blob, mimeType: string) => void;
  onCancel: () => void;
}

export function ImageCapture({ onCapture, onCancel }: ImageCaptureProps) {
  const [mode, setMode] = useState<'choose' | 'camera' | 'preview'>('choose');
  const [preview, setPreview] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [capturedMime, setCapturedMime] = useState<string>('image/jpeg');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setMode('camera');
    } catch (error) {
      console.error('Camera error:', error);
      // Fall back to file input
      fileInputRef.current?.click();
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    stopStream();

    canvas.toBlob(
      (blob) => {
        if (blob) {
          setCapturedBlob(blob);
          setCapturedMime('image/jpeg');
          setPreview(URL.createObjectURL(blob));
          setMode('preview');
        }
      },
      'image/jpeg',
      0.85
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedBlob(file);
    setCapturedMime(file.type || 'image/jpeg');
    setPreview(URL.createObjectURL(file));
    setMode('preview');
  };

  const handleConfirm = () => {
    if (capturedBlob) {
      onCapture(capturedBlob, capturedMime);
    }
  };

  const handleRetake = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setCapturedBlob(null);
    setMode('choose');
  };

  const handleCancel = () => {
    stopStream();
    if (preview) URL.revokeObjectURL(preview);
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Hidden elements */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <div className="flex items-center justify-between p-4 safe-area-top">
        <button onClick={handleCancel} className="text-white">
          <X className="w-6 h-6" />
        </button>
        <span className="text-white text-sm font-medium">
          {mode === 'camera' ? 'צילום' : mode === 'preview' ? 'תצוגה מקדימה' : 'בחר תמונה'}
        </span>
        <div className="w-6" />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center">
        {mode === 'choose' && (
          <div className="flex flex-col items-center gap-6 px-8">
            <button
              onClick={startCamera}
              className="w-full py-4 rounded-2xl bg-white/10 text-white flex items-center justify-center gap-3 text-lg font-medium hover:bg-white/20 transition-colors"
            >
              <Camera className="w-6 h-6" />
              צלם תמונה
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 rounded-2xl bg-white/10 text-white flex items-center justify-center gap-3 text-lg font-medium hover:bg-white/20 transition-colors"
            >
              <ImageIcon className="w-6 h-6" />
              בחר מהגלריה
            </button>
          </div>
        )}

        {mode === 'camera' && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
        )}

        {mode === 'preview' && preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
          />
        )}
      </div>

      {/* Actions */}
      <div className="p-6 safe-area-bottom">
        {mode === 'camera' && (
          <div className="flex justify-center">
            <button
              onClick={takePhoto}
              className="w-16 h-16 rounded-full bg-white border-4 border-white/50 hover:scale-95 transition-transform"
              aria-label="צלם"
            />
          </div>
        )}

        {mode === 'preview' && (
          <div className="flex gap-3">
            <button
              onClick={handleRetake}
              className="flex-1 py-3.5 rounded-2xl bg-white/10 text-white flex items-center justify-center gap-2 font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              שוב
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-3.5 rounded-2xl bg-purple-600 text-white flex items-center justify-center gap-2 font-bold"
            >
              השתמש בתמונה
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
