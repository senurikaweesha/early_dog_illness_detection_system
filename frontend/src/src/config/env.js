const requiredEnvVars = ['VITE_API_BASE_URL'];

const validateEnv = () => {
    const missing = requiredEnvVars.filter((varName) => !import.meta.env[varName]);

    if (missing.length > 0) {
        console.warn('Warning: Missing recommended environment variables:', missing);
        console.warn(
            `Missing environment variables: ${missing.join(', ')}\n` +
            'Please check your .env file or rely on fallbacks.'
        );
    }
};

// Validate on import
if (import.meta.env.PROD) {
    validateEnv();
}

export const config = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    mode: import.meta.env.MODE,
};

export default config;
