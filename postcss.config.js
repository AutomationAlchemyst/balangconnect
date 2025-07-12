/** @type {import('postcss').Config} */
module.exports = {
  plugins: {
    // --- THE FIX IS HERE ---
    // We are now using the correct, modern plugin for Tailwind CSS
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
