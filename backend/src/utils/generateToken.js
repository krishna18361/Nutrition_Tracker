const jwt = require('jsonwebtoken');

/**
 * Generate a JSON Web Token for authentication
 * @param {string} id - User ID to include in the token
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      throw new Error('JWT configuration error');
    }
    
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d'
    });
    
    return token;
  } catch (error) {
    console.error('Error generating JWT token:', error);
    throw error;
  }
};

module.exports = generateToken; 