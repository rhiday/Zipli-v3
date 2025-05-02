/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: ['./src/**/*.{ts,tsx,jsx,js}'],
  theme: {
  	extend: {
  		/*  ─────────────────────────────────────────
  		 *  Zipli Brand Colors  (from design-tokens)
  		 * ───────────────────────────────────────── */
  		colors: {
  			primary:  { DEFAULT: '#021d13',  50:'#021d1399',  75:'#021d13cc' },
  			earth:    '#024209',
  			lime:     '#18e170',
  			cream:    '#f5f9ef',
  			rose:     '#fbb1c5',
  			plum:     '#5a0057',
  			red:      '#cb0003',
  			blue:     '#0071b0',
  			yellow:   '#f6e200',

  			// UI semantic
  			positive: {
  				DEFAULT: '#a6f175',
  				hover:   '#18e170',
  				select:  '#01cb59'
  			},
  			negative: {
  				DEFAULT: '#cb0003',
  				hover:   '#a00003',
  				select:  '#860002'
  			},
  			border:   '#d9dbd5',
  			inactive: '#c3cbc3',
  			base:     '#ffffff',
  			cloud:    '#efeee8'
  		},

  		/*  ───────── Radius – from rounding tokens ───────── */
  		borderRadius: {
  			xs:  '3px',   // super small
  			sm:  '6px',   // small
  			md:  '12px',  // medium   ← default for buttons / inputs
  			lg:  '24px'   // large
  		},

  		/*  ───────── Spacing / Icon sizes ───────── */
  		spacing: {
  			icon:  '14px',   // small
  			'icon-lg': '20px',
  			'icon-xs': '12px',
  			'icon-md': '18px',
  			'icon-xl': '28px'
  		},

  		/*  ───────── Typography  (most used only) ───────── */
  		fontFamily: {
  			sans: ['var(--font-manrope)', 'sans-serif'],
  			display: ['var(--font-space-grotesk)', 'sans-serif'],
  			body: ['var(--font-manrope)', 'sans-serif']
  		},
  		fontSize: {
  			label:   ['12px', { lineHeight: '14.4px', fontWeight: '500' }],
  			body:    ['14px', { lineHeight: '16.8px' }],
  			bodyLg:  ['16px', { lineHeight: '19.2px' }],
  			titleSm: ['24px', { lineHeight: '28.8px', fontWeight: '600' }],
  			titleMd: ['36px', { lineHeight: '43.2px', fontWeight: '600' }]
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
