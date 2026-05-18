# Video Streaming Platform - UI

A modern, responsive React-based user interface for the Video Streaming Platform microservices.

## Features

✅ **User Authentication**
- Register with username, email, and password
- Login with username or email
- JWT token-based authentication
- Auto-logout on token expiry

✅ **Video Management**
- Browse and discover public videos
- Upload videos with metadata (title, description, category, visibility)
- View video details and playback
- Edit/Delete your own videos
- Filter by visibility (Public, Private, Unlisted)

✅ **Modern UI/UX**
- Responsive design (mobile, tablet, desktop)
- Dark theme optimized for video viewing
- Real-time loading states
- Error handling and user feedback
- Smooth animations and transitions

## Tech Stack

- **React 18** - UI framework
- **React Router 6** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Vite** - Fast build tool and dev server

## Prerequisites

- Node.js 16+ and npm/yarn
- Backend services running (Auth, Video, Upload services on API Gateway)

## Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your backend URL
# VITE_API_BASE_URL=http://localhost:8080
```

## Development

```bash
# Start dev server (opens http://localhost:3000)
npm run dev
```

## Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
frontend-web/
├── src/
│   ├── api/
│   │   ├── client.js        # Axios instance with interceptors
│   │   └── services.js      # API endpoint definitions
│   ├── components/
│   │   ├── Navbar.jsx       # Navigation bar
│   │   ├── ProtectedRoute.jsx # Auth guard
│   │   └── VideoCard.jsx    # Video grid card
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication state
│   ├── pages/
│   │   ├── Home.jsx         # Video list page
│   │   ├── Login.jsx        # Login page
│   │   ├── Register.jsx     # Registration page
│   │   ├── Upload.jsx       # Video upload page
│   │   └── VideoDetail.jsx  # Video detail/player page
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS config
└── package.json             # Dependencies
```

## API Integration

The UI communicates with the backend through the API Gateway at `/videos`, `/auth`, and `/upload` endpoints.

### Key API Endpoints Used

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user
- `POST /auth/logout` - User logout
- `GET /videos` - List videos (paginated)
- `GET /videos/{id}` - Get video details
- `POST /videos` - Create video
- `PUT /videos/{id}` - Update video
- `DELETE /videos/{id}` - Delete video
- `POST /videos/{id}/attach-upload` - Link upload file to video
- `POST /upload` - Upload video file

## Authentication Flow

1. User registers → JWT tokens stored in localStorage
2. Automatic token injection on all requests via Axios interceptor
3. Token expiry at 401 response → Auto-redirect to login
4. Logout removes tokens and clears auth state

## Deployment

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Environment Variables (Production)

Update `.env` with your production backend URL:
```
VITE_API_BASE_URL=https://api.yourbackend.com
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Troubleshooting

### CORS Errors
Ensure API Gateway allows the frontend origin. Check CORS configuration in API Gateway.

### 401 Errors
Token may be expired. Clear localStorage and login again.

### Videos Not Loading
Check API Gateway is running and accessible at `VITE_API_BASE_URL`.

## License

MIT

