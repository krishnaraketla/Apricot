import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/NavigationHeader.css';

interface NavigationHeaderProps {
  title: string;
  showHomeLink?: boolean;
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({ 
  title, 
  showHomeLink = true 
}) => {
  return (
    <div className="navigation-header">
      <div className="header-content">
        <h1 className="page-title">{title}</h1>
        {showHomeLink && (
          <Link to="/" className="home-link">
            Home
          </Link>
        )}
      </div>
      <div className="header-divider"></div>
    </div>
  );
};

export default NavigationHeader; 