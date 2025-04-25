/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "app-primary": "#4793AF",
      },
      fontFamily: {
        poppins: ["Poppins-Regular"],
      },
    },
  },
  plugins: [],
};
