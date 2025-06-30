import React from 'react';

const MaintenanceBanner: React.FC = () => {
  return (
    <div style={{
      backgroundColor: '#ff4500',
      color: 'white',
      textAlign: 'center',
      padding: '10px',
      position: 'fixed',
      bottom: '0',
      left: '0',
      width: '100%',
      fontWeight: 'bold',
      zIndex: 9999,
      boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.3)'
    }}>
      🚀 Updates Applied Successfully! 🚀
    </div>
  );
};

export default MaintenanceBanner;
