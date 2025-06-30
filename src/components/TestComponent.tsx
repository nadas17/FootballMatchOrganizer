import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f0f0f0',
      borderRadius: '10px',
      margin: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#2563eb' }}>Test Component is Working!</h1>
      <p style={{ color: '#4b5563' }}>
        If you can see this, React is functioning properly.
      </p>
      <button 
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '5px',
          border: 'none',
          cursor: 'pointer',
          marginTop: '10px'
        }}
        onClick={() => alert('Button clicked!')}
      >
        Click Me
      </button>
    </div>
  );
};

export default TestComponent;
