# Online Quiz Platform

A full-stack quiz platform built with Node.js/Express backend and React frontend.

## Features

- **User Authentication** - Register, login, JWT-based auth
- **Quiz Management** - Create, edit, publish quizzes
- **Take Quizzes** - Timed quizzes with multiple choice questions
- **Results Tracking** - View scores, grades, and history
- **Categories & Difficulty** - Filter quizzes by category and difficulty
- **Leaderboards** - See top scores per quiz

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- React 18
- React Router v6
- Axios for API calls
- CSS3 with modern styling

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

npm run dev
```

Backend runs on http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on http://localhost:3000

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Quizzes
- `GET /api/quizzes` - List published quizzes
- `GET /api/quizzes/:id` - Get quiz details
- `POST /api/quizzes` - Create quiz (auth required)
- `PUT /api/quizzes/:id` - Update quiz (owner only)
- `DELETE /api/quizzes/:id` - Delete quiz (owner only)
- `POST /api/quizzes/:id/submit` - Submit quiz answers

### Results
- `POST /api/results` - Save quiz result
- `GET /api/results/my-results` - Get user's results
- `GET /api/results/quiz/:id/leaderboard` - Get quiz leaderboard

## Project Structure

```
├── backend/
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── middleware/     # Auth middleware
│   └── server.js       # Entry point
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/ # Reusable components
│       ├── context/    # React context (Auth)
│       ├── pages/      # Page components
│       └── services/   # API service
└── README.md
```
