import React, { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import NoteEditor, { getPlainTextFromSlate } from '../components/NoteEditor';
import PerplexityService from '../services/PerplexityService';
import useElectron from '../hooks/useElectron';
import useScrollContainment from '../hooks/useScrollContainment';
import '../styles/pages/NotesPage.css';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPending, startTransition] = useTransition();
  const { saveData, loadData } = useElectron();
  const noteRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  const notesListRef = useRef<HTMLDivElement>(null);
  
  // Use the scroll containment hook to prevent scroll events from propagating
  useScrollContainment(notesListRef);

  useEffect(() => {
    // Load notes from storage on component mount
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const savedNotes = await loadData('walnut-notes');
        if (savedNotes && Array.isArray(savedNotes)) {
          // Ensure dates are properly parsed from JSON
          const parsedNotes = savedNotes.map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt)
          }));
          
          // Sort notes from most recent to oldest
          const sortedNotes = parsedNotes.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          
          setNotes(sortedNotes);
          
          if (sortedNotes.length > 0) {
            // Select the most recent note (first in sorted array)
            setSelectedNote(sortedNotes[0]);
          }
        }
      } catch (error) {
        console.error('Error loading saved notes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, []); // Remove loadData from dependencies to prevent unnecessary reloads

  // Enhanced debugging logs
  useEffect(() => {
    console.log('Selected note changed:', selectedNote?.id, selectedNote?.title);
  }, [selectedNote]);

  useEffect(() => {
    console.log('Notes list updated, count:', notes.length);
  }, [notes]);

  const handleSaveNote = useCallback(async (content: string, title: string) => {
    if (selectedNote) {
      // Update existing note
      const updatedNote = {
        ...selectedNote,
        title,
        content,
        updatedAt: new Date()
      };
      
      // Update the note and resort the array
      const updatedNotes = notes
        .map(note => note.id === selectedNote.id ? updatedNote : note)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      
      setNotes(updatedNotes);
      setSelectedNote(updatedNote);
      await saveData('walnut-notes', updatedNotes);
    } else {
      // Create new note
      const newNote: Note = {
        id: Date.now().toString(),
        title: title || 'Untitled Note',
        content,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add new note at the beginning (most recent)
      const newNotes = [newNote, ...notes];
      setNotes(newNotes);
      setSelectedNote(newNote);
      await saveData('walnut-notes', newNotes);
    }
  }, [notes, selectedNote, saveData]);

  const handleAddNote = useCallback(() => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const newNotes = [newNote, ...notes];
    setNotes(newNotes);
    setSelectedNote(newNote);
    saveData('walnut-notes', newNotes);
    
    // Allow a brief delay for the DOM to update before scrolling
    setTimeout(() => {
      if (notesListRef.current && noteRefs.current[newNote.id]) {
        // Smoothly scroll to the new note at the top
        noteRefs.current[newNote.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }, [notes, saveData]);

  const handleNoteSelect = useCallback((note: Note) => {
    console.log('Note selected:', note.id, note.title);
    setSelectedNote(note);
  }, []);

  const handleDeleteNote = useCallback(async (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    
    if (selectedNote && selectedNote.id === id) {
      // If we deleted the selected note, select the most recent one (first in the sorted array)
      setSelectedNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
    }
    
    await saveData('walnut-notes', updatedNotes);
  }, [notes, selectedNote, saveData]);

  const handleCreateFlashcards = useCallback(async () => {
    if (!selectedNote) return;
    
    // Navigate to the flashcards page with the selected note's ID
    window.location.href = `/flashcards?noteId=${selectedNote.id}`;
  }, [selectedNote]);

  const formatDate = useCallback((date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  const formatNotePreview = (content: string): string => {
    try {
      // Try to parse as JSON (for Slate format)
      const parsed = JSON.parse(content);
      return getPlainTextFromSlate(parsed);
    } catch (e) {
      // If it's not valid JSON, return as is (legacy plain text format)
      return content;
    }
  };

  // Only focus on first note when notes list first loads, not on every selection change
  useEffect(() => {
    if (notes.length > 0 && !selectedNote) {
      setSelectedNote(notes[0]);
    }
  }, [notes, selectedNote]);

  if (isLoading) {
    return (
      <div className="notes-page loading">
        <div className="loading-message">
          <p>Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-page">
      <div className="notes-sidebar">
        <div className="notes-sidebar-header">
          <h2>Notes</h2>
          <button 
            className="add-note-btn"
            onClick={handleAddNote}
          >
            + New Note
          </button>
        </div>
        <div className="notes-list" ref={notesListRef}>
          {notes.length === 0 ? (
            <div className="empty-notes-message">
              <p>You don't have any notes yet. Create one to get started!</p>
            </div>
          ) : (
            notes.map((note) => {
              const isSelected = selectedNote && selectedNote.id === note.id;
              
              return (
                <div
                  key={note.id}
                  ref={(el) => noteRefs.current[note.id] = el}
                  className={`note-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleNoteSelect(note)}
                  tabIndex={0}
                >
                  <div className="note-item-details">
                    <h3 className="note-item-title">
                      {note.title || 'Untitled Note'}
                    </h3>
                    <p className="note-item-preview">
                      {formatNotePreview(note.content)?.substring(0, 100) || 'No content'}
                    </p>
                    <span className="note-item-date">{formatDate(new Date(note.updatedAt))}</span>
                  </div>
                  <button 
                    className="delete-note-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <div className="notes-editor-container">
        {selectedNote ? (
          <NoteEditor 
            key={selectedNote.id}
            initialContent={selectedNote.content}
            initialTitle={selectedNote.title}
            onSave={handleSaveNote}
            onCreateFlashcards={handleCreateFlashcards}
          />
        ) : (
          <div className="empty-editor-message">
            <p>Select a note from the sidebar or create a new one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesPage; 