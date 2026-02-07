'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Check, X } from 'lucide-react';
import { toast } from 'sonner';

// ============================================
// Web Speech API Type Declarations
// ============================================

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

// ============================================
// Component Props
// ============================================

interface AudioRecorderProps {
  onTranscript: (text: string) => void;
  onRecordingComplete?: (blob: Blob, transcript: string, duration: number) => void;
}

// ============================================
// Component
// ============================================

export function AudioRecorder({ onTranscript, onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [showTranscriptReview, setShowTranscriptReview] = useState(false);

  // Refs to avoid stale closure issues
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const finalTranscriptRef = useRef('');
  const interimTranscriptRef = useRef('');
  const isRecordingRef = useRef(false);

  // Check browser support on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const hasMediaRecorder = 'MediaRecorder' in window;
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    setIsSupported(hasMediaRecorder && hasGetUserMedia);

    const hasSpeechRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    setIsSpeechSupported(hasSpeechRecognition);
  }, []);

  // Format seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================
  // Start Recording
  // ============================================
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // --- MediaRecorder ---
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start(1000);
      mediaRecorderRef.current = mediaRecorder;

      // --- Speech Recognition ---
      if (isSpeechSupported) {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'he-IL';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalText = '';
          let interimText = '';

          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalText += result[0].transcript + ' ';
            } else {
              interimText += result[0].transcript;
            }
          }

          if (finalText) {
            finalTranscriptRef.current = finalText;
            setFinalTranscript(finalText);
          }
          interimTranscriptRef.current = interimText;
          setInterimTranscript(interimText);
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);
        };

        recognition.onend = () => {
          // Auto-restart if still recording (recognition may auto-stop)
          if (isRecordingRef.current && recognitionRef.current) {
            try {
              recognition.start();
            } catch {
              // Already started or other error — ignore
            }
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      // --- Timer ---
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      // Reset state
      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
      setFinalTranscript('');
      setInterimTranscript('');
      setShowTranscriptReview(false);
      setDuration(0);
      setIsRecording(true);
      isRecordingRef.current = true;

    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error('לא ניתן להפעיל את המיקרופון');
    }
  }, [isSpeechSupported]);

  // ============================================
  // Stop Recording
  // ============================================
  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }

    // Stop media recorder and collect blob
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      const recorder = mediaRecorderRef.current;
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const transcript = (finalTranscriptRef.current + interimTranscriptRef.current).trim();
        
        if (onRecordingComplete) {
          onRecordingComplete(blob, transcript, duration);
        }
      };

      recorder.stop();
      recorder.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }

    setIsRecording(false);

    // Show transcript review if we have transcript text
    const hasTranscript = (finalTranscriptRef.current + interimTranscriptRef.current).trim().length > 0;
    if (hasTranscript) {
      setShowTranscriptReview(true);
    }
  }, [duration, onRecordingComplete]);

  // ============================================
  // Transcript Actions
  // ============================================
  const insertTranscript = () => {
    const transcript = (finalTranscript + interimTranscript).trim();
    if (transcript) {
      onTranscript(transcript);
      toast.success('התמלול הוכנס לטקסט');
    }
    setShowTranscriptReview(false);
    setFinalTranscript('');
    setInterimTranscript('');
  };

  const discardTranscript = () => {
    setShowTranscriptReview(false);
    setFinalTranscript('');
    setInterimTranscript('');
  };

  // ============================================
  // Cleanup on unmount
  // ============================================
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch { /* ignore */ }
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // ============================================
  // Don't render if browser doesn't support recording
  // ============================================
  if (!isSupported) {
    return null;
  }

  const currentTranscript = (finalTranscript + interimTranscript).trim();

  // ============================================
  // Render
  // ============================================
  return (
    <div className="space-y-3">
      {/* ---- Record / Stop Controls ---- */}
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600
                     hover:bg-red-100 transition-all duration-200 press-effect font-medium text-sm"
          aria-label="התחלת הקלטה"
        >
          <Mic className="w-5 h-5" />
          להקליט
        </button>
      ) : (
        <div className="flex items-center gap-3">
          {/* Recording indicator bar */}
          <div className="flex items-center gap-3 flex-1 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
            {/* Pulsing red dot */}
            <div className="relative flex-shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-recording-pulse" />
            </div>

            {/* Timer */}
            <span className="text-red-600 font-mono font-semibold text-sm tabular-nums flex-shrink-0">
              {formatDuration(duration)}
            </span>

            {/* Waveform animation */}
            <div className="flex items-center gap-[3px] mr-auto" aria-hidden="true">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full bg-red-400 animate-waveform"
                  style={{ animationDelay: `${i * 0.12}s` }}
                />
              ))}
            </div>
          </div>

          {/* Stop button */}
          <button
            onClick={stopRecording}
            className="w-11 h-11 rounded-xl bg-red-500 text-white flex items-center justify-center
                       hover:bg-red-600 transition-all duration-200 press-effect shadow-md flex-shrink-0"
            aria-label="עצירת הקלטה"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        </div>
      )}

      {/* ---- Live Transcript (during recording) ---- */}
      {isRecording && currentTranscript && (
        <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 animate-fade-in">
          <p className="text-xs text-purple-600 mb-1.5 font-semibold">תמלול חי</p>
          <p className="text-gray-800 text-sm leading-relaxed" dir="rtl">
            <span>{finalTranscript}</span>
            <span className="text-gray-400 italic">{interimTranscript}</span>
          </p>
        </div>
      )}

      {/* Speech recognition not available notice */}
      {isRecording && !isSpeechSupported && (
        <p className="text-xs text-gray-400 text-center px-2">
          תמלול אוטומטי אינו זמין בדפדפן זה. ההקלטה תישמר ללא תמלול.
        </p>
      )}

      {/* ---- Post-Recording Transcript Review ---- */}
      {!isRecording && showTranscriptReview && currentTranscript && (
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm animate-fade-in-up space-y-3">
          <p className="text-sm text-gray-500 font-semibold">תמלול ההקלטה</p>
          <p className="text-gray-800 leading-relaxed text-sm" dir="rtl">
            {currentTranscript}
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={insertTranscript}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-100 text-purple-700
                         text-sm font-semibold hover:bg-purple-200 transition-colors duration-150"
            >
              <Check className="w-4 h-4" />
              להכניס לטקסט
            </button>
            <button
              onClick={discardTranscript}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 text-gray-600
                         text-sm font-medium hover:bg-gray-200 transition-colors duration-150"
            >
              <X className="w-4 h-4" />
              ביטול
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
