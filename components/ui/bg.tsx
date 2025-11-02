import React from 'react';

const Pattern = () => {
  return (
    <div className="w-full h-full" style={{
      backgroundColor: '#0c0c0c',
      backgroundImage: `linear-gradient(
        0deg,
        transparent 24%,
        #1e1e1e 25%,
        #1e1e1e 26%,
        transparent 27%,
        transparent 74%,
        #1e1e1e 75%,
        #1e1e1e 76%,
        transparent 77%,
        transparent
      ),
      linear-gradient(
        90deg,
        transparent 24%,
        #1e1e1e 25%,
        #1e1e1e 26%,
        transparent 27%,
        transparent 74%,
        #1e1e1e 75%,
        #1e1e1e 76%,
        transparent 77%,
        transparent
      )`,
      backgroundSize: '55px 55px'
    }} />
  );
}

export default Pattern;
