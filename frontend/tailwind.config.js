/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a2744',
          light: '#2a3d5e',
          dark: '#111b30',
        },
        secondary: {
          DEFAULT: '#2f5496',
          light: '#3d6ab8',
          dark: '#243f73',
        },
        accent: {
          DEFAULT: '#90caf9',
          light: '#bbdefb',
          dark: '#64b5f6',
        },
        success: {
          DEFAULT: '#4caf50',
          light: '#81c784',
          dark: '#388e3c',
        },
        warning: {
          DEFAULT: '#ff9800',
          light: '#ffb74d',
          dark: '#f57c00',
        },
        danger: {
          DEFAULT: '#f44336',
          light: '#e57373',
          dark: '#d32f2f',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f5f5f5',
          hover: '#fafafa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}