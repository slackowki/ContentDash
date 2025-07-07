import React, { useState } from 'react'
import Analytics from './Analytics'
import Search from './Search'
import './Dashboard.css'

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState('analytics')

  const renderPage = () => {
    switch (currentPage) {
      case 'analytics':
        return <Analytics />
      case 'search':
        return <Search />
      default:
        return <Analytics />
    }
  }

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">TikTok Scraper</h1>
          <p className="sidebar-subtitle">Analytics & Search Platform</p>
        </div>
        
        <div className="sidebar-nav">
          <div 
            className={`nav-item ${currentPage === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentPage('analytics')}
          >
            <span className="nav-icon">📊</span>
            Analytics
          </div>
          <div 
            className={`nav-item ${currentPage === 'search' ? 'active' : ''}`}
            onClick={() => setCurrentPage('search')}
          >
            <span className="nav-icon">🔍</span>
            Search
          </div>
        </div>
        
        <div className="sidebar-footer">
          <button className="new-search-btn" onClick={() => setCurrentPage('search')}>
            ✨ New Search
          </button>
        </div>
      </div>
      
      <div className="main-content">
        {renderPage()}
      </div>
    </div>
  )
}

export default Dashboard 