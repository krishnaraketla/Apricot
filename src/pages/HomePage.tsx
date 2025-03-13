import React from 'react';
import { Link } from 'react-router-dom';
import { IoDocumentTextOutline } from "react-icons/io5";
import { PiCards } from "react-icons/pi";
import { RiQuestionMark } from "react-icons/ri";
import '../styles/pages/HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="desktop-home">
      <div className="app-dashboard">
        <div className="quick-actions">
          <Link to="/notes" className="action-card">
            <div className="action-icon">
              <IoDocumentTextOutline />
            </div>
            <div className="action-label">Notes</div>
          </Link>
          
          <Link to="/flashcards" className="action-card">
            <div className="action-icon">
              <PiCards />
            </div>
            <div className="action-label">Flashcards</div>
          </Link>
          
          <Link to="/quiz" className="action-card">
            <div className="action-icon">
              <RiQuestionMark />
            </div>
            <div className="action-label">Quizzes</div>
          </Link>
        </div>
        
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="empty-state">
              No recent activity. Start by creating some notes!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 