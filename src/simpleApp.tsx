import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Extremely simple component with no dependencies
const SimpleApp = () => {
  const [count, setCount] = React.useState(0);
  
  return (
    <div style={{
      maxWidth: '600px',
      margin: '50px auto',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#2563eb' }}>Simple React App</h1>
      <p>This is a basic React app with no external dependencies to test if React is working properly.</p>
      
      <div style={{ marginTop: '20px' }}>
        <p>You clicked {count} times</p>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Click me
        </button>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <p>React version: {React.version}</p>
        <p>Current time: {new Date().toLocaleTimeString()}</p>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <a
          href="/"
          style={{
            display: 'inline-block',
            backgroundColor: '#4b5563',
            color: 'white',
            textDecoration: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            marginRight: '10px'
          }}
        >
          Go to Main App
        </a>
        
        <a
          href="/working-test.html"
          style={{
            display: 'inline-block',
            backgroundColor: '#059669',
            color: 'white',
            textDecoration: 'none',
            padding: '10px 20px',
            borderRadius: '5px'
          }}
        >
          Go to Test Page
        </a>
      </div>
    </div>
  );
};

// Try to render
try {
  console.log('Simple app starting...');
  const container = document.getElementById("root");
  
  if (!container) {
    console.error('Could not find root element!');
    document.body.innerHTML = '<div style="color: red; padding: 20px;">Root element not found!</div>';
  } else {
    console.log('Root element found, creating root...');
    const root = createRoot(container);
    console.log('Rendering app...');
    root.render(<SimpleApp />);
    console.log('App rendered successfully!');
  }
} catch (error) {
  console.error('Error rendering simple app:', error);
  
  // Create fallback UI
  const errorDiv = document.createElement('div');
  errorDiv.style.maxWidth = '600px';
  errorDiv.style.margin = '50px auto';
  errorDiv.style.backgroundColor = '#fee2e2';
  errorDiv.style.color = '#b91c1c';
  errorDiv.style.padding = '20px';
  errorDiv.style.borderRadius = '10px';
  
  errorDiv.innerHTML = `
    <h1>React Error</h1>
    <div style="white-space: pre-wrap; font-family: monospace; margin: 20px 0; padding: 10px; background-color: #fef2f2;">
      ${error.toString()}
    </div>
    <p>There was an error loading React. Please check the console for more details.</p>
    <div style="margin-top: 20px;">
      <a href="/working-test.html" style="display: inline-block; background-color: #059669; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px;">
        Go to Test Page
      </a>
    </div>
  `;
  
  document.body.appendChild(errorDiv);
}
