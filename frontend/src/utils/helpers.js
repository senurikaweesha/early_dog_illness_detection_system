/**
 * Format age in years to a human-readable string
 * @param {number} ageInYears - Age in years (can be decimal)
 * @returns {string} Formatted age string
 */
export const formatAge = (ageInYears) => {
  if (!ageInYears) return '0 months';
  
  const years = Math.floor(ageInYears);
  const months = Math.round((ageInYears - years) * 12);
  
  if (years === 0) {
    return `${months} ${months === 1 ? 'month' : 'months'}`;
  }
  
  if (months === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  }
  
  return `${years} ${years === 1 ? 'year' : 'years'}, ${months} ${months === 1 ? 'month' : 'months'}`;
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format timestamp to readable string with time
 * @param {string|Date} timestamp - Timestamp to format
 * @returns {string} Formatted timestamp string
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get password strength
 * @param {string} password - Password to check
 * @returns {object} Strength info {score, label, color}
 */
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'Weak', color: 'red' };
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character variety
  if (/[a-z]/.test(password)) score++; // lowercase
  if (/[A-Z]/.test(password)) score++; // uppercase
  if (/[0-9]/.test(password)) score++; // numbers
  if (/[^A-Za-z0-9]/.test(password)) score++; // special chars
  
  // Determine strength
  if (score <= 2) return { score, label: 'Weak', color: 'red' };
  if (score <= 4) return { score, label: 'Medium', color: 'orange' };
  return { score, label: 'Strong', color: 'green' };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} True if password meets minimum requirements
 */
export const validatePassword = (password) => {
  if (!password) return false;
  // At least 8 characters
  return password.length >= 8;
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

/**
 * Validate name
 * @param {string} name - Name to validate
 * @returns {boolean} True if valid name
 */
export const validateName = (name) => {
  if (!name) return false;
  return name.trim().length >= 2;
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format confidence percentage
 * @param {number} confidence - Confidence value (0-1 or 0-100)
 * @returns {string} Formatted confidence percentage
 */
export const formatConfidence = (confidence) => {
  if (confidence === null || confidence === undefined) return 'N/A';
  
  // If confidence is between 0-1, convert to percentage
  const percentage = confidence <= 1 ? confidence * 100 : confidence;
  
  return `${Math.round(percentage)}%`;
};
