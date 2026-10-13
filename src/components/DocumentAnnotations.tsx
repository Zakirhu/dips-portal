import React, { useState } from 'react';
import { 
  Highlighter, 
  StickyNote as StickyNoteIcon, 
  Trash2, 
  Plus, 
  X, 
  Check, 
  Palette, 
  MessageSquare,
  CornerDownRight
} from 'lucide-react';

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'purple' | 'pink';

export interface TextHighlight {
  id: string;
  materialId: string;
  text: string;
  color: HighlightColor;
  createdAt: string;
  paragraphIndex: number;
}

export interface StickyNote {
  id: string;
  materialId: string;
  text: string;
  color: HighlightColor;
  createdAt: string;
  paragraphIndex?: number;
}

export const COLOR_CLASSES: Record<HighlightColor, { bg: string; text: string; border: string; preview: string; name: string }> = {
  yellow: {
    bg: 'bg-amber-100/90 text-amber-950',
    text: 'text-amber-800',
    border: 'border-amber-300',
    preview: 'bg-amber-300',
    name: 'Yellow'
  },
  green: {
    bg: 'bg-emerald-100/90 text-emerald-950',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    preview: 'bg-emerald-400',
    name: 'Green'
  },
  blue: {
    bg: 'bg-blue-100/90 text-blue-950',
    text: 'text-blue-800',
    border: 'border-blue-300',
    preview: 'bg-blue-400',
    name: 'Blue'
  },
  purple: {
    bg: 'bg-purple-100/90 text-purple-950',
    text: 'text-purple-800',
    border: 'border-purple-300',
    preview: 'bg-purple-400',
    name: 'Purple'
  },
  pink: {
    bg: 'bg-pink-100/90 text-pink-950',
    text: 'text-pink-800',
    border: 'border-pink-300',
    preview: 'bg-pink-400',
    name: 'Pink'
  }
};

interface AnnotationToolbarProps {
  activeColor: HighlightColor;
  onColorChange: (color: HighlightColor) => void;
  isHighlightMode: boolean;
  onToggleHighlightMode: () => void;
  stickyNotesCount: number;
  highlightsCount: number;
  onOpenNewNoteModal: () => void;
  onToggleNotesDrawer: () => void;
  isNotesDrawerOpen: boolean;
  onClearAllAnnotations: () => void;
}

export const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
  activeColor,
  onColorChange,
  isHighlightMode,
  onToggleHighlightMode,
  stickyNotesCount,
  highlightsCount,
  onOpenNewNoteModal,
  onToggleNotesDrawer,
  isNotesDrawerOpen,
  onClearAllAnnotations
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-white">
      {/* Left tools: Highlight mode + Color picker */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleHighlightMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isHighlightMode
              ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/30 ring-2 ring-amber-300/50'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
          }`}
          title="Toggle highlight tool (click or select text in notes)"
        >
          <Highlighter className="w-3.5 h-3.5" />
          <span>{isHighlightMode ? 'Highlighting Active' : 'Highlight Tool'}</span>
        </button>

        {/* Color Picker dropdown/row */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700">
          {(Object.keys(COLOR_CLASSES) as HighlightColor[]).map(color => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className={`w-5 h-5 rounded-full ${COLOR_CLASSES[color].preview} transition-transform ${
                activeColor === color ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-slate-900' : 'opacity-70 hover:opacity-100'
              }`}
              title={`Use ${COLOR_CLASSES[color].name} highlight`}
            />
          ))}
        </div>
      </div>

      {/* Right tools: Add Sticky Note + Drawer Toggle + Clear */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenNewNoteModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Sticky Note</span>
        </button>

        <button
          onClick={onToggleNotesDrawer}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            isNotesDrawerOpen
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
          }`}
        >
          <StickyNoteIcon className="w-3.5 h-3.5 text-yellow-300" />
          <span>Notes ({stickyNotesCount})</span>
        </button>

        {(highlightsCount > 0 || stickyNotesCount > 0) && (
          <button
            onClick={() => {
              if (window.confirm('Clear all highlights and sticky notes for this document?')) {
                onClearAllAnnotations();
              }
            }}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
            title="Clear all annotations"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

interface StickyNotesDrawerProps {
  notes: StickyNote[];
  isOpen: boolean;
  onClose: () => void;
  onDeleteNote: (id: string) => void;
  onAddNote: (text: string, color: HighlightColor) => void;
}

export const StickyNotesDrawer: React.FC<StickyNotesDrawerProps> = ({
  notes,
  isOpen,
  onClose,
  onDeleteNote,
  onAddNote
}) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedColor, setSelectedColor] = useState<HighlightColor>('yellow');

  if (!isOpen) return null;

  return (
    <div className="w-80 shrink-0 border-l border-slate-200 bg-amber-50/40 p-4 overflow-y-auto flex flex-col space-y-4">
      <div className="flex items-center justify-between border-b border-amber-200 pb-3">
        <div className="flex items-center gap-2">
          <StickyNoteIcon className="w-4 h-4 text-amber-600" />
          <h3 className="font-bold text-slate-900 text-sm">Study Sticky Notes</h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Add Note Card */}
      <div className="p-3 bg-white rounded-2xl border border-amber-200 shadow-2xs space-y-2">
        <textarea
          value={newNoteText}
          onChange={e => setNewNoteText(e.target.value)}
          placeholder="Jot down a quick revision formula or exam reminder..."
          rows={3}
          className="w-full text-xs p-2 rounded-xl bg-amber-50/50 border border-amber-200/80 focus:outline-hidden focus:border-amber-400 resize-none text-slate-800"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {(Object.keys(COLOR_CLASSES) as HighlightColor[]).map(c => (
              <button
                key={c}
                onClick={() => setSelectedColor(c)}
                className={`w-4 h-4 rounded-full ${COLOR_CLASSES[c].preview} ${
                  selectedColor === c ? 'ring-2 ring-slate-800' : 'opacity-70'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (newNoteText.trim()) {
                onAddNote(newNoteText.trim(), selectedColor);
                setNewNoteText('');
              }
            }}
            disabled={!newNoteText.trim()}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Post Note
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-slate-400 space-y-1">
            <StickyNoteIcon className="w-8 h-8 mx-auto text-amber-300" />
            <p className="text-xs">No sticky notes attached yet.</p>
            <p className="text-[11px] text-slate-400">Add notes for key definitions, syntax, or tricky questions.</p>
          </div>
        ) : (
          notes.map(note => {
            const colorMeta = COLOR_CLASSES[note.color] || COLOR_CLASSES.yellow;

            return (
              <div
                key={note.id}
                className={`p-3.5 rounded-2xl border shadow-2xs space-y-2 relative group ${colorMeta.bg} ${colorMeta.border}`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-semibold text-slate-700">Sticky Note</span>
                  <div className="flex items-center gap-1">
                    <span>{note.createdAt}</span>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 hover:text-red-600 rounded opacity-60 hover:opacity-100 transition-opacity"
                      title="Delete note"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-wrap">
                  {note.text}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
