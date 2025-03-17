import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoDocumentTextOutline, IoHome, IoMenu, IoChevronBack } from "react-icons/io5";
import { PiCards } from "react-icons/pi";
import { RiQuestionMark } from "react-icons/ri";
import '../styles/components/Sidebar.css';

interface SidebarProps {
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed: propCollapsed, 
  setCollapsed: propSetCollapsed 
}) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Allow both internal state or parent-controlled state
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(false);
  
  const collapsed = propCollapsed !== undefined ? propCollapsed : internalCollapsed;
  const setCollapsed = propSetCollapsed || setInternalCollapsed;
  
  // Toggle the sidebar collapse state
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(collapsed));
  }, [collapsed]);

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null && propCollapsed === undefined) {
      setInternalCollapsed(savedState === 'true');
    }
  }, [propCollapsed]);
  
  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <h2>{collapsed ? 'A' : 'Apricot'}</h2>
        </Link>
        <button 
          className="sidebar-toggle" 
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <IoMenu /> : <IoChevronBack />}
        </button>
      </div>
      
      <div className="sidebar-nav">
        <Link to="/" className={`sidebar-nav-item ${currentPath === '/' ? 'active' : ''}`}>
          <IoHome className="sidebar-icon" />
          <span className="nav-text">Home</span>
        </Link>
        
        <Link to="/notes" className={`sidebar-nav-item ${currentPath === '/notes' ? 'active' : ''}`}>
          <IoDocumentTextOutline className="sidebar-icon" />
          <span className="nav-text">Notes</span>
        </Link>
        
        <Link to="/flashcards" className={`sidebar-nav-item ${currentPath === '/flashcards' ? 'active' : ''}`}>
          <PiCards className="sidebar-icon" />
          <span className="nav-text">Flashcards</span>
        </Link>
        
        <Link to="/quiz" className={`sidebar-nav-item ${currentPath === '/quiz' ? 'active' : ''}`}>
          <RiQuestionMark className="sidebar-icon" />
          <span className="nav-text">Quiz</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar; 