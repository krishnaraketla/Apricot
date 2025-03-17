import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import '../styles/components/NoteEditor.css';

interface NoteEditorProps {
  initialContent?: string;
  initialTitle?: string;
  onSave: (content: string, title: string) => void;
  onCreateFlashcards?: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ 
  initialContent = '', 
  initialTitle = 'Untitled Note',
  onSave,
  onCreateFlashcards
}) => {
  // Use state initialization with useMemo to ensure props are captured at mount time
  const [content, setContent] = useState<string>(() => initialContent);
  const [title, setTitle] = useState<string>(() => initialTitle);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasFocusRef = useRef<boolean>(false);
  
  // Track component instance with an instance ID for debugging
  const instanceId = useMemo(() => Math.random().toString(36).substring(2, 9), []);
  
  // Mount logging
  useEffect(() => {
    console.log(`[NoteEditor ${instanceId}] Mounted with initial content:`, initialContent?.substring(0, 20));
    console.log(`[NoteEditor ${instanceId}] Mounted with initial title:`, initialTitle);
    
    // Clean up timeout on unmount
    return () => {
      console.log(`[NoteEditor ${instanceId}] Unmounting, clearing timeout`);
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
    };
  }, [instanceId, initialContent, initialTitle, saveTimeout]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // This effect will run when initialContent changes
  useEffect(() => {
    console.log(`[NoteEditor ${instanceId}] initialContent changed:`, initialContent?.substring(0, 20));
    setContent(initialContent);
  }, [initialContent, instanceId]);

  // This effect will run when initialTitle changes
  useEffect(() => {
    console.log(`[NoteEditor ${instanceId}] initialTitle changed:`, initialTitle);
    setTitle(initialTitle);
  }, [initialTitle, instanceId]);

  // Track focus state of the textarea
  useEffect(() => {
    const handleFocus = () => {
      hasFocusRef.current = true;
    };
    
    const handleBlur = () => {
      hasFocusRef.current = false;
    };
    
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('focus', handleFocus);
      textarea.addEventListener('blur', handleBlur);
      
      return () => {
        textarea.removeEventListener('focus', handleFocus);
        textarea.removeEventListener('blur', handleBlur);
      };
    }
  }, []);

  const autoSave = useCallback((newContent: string, newTitle: string) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    const timeout = setTimeout(() => {
      console.log(`[NoteEditor ${instanceId}] Auto-saving content:`, newContent?.substring(0, 20));
      console.log(`[NoteEditor ${instanceId}] Auto-saving title:`, newTitle);
      
      // Store the current cursor position
      const selectionStart = textareaRef.current?.selectionStart;
      const selectionEnd = textareaRef.current?.selectionEnd;
      const wasFocused = hasFocusRef.current;
      
      // Save the note
      onSave(newContent, newTitle);
      
      // In the next tick, restore focus and cursor position if it was focused before
      if (wasFocused) {
        requestAnimationFrame(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            if (selectionStart !== undefined && selectionEnd !== undefined) {
              textareaRef.current.selectionStart = selectionStart;
              textareaRef.current.selectionEnd = selectionEnd;
            }
          }
        });
      }
    }, 1000);
    
    setSaveTimeout(timeout);
  }, [saveTimeout, onSave, instanceId]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    autoSave(newContent, title);
  }, [autoSave, title]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    autoSave(content, newTitle);
  }, [autoSave, content]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const newContent = content + pastedText;
    setContent(newContent);
    autoSave(newContent, title);
    e.preventDefault();
  }, [autoSave, content, title]);

  const toggleDropdown = useCallback(() => {
    setShowDropdown(prev => !prev);
  }, []);

  return (
    <div className="note-editor">
      <div className="note-editor-header">
        <input 
          type="text" 
          className="note-title-input" 
          value={title} 
          onChange={handleTitleChange}
          placeholder="Note Title"
        />
        <div className="dropdown-container" ref={dropdownRef}>
          <button 
            className="dropdown-btn"
            onClick={toggleDropdown}
            title="Options"
          >
            <span className="ellipsis">•••</span>
          </button>
          {showDropdown && (
            <div className="dropdown-menu">
              {onCreateFlashcards && (
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    onCreateFlashcards();
                    setShowDropdown(false);
                  }}
                >
                  Create Flashcards
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <textarea 
        ref={textareaRef}
        className="note-content-area"
        value={content}
        onChange={handleContentChange}
        onPaste={handlePaste}
        placeholder="Start typing or paste your notes here..."
      />
    </div>
  );
};

export default React.memo(NoteEditor); 