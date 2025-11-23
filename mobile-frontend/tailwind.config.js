/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx", 
    "./components/**/*.{js,jsx,ts,tsx}", 
    "./app/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#06051F",
        primaryLight: "#53516B", 
        primaryUltraLight: "#D4DADA",

        accent: "#3C46FF",
        accentLight: "#6E75FF", 
        accentDark: "#272FCC",

        // Białe
        surface: "#ECEFEF",
        background: "#D4DADA",

        // Neutralne szarości 
        neutral: {
          50:  "#F7F8FA",
          100: "#ECEFF3",
          200: "#D9DEE6",
          300: "#B9C0CC",
          400: "#8C93A3",
          500: "#616778",
          600: "#3D4251",
          700: "#2A2E3A",
          800: "#1C1F27",
          900: "#12141A",
        },

        pastelYellowCold: "#F6D88A",
        pastelBlue: "#A4C9E2",
        pastelViolet: "#D284B9",
        pastelYellowWarm: "#F5BC6D",
        pastelRed: "#DC5B40",
      },

      fontFamily: {
        display: ["System"],
        body: ["System"],
      },

      fontSize: {
        h1: 32,
        h2: 26,
        h3: 22,
        h4: 18,
        body: 16,
        caption: 13,
      },

      borderRadius: {
        card: 24,
        button: 12,
      },

      backgroundImage: {
        "gradient-card-1":
          "linear-gradient(135deg, #A4C9E2 0%, #D284B9 100%)",
        "gradient-card-2":
          "linear-gradient(135deg, #D284B9 0%, #F5BC6D 100%)",
        "gradient-card-3":
          "linear-gradient(135deg, #D284B9 0%, #A4C9E2 100%)",
      },
    },
  },
  plugins: [],
}

