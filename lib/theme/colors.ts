/**
 * Theme Colors for Mod Fancy Dress
 * Professional color scheme with primary and secondary colors
 */

export const theme = {
  // Primary Color - Indigo (Professional, Trustworthy)
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1', // Main primary
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  
  // Secondary Color - Teal (Fresh, Modern)
  secondary: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6', // Main secondary
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },
  
  // Accent Color - Warm Orange (For CTAs and highlights)
  accent: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // Main accent
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  
  // Neutral colors
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
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
  primary: 'text-indigo-600',
  primaryBg: 'bg-indigo-600',
  primaryHover: 'hover:bg-indigo-700',
  primaryLight: 'bg-indigo-50',
  primaryBorder: 'border-indigo-600',
  
  // Secondary
  secondary: 'text-teal-600',
  secondaryBg: 'bg-teal-600',
  secondaryHover: 'hover:bg-teal-700',
  secondaryLight: 'bg-teal-50',
  secondaryBorder: 'border-teal-600',
  
  // Headings
  heading: 'text-indigo-900',
  headingLight: 'text-indigo-700',
  subheading: 'text-teal-700',
  
  // Links
  link: 'text-indigo-600 hover:text-indigo-700',
  linkSecondary: 'text-teal-600 hover:text-teal-700',
  
  // Buttons
  buttonPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  buttonSecondary: 'bg-teal-600 hover:bg-teal-700 text-white',
  buttonOutline: 'border-indigo-600 text-indigo-600 hover:bg-indigo-50',
}

