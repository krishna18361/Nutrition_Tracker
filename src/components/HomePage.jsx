import React from 'react';

const HomePage = () => {
  return (
    <div className="homepage-container card-hover">
      <h1 className="homepage-title">
        NU<span style={{ color: '#444' }}>TRACK</span>
      </h1>
      <p className="homepage-subtitle">Track your nutrition effortlessly</p>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <div style={{ width: '80px', height: '3px', background: '#333', borderRadius: '2px' }}></div>
      </div>
      
      <div className="homepage-content">
        <p>Welcome to NUTRACK, your personal nutrition tracker. Log in to start tracking your meals and get detailed nutritional information.</p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-around', margin: '2rem 0 1rem' }}>
        <div style={{ textAlign: 'center', padding: '0 1rem' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.9955 18C10.3711 18 8.81952 17.3731 7.65432 16.2426C6.48913 15.1122 5.82978 13.5913 5.78534 12C5.83429 10.4169 6.48624 8.90347 7.64101 7.77472C8.79578 6.64597 10.3347 6.01016 11.9454 5.99901C13.5637 6.00104 15.1097 6.62885 16.2715 7.75399C17.4334 8.87912 18.0927 10.4409 18.1614 12.0246C18.0935 13.5987 17.4303 15.0948 16.2737 16.1917C15.117 17.2886 13.5841 17.9185 11.9863 17.9454L11.9955 18ZM12.0007 4C10.02 4.00478 8.12134 4.77472 6.7355 6.14356C5.34965 7.5124 4.58473 9.39985 4.59003 11.3608C4.59532 13.3217 5.3705 15.2046 6.76425 16.5667C8.15799 17.9288 10.0617 18.69 12.0423 18.6852C13.9942 18.6597 15.856 17.8742 17.2361 16.5005C18.6161 15.1267 19.4027 13.2849 19.4325 11.3534C19.4271 9.39246 18.6522 7.50499 17.2663 6.13615C15.8805 4.76731 13.9818 3.99737 12.0011 4H12.0007Z" fill="#444"/>
            <path d="M14.7012 10.2999L11.291 13.6999L9.70117 12.0999" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#444', marginTop: '0.5rem' }}>Track Meals</p>
        </div>
        
        <div style={{ textAlign: 'center', padding: '0 1rem' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6.5V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#444', marginTop: '0.5rem' }}>Save Time</p>
        </div>
        
        <div style={{ textAlign: 'center', padding: '0 1rem' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M20.6179 5.98434C20.4132 5.99472 20.2072 5.99997 20 5.99997C16.9265 5.99997 14.123 4.84453 11.9999 2.94434C9.87691 4.84446 7.07339 5.99985 4 5.99985C3.79277 5.99985 3.58678 5.9946 3.38213 5.98422C3.1327 6.94783 3 7.95842 3 9.00001C3 14.5915 6.82432 19.2898 12 20.622C17.1757 19.2898 21 14.5915 21 9.00001C21 7.95847 20.8673 6.94791 20.6179 5.98434Z" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#444', marginTop: '0.5rem' }}>Stay Healthy</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;