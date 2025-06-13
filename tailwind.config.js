/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#00A3E0', // Blue from logo
        secondary: '#800080', // Purple from logo
        accent: '#FF4500', // Red from logo
        background: '#1C2526', // Dark gray to match black
        border: '#FFFFFF', // White for frame effect
      },
    },
  },
  plugins: [],
};