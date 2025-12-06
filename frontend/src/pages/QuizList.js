import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function QuizList() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: ''
  });

  useEffect(() => {
    api.get('/quizzes/categories').then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.difficulty) params.append('difficulty', filters.difficulty);
        if (filters.search) params.append('search', filters.search);

        const res = await api.get(`/quizzes?${params.toString()}`);
        setQuizzes(res.data);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [filters]);

  return (
    <div className="container fade-in">
      <div className="card">
        <h2 style={{ marginBottom: '25px' }}>🎮 Browse Quizzes</h2>
        <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="🔍 Search quizzes..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            style={{ 
              flex: 1, 
              minWidth: '200px', 
              padding: '14px 18px',
              background: 'var(--glass)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              color: '#fff'
            }}
          />
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            style={{ 
              padding: '14px 18px',
              background: 'var(--glass)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              color: '#fff',
              minWidth: '150px'
            }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat._id} ({cat.count})</option>
            ))}
          </select>
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            style={{ 
              padding: '14px 18px',
              background: 'var(--glass)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              color: '#fff',
              minWidth: '150px'
            }}
          >
            <option value="">All Difficulties</option>
            <option value="easy">🟢 Easy</option>
            <option value="medium">🟡 Medium</option>
            <option value="hard">🔴 Hard</option>
            <option value="extreme">💀 Extreme</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : quizzes.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
          <h3>No quizzes found</h3>
          <p style={{ opacity: 0.7 }}>Try adjusting your filters or check back later.</p>
        </div>
      ) : (
        <div className="quiz-grid">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="quiz-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <div className="icon">{quiz.icon || '📚'}</div>
                <div style={{ flex: 1 }}>
                  <h3>{quiz.title}</h3>
                  <p style={{ marginTop: '5px' }}>{quiz.description || 'Test your knowledge!'}</p>
                </div>
              </div>
              
              <div style={{ margin: '15px 0' }}>
                <span className="badge badge-category">{quiz.category}</span>
                <span className={`badge badge-${quiz.difficulty}`}>{quiz.difficulty}</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid var(--glass-border)'
              }}>
                <div style={{ opacity: 0.8 }}>
                  <span>📝 {quiz.questions?.length || 0} Q</span>
                  <span style={{ marginLeft: '15px' }}>⏱️ {quiz.timeLimit}m</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ color: '#22d3ee' }}>⭐ +{quiz.xpReward} XP</span>
                  {user ? (
                    <Link to={`/quiz/${quiz._id}`}>
                      <button className="btn btn-primary">Play</button>
                    </Link>
                  ) : (
                    <Link to="/login">
                      <button className="btn btn-secondary">Login</button>
                    </Link>
                  )}
                </div>
              </div>
              
              {quiz.playCount > 0 && (
                <div style={{ marginTop: '10px', fontSize: '12px', opacity: 0.6 }}>
                  👥 {quiz.playCount} plays • ⭐ {quiz.avgScore?.toFixed(0) || 0}% avg
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizList;
