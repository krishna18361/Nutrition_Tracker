# NuTrack - Nutrition Tracking Application

A full-stack nutrition tracking application with calorie counting, meal planning, and nutritional analysis features.

## Tech Stack

- **Frontend**: React, Vite, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB

## Deployment to Render.com

1. Push your code to GitHub
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. Create a MongoDB database
   - You can use MongoDB Atlas (https://www.mongodb.com/cloud/atlas)
   - Create a free cluster and get your connection string

3. Deploy on Render.com
   - Go to https://render.com and sign up/log in
   - Connect your GitHub repository
   - Click "New" and select "Blueprint"
   - Select your repo with the render.yaml file
   - Enter your environment variables when prompted:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secret string for JWT authentication
   - Click "Apply"

4. Wait for the deployment to complete
   - Render will automatically deploy both your frontend and backend
   - Frontend will be available at: https://nutrack.onrender.com
   - Backend API will be available at: https://nutrack-api.render.com

## Local Development

1. Install dependencies
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

2. Set up environment variables
   - Create a `.env` file in the root directory
   - Create a `.env` file in the `backend` directory

3. Start the development servers
   ```bash
   # Start backend server
   cd backend
   npm run dev
   
   # In a new terminal, start frontend
   cd ..
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Features

- User authentication
- Food and meal tracking
- Nutritional analysis
- Calorie tracking
- BMI calculator
- Meal quality scores
- Seasonal food recommendations
- Comprehensive reporting
