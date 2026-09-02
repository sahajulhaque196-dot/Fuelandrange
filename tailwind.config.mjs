/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand palette
        'cyber-slate':  '#07090E',
        'cyber-slate-2': '#0D1117',
        'cyber-slate-3': '#161B25',
        'cyber-slate-4': '#1E2536',
        'neon-cyan':    '#00F0FF',
        'neon-cyan-dim': '#00C8D4',
        'efficiency-green': '#10B981',
        'canadian-crimson': '#FF2E4D',
        'amber-fuel':   '#F59E0B',
        'purple-ev':    '#8B5CF6',
        // Grays
        'slate-text':   '#94A3B8',
        'slate-border': '#1E293B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'grid-dark': `
          linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)
        `,
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,240,255,0.15), transparent)',
        'card-glow': 'linear-gradient(135deg, rgba(0,240,255,0.05), rgba(16,185,129,0.05))',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0,240,255,0.3), 0 0 40px rgba(0,240,255,0.1)',
        'neon-green': '0 0 20px rgba(16,185,129,0.3)',
        'neon-red': '0 0 20px rgba(255,46,77,0.3)',
        'card': '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(30,37,54,0.8)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,240,255,0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,240,255,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0,240,255,0.6), 0 0 80px rgba(0,240,255,0.2)' },
        },
      },
      borderColor: {
        DEFAULT: '#1E293B',
      },
    },
  },
  plugins: [],
};
