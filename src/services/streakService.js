/**
 * Nutrition streak service
 * Uses localStorage to track user's daily nutrition goals streak
 */

/**
 * Get the current streak information
 * @returns {Promise<Object>} Streak information
 */
export const getStreak = async () => {
  try {
    // Using localStorage for now
    return getLocalStreak();
  } catch (error) {
    console.error('Error fetching streak:', error);
    return { currentStreak: 0, longestStreak: 0 };
  }
};

/**
 * Update the streak when user meets daily nutrition goal
 * @returns {Promise<Object>} Updated streak information
 */
export const updateStreak = async () => {
  try {
    // Using localStorage for now
    return updateLocalStreak();
  } catch (error) {
    console.error('Error updating streak:', error);
    return { currentStreak: 0, longestStreak: 0 };
  }
};

/**
 * Reset the streak when user misses daily nutrition goal
 * @returns {Promise<Object>} Reset streak information
 */
export const resetStreak = async () => {
  try {
    // Using localStorage for now
    return resetLocalStreak();
  } catch (error) {
    console.error('Error resetting streak:', error);
    return { currentStreak: 0, longestStreak: 0 };
  }
};

// Local storage functions
const getLocalStreak = () => {
  const streakData = localStorage.getItem('nutritionStreak');
  if (streakData) {
    return JSON.parse(streakData);
  }
  
  // Default initial streak data
  const defaultStreak = {
    currentStreak: 0,
    longestStreak: 0,
    lastUpdated: null,
    goalsMet: {}
  };
  
  localStorage.setItem('nutritionStreak', JSON.stringify(defaultStreak));
  return defaultStreak;
};

const updateLocalStreak = () => {
  const streakData = getLocalStreak();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Skip if already updated today
  if (streakData.goalsMet[today]) {
    return streakData;
  }
  
  // Check if streak is broken (more than 1 day since last update)
  const lastUpdated = streakData.lastUpdated ? new Date(streakData.lastUpdated) : null;
  const currentDate = new Date();
  const yesterday = new Date(currentDate);
  yesterday.setDate(currentDate.getDate() - 1);
  
  let updatedStreak = { ...streakData };
  
  if (!lastUpdated || lastUpdated.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
    // Streak continues
    updatedStreak.currentStreak += 1;
    updatedStreak.longestStreak = Math.max(updatedStreak.currentStreak, updatedStreak.longestStreak);
  } else if (lastUpdated.toISOString().split('T')[0] !== today) {
    // Streak broken (gap in days)
    updatedStreak.currentStreak = 1;
  }
  
  // Update last updated date and mark goal as met for today
  updatedStreak.lastUpdated = today;
  updatedStreak.goalsMet[today] = true;
  
  localStorage.setItem('nutritionStreak', JSON.stringify(updatedStreak));
  return updatedStreak;
};

const resetLocalStreak = () => {
  const streakData = getLocalStreak();
  const updatedStreak = {
    ...streakData,
    currentStreak: 0,
    lastUpdated: new Date().toISOString().split('T')[0]
  };
  
  localStorage.setItem('nutritionStreak', JSON.stringify(updatedStreak));
  return updatedStreak;
};

export default {
  getStreak,
  updateStreak,
  resetStreak
}; 