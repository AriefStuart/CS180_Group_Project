/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "app-primary": "#4793AF",
        "app-secondary": "#DD5746",
        "app-gray": "#747474",
      },
      fontFamily: {
        poppins: ["Poppins-Regular"],
      },
    },
  },
  plugins: [],
};
