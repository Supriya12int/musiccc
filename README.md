# 🎵 Musiccc - Advanced Music Streaming Platform

A full-stack music streaming application with karaoke functionality, built with React, Node.js, and MongoDB.

![Music Platform](https://img.shields.io/badge/Music-Platform-purple)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)

## Features

- **User Authentication**: JWT-based registration and login
- **Music Streaming**: Play songs with audio controls
- **Playlists**: Create and manage personal playlists
- **Music Discovery**: Browse trending songs and get recommendations
- **Responsive Design**: Works on desktop and mobile devices
- **Music Player**: Full-featured player with play/pause, skip, volume control
- **Search**: Find songs, artists, and albums
- **Admin Panel**: Admin users can manage songs and users

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- CORS enabled
- Input validation with express-validator

### Frontend
- React 18
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling
- Lucide React for icons
- Axios for API calls
🔐 Admin Login:
Email: admin@musiccc.com
Password: admin123
## Project Structure

```
musiccc/
├── backend/
│   ├── config/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Song.js
│   │   └── Playlist.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── music.js
│   │   └── playlists.js
│   ├── .env
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.js
    │   │   ├── TopBar.js
    │   │   ├── MusicPlayer.js
    │   │   ├── SongCard.js
    │   │   ├── PlaylistCard.js
    │   │   └── ProtectedRoute.js
    │   ├── context/
    │   │   ├── AuthContext.js
    │   │   └── MusicContext.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   └── Dashboard.js
    │   ├── services/
    │   │   └── api.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    └── postcss.config.js
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment variables:
   - Copy `.env` file and update values:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/musiccc
   JWT_SECRET=your_jwt_secret_key_here_replace_with_strong_secret
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

### Database Setup

The application will automatically create the necessary collections in MongoDB when you first run it.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (Admin only)

### Music
- `GET /api/music/songs` - Get all songs with pagination and filtering
- `GET /api/music/songs/:id` - Get single song
- `POST /api/music/songs` - Add new song (Admin only)
- `PUT /api/music/songs/:id/play` - Increment play count
- `GET /api/music/popular` - Get popular songs
- `GET /api/music/recommendations` - Get song recommendations

### Playlists
- `GET /api/playlists` - Get user's playlists
- `GET /api/playlists/public` - Get public playlists
- `GET /api/playlists/:id` - Get single playlist
- `POST /api/playlists` - Create new playlist
- `PUT /api/playlists/:id` - Update playlist
- `POST /api/playlists/:id/songs` - Add song to playlist
- `DELETE /api/playlists/:id/songs/:songId` - Remove song from playlist
- `DELETE /api/playlists/:id` - Delete playlist

## Usage

1. **Registration/Login**: Create an account or login with existing credentials
2. **Dashboard**: Browse trending songs, recommendations, and recently added music
3. **Music Player**: Click on any song to start playing. Use the bottom player controls
4. **Playlists**: Create and manage personal playlists
5. **Search**: Use the search bar to find songs, artists, or albums

## Default User Roles

- **User**: Can browse music, create playlists, play songs
- **Admin**: All user permissions plus ability to manage songs and users

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/musiccc |
| JWT_SECRET | Secret key for JWT tokens | (required) |
| JWT_EXPIRE | JWT token expiration time | 7d |
| NODE_ENV | Environment mode | development |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support or questions, please create an issue in the repository.