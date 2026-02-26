/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
        extend: {
            animation: {
                'border': 'border 8s linear infinite',
            },
            keyframes: {
                'border': {
                    to: { '--border-angle': '360deg' },
                }
            }                      
        },
    },
  plugins: [
    require('daisyui'),
  ],
}