import React from 'react';
import { Link } from 'react-router-dom';
import { IoDocumentTextOutline } from "react-icons/io5";
import { PiCards } from "react-icons/pi";
import { RiQuestionMark } from "react-icons/ri";
import '../styles/pages/HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="desktop-home">
      <div className="app-header">
        <div className="app-title">
          <h1>Walnut</h1>
          <p className="subtitle">Remeber Everything</p>
        </div>
      </div>
      
      <div className="app-dashboard">
        <div className="quick-actions">
          <Link to="/notes" className="action-card">
            <div className="action-icon">
              <IoDocumentTextOutline />
            </div>
            <div className="action-label">Notes</div>
            <p className="action-description">Create and manage your study notes</p>
          </Link>
          
          <Link to="/flashcards" className="action-card">
            <div className="action-icon">
              <PiCards />
            </div>
            <div className="action-label">Flashcards</div>
            <p className="action-description">Create flashcards from your notes</p>
          </Link>
          
          <Link to="/quiz" className="action-card">
            <div className="action-icon">
              <RiQuestionMark />
            </div>
            <div className="action-label">Quizzes</div>
            <p className="action-description">Test your knowledge with quizzes</p>
          </Link>
        </div>
        
        <div className="home-footer">
          <p>Select an option above to get started</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 