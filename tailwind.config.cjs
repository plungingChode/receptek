/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,svelte}"],
  theme: {
    extend: {
      fontFamily: {
        body: "'Roboto Slab', serif",
        caveat: "'Caveat', cursive",
      },
      colors: {
        "cozy-green": "#4b4d26",
        "cozy-light-green": "#80916d",
        "cozy-light-beige": "#e5d8ca",
        "cozy-beige": "#cbb397",
        "cozy-light-brown": "#9b6a5b",
        "cozy-brown": "#613a2b",
        "cozy-red": "#844238",
      },
    },
  },
  plugins: [],
};
