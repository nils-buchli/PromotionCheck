export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--c-primary) / <alpha-value>)',
          light: 'rgb(var(--c-primary-light) / <alpha-value>)',
          dark: 'rgb(var(--c-primary-dark) / <alpha-value>)',
        },
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
