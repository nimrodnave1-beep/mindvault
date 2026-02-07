'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { ImageCapture } from '@/components/ImageCapture';
import { toast } from 'sonner';
import { Save, Camera, ImageIcon } from 'lucide-react';
import { saveMediaBlob, addImageEntry } from '@/lib/db';

export default function CapturePage() {
  const router = useRouter();
  const [showCapture, setShowCapture] = useState(true);
  const [blobKey, setBlobKey] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCapture = async (blob: Blob, mimeType: string) => {
    try {
      const key = await saveMediaBlob(blob, mimeType);
      setBlobKey(key);
      setPreviewUrl(URL.createObjectURL(blob));
      setShowCapture(false);
    } catch (error) {
      console.error('Failed to save image:', error);
      toast.error('שגיאה בשמירת התמונה');
    }
  };

  const handleSave = async () => {
    if (!blobKey) return;

    setSaving(true);
    try {
      await addImageEntry({
        blobKey,
        note: note.trim() || null,
        tags: [],
        cycleId: null,
      });
      toast.success('התמונה נשמרה 📸');
      router.push('/journey');
    } catch (error) {
      console.error('Failed to save image entry:', error);
      toast.error('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  };

  if (showCapture) {
    return (
      <ImageCapture
        onCapture={handleCapture}
        onCancel={() => router.back()}
      />
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="הוסף תמונה"
        showBack
        icon="📸"
        action={
          <button
            onClick={handleSave}
            disabled={saving || !blobKey}
            className="btn-primary px-4 py-2 text-sm"
          >
            <Save className="w-4 h-4" />
            שמירה
          </button>
        }
      />

      <div className="app-container space-y-5 pt-2">
        {/* Preview */}
        {previewUrl && (
          <div className="rounded-2xl overflow-hidden shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full max-h-[50vh] object-cover"
            />
          </div>
        )}

        {/* Change image */}
        <button
          onClick={() => setShowCapture(true)}
          className="w-full py-2.5 rounded-xl bg-gray-50 text-gray-600 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
        >
          <Camera className="w-4 h-4" />
          שנה תמונה
        </button>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            הערה (אופציונלי)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="על מה התמונה הזו?"
            className="input-premium min-h-[80px]"
            dir="rtl"
          />
        </div>

        {/* Tips */}
        <div className="card-premium p-4 bg-teal-50/50">
          <p className="text-sm text-gray-600">
            <strong className="text-teal-700">💡</strong> תמונות נשמרות מקומית במכשיר שלך — בלי ענן, בלי שיתוף.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
