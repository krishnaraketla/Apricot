import React, { useState, useEffect, useRef } from 'react';
import QuizQuestion from '../components/QuizQuestion';
import PerplexityService from '../services/PerplexityService';
import useElectron from '../hooks/useElectron';
import '../styles/pages/QuizPage.css';

interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Note {
  id: string;
  title: string;
  content: string;
}

const QuizPage: React.FC = () => {
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [totalAnswered, setTotalAnswered] = useState<number>(0);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { saveData, loadData } = useElectron();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load notes from storage
        const savedNotes = await loadData('apricot-notes');
        if (savedNotes) {
          setNotes(savedNotes);
        }

        // Load quiz questions from storage
        const savedQuizQuestions = await loadData('apricot-quiz-questions');
        if (savedQuizQuestions) {
          setQuizQuestions(savedQuizQuestions);
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

  const handleGenerateQuiz = async () => {
    if (!selectedNoteId) return;
    
    const selectedNote = notes.find(note => note.id === selectedNoteId);
    if (!selectedNote) return;
    
    setIsGenerating(true);
    
    try {
      const generatedQuizQuestions = await PerplexityService.generateQuiz(selectedNote.content);
      
      const newQuizQuestions = generatedQuizQuestions.map(question => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer
      }));
      
      setQuizQuestions(newQuizQuestions);
      setScore(0);
      setTotalAnswered(0);
      await saveData('apricot-quiz-questions', newQuizQuestions);
    } catch (error) {
      console.error('Error generating quiz questions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }
    setTotalAnswered(prevTotal => prevTotal + 1);
  };

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
    setDropdownOpen(false);
  };

  const getSelectedNoteName = () => {
    if (!selectedNoteId) return "Select a note to generate a quiz";
    const selectedNote = notes.find(note => note.id === selectedNoteId);
    return selectedNote ? selectedNote.title : "Select a note to generate a quiz";
  };

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <h1>Quiz</h1>
        <div className="quiz-controls">
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
            onClick={handleGenerateQuiz}
            disabled={!selectedNoteId || isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Quiz'}
          </button>
        </div>
      </div>

      {quizQuestions.length > 0 && (
        <div className="quiz-score">
          <p>
            Score: <span className="score-value">{score}</span> / {totalAnswered} 
            {totalAnswered > 0 && (
              <span className="score-percentage">
                ({Math.round((score / totalAnswered) * 100)}%)
              </span>
            )}
          </p>
        </div>
      )}

      {quizQuestions.length === 0 ? (
        <div className="empty-quiz">
          <p>You don't have any quiz questions yet. Select a note and generate a quiz to get started!</p>
        </div>
      ) : (
        <div className="quiz-questions-container">
          {quizQuestions.map(question => (
            <QuizQuestion 
              key={question.id}
              question={question.question}
              options={question.options}
              correctAnswer={question.correctAnswer}
              onAnswerSubmit={handleAnswerSubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizPage; 