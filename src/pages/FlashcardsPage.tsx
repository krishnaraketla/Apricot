import React, { useState, useEffect, useRef } from 'react';
import FlashCard from '../components/FlashCard';
import PerplexityService from '../services/PerplexityService';
import useElectron from '../hooks/useElectron';
import '../styles/pages/FlashcardsPage.css';

interface FlashCardItem {
  id: string;
  front: string;
  back: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
}

const FlashcardsPage: React.FC = () => {
  const [flashcards, setFlashcards] = useState<FlashCardItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { saveData, loadData } = useElectron();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load notes from storage
        const savedNotes = await loadData('walnut-notes');
        if (savedNotes) {
          setNotes(savedNotes);
        }

        // Load flashcards from storage
        const savedFlashcards = await loadData('walnut-flashcards');
        if (savedFlashcards) {
          setFlashcards(savedFlashcards);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    fetchData();
  }, [loadData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGenerateFlashcards = async () => {
    if (!selectedNoteId) return;
    
    const selectedNote = notes.find(note => note.id === selectedNoteId);
    if (!selectedNote) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const generatedFlashcards = await PerplexityService.generateFlashcards(selectedNote.content);
      
      const newFlashcards = generatedFlashcards.map(card => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        front: card.front,
        back: card.back
      }));
      
      const updatedFlashcards = [...flashcards, ...newFlashcards];
      setFlashcards(updatedFlashcards);
      await saveData('walnut-flashcards', updatedFlashcards);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate flashcards. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteFlashcard = async (id: string) => {
    const updatedFlashcards = flashcards.filter(card => card.id !== id);
    setFlashcards(updatedFlashcards);
    await saveData('walnut-flashcards', updatedFlashcards);
  };

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setDropdownOpen(false);
  };

  const getSelectedNoteName = () => {
    if (!selectedNoteId) return "Select a note to generate flashcards";
    const selectedNote = notes.find(note => note.id === selectedNoteId);
    return selectedNote ? selectedNote.title : "Select a note to generate flashcards";
  };

  return (
    <div className="flashcards-page">
      <div className="flashcards-header">
        <h1>Flashcards</h1>
        <div className="flashcards-controls">
          <div className="custom-dropdown" ref={dropdownRef}>
            <div 
              className="dropdown-selected" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span>{getSelectedNoteName()}</span>
              <svg className={`dropdown-icon ${dropdownOpen ? 'open' : ''}`} viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            {dropdownOpen && (
              <div className="dropdown-options">
                {notes.length > 0 ? (
                  notes.map(note => (
                    <div 
                      key={note.id} 
                      className={`dropdown-option ${note.id === selectedNoteId ? 'selected' : ''}`}
                      onClick={() => handleSelectNote(note.id)}
                    >
                      {note.title}
                    </div>
                  ))
                ) : (
                  <div className="dropdown-option disabled">No notes available</div>
                )}
              </div>
            )}
          </div>
          <button 
            className="generate-btn"
            onClick={handleGenerateFlashcards}
            disabled={!selectedNoteId || isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Flashcards'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {flashcards.length === 0 ? (
        <div className="empty-flashcards">
          <p>You don't have any flashcards yet. Select a note and generate flashcards to get started!</p>
        </div>
      ) : (
        <div className="flashcards-grid">
          {flashcards.map(card => (
            <div key={card.id} className="flashcard-container">
              <FlashCard front={card.front} back={card.back} />
              <button 
                className="delete-flashcard-btn"
                onClick={() => handleDeleteFlashcard(card.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage; 