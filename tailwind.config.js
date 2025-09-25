/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: {
          900: '#021026',
          800: '#042047',
          700: '#063a6d',
        },
        coral: '#ff7f66',
        kelp: '#7bcf95',
      },
      fontFamily: {
        heading: ['Be Vietnam Pro', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        hud: '0 20px 45px rgba(4, 32, 71, 0.35)',
      },
    },
  },
  plugins: [],
};
