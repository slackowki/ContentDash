import React, { useState, useEffect } from 'react'
import VideoModal from './VideoModal'
import './Analytics.css'

const Analytics = () => {
  const [jsonFiles, setJsonFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load real JSON file from DesktopApp folder
  useEffect(() => {
    const loadJsonFile = async () => {
      try {
        setLoading(true)
        
        // Load the actual JSON file from the DesktopApp folder
        const response = await fetch('/olive app_20240703-20250703_100.json')
        
        if (!response.ok) {
          throw new Error(`Failed to load JSON file: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Calculate stats from the real data
        const videos = data.results || []
        const totalViews = videos.reduce((sum, video) => sum + (video.playCount || 0), 0)
        const totalLikes = videos.reduce((sum, video) => sum + (video.diggCount || 0), 0)
        const totalComments = videos.reduce((sum, video) => sum + (video.commentCount || 0), 0)
        const avgEngagement = videos.length > 0 
          ? ((totalLikes + totalComments) / totalViews * 100).toFixed(1) + '%'
          : '0%'
        
        const fileData = {
          id: 'olive_app_100',
          name: 'olive app_20240703-20250703_100.json',
          date: data.date_range?.start || data.scraped_at?.split('T')[0] || '2024-07-03',
          videoCount: videos.length,
          totalViews: formatNumber(totalViews),
          totalLikes: formatNumber(totalLikes),
          avgEngagement: avgEngagement,
          rawData: data
        }
        
        setJsonFiles([fileData])
        setLoading(false)
      } catch (error) {
        console.error('Error loading JSON file:', error)
        setError(`Failed to load data: ${error.message}`)
        setLoading(false)
      }
    }

    loadJsonFile()
  }, [])

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const handleFileClick = (file) => {
    setSelectedFile(file)
    setShowVideoModal(true)
  }

  const getTotalStats = () => {
    return {
      totalVideos: jsonFiles.reduce((acc, file) => acc + file.videoCount, 0),
      totalViews: jsonFiles.reduce((acc, file) => {
        const views = parseFloat(file.totalViews.replace(/[MK]/g, '')) * 
          (file.totalViews.includes('M') ? 1000000 : file.totalViews.includes('K') ? 1000 : 1)
        return acc + views
      }, 0),
      totalLikes: jsonFiles.reduce((acc, file) => {
        const likes = parseFloat(file.totalLikes.replace(/[MK]/g, '')) * 
          (file.totalLikes.includes('M') ? 1000000 : file.totalLikes.includes('K') ? 1000 : 1)
        return acc + likes
      }, 0)
    }
  }

  const stats = getTotalStats()

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <h3>Loading scraped data...</h3>
          <p>Reading JSON file from your collection</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Failed to Load Data</h3>
          <p>{error}</p>
          <p>Make sure the JSON file is in the DesktopApp folder</p>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Insights from your scraped TikTok collections</p>
      </div>

      <div className="analytics-summary">
        <div className="summary-card">
          <div className="summary-icon">📈</div>
          <div className="summary-content">
            <h3>Total Scraped</h3>
            <p className="summary-number">{stats.totalVideos.toLocaleString()}</p>
            <span className="summary-label">Videos</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">👁️</div>
          <div className="summary-content">
            <h3>Total Views</h3>
            <p className="summary-number">{formatNumber(stats.totalViews)}</p>
            <span className="summary-label">Views</span>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon">❤️</div>
          <div className="summary-content">
            <h3>Total Likes</h3>
            <p className="summary-number">{formatNumber(stats.totalLikes)}</p>
            <span className="summary-label">Likes</span>
          </div>
        </div>
      </div>

      <div className="file-grid">
        <h2 className="section-title">Scraped Collections</h2>
        <div className="grid-container">
          {jsonFiles.map((file) => (
            <div 
              key={file.id} 
              className="file-card"
              onClick={() => handleFileClick(file)}
            >
              <div className="file-header">
                <div className="file-icon">📄</div>
                <div className="file-date">{file.date}</div>
              </div>
              
              <div className="file-content">
                <h3 className="file-name">{file.name}</h3>
                
                <div className="file-stats">
                  <div className="stat-item">
                    <span className="stat-label">Videos</span>
                    <span className="stat-value">{file.videoCount.toLocaleString()}</span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Views</span>
                    <span className="stat-value">{file.totalViews}</span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Likes</span>
                    <span className="stat-value">{file.totalLikes}</span>
                  </div>
                  
                  <div className="stat-item">
                    <span className="stat-label">Engagement</span>
                    <span className="stat-value">{file.avgEngagement}</span>
                  </div>
                </div>
              </div>
              
              <div className="file-footer">
                <button className="view-button">
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showVideoModal && (
        <VideoModal 
          file={selectedFile}
          onClose={() => setShowVideoModal(false)}
        />
      )}
    </div>
  )
}

export default Analytics 