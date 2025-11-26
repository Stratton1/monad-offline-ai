# MONAD Design System Preview Documentation

**Date:** 2025-01-27  
**Version:** 1.1.2  
**Status:** ✅ **COMPLETE**  

---

## Overview

The Design System Preview component (`frontend/src/pages/DesignSystemPreview.tsx`) provides an interactive showcase of MONAD's complete design system, including:

- 20 brand color tokens
- Typography scale (h1-h6, body, caption, code)
- Spacing system (4px base grid)
- Sample UI components
- Theme toggle (dark/light)

---

## Component Features

### 1. Color Token Swatches

**All 20 tokens displayed:**
- Core Brand (5): primary-50, 100, 300, 500, 700
- Accent & Innovation (4): accent-100, 300, 500, 700
- Neutral & Depth (5): neutral-50, 200, 600, 800, 950
- Feedback & State (5): success, warning, error, info, focus
- Special (1): terminal-glow

**Interactive Features:**
- Click any swatch to copy hex value
- Visual feedback on copy (checkmark)
- Contrast-aware text colors

---

### 2. Hero Gradient Banner

**Animated Background:**
- 5-second loop animation
- Gradient shifts between angles (135° → 145° → 125° → 135°)
- Combines primary-500 (#3B82F6) and accent-500 (#8B5CF6)

---

### 3. Sample UI Elements

**Buttons:**
- Primary (hero gradient)
- Secondary (glass effect)
- Accent (purple)

**Alerts:**
- Success (green)
- Warning (yellow)
- Error (red)
- Info (cyan)

**Inputs:**
- Default state
- Focused state (focus-500 ring)

**Cards:**
- Glass effect
- Glass-strong effect
- Terminal glow variant

**Badges:**
- All state colors represented

---

### 4. Typography Scale

**Headings:**
- H1: 2.5rem / Bold / -0.025em tracking
- H2: 2.0rem / Semibold / -0.0125em tracking
- H3: 1.5rem / Semibold / -0.00625em tracking
- H4: 1.25rem / Medium / normal tracking

**Body Text:**
- Body Large: 1.125rem / Normal / 1.6 line-height
- Body: 1.0rem / Normal / 1.5 line-height
- Body Small: 0.875rem / Normal / 1.5 line-height

**Special:**
- Caption: 0.75rem / Medium / 0.05em tracking
- Code: 0.875rem / Mono / Medium

**Font Stack:**
- Sans: "Inter Variable", "SF Pro Text", system-ui, sans-serif
- Mono: "JetBrains Mono", "Menlo", "Consolas", monospace

---

### 5. Spacing Scale

**4px Base Grid:**
- xs: 4px (0.25rem)
- sm: 8px (0.5rem)
- md: 12px (0.75rem)
- lg: 16px (1rem)
- xl: 24px (1.5rem)
- 2xl: 32px (2rem)
- 3xl: 48px (3rem)
- 4xl: 64px (4rem)
- 5xl: 96px (6rem)

**Visual Grid:**
- Interactive boxes showing each spacing size
- Labels with token name, pixel value, and CSS variable

---

### 6. Theme Toggle

**Dark/Light Mode:**
- Toggle button in header
- Updates `data-theme` attribute
- All colors and typography adapt

---

### 7. Console Logging

**Debug Output:**
```
🎨 MONAD Design System Preview
Active Theme: dark
Color Token Map: { primary-50: '#EAF2FF', ... }
Total Tokens: 20
Typography Vars: { --font-h1-size: '2.5rem', ... }
Spacing Vars: { --space-xs: '0.25rem', ... }
```

---

## Access Method

### Import and Use

```tsx
import DesignSystemPreview from './pages/DesignSystemPreview';

// Add to App.tsx or Dashboard
<DesignSystemPreview />
```

### URL Parameter (Future)

```tsx
// Add route handling in App.tsx
const showPreview = new URLSearchParams(window.location.search).get('preview') === 'design-system';

{showPreview && <DesignSystemPreview />}
```

---

## File Structure

```
frontend/src/
├── pages/
│   └── DesignSystemPreview.tsx    # Main preview component
├── styles/
│   ├── theme.css                  # Color tokens
│   ├── typography.css             # Typography system
│   └── spacing.css                # Spacing system
└── index.css                      # Imports all styles
```

---

## CSS Variables Reference

### Typography Variables

```css
--font-sans: "Inter Variable", "SF Pro Text", system-ui, sans-serif;
--font-mono: "JetBrains Mono", "Menlo", "Consolas", monospace;
--font-h1-size: 2.5rem;
--font-body-size: 1.0rem;
--line-h-body: 1.5;
--letter-spacing-h1: -0.025em;
```

### Spacing Variables

```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 0.75rem;   /* 12px */
--space-lg: 1rem;      /* 16px */
--space-xl: 1.5rem;    /* 24px */
```

---

## Visual Verification Checklist

- [ ] All 20 color swatches render correctly
- [ ] Hero gradient animates smoothly
- [ ] Typography scale displays all sizes
- [ ] Spacing grid shows all 9 sizes
- [ ] Buttons have hover animations
- [ ] Theme toggle works correctly
- [ ] Click-to-copy functionality works
- [ ] Console logs appear correctly
- [ ] Dark mode colors are correct
- [ ] Light mode colors are correct

---

## Screenshots

**Status:** ⚠️ **MANUAL CAPTURE REQUIRED**

**Recommended Screenshots:**
1. Full page overview (dark mode)
2. Color swatches section
3. Typography scale section
4. Spacing grid visualizer
5. Sample UI elements
6. Light mode comparison

---

## Build Verification

**Status:** ✅ **PASSED**

```bash
npm run build
✓ built in 8.99s
```

**No errors or warnings.**

---

## Accessibility

**Contrast Ratios:**
- All text meets WCAG AA+ standards
- Color swatches use contrast-aware text
- Focus states clearly visible

**Keyboard Navigation:**
- Theme toggle is keyboard accessible
- All interactive elements focusable

---

## Future Enhancements

1. **Route Integration:** Add `/design-system` route
2. **Export Functionality:** Export color palette as JSON/CSV
3. **Copy All Tokens:** Button to copy all CSS variables
4. **Print Styles:** Optimize for printing
5. **Component Library:** Link to actual component examples

---

**Documentation Version:** 1.1.2  
**Last Updated:** 2025-01-27  
**Maintained By:** MONAD Design Team

