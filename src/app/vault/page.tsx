'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { toast } from 'sonner';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Download, 
  FileText,
  FileJson,
  Calendar,
  Trash2,
  AlertTriangle,
  HardDrive,
} from 'lucide-react';
import {
  getSetting,
  setSetting,
  exportAllData,
  exportToMarkdown,
} from '@/lib/db';
import { downloadFile, downloadJSON, getToday } from '@/lib/utils';

export default function VaultPage() {
  const [hasPin, setHasPin] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [discreteMode, setDiscreteMode] = useState(false);
  const [showSetPin, setShowSetPin] = useState(false);
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState(getToday());
  const [storageUsage, setStorageUsage] = useState<{ used: string; percent: number } | null>(null);

  useEffect(() => {
    async function checkPin() {
      const storedPin = await getSetting<string>('pin');
      setHasPin(!!storedPin);
      if (!storedPin) {
        setIsLocked(false);
      }
    }
    checkPin();

    // Check storage usage
    async function checkStorage() {
      try {
        if (navigator.storage && navigator.storage.estimate) {
          const estimate = await navigator.storage.estimate();
          const usedBytes = estimate.usage || 0;
          const quotaBytes = estimate.quota || 1;
          const percent = Math.round((usedBytes / quotaBytes) * 100);
          const usedMB = (usedBytes / (1024 * 1024)).toFixed(1);
          const quotaMB = (quotaBytes / (1024 * 1024)).toFixed(0);
          setStorageUsage({
            used: `${usedMB} MB מתוך ${quotaMB} MB`,
            percent,
          });
        }
      } catch {
        // Storage API not available
      }
    }
    checkStorage();
  }, []);

  async function handleUnlock() {
    const storedPin = await getSetting<string>('pin');
    if (pinInput === storedPin) {
      setIsLocked(false);
      setPinInput('');
      toast.success('הכספת נפתחה');
    } else {
      toast.error('קוד שגוי');
      setPinInput('');
    }
  }

  async function handleSetPin() {
    if (newPin.length < 4) {
      toast.error('הקוד חייב להכיל לפחות 4 ספרות');
      return;
    }
    if (newPin !== confirmPin) {
      toast.error('הקודים לא תואמים');
      return;
    }

    await setSetting('pin', newPin);
    setHasPin(true);
    setShowSetPin(false);
    setNewPin('');
    setConfirmPin('');
    toast.success('הקוד נשמר');
  }

  async function handleRemovePin() {
    if (!confirm('להסיר את הקוד?')) return;
    await setSetting('pin', null);
    setHasPin(false);
    toast.success('הקוד הוסר');
  }

  async function handleExportJSON() {
    try {
      const data = await exportAllData();
      downloadJSON(data, `mindvault-export-${getToday()}.json`);
      toast.success('הנתונים יוצאו בהצלחה');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('שגיאה ביצוא');
    }
  }

  async function handleExportMarkdown() {
    try {
      const md = await exportToMarkdown(exportStartDate || undefined, exportEndDate || undefined);
      downloadFile(md, `mindvault-export-${getToday()}.md`, 'text/markdown');
      toast.success('הנתונים יוצאו בהצלחה');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('שגיאה ביצוא');
    }
  }

  function toggleDiscreteMode() {
    setDiscreteMode(!discreteMode);
    if (!discreteMode) {
      toast('מצב דיסקרטי פעיל', { icon: '🔒' });
    }
  }

  // Locked state
  if (isLocked && hasPin) {
    return (
      <AppShell>
        <div className="min-h-[80dvh] flex flex-col items-center justify-center app-container">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-5">
            <Lock className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">הכספת נעולה</h2>
          <p className="text-sm text-gray-500 mb-6">הזינו את הקוד לפתיחה</p>
          
          <input
            type="password"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
            placeholder="קוד PIN"
            maxLength={6}
            className="input-premium text-center text-2xl tracking-widest w-48 mb-4"
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
          />
          
          <button onClick={handleUnlock} className="btn-primary px-6 py-2.5 text-sm">
            פתיחה
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="כספת"
        subtitle="פרטיות ונתונים"
        icon="🔐"
      />

      <div className={`app-container space-y-5 pt-1 ${discreteMode ? 'discrete-mode' : ''}`}>
        {/* Discrete Mode Toggle */}
        <button
          onClick={toggleDiscreteMode}
          className={`fixed top-4 left-4 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-all ${
            discreteMode 
              ? 'bg-purple-600 text-white shadow-lg' 
              : 'bg-white text-gray-500 shadow-md border border-gray-100'
          }`}
        >
          {discreteMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* PIN Section */}
        <section className="card-premium p-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-purple-500" />
            נעילה בקוד
          </h3>
          
          {hasPin ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">הכספת מוגנת בקוד PIN</p>
                <p className="text-sm text-gray-400">הקוד יידרש בכניסה הבאה</p>
              </div>
              <button
                onClick={handleRemovePin}
                className="btn-ghost text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                הסרה
              </button>
            </div>
          ) : showSetPin ? (
            <div className="space-y-3">
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="קוד חדש (4-6 ספרות)"
                maxLength={6}
                className="input-premium"
              />
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="אימות קוד"
                maxLength={6}
                className="input-premium"
              />
              <div className="flex gap-2">
                <button onClick={handleSetPin} className="btn-primary flex-1 py-2">
                  שמירה
                </button>
                <button onClick={() => setShowSetPin(false)} className="btn-secondary py-2 px-4">
                  ביטול
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSetPin(true)}
              className="btn-secondary w-full py-3"
            >
              <Lock className="w-4 h-4" />
              הגדרת קוד PIN
            </button>
          )}
        </section>

        {/* Discrete Mode Info */}
        <section className="card-premium p-4 bg-purple-50/50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-purple-500" />
            מצב דיסקרטי
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            לחצו על כפתור העין בפינה השמאלית העליונה כדי לטשטש את כל התוכן באופן מיידי
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <AlertTriangle className="w-4 h-4" />
            מושלם כשמישהו מציץ למסך
          </div>
        </section>

        {/* Export Section */}
        <section className="card-premium p-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-teal-500" />
            יצוא נתונים
          </h3>
          
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">מתאריך</label>
              <input
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
                className="input-premium py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">עד תאריך</label>
              <input
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
                className="input-premium py-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleExportMarkdown}
              className="btn-secondary w-full py-3 justify-start"
            >
              <FileText className="w-5 h-5 text-teal-600" />
              <span className="flex-1 text-right">יצוא ל-Markdown</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="btn-secondary w-full py-3 justify-start"
            >
              <FileJson className="w-5 h-5 text-blue-600" />
              <span className="flex-1 text-right">יצוא ל-JSON (גיבוי מלא)</span>
            </button>
          </div>
        </section>

        {/* Storage Usage */}
        {storageUsage && (
          <section className="card-premium p-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-3">
              <HardDrive className="w-5 h-5 text-indigo-500" />
              אחסון
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{storageUsage.used}</span>
                <span className={`font-semibold ${storageUsage.percent > 80 ? 'text-red-600' : storageUsage.percent > 50 ? 'text-amber-600' : 'text-green-600'}`}>
                  {storageUsage.percent}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    storageUsage.percent > 80 ? 'bg-red-500' : storageUsage.percent > 50 ? 'bg-amber-400' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.max(storageUsage.percent, 1)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">
                כולל הקלטות, תמונות וכל הנתונים. הכל נשמר מקומית.
              </p>
            </div>
          </section>
        )}

        {/* Privacy Note */}
        <div className="card-premium p-4 bg-green-50/50">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">הנתונים שלך בטוחים</h4>
              <p className="text-sm text-gray-600">
                כל המידע נשמר רק במכשיר שלך. אין שרת, אין ענן, אין גישה לאף אחד מלבדך.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
