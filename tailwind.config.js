/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false,
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        white: "#ffffff",
        darkBlack: "#030303",
        brandBlue: "#2c7be5",
        brandGreen: "#28c76f",
        brandGreenHover: "#22b463",

        lightGreen: "#A8E6CF",
        darkGreen: "#006400",
        lightBlue: "#ADD8E6",
        darkBlue: "#00008B",
        lightTurquoise: "#AFEEEE",
        darkTurquoise: "#008B8B",

        neutral: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        },

        success: {
          DEFAULT: "#28c76f",
          hover: "#22b463",
          light: "#d1fae5",
          text: "#16a34a",
        },

        error: {
          DEFAULT: "#dc2626",
          hover: "#b91c1c",
          light: "#fee2e2",
          border: "#fca5a5",
        },
      },
    },
  },
  plugins: [],
};
