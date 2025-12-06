import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CreateQuiz() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    category: '',
    icon: '📚',
    difficulty: 'medium',
    timeLimit: 10,
    xpReward: 50,
    coinReward: 25,
    isPublished: false,
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0, points: 10, explanation: '' }]
  });

  const icons = ['📚', '🔬', '🌍', '💻', '🎮', '🎬', '🎵', '⚽', '🧮', '🎨', '📜', '🌟'];

  const addQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0, points: 10, explanation: '' }]
    });
  };

  const removeQuestion = (index) => {
    if (quiz.questions.length === 1) return;
    const newQuestions = quiz.questions.filter((_, i) => i !== index);
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[index][field] = value;
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const updateOption = (qIndex, optIndex, value) => {
    const newQuestions = [...quiz.questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const handleSubmit = async (publish = false) => {
    setError('');
    setLoading(true);

    try {
      const quizData = { ...quiz, isPublished: publish };
      await api.post('/quizzes', quizData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fade-in">
      <div className="card glow">
        <h2 style={{ marginBottom: '30px' }}>✍️ Create New Quiz</h2>
        
        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.2)', 
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '15px', 
            borderRadius: '12px', 
            marginBottom: '20px',
            color: '#ef4444'
          }}>
            {error}
          </div>
        )}

        <div className="grid grid-2 gap-20" style={{ marginBottom: '30px' }}>
          <div className="input-group">
            <label>Quiz Title *</label>
            <input
              type="text"
              value={quiz.title}
              onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
              placeholder="Enter quiz title"
              required
            />
          </div>
          <div className="input-group">
            <label>Category *</label>
            <input
              type="text"
              value={quiz.category}
              onChange={(e) => setQuiz({ ...quiz, category: e.target.value })}
              placeholder="e.g., Science, History, Gaming"
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label>Description</label>
          <textarea
            value={quiz.description}
            onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
            placeholder="Brief description of your quiz"
            rows="3"
            style={{
              width: '100%',
              padding: '14px 18px',
              background: 'var(--glass)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              color: '#fff',
              resize: 'vertical'
            }}
          />
        </div>

        <div className="grid grid-4 gap-20" style={{ marginBottom: '30px' }}>
          <div className="input-group">
            <label>Icon</label>
            <div className="flex gap-10" style={{ flexWrap: 'wrap' }}>
              {icons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setQuiz({ ...quiz, icon })}
                  style={{
                    fontSize: '24px',
                    padding: '10px',
                    background: quiz.icon === icon ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--glass)',
                    border: quiz.icon === icon ? '2px solid #fff' : '1px solid var(--glass-border)',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="input-group">
            <label>Difficulty</label>
            <select
              value={quiz.difficulty}
              onChange={(e) => setQuiz({ ...quiz, difficulty: e.target.value })}
            >
              <option value="easy">🟢 Easy</option>
              <option value="medium">🟡 Medium</option>
              <option value="hard">🔴 Hard</option>
              <option value="extreme">💀 Extreme</option>
            </select>
          </div>
          <div className="input-group">
            <label>Time Limit (minutes)</label>
            <input
              type="number"
              value={quiz.timeLimit}
              onChange={(e) => setQuiz({ ...quiz, timeLimit: parseInt(e.target.value) || 10 })}
              min="1"
              max="60"
            />
          </div>
          <div className="input-group">
            <label>XP Reward</label>
            <input
              type="number"
              value={quiz.xpReward}
              onChange={(e) => setQuiz({ ...quiz, xpReward: parseInt(e.target.value) || 50 })}
              min="10"
              max="500"
            />
          </div>
        </div>

        <h3 style={{ margin: '30px 0 20px' }}>📝 Questions ({quiz.questions.length})</h3>

        {quiz.questions.map((q, qIndex) => (
          <div key={qIndex} style={{ 
            background: 'var(--glass)', 
            padding: '25px', 
            borderRadius: '16px', 
            marginBottom: '20px',
            border: '1px solid var(--glass-border)'
          }}>
            <div className="flex flex-between items-center" style={{ marginBottom: '20px' }}>
              <h4>Question {qIndex + 1}</h4>
              {quiz.questions.length > 1 && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeQuestion(qIndex)}
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  Remove
                </button>
              )}
            </div>

            <div className="input-group">
              <label>Question Text *</label>
              <input
                type="text"
                value={q.question}
                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                placeholder="Enter your question"
                required
              />
            </div>

            <div className="grid grid-2 gap-10" style={{ marginBottom: '15px' }}>
              {q.options.map((opt, optIndex) => (
                <div key={optIndex} className="input-group" style={{ marginBottom: 0 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctAnswer === optIndex}
                      onChange={() => updateQuestion(qIndex, 'correctAnswer', optIndex)}
                      style={{ width: '18px', height: '18px' }}
                    />
                    Option {String.fromCharCode(65 + optIndex)} 
                    {q.correctAnswer === optIndex && <span style={{ color: '#22c55e' }}>✓ Correct</span>}
                  </label>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-2 gap-20">
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Points</label>
                <input
                  type="number"
                  value={q.points}
                  onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value) || 10)}
                  min="1"
                  max="100"
                />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label>Explanation (shown after quiz)</label>
                <input
                  type="text"
                  value={q.explanation}
                  onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                  placeholder="Why is this the correct answer?"
                />
              </div>
            </div>
          </div>
        ))}

        <button 
          type="button"
          className="btn btn-secondary" 
          onClick={addQuestion} 
          style={{ marginBottom: '30px' }}
        >
          + Add Question
        </button>

        <div className="flex gap-10">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleSubmit(false)}
            disabled={loading}
          >
            💾 Save as Draft
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSubmit(true)}
            disabled={loading}
          >
            {loading ? 'Creating...' : '🚀 Publish Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateQuiz;
