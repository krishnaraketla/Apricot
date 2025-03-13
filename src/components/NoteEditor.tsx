import React, { useState, useEffect, useMemo, useCallback } from 'react';
import '../styles/components/NoteEditor.css';

interface NoteEditorProps {
  initialContent?: string;
  initialTitle?: string;
  onSave: (content: string, title: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ 
  initialContent = '', 
  initialTitle = 'Untitled Note',
  onSave 
}) => {
  // Use state initialization with useMemo to ensure props are captured at mount time
  const [content, setContent] = useState<string>(() => initialContent);
  const [title, setTitle] = useState<string>(() => initialTitle);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
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

  const autoSave = useCallback((newContent: string, newTitle: string) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    const timeout = setTimeout(() => {
      console.log(`[NoteEditor ${instanceId}] Auto-saving content:`, newContent?.substring(0, 20));
      console.log(`[NoteEditor ${instanceId}] Auto-saving title:`, newTitle);
      onSave(newContent, newTitle);
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
      </div>
      <textarea 
        className="note-content-area"
        value={content}
        onChange={handleContentChange}
        onPaste={handlePaste}
        placeholder="Start typing or paste your notes here..."
      />
      <div className="note-editor-tools">
        <button className="tool-btn" title="Create Flashcards">
          Create Flashcards
        </button>
        <button className="tool-btn" title="Generate Quiz">
          Generate Quiz
        </button>
        <button className="tool-btn" title="Organize Content">
          Organize Content
        </button>
      </div>
    </div>
  );
};

export default React.memo(NoteEditor); 