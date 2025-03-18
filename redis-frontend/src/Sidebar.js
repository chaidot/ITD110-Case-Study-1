import React from 'react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, handleLogout }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <img src="/brgy-logo.jpg" alt="Barangay Logo" className="sidebar-logo" />
        </div>
        <h3>Barangay Del Carmen</h3>
      </div>
      
      <div className="sidebar-menu">
        <div 
          className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <i className="fas fa-tachometer-alt"></i>
          <span>Dashboard</span>
        </div>
        
        <div 
          className={`sidebar-item ${activeTab === 'residents' ? 'active' : ''}`}
          onClick={() => setActiveTab('residents')}
        >
          <i className="fas fa-users"></i>
          <span>Residents List</span>
        </div>
        
        <div 
          className={`sidebar-item ${activeTab === 'visualization' ? 'active' : ''}`}
          onClick={() => setActiveTab('visualization')}
        >
          <i className="fas fa-chart-bar"></i>
          <span>Data Visualization</span>
        </div>
        
        <div className="sidebar-item" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;