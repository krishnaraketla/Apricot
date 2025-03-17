import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Navbar.css';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Walnut</span>
          <span className="logo-subtitle">Study Assistant</span>
        </Link>
        <ul className="navbar-links">
          <li>
            <Link to="/" className="navbar-link">Home</Link>
          </li>
          <li>
            <Link to="/notes" className="navbar-link">Notes</Link>
          </li>
          <li>
            <Link to="/flashcards" className="navbar-link">Flashcards</Link>
          </li>
          <li>
            <Link to="/quiz" className="navbar-link">Quiz</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 