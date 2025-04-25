import React, { useState, useEffect } from 'react';
import { authService } from '../services/api.service';

const LoginPage = ({ onLogin, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  
  // Clear errors when changing between login/register
  useEffect(() => {
    setFormError(null);
  }, [showRegister]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    
    try {
      if (showRegister) {
        // Handle registration
        console.log('Attempting registration for:', email);
        const response = await authService.register({ name, email, password });
        console.log('Registration successful:', response.data);
        
        // Store token and refresh page
        if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          window.location.href = '/';
        } else {
          throw new Error('No token received after registration');
        }
      } else {
        // Handle login through parent component
        await onLogin({ email, password });
      }
    } catch (err) {
      console.error('Auth error:', err);
      let message = 'Authentication failed';
      
      // Display user-friendly error messages
      if (err.code === 'ECONNABORTED') {
        message = 'The server is taking too long to respond. Please try again later.';
      } else if (err.message && err.message.includes('timeout')) {
        message = 'Login request timed out. The server might be overloaded, please try again later.';
      } else if (err.response) {
        // Server responded with error
        message = err.response.data?.message || 'Login failed. Please check your credentials.';
      } else if (err.request) {
        // No response received
        message = 'Cannot connect to the server. Please check your internet connection.';
      } else {
        message = err.message || 'Authentication failed';
      }
      
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setShowRegister(!showRegister);
    setEmail('');
    setPassword('');
    setName('');
    setFormError(null);
  };

  return (
    <div className="container card-hover">
      <h2>{showRegister ? 'Create Account' : 'Welcome Back'}</h2>
      <form onSubmit={handleSubmit}>
        {showRegister && (
          <div style={{ width: '100%' }}>
            <label>Full Name:</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        )}
        <div style={{ width: '100%' }}>
          <label>Email:</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div style={{ width: '100%' }}>
          <label>Password:</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        {(error || formError) && (
          <div style={{ color: 'red', margin: '1rem 0', fontSize: '0.9rem' }}>
            {error || formError}
          </div>
        )}
        
        <button type="submit" disabled={loading}>
          {loading ? (
            'Processing...'
          ) : (
            <>
              <svg 
                style={{ marginRight: '8px', verticalAlign: 'middle' }} 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              {showRegister ? 'Register' : 'Login'}
            </>
          )}
        </button>
        
        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <button 
            type="button" 
            onClick={toggleForm}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#666', 
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
            disabled={loading}
          >
            {showRegister ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;