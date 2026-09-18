/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        // Primary — Natural Green
        green: {
          50:  "#f0f7f0",
          100: "#dceedd",
          200: "#b9dcbb",
          300: "#8ec391",
          400: "#5fa863",
          500: "#3d8c42",  // primary action
          600: "#2f7035",
          700: "#255829",
          800: "#1d451f",
          900: "#133016",
        },
        // Earth Brown / Cream
        earth: {
          50:  "#fdfaf5",
          100: "#f9f2e3",
          200: "#f0e0c0",
          300: "#e4c98e",
          400: "#d4a85c",
          500: "#b8883c",
          600: "#8f6830",
          700: "#6b4e26",
          800: "#4a361c",
          900: "#2f2110",
        },
        // Warm Cream / Background
        cream: {
          50:  "#fffef9",
          100: "#fefcf0",
          200: "#fdf5dc",
          300: "#faecc0",
          400: "#f5dc94",
          500: "#edcc68",
        },
        // Soft Olive
        olive: {
          50:  "#f5f6ef",
          100: "#eaecd9",
          200: "#d3d8b2",
          300: "#b5bf82",
          400: "#96a457",
          500: "#768839",
          600: "#5c6b2c",
          700: "#455122",
          800: "#303a19",
          900: "#1e2510",
        },
        // Terracotta accent
        terra: {
          50:  "#fdf3ef",
          100: "#fbe4d8",
          200: "#f5c3a8",
          300: "#ed9a71",
          400: "#e26e3e",
          500: "#c4521f",
          600: "#9c3e18",
          700: "#762e13",
          800: "#50200e",
          900: "#311409",
        },
        // Soft yellow/amber
        harvest: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        // Status colors — muted, not neon
        status: {
          healthy:   "#3d8c42",
          warning:   "#d97706",
          danger:    "#c0392b",
          info:      "#2980b9",
          neutral:   "#6b7280",
        },
      },
      boxShadow: {
        card:    "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)",
        "card-md": "0 4px 12px 0 rgba(0,0,0,0.10), 0 2px 4px -1px rgba(0,0,0,0.06)",
        "card-lg": "0 8px 24px 0 rgba(0,0,0,0.12), 0 4px 8px -2px rgba(0,0,0,0.08)",
        inner: "inset 0 1px 3px 0 rgba(0,0,0,0.06)",
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
