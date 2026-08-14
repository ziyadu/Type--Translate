import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, FileText, Camera, Bookmark } from 'lucide-react';
import { CustomText } from '../types';
import { 
  ICEBREAKER_QUESTIONS_SCRIPT, 
  MOTIVATIONAL_STORIES, 
  MOTIVATIONAL_STORIES_FULL_SCRIPT,
  INTERVIEW_PRACTICE_QUESTIONS,
  INTERVIEW_PRACTICE_FULL_SCRIPT
} from '../data/words';

interface CustomTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomText: (text: string) => void;
  currentSelectedId?: string;
  onOpenCameraModal?: () => void;
}

export default function CustomTextModal({
  isOpen,
  onClose,
  onSelectCustomText,
  currentSelectedId,
  onOpenCameraModal,
}: CustomTextModalProps) {
  const [customTexts, setCustomTexts] = useState<CustomText[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load custom texts from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('typing-custom-passages');
    let list: CustomText[] = [];
    if (saved) {
      try {
        list = JSON.parse(saved);
      } catch (err) {
        console.error('Error parsing custom texts:', err);
      }
    }

    const defaultStories: CustomText[] = [
      {
        id: 'custom_default_motivational_full',
        title: '🌟 20 Motivational Stories (Complete Collection)',
        content: MOTIVATIONAL_STORIES_FULL_SCRIPT,
        createdAt: 'Preset',
      },
      ...MOTIVATIONAL_STORIES.map((s, idx) => ({
        id: `custom_default_story_${idx + 1}`,
        title: `📖 Story ${s.title}`,
        content: s.content,
        createdAt: 'Preset',
      })),
      {
        id: 'custom_default_interview_full',
        title: '💼 20 Interview Practice Answers (Complete Collection)',
        content: INTERVIEW_PRACTICE_FULL_SCRIPT,
        createdAt: 'Preset',
      },
      ...INTERVIEW_PRACTICE_QUESTIONS.map((q, idx) => ({
        id: `custom_default_interview_${idx + 1}`,
        title: `💼 Interview Q${idx + 1}: ${q.title}`,
        content: q.content,
        createdAt: 'Preset',
      })),
      {
        id: 'custom_default_icebreakers',
        title: '💬 200 Questions Icebreaker Script',
        content: ICEBREAKER_QUESTIONS_SCRIPT,
        createdAt: 'Preset',
      }
    ];

    let updatedList = [...list];
    let changed = false;

    for (const defItem of defaultStories) {
      const existingIdx = updatedList.findIndex((item) => item.id === defItem.id);
      if (existingIdx === -1) {
        updatedList.push(defItem);
        changed = true;
      } else if (defItem.id.startsWith('custom_default_') && (updatedList[existingIdx].content !== defItem.content || updatedList[existingIdx].title !== defItem.title)) {
        updatedList[existingIdx] = defItem;
        changed = true;
      }
    }

    if (changed) {
      localStorage.setItem('typing-custom-passages', JSON.stringify(updatedList));
    }

    setCustomTexts(updatedList);
  }, [isOpen]);

  if (!isOpen) return null;

  const saveCustomTexts = (list: CustomText[]) => {
    setCustomTexts(list);
    localStorage.setItem('typing-custom-passages', JSON.stringify(list));
  };

  const handleAddText = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedContent = newContent.trim();
    if (!trimmedContent) {
      setErrorMsg('Please paste or write some text to practice!');
      return;
    }

    if (trimmedContent.length < 10) {
      setErrorMsg('The passage must be at least 10 characters long to make a proper test.');
      return;
    }

    const trimmedTitle = newTitle.trim() || `Custom Practice #${customTexts.length + 1}`;

    const newEntry: CustomText = {
      id: `custom_${Date.now()}`,
      title: trimmedTitle,
      content: trimmedContent,
      createdAt: new Date().toLocaleDateString(),
    };

    const updatedList = [newEntry, ...customTexts];
    saveCustomTexts(updatedList);

    // Reset inputs
    setNewTitle('');
    setNewContent('');

    // Select the newly added text immediately
    onSelectCustomText(newEntry.content);
    onClose();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customTexts.filter((item) => item.id !== id);
    saveCustomTexts(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="custom-text-modal-overlay">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Content card */}
      <div
        id="custom-text-modal-content"
        className="relative bg-theme-card border border-theme-muted/30 rounded-2xl w-full max-w-2xl p-6 shadow-2xl z-10 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-theme-muted/20">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-theme-accent" />
            <h3 className="text-lg font-semibold text-theme-correct font-sans">Custom Practice Passages</h3>
          </div>
          <button
            onClick={onClose}
            className="text-theme-muted hover:text-theme-correct hover:bg-theme-muted/20 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable contents */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* Create new custom passage */}
          <form onSubmit={handleAddText} className="space-y-3.5 bg-theme-bg/40 p-4 rounded-xl border border-theme-muted/20">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-theme-correct">Create New Custom Test</h4>
              {onOpenCameraModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCameraModal();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-theme-accent/10 border border-theme-accent/30 text-theme-accent hover:bg-theme-accent/20 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan with Camera (OCR)</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-theme-muted tracking-wider uppercase">Title (Optional)</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Shakespeare Prose, JavaScript practice..."
                className="w-full bg-theme-bg border border-theme-muted/20 rounded-lg px-3 py-2 text-sm text-theme-text placeholder-theme-muted/50 focus:outline-none focus:border-theme-accent/50 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-theme-muted tracking-wider uppercase">Paste Text Passage</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={4}
                placeholder="Paste the text you want to practice typing here..."
                className="w-full bg-theme-bg border border-theme-muted/20 rounded-lg px-3 py-2 text-sm text-theme-text placeholder-theme-muted/50 focus:outline-none focus:border-theme-accent/50 transition-colors font-mono"
              />
            </div>

            {errorMsg && <p className="text-theme-wrong text-xs font-medium">{errorMsg}</p>}

            <button
              type="submit"
              className="w-full bg-theme-accent hover:bg-theme-accent-hover text-theme-bg font-medium text-sm py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Save & Start Typing</span>
            </button>
          </form>

          {/* List of saved passages */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-theme-correct">Saved Custom Passages</h4>

            {customTexts.length === 0 ? (
              <div className="text-center py-8 bg-theme-bg/20 rounded-xl border border-dashed border-theme-muted/20 text-theme-muted text-sm">
                No custom texts saved yet. Use the form above to add one!
              </div>
            ) : (
              <div className="grid gap-2" id="custom-text-list">
                {customTexts.map((item) => {
                  const isCurrentlyActive = currentSelectedId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectCustomText(item.content);
                        onClose();
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                        isCurrentlyActive
                          ? 'bg-theme-accent/10 border-theme-accent/40 hover:bg-theme-accent/15'
                          : 'bg-theme-bg/20 border-theme-muted/20 hover:border-theme-muted/40 hover:bg-theme-bg/30'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-theme-correct truncate">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-theme-muted font-mono bg-theme-card px-1.5 py-0.5 rounded-md">
                            {item.createdAt}
                          </span>
                        </div>
                        <p className="text-xs text-theme-muted truncate font-mono mt-1">
                          {item.content}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {isCurrentlyActive && (
                          <span className="text-xs font-semibold text-theme-accent flex items-center gap-0.5 bg-theme-accent/10 px-2 py-0.5 rounded-full mr-1.5">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          className="text-theme-muted hover:text-theme-wrong hover:bg-theme-wrong/15 p-2 rounded-lg transition-all"
                          title="Delete Custom Passage"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-theme-muted/20 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-theme-muted/30 text-theme-text/80 hover:text-theme-text rounded-lg text-sm hover:bg-theme-muted/10 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
