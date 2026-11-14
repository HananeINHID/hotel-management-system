/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1d9a8a',
          hover: '#167d70',
        },
        sidebar: {
          DEFAULT: '#0f3d3e',
          hover: '#165456',
        },
      },
    },
  },
  plugins: [],
}
