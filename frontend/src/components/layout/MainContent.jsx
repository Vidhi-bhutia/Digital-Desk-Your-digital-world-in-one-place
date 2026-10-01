import React from 'react';

export const MainContent = ({ children }) => {
  return (
    <main
      className="dd-main-content animate-fade-in"
      style={{
        flex: 1,
        padding: '32px 28px',
        overflowY: 'auto',
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
      }}
    >
      {children}
    </main>
  );
};

export default MainContent;
