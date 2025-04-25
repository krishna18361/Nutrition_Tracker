# NUTRACK Backend API

This is the backend API for the NUTRACK nutrition tracking application.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure the environment variables:
   - Create a `.env` file in the root directory with the following variables:
     ```
     NODE_ENV=development
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/nutrack
     JWT_SECRET=your_jwt_secret_key
     JWT_EXPIRES_IN=30d
     ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `POST /api/auth/logout` - Logout (requires token)

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Meals
- `GET /api/meals` - Get all meals for current user
- `POST /api/meals` - Add a new meal
- `GET /api/meals/:id` - Get a specific meal
- `PUT /api/meals/:id` - Update a meal
- `DELETE /api/meals/:id` - Delete a meal

### Nutrition
- `GET /api/nutrition/stats` - Get nutrition statistics for the current day

## Data Models

### User
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashedpassword",
  "calorieGoal": 2000
}
```

### Meal
```json
{
  "user": "userId",
  "name": "Apple",
  "quantity": "1 medium",
  "mealType": "Snack",
  "nutritionInfo": {
    "calories": 95,
    "protein_g": 0.5,
    "carbohydrates_total_g": 25,
    "fat_total_g": 0.3
  },
  "timestamp": "2023-04-10T12:00:00Z"
}
```

## Development

- Run in development mode: `npm run dev`
- Run in production mode: `npm start` 