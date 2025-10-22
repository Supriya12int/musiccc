# Development Scripts

## Backend Development

# Install backend dependencies
cd backend
npm install

# Start backend development server
npm run dev

# Start backend production server
npm start

## Frontend Development

# Install frontend dependencies
cd frontend
npm install

# Start frontend development server
npm start

# Build frontend for production
npm run build

## Database Setup

# Start MongoDB (if running locally)
mongod

# Or use MongoDB Atlas connection string in .env file

## Environment Setup

# Copy example environment file
cp backend/.env.example backend/.env

# Update the following variables in backend/.env:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (generate a strong secret key)

## Development Tips

1. Make sure MongoDB is running before starting the backend
2. Backend runs on http://localhost:5000
3. Frontend runs on http://localhost:3000
4. API requests from frontend are proxied to backend

## Production Deployment

1. Set NODE_ENV=production in backend/.env
2. Update MONGODB_URI to production database
3. Build frontend: npm run build
4. Serve built files with a web server
5. Use PM2 or similar for backend process management