'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { TopicPicker } from '@/components/TopicPicker';
import { useTopics } from '@/lib/topicContext';
import { toast } from 'sonner';
import { 
  ListChecks, 
  Sparkles, 
  Tag,
  Check,
  X,
  Play,
  Pause,
  Trash2,
  Mic
} from 'lucide-react';
import {
  getTodayEntry,
  addEntry,
  updateEntry,
  addAgendaItem,
  addHighlight,
  getAllTags,
  addTag,
  getOpenAgendaItems,
  addRecording,
  getRecordingsByEntry,
  deleteRecording,
  DailyEntry,
  Tag as TagType,
  Recording,
} from '@/lib/db';
import { getToday, getInspirationPrompt } from '@/lib/utils';
import { AudioRecorder } from '@/components/AudioRecorder';

export default function TodayPage() {
  const { topics } = useTopics();
  const [entry, setEntry] = useState<DailyEntry | null>(null);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [selection, setSelection] = useState<{ text: string; rect: DOMRect } | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const [todayEntry, allTags] = await Promise.all([
          getTodayEntry(),
          getAllTags(),
        ]);
        
        if (todayEntry) {
          setEntry(todayEntry);
          setContent(todayEntry.content);
          setSelectedTags(todayEntry.tags);
          setSelectedTopicId(todayEntry.primaryTopicId);
          // Load recordings for today's entry
          const entryRecordings = await getRecordingsByEntry(todayEntry.id);
          setRecordings(entryRecordings);
        }
        setTags(allTags);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    }
    loadData();
  }, []);

  // Auto-save with debounce
  const saveEntry = useCallback(async (newContent: string, newTags: string[], topicId: string | null = selectedTopicId) => {
    if (!newContent.trim() && !entry) return;
    
    setSaving(true);
    try {
      if (entry) {
        await updateEntry({
          ...entry,
          content: newContent,
          tags: newTags,
          primaryTopicId: topicId,
        });
      } else {
        const newEntry = await addEntry({
          date: getToday(),
          content: newContent,
          cycleId: null,
          tags: newTags,
          primaryTopicId: topicId,
        });
        setEntry(newEntry);
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('שגיאה בשמירה');
    } finally {
      setSaving(false);
    }
  }, [entry, selectedTopicId]);

  // Handle content change with debounced save
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveEntry(newContent, selectedTags);
    }, 2000);
  };

  // Handle topic change
  const handleTopicChange = (topicId: string | null) => {
    setSelectedTopicId(topicId);
    saveEntry(content, selectedTags, topicId);
  };

  // Handle tag toggle
  const toggleTag = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter(t => t !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(newTags);
    saveEntry(content, newTags);
  };

  // Add new tag
  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const colors = ['#6B4EE6', '#14A292', '#E6994E', '#E64E7A', '#4E8BE6'];
      const newTag = await addTag({
        name: newTagName.trim(),
        color: colors[tags.length % colors.length],
      });
      setTags([...tags, newTag]);
      setNewTagName('');
      setShowTagInput(false);
      toast.success('תגית נוספה');
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  };

  // Handle text selection
  const handleSelection = () => {
    const selectedText = window.getSelection()?.toString().trim();
    if (selectedText && selectedText.length > 3) {
      const range = window.getSelection()?.getRangeAt(0);
      if (range) {
        const rect = range.getBoundingClientRect();
        setSelection({ text: selectedText, rect });
      }
    } else {
      setSelection(null);
    }
  };

  // Add to agenda
  const addToAgenda = async () => {
    if (!selection) return;
    
    try {
      const items = await getOpenAgendaItems();
      await addAgendaItem({
        text: selection.text,
        priority: items.length,
        sourceId: entry?.id || null,
        sourceType: 'entry',
        status: 'open',
        cycleId: null,
        primaryTopicId: selectedTopicId,
      });
      toast.success('נוסף לאג\'נדה');
      setSelection(null);
    } catch (error) {
      console.error('Failed to add to agenda:', error);
      toast.error('שגיאה');
    }
  };

  // Add highlight
  const addToHighlights = async () => {
    if (!selection) return;
    
    try {
      await addHighlight({
        text: selection.text,
        sourceEntryId: entry?.id || null,
        sourceType: 'entry',
        cycleId: null,
        primaryTopicId: selectedTopicId,
      });
      toast.success('נשמר כהארה');
      setSelection(null);
    } catch (error) {
      console.error('Failed to add highlight:', error);
      toast.error('שגיאה');
    }
  };

  // Handle transcript insertion from audio recorder
  const handleTranscript = useCallback((text: string) => {
    const separator = content.trim() ? '\n\n' : '';
    const newContent = content + separator + text;
    setContent(newContent);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveEntry(newContent, selectedTags);
    }, 500);
  }, [content, selectedTags, saveEntry]);

  // Handle recording completion
  const handleRecordingComplete = useCallback(async (blob: Blob, transcript: string, duration: number) => {
    try {
      let currentEntry = entry;
      if (!currentEntry) {
        currentEntry = await addEntry({
          date: getToday(),
          content: content || '',
          cycleId: null,
          tags: selectedTags,
          primaryTopicId: selectedTopicId,
        });
        setEntry(currentEntry);
        setLastSaved(new Date());
      }

      const recording = await addRecording({
        entryId: currentEntry.id,
        audioBlob: blob,
        mimeType: 'audio/webm',
        transcript,
        duration,
      });
      setRecordings(prev => [recording, ...prev]);
    } catch (error) {
      console.error('Failed to save recording:', error);
      toast.error('שגיאה בשמירת ההקלטה');
    }
  }, [entry, content, selectedTags, selectedTopicId]);

  // Play/pause recording
  const togglePlayRecording = useCallback((recording: Recording) => {
    if (playingId === recording.id && audioRef.current) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
    }

    const url = URL.createObjectURL(recording.audioBlob);
    audioUrlRef.current = url;
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onended = () => {
      setPlayingId(null);
      URL.revokeObjectURL(url);
      audioUrlRef.current = null;
    };

    audio.play();
    setPlayingId(recording.id);
  }, [playingId]);

  // Delete recording
  const handleDeleteRecording = useCallback(async (id: string) => {
    try {
      await deleteRecording(id);
      setRecordings(prev => prev.filter(r => r.id !== id));
      if (playingId === id && audioRef.current) {
        audioRef.current.pause();
        setPlayingId(null);
      }
      toast.success('ההקלטה נמחקה');
    } catch (error) {
      console.error('Failed to delete recording:', error);
      toast.error('שגיאה במחיקה');
    }
  }, [playingId]);

  // Format recording duration
  const formatRecordingDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  // Get the active topic for visual context
  const activeTopic = selectedTopicId ? topics.find(t => t.id === selectedTopicId) : null;

  const saveStatus = saving ? (
    <div className="text-sm text-gray-400 flex items-center gap-1.5">
      <div className="w-3.5 h-3.5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      שומר...
    </div>
  ) : lastSaved ? (
    <div className="text-sm text-green-600 flex items-center gap-1">
      <Check className="w-3.5 h-3.5" />
      נשמר
    </div>
  ) : null;

  return (
    <AppShell>
      <PageHeader
        title="היום"
        subtitle={lastSaved 
          ? `נשמר ${lastSaved.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}` 
          : new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
        }
        icon="📝"
        action={saveStatus}
      />

      <div className="app-container space-y-4 pt-2">
        {/* Topic Picker */}
        <TopicPicker
          value={selectedTopicId}
          onChange={handleTopicChange}
          showInbox={true}
          compact
        />

        {/* Tags */}
        <div className="flex flex-wrap gap-2 items-center">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`chip transition-all text-sm ${
                selectedTags.includes(tag.id)
                  ? 'bg-purple-50 text-purple-700 border border-purple-200 font-semibold'
                  : 'bg-gray-50 text-gray-500 border border-gray-200'
              }`}
            >
              <Tag className="w-3 h-3" />
              {tag.name}
            </button>
          ))}
          
          {showTagInput ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="שם התגית"
                className="input-premium py-1.5 px-3 text-sm w-28"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTag();
                  if (e.key === 'Escape') setShowTagInput(false);
                }}
              />
              <button onClick={handleAddTag} className="btn-icon w-8 h-8 bg-green-50 text-green-600 hover:bg-green-100">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setShowTagInput(false)} className="btn-icon w-8 h-8 bg-gray-50 text-gray-500 hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowTagInput(true)}
              className="chip bg-transparent text-gray-400 border border-dashed border-gray-300 hover:border-gray-400 hover:text-gray-500 transition-colors"
            >
              + תגית
            </button>
          )}
        </div>

        {/* Writing Canvas — with topic accent border */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onMouseUp={handleSelection}
            onTouchEnd={handleSelection}
            placeholder={getInspirationPrompt()}
            className="writing-canvas min-h-[360px]"
            style={activeTopic ? { borderColor: `${activeTopic.color}40` } : {}}
            dir="rtl"
          />
          {/* Topic indicator stripe */}
          {activeTopic && (
            <div
              className="absolute top-3 right-0 w-1 h-8 rounded-full"
              style={{ backgroundColor: activeTopic.color }}
            />
          )}
        </div>

        {/* Audio Recorder */}
        <AudioRecorder
          onTranscript={handleTranscript}
          onRecordingComplete={handleRecordingComplete}
        />

        {/* Past Recordings */}
        {recordings.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-500 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" />
              הקלטות ({recordings.length})
            </p>
            <div className="space-y-1.5">
              {recordings.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 shadow-xs"
                >
                  <button
                    onClick={() => togglePlayRecording(rec)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                      playingId === rec.id
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {playingId === rec.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 mr-[-2px]" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-500">
                        {formatRecordingDuration(rec.duration)}
                      </span>
                      <span className="text-xs text-gray-300">
                        {new Date(rec.createdAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {rec.transcript && (
                      <p className="text-xs text-gray-500 truncate mt-0.5" dir="rtl">
                        {rec.transcript}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteRecording(rec.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 
                               hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selection Toolbar */}
        {selection && (
          <div
            className="selection-toolbar animate-fade-in"
            style={{
              top: selection.rect.bottom + window.scrollY + 8,
              left: Math.max(16, Math.min(selection.rect.left, window.innerWidth - 250)),
            }}
          >
            <button
              onClick={addToAgenda}
              className="selection-toolbar-btn text-purple-600 hover:bg-purple-50"
            >
              <ListChecks className="w-4 h-4" />
              להביא לטיפול
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <button
              onClick={addToHighlights}
              className="selection-toolbar-btn text-amber-600 hover:bg-amber-50"
            >
              <Sparkles className="w-4 h-4" />
              הארה
            </button>
          </div>
        )}

        {/* Tip */}
        {!content && (
          <div className="rounded-xl p-4 bg-purple-50/40 border border-purple-100/50 animate-fade-in">
            <p className="text-sm text-gray-500 leading-relaxed">
              <strong className="text-purple-700">טיפ:</strong> סמנו טקסט כדי להוסיף אותו לאג&apos;נדה או לשמור כהארה
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
