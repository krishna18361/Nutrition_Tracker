import React, { useState } from 'react';

const WaterIntake = () => {
  const [glasses, setGlasses] = useState(0);
  const targetGlasses = 12;

  const handleAddGlass = () => {
    if (glasses < targetGlasses) {
      setGlasses(glasses + 1);
    }
  };

  const handleRemoveGlass = () => {
    if (glasses > 0) {
      setGlasses(glasses - 1);
    }
  };

  // Calculate percentage for progress bar
  const percentage = (glasses / targetGlasses) * 100;

  return (
    <div className="water-intake-container card-hover">
      <h2>Water Intake</h2>
      
      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{ 
            width: `${percentage}%`,
            background: '#333',
            transition: 'width 0.3s ease'
          }}
        ></div>
      </div>
      
      <p style={{ textAlign: 'center', margin: '1rem 0' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{glasses}</span>
        <span style={{ color: '#777' }}> / {targetGlasses} glasses</span>
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <button 
          onClick={handleRemoveGlass} 
          style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            padding: '0', 
            marginRight: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button 
          onClick={handleAddGlass} 
          style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <p style={{ fontSize: '0.85rem', color: '#777', textAlign: 'center', marginTop: '1rem' }}>
        Track your daily water intake for better health
      </p>
    </div>
  );
};

export default WaterIntake;