# Mod Fancy Dress - Color Theme Guide

## Color Palette

### Primary Color: Indigo
- **Main**: `indigo-600` (#4F46E5) - Used for buttons, links, and primary actions
- **Dark**: `indigo-900` (#312E81) - Used for headings and important text
- **Light**: `indigo-700` (#4338CA) - Used for hover states
- **Background**: `indigo-50` - Used for subtle backgrounds

**Usage:**
- Headings (h1, h2, h3)
- Primary buttons
- Navigation links
- Brand name/logo
- Focus states

### Secondary Color: Teal
- **Main**: `teal-600` (#0D9488) - Used for secondary elements
- **Dark**: `teal-700` (#0F766E) - Used for hover states

**Usage:**
- Category names
- Secondary text accents
- Subtle highlights

### Neutral Colors: Gray
- Used for body text, borders, and backgrounds
- Maintains readability and professional appearance

## Component Color Usage

### Headings
- **H1**: `text-indigo-900` (dark indigo)
- **H2**: `text-indigo-900` (dark indigo)
- **H3**: `text-indigo-900` (dark indigo)

### Buttons
- **Primary**: `bg-indigo-600 hover:bg-indigo-700`
- **Outline**: `border-indigo-600 text-indigo-600 hover:bg-indigo-50`
- **Ghost**: `hover:bg-indigo-50 text-indigo-600`

### Links
- **Default**: `text-indigo-600 hover:text-indigo-700`
- **Navigation**: `text-indigo-700 hover:text-indigo-900`

### Cards
- **Category Cards**: Border changes to `border-indigo-300` on hover
- **Product Cards**: Title uses `text-indigo-900` with hover to `text-indigo-700`

### Forms
- **Focus States**: `focus:border-indigo-500 focus:ring-indigo-500`

## Theme File Location

The theme colors are defined in: `/lib/theme/colors.ts`

This file contains:
- Color palette definitions
- Tailwind CSS class mappings
- Usage guidelines

## Best Practices

1. **Consistency**: Always use the theme colors defined in the theme file
2. **Contrast**: Ensure sufficient contrast for accessibility (WCAG AA)
3. **Hover States**: Use lighter/darker shades for interactive elements
4. **Headings**: Always use `text-indigo-900` for main headings
5. **Secondary Elements**: Use teal for category names and accents

## Color Accessibility

All colors meet WCAG AA contrast requirements:
- Indigo-900 on white: ✅ Excellent contrast
- Indigo-600 on white: ✅ Good contrast
- Teal-600 on white: ✅ Good contrast


