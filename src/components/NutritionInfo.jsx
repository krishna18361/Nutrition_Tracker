import React from 'react';
import MealQualityScore from './MealQualityScore';

const NutritionInfo = ({ nutrition }) => {
  if (!nutrition) {
    return null;
  }

  // Function to create progress bar based on value and max value
  const renderProgressBar = (value, maxValue, label, unit = 'g') => {
    const percentage = Math.min((value / maxValue) * 100, 100);
    return (
      <div className="macro-progress">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span>{label}</span>
          <span>{value} {unit}</span>
        </div>
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Calculate percentage of daily values (RDI)
  const getDailyValuePercent = (value, dailyRecommended) => {
    if (!value || !dailyRecommended) return "0%";
    return `${Math.round((value / dailyRecommended) * 100)}%`;
  };

  return (
    <div className="nutrition-info card-hover">
      <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
        {nutrition.name} 
        {nutrition.serving_size_g ? <span style={{ fontSize: '0.85rem', color: '#777', marginLeft: '8px' }}>
          ({nutrition.serving_size_g}g)
        </span> : null}
      </h3>
      
      <MealQualityScore nutrition={nutrition} />
      
      <div className="macro-primary">
        {renderProgressBar(nutrition.calories, 2000, 'Calories', 'kcal')}
        {renderProgressBar(nutrition.protein_g, 50, 'Protein')}
        {renderProgressBar(nutrition.carbohydrates_total_g, 300, 'Carbohydrates')}
        {renderProgressBar(nutrition.fat_total_g, 70, 'Total Fat')}
      </div>
      
      <div className="macro-details" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '8px', 
        marginTop: '20px',
        borderTop: '1px solid #eee',
        paddingTop: '15px'
      }}>
        <div className="macro-detail">
          <span className="macro-label">Saturated Fat</span>
          <div className="macro-values">
            <span className="macro-value">{nutrition.fat_saturated_g}g</span>
            <span className="macro-daily">{getDailyValuePercent(nutrition.fat_saturated_g, 20)} DV</span>
          </div>
        </div>

        <div className="macro-detail">
          <span className="macro-label">Sugar</span>
          <div className="macro-values">
            <span className="macro-value">{nutrition.sugar_g}g</span>
            <span className="macro-daily">{getDailyValuePercent(nutrition.sugar_g, 50)} DV</span>
          </div>
        </div>

        <div className="macro-detail">
          <span className="macro-label">Fiber</span>
          <div className="macro-values">
            <span className="macro-value">{nutrition.fiber_g}g</span>
            <span className="macro-daily">{getDailyValuePercent(nutrition.fiber_g, 28)} DV</span>
          </div>
        </div>

        <div className="macro-detail">
          <span className="macro-label">Cholesterol</span>
          <div className="macro-values">
            <span className="macro-value">{nutrition.cholesterol_mg}mg</span>
            <span className="macro-daily">{getDailyValuePercent(nutrition.cholesterol_mg, 300)} DV</span>
          </div>
        </div>

        <div className="macro-detail">
          <span className="macro-label">Sodium</span>
          <div className="macro-values">
            <span className="macro-value">{nutrition.sodium_mg}mg</span>
            <span className="macro-daily">{getDailyValuePercent(nutrition.sodium_mg, 2300)} DV</span>
          </div>
        </div>

        <div className="macro-detail">
          <span className="macro-label">Potassium</span>
          <div className="macro-values">
            <span className="macro-value">{nutrition.potassium_mg}mg</span>
            <span className="macro-daily">{getDailyValuePercent(nutrition.potassium_mg, 4700)} DV</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .macro-detail {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          font-size: 0.9rem;
        }
        .macro-label {
          color: #555;
        }
        .macro-values {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .macro-value {
          font-weight: 500;
        }
        .macro-daily {
          font-size: 0.75rem;
          color: #777;
        }
        .macro-progress {
          margin-bottom: 12px;
        }
      `}</style>
    </div>
  );
};

export default NutritionInfo;