'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PenLine,
  Mic,
  Camera,
  BookOpen,
  ListChecks,
  Sparkles,
  Heart,
  Target,
  Star,
  Dumbbell,
  Mail,
  Compass,
  BarChart3,
  X,
} from 'lucide-react';

interface ActionItem {
  icon: typeof PenLine;
  label: string;
  description: string;
  href: string;
  color: string;
  bgColor: string;
  category: string;
}

const actions: ActionItem[] = [
  // כתיבה ומדיה
  { icon: PenLine, label: 'רשומה', description: 'כתיבה חופשית', href: '/today', color: '#7C3AED', bgColor: '#EDE9FE', category: 'כתיבה' },
  { icon: Mic, label: 'הקלטה', description: 'הקלטה קולית', href: '/record', color: '#DC2626', bgColor: '#FEE2E2', category: 'כתיבה' },
  { icon: Camera, label: 'תמונה', description: 'צילום / גלריה', href: '/capture', color: '#0D9488', bgColor: '#CCFBF1', category: 'כתיבה' },
  // טיפול
  { icon: BookOpen, label: 'סיכום פגישה', description: 'סיכום טיפול', href: '/therapy/new', color: '#0D9488', bgColor: '#CCFBF1', category: 'טיפול' },
  { icon: ListChecks, label: 'נקודה לאג\'נדה', description: 'לפגישה הבאה', href: '/agenda?add=true', color: '#7C3AED', bgColor: '#EDE9FE', category: 'טיפול' },
  { icon: Sparkles, label: 'תובנה', description: 'הבנתי ש...', href: '/insights', color: '#F59E0B', bgColor: '#FEF3C7', category: 'טיפול' },
  // רגש
  { icon: Heart, label: 'הכרת תודה', description: 'על מה תודה?', href: '/gratitude/new', color: '#EC4899', bgColor: '#FCE7F3', category: 'רגש' },
  { icon: Star, label: 'משאלה', description: 'מה אני מאחל לעצמי', href: '/wishes/new', color: '#F59E0B', bgColor: '#FEF3C7', category: 'רגש' },
  { icon: Dumbbell, label: 'כוחות שלי', description: 'אני טוב ב...', href: '/strengths/new', color: '#10B981', bgColor: '#D1FAE5', category: 'רגש' },
  // מטרות
  { icon: Target, label: 'מטרה חדשה', description: 'לאן אני הולך', href: '/goals/new', color: '#7C3AED', bgColor: '#EDE9FE', category: 'מטרות' },
  { icon: BarChart3, label: 'מעקב', description: 'מעקב חדש', href: '/tracking', color: '#6366F1', bgColor: '#E0E7FF', category: 'מטרות' },
  // מתקדם
  { icon: Mail, label: 'מכתב לעצמי', description: 'מהעתיד / מהעבר', href: '/letters/new', color: '#8B5CF6', bgColor: '#EDE9FE', category: 'מתקדם' },
  { icon: Compass, label: 'ערכים שלי', description: 'מה חשוב לי', href: '/values/new', color: '#0D9488', bgColor: '#CCFBF1', category: 'מתקדם' },
];

interface AddActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddActionSheet({ isOpen, onClose }: AddActionSheetProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const categories = [...new Set(actions.map((a) => a.category))];

  const handleAction = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
        <div className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto safe-area-bottom">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-3">
            <h2 className="text-lg font-bold text-gray-900">הוספה</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Actions Grid by Category */}
          <div className="px-5 pb-6 space-y-5">
            {categories.map((category) => (
              <div key={category}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
                  {category}
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {actions
                    .filter((a) => a.category === category)
                    .map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.href + action.label}
                          onClick={() => handleAction(action.href)}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-gray-50 active:scale-95 transition-all"
                        >
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: action.bgColor }}
                          >
                            <Icon
                              className="w-5 h-5"
                              style={{ color: action.color }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                            {action.label}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
