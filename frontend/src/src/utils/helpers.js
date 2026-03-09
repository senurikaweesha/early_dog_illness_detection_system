export function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatConfidence(score) {
  // Score is already a percentage from the backend (e.g. 93.46)
  // Ensure we handle cases where it might be provided as a decimal by checking if it's <= 1.
  // In our current backend, it's multiplied by 100 before sending.
  const percentage = score <= 1 && score > 0 ? score * 100 : score;
  return `${percentage.toFixed(2)}%`;
}

export function getUrgencyLevel(confidence, isAbnormal) {
  if (!isAbnormal) return "Low";
  if (confidence > 0.85) return "High";
  if (confidence > 0.6) return "Medium";
  return "Low";
}

export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password) {
  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long.",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter.",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter.",
    };
  }
  if (!/\d/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number.",
    };
  }
  return { valid: true, message: "" };
}

export function getPasswordStrength(password) {
  if (password.length < 6) return "weak";
  if (password.length < 10) return "medium";
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  if (hasNumber && hasSpecial) return "strong";
  return "medium";
}
