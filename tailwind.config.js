/**
 * Paleta portada de BoxService_FrontEnd/web/app/globals.css — no es un
 * rediseño, es continuidad visual con lo que ya está validado en la web.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#0d1117",
        surface: "#161b22",
        "surface-2": "#1c2333",
        border: "#30363d",
        "border-light": "#21262d",
        accent: "#f59e0b",
        "accent-hover": "#d97706",
        "accent-dim": "rgba(245, 158, 11, 0.08)",
        muted: "#8b949e",
        light: "#e6edf3",
        danger: "#f85149",
        success: "#3fb950",
        info: "#58a6ff",
        completed: "#a371f7",
      },
      borderRadius: {
        md: "8px",
        lg: "12px",
      },
    },
  },
  plugins: [],
};
