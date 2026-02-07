'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';
import { Mic, Square, Save, Play, Pause, RotateCcw } from 'lucide-react';
import { saveMediaBlob, addAudioMemo } from '@/lib/db';

type RecordState = 'idle' | 'recording' | 'recorded';

export default function RecordPage() {
  const router = useRouter();
  const [state, setState] = useState<RecordState>('idle');
  const [duration, setDuration] = useState(0);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasMediaRecorder = 'MediaRecorder' in window;
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    setIsSupported(hasMediaRecorder && hasGetUserMedia);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        audioBlobRef.current = blob;
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = URL.createObjectURL(blob);
        setState('recorded');
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;

      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      setDuration(0);
      setState('recording');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('לא ניתן להפעיל את המיקרופון');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      const recorder = mediaRecorderRef.current;
      recorder.stop();
      recorder.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
  }, []);

  const resetRecording = () => {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioBlobRef.current = null;
    audioUrlRef.current = null;
    setDuration(0);
    setIsPlaying(false);
    setState('idle');
  };

  const togglePlayback = () => {
    if (!audioUrlRef.current) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrlRef.current);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSave = async () => {
    if (!audioBlobRef.current) return;

    setSaving(true);
    try {
      const blobKey = await saveMediaBlob(audioBlobRef.current, 'audio/webm');
      await addAudioMemo({
        duration,
        blobKey,
        note: note.trim() || null,
        tags: [],
        cycleId: null,
      });
      toast.success('ההקלטה נשמרה 🎙️');
      router.push('/journey');
    } catch (error) {
      console.error('Failed to save audio memo:', error);
      toast.error('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      }
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (!isSupported) {
    return (
      <AppShell>
        <PageHeader title="הקלטה" showBack icon="🎙️" />
        <div className="app-container pt-8 text-center">
          <p className="text-gray-500">הדפדפן שלך לא תומך בהקלטה.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="הקלטה קולית"
        showBack
        icon="🎙️"
        action={
          state === 'recorded' ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary px-4 py-2 text-sm"
            >
              <Save className="w-4 h-4" />
              שמירה
            </button>
          ) : undefined
        }
      />

      <div className="app-container pt-4 space-y-6">
        {/* Big circle visual */}
        <div className="flex flex-col items-center justify-center py-12">
          {/* Timer */}
          <p className="text-4xl font-mono font-bold text-gray-800 tabular-nums mb-8">
            {formatDuration(duration)}
          </p>

          {/* Main button */}
          {state === 'idle' && (
            <button
              onClick={startRecording}
              className="w-24 h-24 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xl hover:bg-red-600 active:scale-95 transition-all"
              aria-label="התחל הקלטה"
            >
              <Mic className="w-10 h-10" />
            </button>
          )}

          {state === 'recording' && (
            <div className="flex flex-col items-center gap-4">
              {/* Waveform */}
              <div className="flex items-center gap-[4px]" aria-hidden="true">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="w-[4px] rounded-full bg-red-400 animate-waveform"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  />
                ))}
              </div>

              <button
                onClick={stopRecording}
                className="w-24 h-24 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xl hover:bg-red-600 active:scale-95 transition-all animate-recording-pulse"
                aria-label="עצור הקלטה"
              >
                <Square className="w-8 h-8 fill-current" />
              </button>

              <p className="text-sm text-red-500 font-medium">מקליט...</p>
            </div>
          )}

          {state === 'recorded' && (
            <div className="flex items-center gap-4">
              <button
                onClick={resetRecording}
                className="w-14 h-14 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
                aria-label="הקלט שוב"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlayback}
                className="w-20 h-20 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-xl hover:bg-purple-600 active:scale-95 transition-all"
                aria-label={isPlaying ? 'עצור' : 'נגן'}
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 mr-1" />}
              </button>

              <div className="w-14" /> {/* Spacer for centering */}
            </div>
          )}
        </div>

        {/* Note — only after recording */}
        {state === 'recorded' && (
          <div className="animate-fade-in-up">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              הערה (אופציונלי)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="על מה ההקלטה?"
              className="input-premium min-h-[80px]"
              dir="rtl"
            />
          </div>
        )}

        {/* Tips */}
        <div className="card-premium p-4 bg-red-50/50">
          <p className="text-sm text-gray-600">
            <strong className="text-red-600">🎙️</strong> ההקלטה נשמרת מקומית במכשיר שלך.
            אין תמלול אוטומטי — זה בכוונה. לפעמים הקול עצמו הוא מה שחשוב.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
