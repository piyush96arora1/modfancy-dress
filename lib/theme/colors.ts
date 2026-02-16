/**
 * Theme Colors for Mod Fancy Dress
 * Premium navy & gold color scheme
 */

export const theme = {
  // Primary Color - Deep Navy (Premium, Trustworthy)
  primary: {
    50: '#EEF1F7',
    100: '#D5DBEA',
    200: '#AAB7D5',
    300: '#7F93C0',
    400: '#546FAB',
    500: '#2A4B96',
    600: '#1B2A4A', // Main primary
    700: '#162240',
    800: '#111A36',
    900: '#0C122C',
  },

  // Accent Color - Warm Gold (Elegant, Premium)
  accent: {
    50: '#FBF5EF',
    100: '#F5E8D8',
    200: '#EBD1B1',
    300: '#E1BA8A',
    400: '#D4A47A',
    500: '#C8956C', // Main accent
    600: '#A07048',
    700: '#7A5636',
    800: '#543C24',
    900: '#2E2112',
  },

  // Secondary - Soft Rose (Warmth)
  secondary: {
    50: '#FDF8F6',
    100: '#F8EDE8',
    200: '#F0DBD2',
    300: '#E8C4B8',
    400: '#D9A999',
    500: '#CA8E7A',
    600: '#B0705A',
    700: '#8A5644',
    800: '#643C2E',
    900: '#3E2218',
  },

  // Neutral colors (warm tinted)
  gray: {
    50: '#FAFAF8',
    100: '#F5F3F0',
    200: '#E8E5E0',
    300: '#D5D0CA',
    400: '#A8A29E',
    500: '#6B6B6B',
    600: '#525252',
    700: '#3D3D3D',
    800: '#2D2D2D',
    900: '#1A1A1A',
  },

  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
}

// Tailwind CSS color classes mapping
export const themeClasses = {
  // Primary
  primary: 'text-[#1B2A4A]',
  primaryBg: 'bg-[#1B2A4A]',
  primaryHover: 'hover:bg-[#162240]',
  primaryLight: 'bg-[#EEF1F7]',
  primaryBorder: 'border-[#1B2A4A]',

  // Accent
  accent: 'text-[#C8956C]',
  accentBg: 'bg-[#C8956C]',
  accentHover: 'hover:bg-[#A07048]',
  accentLight: 'bg-[#FBF5EF]',
  accentBorder: 'border-[#C8956C]',

  // Headings
  heading: 'text-[#1B2A4A]',
  headingLight: 'text-[#2A4B96]',
  subheading: 'text-[#6B6B6B]',

  // Links
  link: 'text-[#1B2A4A] hover:text-[#C8956C]',
  linkSecondary: 'text-[#C8956C] hover:text-[#A07048]',

  // Buttons
  buttonPrimary: 'bg-[#1B2A4A] hover:bg-[#162240] text-white',
  buttonSecondary: 'bg-[#C8956C] hover:bg-[#A07048] text-white',
  buttonOutline: 'border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#EEF1F7]',
}
