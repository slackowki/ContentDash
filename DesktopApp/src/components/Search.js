import React, { useState } from 'react'
import './Search.css'

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [searchHistory, setSearchHistory] = useState([
    { id: 1, query: 'olive app', date: '2024-07-03', status: 'completed', videoCount: 450 },
    { id: 2, query: 'viral dance', date: '2024-07-02', status: 'completed', videoCount: 320 },
    { id: 3, query: 'cooking tips', date: '2024-07-01', status: 'completed', videoCount: 180 }
  ])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchResults(null)

    // Simulate API call to Python backend
    try {
      // This would call your Python script
      setTimeout(() => {
        const mockResults = {
          query: searchQuery,
          videosFound: Math.floor(Math.random() * 500) + 100,
          status: 'completed',
          filename: `${searchQuery.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
        }
        
        setSearchResults(mockResults)
        setSearchHistory(prev => [{
          id: Date.now(),
          query: searchQuery,
          date: new Date().toISOString().split('T')[0],
          status: 'completed',
          videoCount: mockResults.videosFound
        }, ...prev])
        
        setIsSearching(false)
        setSearchQuery('')
      }, 3000)
    } catch (error) {
      console.error('Search failed:', error)
      setIsSearching(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✅'
      case 'running': return '🔄'
      case 'failed': return '❌'
      default: return '⏳'
    }
  }

  return (
    <div className="search-page">
      <div className="search-section">
        <div className="search-card">
          <div className="search-header">
            <h2>🔍 New TikTok Search</h2>
            <p>Enter keywords, hashtags, or usernames to scrape TikTok videos</p>
          </div>
          
          <div className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter search query (e.g., #viral, @username, cooking)"
                className="search-input"
                disabled={isSearching}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="search-button"
              >
                {isSearching ? (
                  <>
                    <span className="spinner"></span>
                    Searching...
                  </>
                ) : (
                  <>
                    🚀 Start Search
                  </>
                )}
              </button>
            </div>
            
            <div className="search-options">
              <label className="option-item">
                <input type="checkbox" defaultChecked />
                <span>Include video metadata</span>
              </label>
              <label className="option-item">
                <input type="checkbox" defaultChecked />
                <span>Download thumbnails</span>
              </label>
              <label className="option-item">
                <input type="checkbox" />
                <span>Download videos</span>
              </label>
            </div>
          </div>
          
          {searchResults && (
            <div className="search-results">
              <div className="results-icon">🎉</div>
              <h3>Search Completed!</h3>
              <div className="results-stats">
                <div className="stat">
                  <strong>{searchResults.videosFound}</strong> videos found
                </div>
                <div className="stat">
                  Saved as <strong>{searchResults.filename}</strong>
                </div>
              </div>
              <button className="view-results-btn">
                View in Analytics →
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="history-section">
        <h2 className="section-title">Search History</h2>
        <div className="history-list">
          {searchHistory.map((search) => (
            <div key={search.id} className="history-item">
              <div className="history-icon">
                {getStatusIcon(search.status)}
              </div>
              
              <div className="history-content">
                <div className="history-query">"{search.query}"</div>
                <div className="history-meta">
                  {search.date} • {search.videoCount} videos
                </div>
              </div>
              
              <div className="history-actions">
                <button className="action-btn repeat">
                  🔄 Repeat
                </button>
                <button className="action-btn view">
                  👁️ View
                </button>
              </div>
            </div>
          ))}
          
          {searchHistory.length === 0 && (
            <div className="empty-history">
              <div className="empty-icon">🔍</div>
              <h3>No searches yet</h3>
              <p>Your search history will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Search 