/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#3498db',
        'primary-dark': '#2980b9',
        'primary-purple': '#9b59b6',
        'primary-green': '#2ecc71',
        'dark-slate': '#2c3e50',
        'medium-slate': '#34495e',
        'light-slate': '#7f8c8d',
        'text-white': '#ffffff',
        'text-light': '#ecf0f1',
        'text-gray': '#bdc3c7',
        'text-dark': '#333333',
        'background-light': '#f0f2f5',
        'error-red': '#e74c3c',
        'success-green': '#27ae60',
      },
      boxShadow: {
        'light': '0 2px 10px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 20px rgba(0, 0, 0, 0.15)',
        'heavy': '0 8px 30px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 30px rgba(52, 152, 219, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'gradient-shift': 'gradientShift 15s ease infinite',
        'floating-orbs': 'floatingOrbs 20s ease-in-out infinite',
        'sidebar-glow': 'sidebarGlow 12s ease-in-out infinite',
        'fade-in-down': 'fadeInDown 0.8s ease-out',
        'fade-in-left': 'fadeInLeft 0.8s ease-out',
        'fade-in-up': 'fadeInUp 0.8s ease-out',
        'text-gradient': 'textGradient 8s ease-in-out infinite',
        'underline-glow': 'underlineGlow 3s ease-in-out infinite',
        'background-shimmer': 'backgroundShimmer 5s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        floatingOrbs: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.1)' },
          '66%': { transform: 'translate(-30px, 30px) scale(0.9)' },
        },
        sidebarGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        fadeInDown: {
          'from': { opacity: '0', transform: 'translateY(-20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          'from': { opacity: '0', transform: 'translateX(-30px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        textGradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        underlineGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'translateX(-50%) scaleX(1)' },
          '50%': { opacity: '1', transform: 'translateX(-50%) scaleX(1.3)' },
        },
        backgroundShimmer: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
      },
    },
  },
  plugins: [],
}

