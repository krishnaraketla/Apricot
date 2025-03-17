import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NotesPage from './pages/NotesPage';
import FlashcardsPage from './pages/FlashcardsPage';
import QuizPage from './pages/QuizPage';
import PageLayout from './components/PageLayout';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/notes" element={
            <PageLayout>
              <NotesPage />
            </PageLayout>
          } />
          <Route path="/flashcards" element={
            <PageLayout>
              <FlashcardsPage />
            </PageLayout>
          } />
          <Route path="/quiz" element={
            <PageLayout>
              <QuizPage />
            </PageLayout>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 