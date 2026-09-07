import React from 'react';

const EMOJIS = ['💪', '🏋️', '⚡', '💧', '🏆', '🔥', '🦾', '🥤', '🫀', '🎯'];

const Stickers = ({ count = 4, className = '' }) => {
  const chosen = [...EMOJIS].sort(() => 0.5 - Math.random()).slice(0, count);
  return (
    <div aria-hidden className={`pointer-events-none select-none ${className}`}>
      {chosen.map((emoji, i) => (
        <span
          key={i}
          className="sticker-float text-xl sm:text-2xl opacity-25 hover:opacity-40 transition-opacity"
          style={{ margin: '0 6px', animationDelay: `${i * 0.45}s`, animationDuration: `${2.8 + (i % 3) * 0.5}s` }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
};

export default Stickers;
