import React from 'react';

const FITHUBLogo = ({ size = 60, theme = 'dark' }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '28%',
        overflow: 'hidden',
        border: theme === 'dark' ? '2px solid rgba(99,102,241,0.45)' : '2px solid rgba(76,29,149,0.35)',
        boxShadow: theme === 'dark'
          ? '0 0 14px rgba(99,102,241,0.35), inset 0 0 0 rgba(0,0,0,0)'
          : '0 2px 8px rgba(0,0,0,0.25)',
        background: theme === 'dark' ? 'rgba(15,23,42,0.55)' : 'rgba(255,255,255,0.9)',
        flexShrink: 0,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      className="fithub-logo"
    >
      <img
        src={`${process.env.PUBLIC_URL}/IMG_7547.PNG`}
        alt="FITHUB"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block'
        }}
      />
    </div>
  );
};

export default FITHUBLogo;