import React, { useState } from 'react'
import './Auth.css'

const Auth = ({ onLogin }) => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setMessage('Please enter both email and password')
      return
    }

    setLoading(true)
    setMessage('')

    // Simulate loading for better UX
    setTimeout(() => {
      setMessage('Welcome to TikTok Scraper!')
      setTimeout(() => {
        onLogin({ email })
      }, 500)
    }, 1000)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="drag-handle" data-draggable="true">
          <div className="drag-dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
        
        <div className="auth-content">
          <h1>TikTok Scraper</h1>
          <p>Enter any email and password to continue</p>
          
          <form onSubmit={handleAuth}>
            <div className="form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </div>
            
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="auth-input"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          {message && (
            <div className="message">
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Auth 