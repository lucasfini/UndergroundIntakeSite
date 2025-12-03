import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'underground-teal': '#1a5f5a',
        'underground-green': '#357f5c',
      },
      fontFamily: {
        'varela': ['Varela Round', 'sans-serif'],
        'gotham': ['Gotham', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
