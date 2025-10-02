import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brixem-primary': {
          DEFAULT: '#2DCAD8',
          dark: '#36098E',
        },
        'brixem-gray': {
          50: '#F8F9FB',
          100: '#F1F3F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        'brixem-accent': '#7C3AED',
        'sidebar-bg': '#F4F6FA',
        'card-bg': '#D9D9D9',
        'status-todo': '#3B82F6',
        'status-inprogress': '#F59E42',
        'status-completed': '#22C55E',
        'priority-important': '#6366F1',
        'priority-high': '#EF4444',
        'priority-ok': '#22C55E',
        'gray-dark': '#222B45',
        'gray-light': '#8F9BB3',
        'border-light': '#E4E9F2',
        'brixem-bg': '#D3D3D3',
      },
      fontFamily: {
        sans: ['Nunito', 'Inter', 'Albert Sans', 'sans-serif'],
      },
      borderRadius: {
        'xl': '24px',
      },
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        gradient: 'gradient 8s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
};

export default config; 