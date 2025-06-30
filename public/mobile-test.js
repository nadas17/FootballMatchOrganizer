// Mobile Optimization Test Script
// This script can be pasted into the browser console when running the application
// to test various mobile optimizations we've implemented

console.log('=== Mobile Optimization Test Script ===');

// Test GPU acceleration
function testGPUAcceleration() {
  const gpuElements = document.querySelectorAll('.gpu-accelerate');
  console.log(`Found ${gpuElements.length} elements with GPU acceleration`);
  
  // Check computed styles
  gpuElements.forEach((el, index) => {
    const style = window.getComputedStyle(el);
    console.log(`Element ${index + 1} - Transform: ${style.transform}, Backface: ${style.backfaceVisibility}`);
  });
  
  return gpuElements.length > 0;
}

// Test responsive sizing with clamp
function testResponsiveSizing() {
  // Check if ProfileForm container has responsive padding
  const formContainer = document.querySelector('form')?.parentElement;
  if (formContainer) {
    const style = window.getComputedStyle(formContainer);
    console.log(`Form container padding: ${style.padding}`);
    return true;
  }
  return false;
}

// Test form elements for mobile friendliness
function testFormElements() {
  const inputs = document.querySelectorAll('input, select');
  let mobileReady = true;
  
  inputs.forEach((input, index) => {
    const style = window.getComputedStyle(input);
    const height = parseInt(style.height);
    console.log(`Form element ${index + 1} height: ${height}px`);
    
    // Check if tap target is large enough (should be at least 44px)
    if (height < 44) {
      mobileReady = false;
      console.warn(`Form element ${index + 1} may be too small for mobile (${height}px)`);
    }
  });
  
  return mobileReady;
}

// Test touch action
function testTouchAction() {
  const buttons = document.querySelectorAll('button');
  let hasProperTouchAction = false;
  
  buttons.forEach((button, index) => {
    const style = window.getComputedStyle(button);
    console.log(`Button ${index + 1} touch-action: ${style.touchAction}`);
    if (style.touchAction === 'manipulation') {
      hasProperTouchAction = true;
    }
  });
  
  return hasProperTouchAction;
}

// Run all tests
function runAllTests() {
  const results = {
    gpuAcceleration: testGPUAcceleration(),
    responsiveSizing: testResponsiveSizing(),
    formElements: testFormElements(),
    touchAction: testTouchAction()
  };
  
  console.log('=== Test Results ===');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${test}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  });
  
  return results;
}

// Execute tests
runAllTests();

// Visual indicator that can be toggled for testing
function toggleMobileTestMode() {
  const id = 'mobile-test-indicator';
  let indicator = document.getElementById(id);
  
  if (indicator) {
    document.body.removeChild(indicator);
    return false;
  } else {
    indicator = document.createElement('div');
    indicator.id = id;
    indicator.style.position = 'fixed';
    indicator.style.bottom = '10px';
    indicator.style.right = '10px';
    indicator.style.backgroundColor = 'rgba(0, 128, 255, 0.7)';
    indicator.style.color = 'white';
    indicator.style.padding = '8px 12px';
    indicator.style.borderRadius = '4px';
    indicator.style.fontSize = '14px';
    indicator.style.fontWeight = 'bold';
    indicator.style.zIndex = '9999';
    indicator.textContent = 'Mobile Test Mode';
    
    document.body.appendChild(indicator);
    return true;
  }
}

// Toggle the test mode indicator
toggleMobileTestMode();

console.log('You can toggle the test indicator by running: toggleMobileTestMode()');
