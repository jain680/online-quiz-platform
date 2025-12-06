import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/results/my-results').then(res => {
      setResults(res.data);
      setLoading(false);
    });
  }, []);

  const getGrade = (percentage) => {
    if (percentage >= 90) return { grade: 'A', color: '#22c55e' };
    if (percentage >= 80) return { grade: 'B', color: '#14b8a6' };
    if (percentage >= 70) return { grade: 'C', color: '#f59e0b' };
    if (percentage >= 60) return { grade: 'D', color: '#f97316' };
    return { grade: 'F', color: '#ef4444' };
  };

  const formatTime = (seconds) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  const stats = {
    totalQuizzes: results.length,
    avgScore: results.length ? Math.round(results.reduce((acc, r) => acc + r.percentage, 0) / results.length) : 0,
    totalXp: results.reduce((acc, r) => acc + (r.xpEarned || 0), 0),
    perfectScores: results.filter(r => r.isPerfect).length
  };

  return (
    <div className="container fade-in">
      <div className="card glow" style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '30px' }}>📊 My Results</h2>
        
        <div className="grid grid-4 gap-20">
          <div style={{ background: 'var(--glass)', padding: '25px', borderRadius: '12px' }}>
            <div style={{ fontSize: '42px', fontWeight: '700', color: '#22d3ee' }}>
              {stats.totalQuizzes}
            </div>
            <div style={{ opacity: 0.7 }}>Quizzes Taken</div>
          </div>
          <div style={{ background: 'var(--glass)', padding: '25px', borderRadius: '12px' }}>
            <div style={{ fontSize: '42px', fontWeight: '700', color: '#22c55e' }}>
              {stats.avgScore}%
            </div>
            <div style={{ opacity: 0.7 }}>Avg Score</div>
          </div>
          <div style={{ background: 'var(--glass)', padding: '25px', borderRadius: '12px' }}>
            <div style={{ fontSize: '42px', fontWeight: '700', color: '#fbbf24' }}>
              {stats.totalXp.toLocaleString()}
            </div>
            <div style={{ opacity: 0.7 }}>XP Earned</div>
          </div>
          <div style={{ background: 'var(--glass)', padding: '25px', borderRadius: '12px' }}>
            <div style={{ fontSize: '42px', fontWeight: '700', color: '#ec4899' }}>
              {stats.perfectScores}
            </div>
            <div style={{ opacity: 0.7 }}>Perfect Scores</div>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎮</div>
          <h3>No results yet</h3>
          <p style={{ opacity: 0.7 }}>Take some quizzes to see your results here!</p>
        </div>
      ) : (
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>📝 Quiz History</h3>
          
          {results.map(result => {
            const { grade, color } = getGrade(result.percentage);
            return (
              <div key={result._id} style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '20px',
                background: 'var(--glass)',
                borderRadius: '12px',
                marginBottom: '15px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${color}, ${color}88)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: '800'
                }}>
                  {grade}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h4>{result.quiz?.title || 'Unknown Quiz'}</h4>
                  <div style={{ marginTop: '5px' }}>
                    <span className="badge badge-category">{result.quiz?.category}</span>
                    <span className={`badge badge-${result.quiz?.difficulty}`}>{result.quiz?.difficulty}</span>
                    {result.isPerfect && <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>⭐ Perfect</span>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                  {result.maxCombo > 2 && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#f97316' }}>
                        🔥 {result.maxCombo}x
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>Combo</div>
                    </div>
                  )}
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#22d3ee' }}>
                      +{result.xpEarned}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>XP</div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#fbbf24' }}>
                      +{result.coinsEarned}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>Coins</div>
                  </div>
                  
                  <div style={{ textAlign: 'center', minWidth: '80px' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700' }}>
                      {formatTime(result.timeTaken)}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>Time</div>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '100px' }}>
                    <div style={{ fontSize: '32px', fontWeight: '700', color }}>
                      {result.percentage}%
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                      {result.score}/{result.totalPoints} pts
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Results;
