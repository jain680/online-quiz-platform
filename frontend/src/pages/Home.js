import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Home() {
  const [featuredQuizzes, setFeaturedQuizzes] = useState([]);

  useEffect(() => {
    api.get('/quizzes?featured=true').then(res => setFeaturedQuizzes(res.data.slice(0, 3)));
  }, []);

  return (
    <div className="container fade-in">
      <div className="card glow" style={{ textAlign: 'center', padding: '80px 40px', marginTop: '40px' }}>
        <h1 style={{ fontSize: '64px', marginBottom: '20px', fontWeight: '800' }}>
          <span style={{ 
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            QuizMaster
          </span>
        </h1>
        <p style={{ fontSize: '22px', opacity: 0.8, marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
          Challenge yourself, earn XP, unlock achievements, and compete with players worldwide!
        </p>
        <div className="flex flex-center gap-20">
          <Link to="/quizzes">
            <button className="btn btn-primary" style={{ fontSize: '20px', padding: '18px 50px' }}>
              🎮 Play Now
            </button>
          </Link>
          <Link to="/register">
            <button className="btn btn-secondary" style={{ fontSize: '20px', padding: '18px 50px' }}>
              ✨ Get Started
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-4 gap-20" style={{ marginTop: '60px' }}>
        <div className="card text-center slide-in">
          <div style={{ fontSize: '56px', marginBottom: '15px' }}>⚡</div>
          <h3 style={{ marginBottom: '10px' }}>Power-Ups</h3>
          <p style={{ opacity: 0.7 }}>Use 50/50, Freeze Time, and Skip to boost your score!</p>
        </div>
        <div className="card text-center slide-in" style={{ animationDelay: '0.1s' }}>
          <div style={{ fontSize: '56px', marginBottom: '15px' }}>🏆</div>
          <h3 style={{ marginBottom: '10px' }}>Achievements</h3>
          <p style={{ opacity: 0.7 }}>Unlock 25+ unique achievements and show off your skills!</p>
        </div>
        <div className="card text-center slide-in" style={{ animationDelay: '0.2s' }}>
          <div style={{ fontSize: '56px', marginBottom: '15px' }}>⚔️</div>
          <h3 style={{ marginBottom: '10px' }}>Battle Mode</h3>
          <p style={{ opacity: 0.7 }}>Challenge friends or random players to epic quiz battles!</p>
        </div>
        <div className="card text-center slide-in" style={{ animationDelay: '0.3s' }}>
          <div style={{ fontSize: '56px', marginBottom: '15px' }}>🔥</div>
          <h3 style={{ marginBottom: '10px' }}>Daily Streaks</h3>
          <p style={{ opacity: 0.7 }}>Keep your streak alive for bonus rewards every day!</p>
        </div>
      </div>

      <h2 style={{ textAlign: 'center', margin: '60px 0 30px', fontSize: '36px' }}>
        🌟 How It Works
      </h2>
      
      <div className="grid grid-3 gap-20">
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '60px', height: '60px', 
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: '800',
            margin: '0 auto 20px'
          }}>1</div>
          <h3 style={{ marginBottom: '10px' }}>Choose a Quiz</h3>
          <p style={{ opacity: 0.7 }}>Browse categories like Science, History, Gaming, and more!</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '60px', height: '60px', 
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: '800',
            margin: '0 auto 20px'
          }}>2</div>
          <h3 style={{ marginBottom: '10px' }}>Answer & Earn</h3>
          <p style={{ opacity: 0.7 }}>Get points for correct answers, build combos for bonuses!</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '60px', height: '60px', 
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: '800',
            margin: '0 auto 20px'
          }}>3</div>
          <h3 style={{ marginBottom: '10px' }}>Level Up</h3>
          <p style={{ opacity: 0.7 }}>Gain XP, unlock achievements, and climb the leaderboard!</p>
        </div>
      </div>

      {featuredQuizzes.length > 0 && (
        <>
          <h2 style={{ textAlign: 'center', margin: '60px 0 30px', fontSize: '36px' }}>
            🔥 Popular Quizzes
          </h2>
          <div className="quiz-grid">
            {featuredQuizzes.map(quiz => (
              <div key={quiz._id} className="quiz-card">
                <div className="icon">{quiz.icon || '📚'}</div>
                <h3>{quiz.title}</h3>
                <p>{quiz.description}</p>
                <div>
                  <span className="badge badge-category">{quiz.category}</span>
                  <span className={`badge badge-${quiz.difficulty}`}>{quiz.difficulty}</span>
                </div>
                <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ opacity: 0.7 }}>
                    ⭐ +{quiz.xpReward} XP
                  </span>
                  <Link to={`/quiz/${quiz._id}`}>
                    <button className="btn btn-primary">Play</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
