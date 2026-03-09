// ============================================
// API ENDPOINTS
// ============================================
export const API_ENDPOINTS = {
    REGISTER: '/api/register',
    LOGIN: '/api/login',
    DOGS: '/api/dogs',
    PREDICT: '/api/predict',
    HISTORY: '/api/history',
};

// ============================================
// CLASSIFICATION TYPES
// ============================================
export const CLASSIFICATION_TYPES = {
    NORMAL: 'Normal',
    ABNORMAL: 'Abnormal',
};

// ============================================
// URGENCY LEVELS
// ============================================
export const URGENCY_LEVELS = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
};

// ============================================
// BADGE VARIANTS
// ============================================
export const BADGE_VARIANTS = {
    NORMAL: 'normal',
    ABNORMAL: 'abnormal',
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
};

// ============================================
// BUTTON VARIANTS
// ============================================
export const BUTTON_VARIANTS = {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    GHOST: 'ghost',
    DANGER: 'danger',
};

// ============================================
// TOAST TYPES
// ============================================
export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
};

// ============================================
// VIDEO CONSTRAINTS
// ============================================
export const VIDEO_CONSTRAINTS = {
    MAX_SIZE_MB: 100,
    MAX_SIZE_BYTES: 100 * 1024 * 1024,
    ALLOWED_TYPES: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'],
    ALLOWED_EXTENSIONS: ['.mp4', '.mpeg', '.mov', '.avi'],
};

// ============================================
// ROUTES
// ============================================
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    DASHBOARD: '/dashboard',
    ANALYZE: '/analyze',
    HISTORY: '/history',
    DOGS: '/dogs',
    ADD_DOG: '/add-dog',
    EDIT_DOG: '/edit-dog/:id',
    VET_DASHBOARD: '/vet-dashboard',
};

// ============================================
// VALIDATION RULES
// ============================================
export const VALIDATION = {
    PASSWORD_MIN_LENGTH: 8,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_REQUIREMENTS: {
        MIN_LENGTH: 8,
        UPPERCASE: /[A-Z]/,
        LOWERCASE: /[a-z]/,
        NUMBER: /[0-9]/,
        SPECIAL_CHAR: /[!@#$%^&*(),.?":{}|<>]/,
    },
};

// ============================================
// MODEL INFORMATION (for display)
// ============================================
export const MODEL_INFO = {
    NAME: 'CNN+LSTM Hybrid',
    BACKBONE: 'MobileNetV2',
    THRESHOLD: 0.3,
    FRAMES_PER_VIDEO: 30,
    IMAGE_SIZE: 224,
    VALIDATION_ACCURACY: 91.67,
    PRECISION: 100,
    RECALL: 83.33,
};

// ============================================
// LOCAL STORAGE KEYS
// ============================================
export const STORAGE_KEYS = {
    USER: 'user',
    AUTH_TOKEN: 'authToken',
    REMEMBER_ME: 'rememberMe',
};
