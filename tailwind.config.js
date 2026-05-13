/** @type {import('tailwindcss').Config} */
export default {
    content: ['./app/**/*.{vue,js,ts,jsx,tsx}', './components/**/*.{vue,js,ts,jsx,tsx}', './layouts/**/*.{vue,js,ts,jsx,tsx}', './pages/**/*.{vue,js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
               
            },
        },
        fontFamily: {
            Manrope: "Manrope, sans-serif",
            Mansalva: "Mansalva, sans-serif",
            Rubik: "Rubik, sans-serif",
            DM: "DM Sans, sans-serif",
        },

    },
    plugins: [],
}