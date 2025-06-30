// This script can be added to index.html to diagnose issues with the React application
// It will capture errors and display them on the page
document.addEventListener('DOMContentLoaded', function() {
  // Create container for errors
  const errorContainer = document.createElement('div');
  errorContainer.id = 'error-container';
  errorContainer.style.position = 'fixed';
  errorContainer.style.top = '0';
  errorContainer.style.left = '0';
  errorContainer.style.width = '100%';
  errorContainer.style.backgroundColor = '#fee2e2';
  errorContainer.style.color = '#b91c1c';
  errorContainer.style.padding = '10px';
  errorContainer.style.zIndex = '9999';
  errorContainer.style.display = 'none';
  errorContainer.style.fontFamily = 'monospace';
  errorContainer.style.fontSize = '12px';
  errorContainer.style.whiteSpace = 'pre-wrap';
  errorContainer.style.overflow = 'auto';
  errorContainer.style.maxHeight = '50vh';
  
  // Create header
  const header = document.createElement('div');
  header.textContent = 'React Application Errors';
  header.style.fontWeight = 'bold';
  header.style.marginBottom = '5px';
  header.style.fontSize = '14px';
  errorContainer.appendChild(header);
  
  // Create error list
  const errorList = document.createElement('div');
  errorList.id = 'error-list';
  errorContainer.appendChild(errorList);
  
  // Add container to body
  document.body.appendChild(errorContainer);
  
  // Original error handler
  const originalConsoleError = console.error;
  
  // Override console.error to capture React errors
  console.error = function() {
    // Call original console.error
    originalConsoleError.apply(console, arguments);
    
    // Format error message
    const errorMessage = Array.from(arguments)
      .map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2))
      .join(' ');
    
    // Add error to the list
    const errorItem = document.createElement('div');
    errorItem.textContent = '• ' + errorMessage;
    errorItem.style.marginBottom = '10px';
    
    const errorList = document.getElementById('error-list');
    errorList.appendChild(errorItem);
    
    // Show the container
    document.getElementById('error-container').style.display = 'block';
  };
  
  // Catch other errors
  window.addEventListener('error', function(event) {
    const errorList = document.getElementById('error-list');
    const errorItem = document.createElement('div');
    errorItem.textContent = '• ' + event.message + ' at ' + event.filename + ':' + event.lineno;
    errorItem.style.marginBottom = '10px';
    errorList.appendChild(errorItem);
    
    document.getElementById('error-container').style.display = 'block';
    
    return false;
  });

  // Check if React root was rendered
  setTimeout(function() {
    const root = document.getElementById('root');
    if (root && (!root.childNodes || root.childNodes.length === 0)) {
      const errorList = document.getElementById('error-list');
      const errorItem = document.createElement('div');
      errorItem.textContent = '• React application did not render anything in the root element. Check the console for errors.';
      errorItem.style.marginBottom = '10px';
      errorList.appendChild(errorItem);
      
      document.getElementById('error-container').style.display = 'block';
      
      // Add fallback content to show something isn't broken
      const fallback = document.createElement('div');
      fallback.style.textAlign = 'center';
      fallback.style.fontFamily = 'Arial, sans-serif';
      fallback.style.marginTop = '100px';
      
      fallback.innerHTML = `
        <h2 style="color: #2563eb;">Application Error</h2>
        <p style="color: #4b5563;">There was a problem loading the application.</p>
        <p style="color: #4b5563;">Please check the browser console for more details.</p>
        <div style="margin-top: 20px;">
          <a href="/working-test.html" style="background-color: #2563eb; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">View Test Page</a>
        </div>
      `;
      
      root.appendChild(fallback);
    }
  }, 2000);
});
