import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AchievementPopup from '../components/AchievementPopup';

function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(Date.now());
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [powerUpsUsed, setPowerUpsUsed] = useState([]);
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [timeFrozen, setTimeFrozen] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quizzes/${id}`);
        setQuiz(res.data);
        setAnswers(new Array(res.data.questions.length).fill(-1));
        setTimeLeft(res.data.timeLimit * 60);
      } catch (error) {
        navigate('/quizzes');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, navigate]);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const res = await api.post(`/quizzes/${id}/submit`, { 
        answers, 
        timeTaken,
        powerUpsUsed 
      });
      
      setResult(res.data);
      refreshUser();
      
      if (res.data.newAchievements?.length > 0) {
        setNewAchievement(res.data.newAchievements[0]);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setSubmitting(false);
    }
  }, [id, answers, startTime, submitting, powerUpsUsed, refreshUser]);

  useEffect(() => {
    if (timeLeft <= 0 || result || timeFrozen) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, result, timeFrozen, handleSubmit]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const usePowerUp = async (type) => {
    if (user.powerUps[type] <= 0 || powerUpsUsed.includes(type)) return;

    setPowerUpsUsed([...powerUpsUsed, type]);

    if (type === 'fiftyFifty') {
      const question = quiz.questions[currentQuestion];
      const wrongOptions = question.options
        .map((_, i) => i)
        .filter(i => i !== question.correctAnswer);
      const toHide = wrongOptions.sort(() => Math.random() - 0.5).slice(0, 2);
      setHiddenOptions(toHide);
    } else if (type === 'freezeTime') {
      setTimeFrozen(true);
      setTimeout(() => setTimeFrozen(false), 10000);
    } else if (type === 'skipQuestion') {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setHiddenOptions([]);
      }
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setHiddenOptions([]);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setHiddenOptions([]);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!quiz) return null;

  if (result) {
    const gradeColors = {
      A: '#22c55e', B: '#14b8a6', C: '#f59e0b', D: '#f97316', F: '#ef4444'
    };
    const grade = result.percentage >= 90 ? 'A' : result.percentage >= 80 ? 'B' : 
                  result.percentage >= 70 ? 'C' : result.percentage >= 60 ? 'D' : 'F';

    return (
      <div className="container fade-in">
        {newAchievement && (
          <AchievementPopup 
            achievement={newAchievement} 
            onClose={() => setNewAchievement(null)} 
          />
        )}
        
        <div className="card result-container glow">
          <h2>🎉 Quiz Complete!</h2>
          
          <div className="result-grade" style={{ 
            background: `linear-gradient(135deg, ${gradeColors[grade]}, ${gradeColors[grade]}88)` 
          }}>
            {grade}
          </div>
          
          <div className="result-score">{result.percentage}%</div>
          
          <p style={{ fontSize: '20px', opacity: 0.8, marginBottom: '20px' }}>
            {result.isPerfect ? '🌟 PERFECT SCORE! 🌟' :
             result.percentage >= 80 ? 'Excellent work!' :
             result.percentage >= 60 ? 'Good job!' :
             result.percentage >= 40 ? 'Keep practicing!' : 'Better luck next time!'}
          </p>

          <div className="rewards">
            <div className="reward-item">
              <div className="icon">⭐</div>
              <div className="value" style={{ color: '#22d3ee' }}>+{result.xpEarned}</div>
              <div className="label">XP Earned</div>
            </div>
            <div className="reward-item">
              <div className="icon">🪙</div>
              <div className="value" style={{ color: '#fbbf24' }}>+{result.coinsEarned}</div>
              <div className="label">Coins</div>
            </div>
            <div className="reward-item">
              <div className="icon">🔥</div>
              <div className="value" style={{ color: '#f97316' }}>{result.maxCombo}x</div>
              <div className="label">Max Combo</div>
            </div>
            <div className="reward-item">
              <div className="icon">✅</div>
              <div className="value">{result.score}/{result.totalPoints}</div>
              <div className="label">Score</div>
            </div>
          </div>

          {result.levelUp?.leveledUp && (
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(236, 72, 153, 0.3))',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <h3>🎊 Level Up!</h3>
              <p>You've reached Level {result.levelUp.newLevel}!</p>
            </div>
          )}

          <h3 style={{ marginTop: '40px', marginBottom: '20px' }}>📝 Answer Review</h3>
          
          {quiz.questions.map((q, idx) => (
            <div key={q._id} style={{ 
              background: 'var(--glass)',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '15px',
              textAlign: 'left'
            }}>
              <p style={{ fontWeight: '600', marginBottom: '15px' }}>
                {idx + 1}. {q.question}
              </p>
              {q.options.map((opt, optIdx) => (
                <div
                  key={optIdx}
                  className={`option ${
                    result.results[idx]?.correctAnswer === optIdx ? 'correct' :
                    result.results[idx]?.selectedAnswer === optIdx && !result.results[idx]?.isCorrect ? 'incorrect' : ''
                  }`}
                  style={{ padding: '12px', marginBottom: '8px' }}
                >
                  <span className="option-letter">{String.fromCharCode(65 + optIdx)}</span>
                  {opt}
                  {result.results[idx]?.correctAnswer === optIdx && ' ✓'}
                  {result.results[idx]?.selectedAnswer === optIdx && !result.results[idx]?.isCorrect && ' ✗'}
                </div>
              ))}
              {result.results[idx]?.explanation && (
                <p style={{ marginTop: '10px', opacity: 0.7, fontSize: '14px' }}>
                  💡 {result.results[idx].explanation}
                </p>
              )}
            </div>
          ))}

          <div className="flex flex-center gap-20 mt-20">
            <button className="btn btn-primary" onClick={() => navigate('/quizzes')}>
              🎮 Play More
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              📊 Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div className="container">
      <div className="question-container fade-in">
        <div className="card glow">
          {/* Header */}
          <div className="flex flex-between items-center" style={{ marginBottom: '20px' }}>
            <div>
              <h3 style={{ marginBottom: '5px' }}>{quiz.title}</h3>
              <span className={`badge badge-${quiz.difficulty}`}>{quiz.difficulty}</span>
            </div>
            <div className={`timer-display ${timeLeft < 60 ? 'danger' : timeLeft < 300 ? 'warning' : ''}`}>
              {timeFrozen && <span style={{ marginRight: '10px' }}>❄️</span>}
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Progress */}
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
          <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: '25px' }}>
            Question {currentQuestion + 1} of {quiz.questions.length}
          </p>

          {/* Power-ups */}
          <div className="flex flex-center gap-10 mb-20">
            <button 
              className="power-up" 
              onClick={() => usePowerUp('fiftyFifty')}
              disabled={user.powerUps?.fiftyFifty <= 0 || powerUpsUsed.includes('fiftyFifty')}
              title="Remove 2 wrong answers"
            >
              <span className="icon">🎯</span>
              <span className="count">{user.powerUps?.fiftyFifty || 0}</span>
            </button>
            <button 
              className="power-up"
              onClick={() => usePowerUp('freezeTime')}
              disabled={user.powerUps?.freezeTime <= 0 || powerUpsUsed.includes('freezeTime')}
              title="Freeze time for 10 seconds"
            >
              <span className="icon">❄️</span>
              <span className="count">{user.powerUps?.freezeTime || 0}</span>
            </button>
            <button 
              className="power-up"
              onClick={() => usePowerUp('skipQuestion')}
              disabled={user.powerUps?.skipQuestion <= 0 || powerUpsUsed.includes('skipQuestion')}
              title="Skip this question"
            >
              <span className="icon">⏭️</span>
              <span className="count">{user.powerUps?.skipQuestion || 0}</span>
            </button>
          </div>

          {/* Question */}
          <h2 style={{ marginBottom: '30px', fontSize: '24px' }}>{question.question}</h2>

          {/* Options */}
          {question.options.map((option, idx) => (
            <div
              key={idx}
              className={`option ${answers[currentQuestion] === idx ? 'selected' : ''}`}
              onClick={() => !hiddenOptions.includes(idx) && handleAnswer(idx)}
              style={{ 
                opacity: hiddenOptions.includes(idx) ? 0.3 : 1,
                pointerEvents: hiddenOptions.includes(idx) ? 'none' : 'auto'
              }}
            >
              <span className="option-letter">{letters[idx]}</span>
              {option}
            </div>
          ))}

          {/* Navigation */}
          <div className="flex flex-between mt-20">
            <button
              className="btn btn-secondary"
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
            >
              ← Previous
            </button>
            
            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={submitting || answers.includes(-1)}
              >
                {submitting ? 'Submitting...' : '✓ Submit Quiz'}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={nextQuestion}>
                Next →
              </button>
            )}
          </div>

          {/* Question Navigator */}
          <div className="question-nav">
            {quiz.questions.map((_, idx) => (
              <div
                key={idx}
                className={`question-nav-item ${
                  currentQuestion === idx ? 'current' : 
                  answers[idx] !== -1 ? 'answered' : ''
                }`}
                onClick={() => { setCurrentQuestion(idx); setHiddenOptions([]); }}
              >
                {idx + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Combo display */}
      {showCombo && combo > 1 && (
        <div className="combo">
          <div className="combo-count">{combo}x</div>
          <div className="combo-text">COMBO!</div>
        </div>
      )}
    </div>
  );
}

export default TakeQuiz;
