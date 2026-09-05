import React from 'react';

const EMOJIS = ['💪', '🏋️', '⚡', '💧', '🏆', '🔥', '🦾', '🥤', '🫀', '🎯'];

const Stickers = ({ count = 4, className = '' }) => {
  const chosen = [...EMOJIS].sort(() => 0.5 - Math.random()).slice(0, count);
  return (
    <div aria-hidden className={`pointer-events-none select-none ${className}`}>
      {chosen.map((emoji, i) => (
        <span
          key={i}
          className="inline-block text-xl sm:text-2xl opacity-25 rotate-[-8deg] hover:opacity-40 transition-opacity"
          style={{ margin: '0 6px' }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
};

export default Stickers;
