/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  // NOTE: This points to App.tsx and the src folder
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#050505",     
        surface: "#121212",   
        border: "#2A2A2A",   
        neon: {
          blue: "#00F0FF",   
          purple: "#BC13FE", 
          red: "#FF003C",    
          green: "#0AFF60",  
        },
        text: {
          primary: "#EDEDED",
          secondary: "#888888",
          muted: "#444444"
        }
      },
    },
  },
  plugins: [],
}