import axios from 'axios';

// Use a fixed API URL to ensure consistency
const API_BASE_URL = 'http://localhost:8000/api';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Disable withCredentials temporarily to troubleshoot CORS issues
    withCredentials: false,
    timeout: 30000 // 30 second timeout (increased from 10 seconds)
});

// Add a request interceptor for authentication
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Adding auth token to request');
        }
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API Error:', error.message);
        
        // Improved error handling with specific timeout error message
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout');
            error.message = 'The server is taking too long to respond. Please try again later.';
        } else if (error.response) {
            console.error('Response error status:', error.response.status);
            console.error('Response error data:', error.response.data);
            
            if (error.response.status === 401) {
                console.log('Unauthorized - clearing token');
                localStorage.removeItem('token');
                
                // Redirect to login only if not already on login page
                if (!window.location.pathname.includes('login')) {
                    window.location.href = '/';
                }
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
            error.message = 'No response from server. Please check your internet connection.';
        }
        
        return Promise.reject(error);
    }
);

export default api; 