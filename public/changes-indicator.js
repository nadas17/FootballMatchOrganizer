// This script will change the background color of the page to red
// It will be injected directly into the index.html file
document.addEventListener('DOMContentLoaded', function() {
  // Create a div that covers the entire page
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
  overlay.style.zIndex = '999999';
  overlay.style.pointerEvents = 'none'; // Allow clicking through
  
  // Create a message to display
  const message = document.createElement('div');
  message.style.position = 'fixed';
  message.style.top = '20px';
  message.style.left = '50%';
  message.style.transform = 'translateX(-50%)';
  message.style.backgroundColor = 'yellow';
  message.style.color = 'black';
  message.style.padding = '10px 20px';
  message.style.borderRadius = '10px';
  message.style.fontWeight = 'bold';
  message.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
  message.style.zIndex = '1000000';
  message.innerHTML = 'CHANGES APPLIED SUCCESSFULLY!';
  
  // Add the overlay and message to the body
  document.body.appendChild(overlay);
  document.body.appendChild(message);
  
  // Remove them after 10 seconds
  setTimeout(function() {
    document.body.removeChild(overlay);
    document.body.removeChild(message);
  }, 10000);
});
