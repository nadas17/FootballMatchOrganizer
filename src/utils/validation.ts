// Input validation and sanitization utilities

export const sanitizeString = (input: string): string => {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

export const validatePlayerName = (name: string): boolean => {
  const sanitized = sanitizeString(name);
  return sanitized.length >= 2 && sanitized.length <= 50 && /^[a-zA-Z0-9\s\-_]+$/.test(sanitized);
};

export const validateMatchTitle = (title: string): boolean => {
  if (!title) return true; // Optional field
  const sanitized = sanitizeString(title);
  return sanitized.length <= 100;
};

export const validateDescription = (description: string): boolean => {
  if (!description) return true; // Optional field
  const sanitized = sanitizeString(description);
  return sanitized.length <= 500;
};

export const validateLocation = (location: string): boolean => {
  if (!location) return true; // Optional field
  const sanitized = sanitizeString(location);
  return sanitized.length <= 200;
};

export const validatePrice = (price: string): boolean => {
  if (!price) return true; // Optional field
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice >= 0 && numPrice <= 1000;
};

export const validateMaxPlayers = (maxPlayers: string): boolean => {
  if (!maxPlayers) return true; // Optional field
  const num = parseInt(maxPlayers);
  return !isNaN(num) && num >= 2 && num <= 22;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};
