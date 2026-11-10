module.exports = {
  content: ['../**/*.html', '../assets/*.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        eo: {
          green: '#1AA24B',
          hover: '#158A3F',
          bright: '#22C55E',
          mint: '#E9F7EE',
          mint2: '#F2FAF5',
          border: '#BFE6CB',
          ink: '#0E1B14',
          ink2: '#16281D',
          ink3: '#1F3628',
          bg: '#F4F7F5',
          line: '#E3E9E5',
          muted: '#65756B',
          blue: '#0B63E5',
          bluehover: '#0950BA',
          amber: '#C2610C',
          red: '#D93636',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(14,27,20,.04), 0 4px 16px rgba(14,27,20,.04)',
        lift: '0 8px 30px rgba(14,27,20,.08)',
      },
    },
  },
};
