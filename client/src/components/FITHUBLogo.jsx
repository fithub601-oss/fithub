import React from 'react';

const FITHUBLogo = ({ size = 60, theme = 'dark' }) => {
  return (
    <img
      src={`${process.env.PUBLIC_URL}/IMG_7547.PNG`}
      alt="FITHUB"
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
    />
  );
};

export default FITHUBLogo;