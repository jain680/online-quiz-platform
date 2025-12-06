import React, { useEffect } from 'react';

function AchievementPopup({ achievement, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="achievement-popup" onClick={onClose}>
      <div className="icon">{achievement.icon}</div>
      <h2 style={{ marginBottom: '10px' }}>Achievement Unlocked!</h2>
      <h3>{achievement.name}</h3>
      <p style={{ opacity: 0.8, marginTop: '10px' }}>+{achievement.xp} XP</p>
    </div>
  );
}

export default AchievementPopup;
