'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import { 
  FileText, 
  Download, 
  Printer,
  ListTodo,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import {
  getOpenAgendaItems,
  getAllHighlights,
  getAllActionItems,
  AgendaItem,
  Highlight,
  ActionItem,
} from '@/lib/db';
import { downloadFile, getToday } from '@/lib/utils';

export default function PacketPage() {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [agenda, highlightsData, actions] = await Promise.all([
          getOpenAgendaItems(),
          getAllHighlights(),
          getAllActionItems(),
        ]);
        setAgendaItems(agenda);
        setHighlights(highlightsData);
        setActionItems(actions.filter(a => a.status === 'pending'));
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function generateMarkdown(): string {
    let md = `# Packet לפגישה\n`;
    md += `**תאריך:** ${new Date().toLocaleDateString('he-IL')}\n\n`;
    md += `---\n\n`;

    // Agenda
    if (agendaItems.length > 0) {
      md += `## 📋 אג'נדה\n\n`;
      agendaItems.forEach((item, index) => {
        md += `${index + 1}. ${item.text}\n`;
      });
      md += `\n`;
    }

    // Highlights
    if (highlights.length > 0) {
      md += `## ✨ הארות\n\n`;
      highlights.forEach((h) => {
        md += `- "${h.text}"\n`;
      });
      md += `\n`;
    }

    // Action Items
    if (actionItems.length > 0) {
      md += `## ☑️ תרגולים פתוחים\n\n`;
      actionItems.forEach((item) => {
        md += `- [ ] ${item.text}\n`;
      });
      md += `\n`;
    }

    return md;
  }

  function handleExportMarkdown() {
    const md = generateMarkdown();
    downloadFile(md, `packet-${getToday()}.md`, 'text/markdown');
    toast.success('ה-Packet יוצא בהצלחה');
  }

  function handlePrint() {
    window.print();
  }

  const hasContent = agendaItems.length > 0 || highlights.length > 0 || actionItems.length > 0;

  return (
    <AppShell>
      <PageHeader
        title="Packet לפגישה"
        subtitle="כל מה שהכנת במקום אחד"
        icon="📄"
        action={
          hasContent && (
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="btn-icon hover:bg-gray-100"
                title="הדפסה"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={handleExportMarkdown}
                className="btn-primary px-4 py-2 text-sm"
              >
                <Download className="w-4 h-4" />
                יצוא
              </button>
            </div>
          )
        }
      />

      <div className="app-container space-y-5 pt-1 print:px-0">
        {loading ? (
          <div className="space-y-4">
            <div className="skeleton h-32 w-full" />
            <div className="skeleton h-24 w-full" />
          </div>
        ) : !hasContent ? (
          <EmptyState
            icon="📄"
            title="ה-Packet ריק"
            description="הוסיפו נקודות לאג'נדה, הארות או תרגולים כדי ליצור את ה-Packet"
          />
        ) : (
          <>
            {/* Agenda Section */}
            {agendaItems.length > 0 && (
              <section className="card-premium p-4 print:shadow-none print:border">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <ListTodo className="w-5 h-5 text-purple-500" />
                  אג'נדה ({agendaItems.length})
                </h3>
                <div className="space-y-3">
                  {agendaItems.map((item, index) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <p className="text-gray-800 pt-0.5">{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Highlights Section */}
            {highlights.length > 0 && (
              <section className="card-premium p-4 print:shadow-none print:border">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  הארות ({highlights.length})
                </h3>
                <div className="space-y-3">
                  {highlights.map((highlight) => (
                    <div 
                      key={highlight.id} 
                      className="p-3 bg-amber-50 rounded-lg border border-amber-100"
                    >
                      <p className="text-gray-700 text-sm leading-relaxed">
                        "{highlight.text}"
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Action Items Section */}
            {actionItems.length > 0 && (
              <section className="card-premium p-4 print:shadow-none print:border">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <CheckSquare className="w-5 h-5 text-teal-500" />
                  תרגולים פתוחים ({actionItems.length})
                </h3>
                <div className="space-y-2">
                  {actionItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2">
                      <div className="w-5 h-5 rounded border-2 border-gray-300" />
                      <p className="text-gray-700">{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Print-only footer */}
            <div className="hidden print:block text-center text-gray-400 text-sm pt-8">
              נוצר ב-MindVault | {new Date().toLocaleDateString('he-IL')}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
