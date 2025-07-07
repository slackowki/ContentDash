import React, { useState, useEffect } from 'react'
import './VideoModal.css'

const VideoModal = ({ file, onClose }) => {
  const [videos, setVideos] = useState([])
  const [sortBy, setSortBy] = useState('playCount')
  const [filterMinViews, setFilterMinViews] = useState('')
  const [filterMinLikes, setFilterMinLikes] = useState('')

  useEffect(() => {
    if (file?.rawData?.results) {
      // Use real data from the JSON file
      setVideos(file.rawData.results)
    } else {
      // No fallback - only real data
      setVideos([])
    }
  }, [file])

  const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const filteredAndSortedVideos = videos
    .filter(video => {
      const views = video.playCount || 0
      const likes = video.diggCount || 0
      if (filterMinViews && views < parseInt(filterMinViews)) return false
      if (filterMinLikes && likes < parseInt(filterMinLikes)) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'playCount':
          return (b.playCount || 0) - (a.playCount || 0)
        case 'diggCount':
          return (b.diggCount || 0) - (a.diggCount || 0)
        case 'commentCount':
          return (b.commentCount || 0) - (a.commentCount || 0)
        case 'collectCount':
          return (b.collectCount || 0) - (a.collectCount || 0)
        case 'duration':
          return (b.videoMeta?.duration || 0) - (a.videoMeta?.duration || 0)
        case 'fans':
          return (b.authorMeta?.fans || 0) - (a.authorMeta?.fans || 0)
        default:
          return 0
      }
    })

  const handleVideoClick = (video) => {
    if (video.webVideoUrl) {
      window.open(video.webVideoUrl, '_blank')
    }
  }

  if (!file || !file.rawData) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title">
              <h2>No Data Available</h2>
            </div>
            <button className="modal-close" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="no-results">
            <div className="no-results-icon">📄</div>
            <h3>No video data found</h3>
            <p>Please ensure the JSON file is properly loaded</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <h2>📄 {file?.name}</h2>
            <p>{videos.length} videos • {file?.date}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-filters">
          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="playCount">Views</option>
              <option value="diggCount">Likes</option>
              <option value="commentCount">Comments</option>
              <option value="collectCount">Saves</option>
              <option value="fans">Followers</option>
              <option value="duration">Duration</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Min Views:</label>
            <input
              type="number"
              value={filterMinViews}
              onChange={(e) => setFilterMinViews(e.target.value)}
              placeholder="e.g., 100000"
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Min Likes:</label>
            <input
              type="number"
              value={filterMinLikes}
              onChange={(e) => setFilterMinLikes(e.target.value)}
              placeholder="e.g., 10000"
              className="filter-input"
            />
          </div>

          <div className="advanced-filters">
            <div 
              className={`filter-chip ${sortBy === 'playCount' ? 'active' : ''}`}
              onClick={() => setSortBy('playCount')}
            >
              🔥 Trending
            </div>
            <div 
              className={`filter-chip ${sortBy === 'diggCount' ? 'active' : ''}`}
              onClick={() => setSortBy('diggCount')}
            >
              ❤️ Most Liked
            </div>
            <div 
              className={`filter-chip ${sortBy === 'commentCount' ? 'active' : ''}`}
              onClick={() => setSortBy('commentCount')}
            >
              💬 Most Discussed
            </div>
            <div 
              className={`filter-chip ${sortBy === 'fans' ? 'active' : ''}`}
              onClick={() => setSortBy('fans')}
            >
              👑 Top Creators
            </div>
            <div 
              className={`filter-chip ${sortBy === 'duration' ? 'active' : ''}`}
              onClick={() => setSortBy('duration')}
            >
              ⏱️ Longest Videos
            </div>
          </div>
        </div>

        <div className="video-grid">
          {filteredAndSortedVideos.map((video) => (
            <div 
              key={video.id} 
              className="video-card"
              onClick={() => handleVideoClick(video)}
            >
              <div className="video-thumbnail-container">
                {video.videoMeta?.coverUrl ? (
                  <img 
                    src={video.videoMeta.coverUrl} 
                    alt="Video thumbnail"
                    className="video-thumbnail"
                  />
                ) : (
                  <div className="video-thumbnail-placeholder">
                    <div className="play-icon">▶️</div>
                  </div>
                )}
                <div className="video-duration">
                  {formatDuration(video.videoMeta?.duration)}
                </div>
                <div className="video-stats-overlay">
                  <div className="stat-overlay">
                    <span className="stat-icon">👁️</span>
                    <span>{formatNumber(video.playCount)}</span>
                  </div>
                  <div className="stat-overlay">
                    <span className="stat-icon">❤️</span>
                    <span>{formatNumber(video.diggCount)}</span>
                  </div>
                </div>
              </div>
              
              <div className="video-info">
                <div className="author-header">
                  <div className="author-avatar">
                    {video.authorMeta?.avatar ? (
                      <img 
                        src={video.authorMeta.avatar} 
                        alt={`@${video.authorMeta.name}`}
                        className="avatar-img"
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {video.authorMeta?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="author-info">
                    <div className="author-name">
                      {video.authorMeta?.nickName || video.authorMeta?.name}
                      {video.authorMeta?.verified && (
                        <span className="verified-badge">✓</span>
                      )}
                    </div>
                    <div className="author-username">@{video.authorMeta?.name}</div>
                    <div className="author-followers">
                      {formatNumber(video.authorMeta?.fans)} followers
                    </div>
                  </div>
                </div>

                <div className="video-caption">
                  {video.text}
                </div>

                {video.authorMeta?.signature && (
                  <div className="author-bio">
                    {video.authorMeta.signature}
                  </div>
                )}

                <div className="video-metadata">
                  {video.createTime && (
                    <div className="video-date">
                      📅 {formatDate(video.createTime)}
                    </div>
                  )}
                  {video.textLanguage && (
                    <div className="video-language">
                      🌐 {video.textLanguage.toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="video-stats-detailed">
                  <div className="stat-detail">
                    <span className="stat-icon">👁️</span>
                    <span className="stat-label">Views</span>
                    <span className="stat-value">{formatNumber(video.playCount)}</span>
                  </div>
                  <div className="stat-detail">
                    <span className="stat-icon">❤️</span>
                    <span className="stat-label">Likes</span>
                    <span className="stat-value">{formatNumber(video.diggCount)}</span>
                  </div>
                  <div className="stat-detail">
                    <span className="stat-icon">💬</span>
                    <span className="stat-label">Comments</span>
                    <span className="stat-value">{formatNumber(video.commentCount)}</span>
                  </div>
                  <div className="stat-detail">
                    <span className="stat-icon">📤</span>
                    <span className="stat-label">Shares</span>
                    <span className="stat-value">{formatNumber(video.shareCount)}</span>
                  </div>
                  {video.collectCount && (
                    <div className="stat-detail">
                      <span className="stat-icon">🔖</span>
                      <span className="stat-label">Saves</span>
                      <span className="stat-value">{formatNumber(video.collectCount)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedVideos.length === 0 && videos.length > 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No videos match your filters</h3>
            <p>Try adjusting the filter criteria</p>
          </div>
        )}

        {videos.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">📄</div>
            <h3>No videos found</h3>
            <p>This collection appears to be empty</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoModal 