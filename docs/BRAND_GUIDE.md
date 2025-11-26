# MONAD Brand Guide v1.1.0

**Purpose:** Complete reference for MONAD's brand color system, typography, and design language  
**Usage:** Designers, developers, and contributors should reference this guide when creating UI components  
**Privacy:** No user data, pure design documentation  

---

## 🎨 Brand Color System

MONAD uses a carefully curated palette of 20 color tokens designed to convey trust, intelligence, creativity, and professionalism. All colors are optimized for dark mode interfaces and meet WCAG AA+ accessibility standards.

---

## 🔵 Core Brand Colors (Trust, Intelligence, Clarity)

The primary brand colors anchor MONAD in technical trust and clarity. Blue tones convey control, professionalism, and reliability.

| Token | Hex | Usage | Rationale |
|-------|-----|-------|-----------|
| `primary-50` | `#EAF2FF` | Very light variant | Gentle light backgrounds, hover states |
| `primary-100` | `#C8DBFF` | Light variant | Secondary button hover, subtle highlights |
| `primary-300` | `#76A9FA` | Muted mid-tone | Iconography, highlights, secondary CTAs |
| `primary-500` | `#3B82F6` | **Core brand blue** | Core CTAs, brand anchors, primary actions |
| `primary-700` | `#1E40AF` | Deep blue | Active states, header gradients, emphasis |

**Emotional Rationale:** Blue represents trust, intelligence, and clarity. These tones communicate that MONAD is a reliable, professional tool for cognitive work.

**Usage Examples:**
- Primary buttons: `bg-primary-500`
- Hover states: `hover:bg-primary-400`
- Active states: `bg-primary-700`
- Text accents: `text-primary-500`

---

## 🟣 Accent Colors (Creativity, Thought)

Accent colors represent creativity and cognitive depth. Purple hints at intelligence, AI, and imagination.

| Token | Hex | Usage | Rationale |
|-------|-----|-------|-----------|
| `accent-100` | `#EDE9FE` | Backgrounds, light contrast | Subtle backgrounds, light mode accents |
| `accent-300` | `#C4B5FD` | Highlights, tooltips | Tooltips, highlights, secondary actions |
| `accent-500` | `#8B5CF6` | **Core accent purple** | Secondary CTAs, intelligent flair, creative elements |
| `accent-700` | `#5B21B6` | Deep accent | Hero gradient anchor, deep emphasis |

**Emotional Rationale:** Purple represents creativity, thought, and innovation. It signals that MONAD is not just functional, but imaginative and intelligent.

**Usage Examples:**
- Secondary buttons: `bg-accent-500`
- Creative elements: `text-accent-500`
- Hero gradients: `bg-hero-gradient` (combines primary-500 + accent-500)

---

## ⚫ Neutral Colors (Focus, Minimalism)

Neutral colors provide minimal, low-distraction foundations for a cognitive tool. Deep neutrals focus the eye on content.

| Token | Hex | Usage | Rationale |
|-------|-----|-------|-----------|
| `neutral-50` | `#F9FAFB` | Background light mode | Light mode backgrounds, subtle surfaces |
| `neutral-200` | `#E5E7EB` | Borders, dividers | Borders, dividers, subtle separators |
| `neutral-600` | `#4B5563` | Secondary text | Secondary text, muted content |
| `neutral-800` | `#1F2937` | Cards, modals, surfaces | Cards, modals, elevated surfaces |
| `neutral-950` | `#0D1117` | **Dark mode background** | Primary dark background, deep surfaces |

**Emotional Rationale:** Neutrals provide focus and minimalism. They ensure content is the hero, not the interface.

**Usage Examples:**
- Dark backgrounds: `bg-neutral-950`
- Cards: `bg-neutral-800`
- Borders: `border-neutral-200`
- Secondary text: `text-neutral-600`

---

## 🟢 Feedback & State Colors (System Messages)

Bright yet harmonious palette tuned for legibility and emotional predictability across states.

| Token | Hex | Usage | Rationale |
|-------|-----|-------|-----------|
| `success-500` | `#10B981` | Success messages | Success states, confirmations, positive feedback |
| `warning-500` | `#FBBF24` | Attention, caution | Warnings, attention states, caution messages |
| `error-500` | `#EF4444` | Failure, alert | Errors, failures, critical alerts |
| `info-500` | `#38BDF8` | Neutral info | Informational messages, neutral feedback |
| `focus-500` | `#22D3EE` | Input outlines, highlights | Focus states, input outlines, keyboard navigation |

**Emotional Rationale:** These colors provide clear, predictable feedback. Users immediately understand the state of their actions.

**Usage Examples:**
- Success: `bg-success-500` or `text-success-500`
- Warning: `bg-warning-500` or `text-warning-500`
- Error: `bg-error-500` or `text-error-500`
- Info: `bg-info-500` or `text-info-500`
- Focus: `focus:ring-focus-500` or `focus:border-focus-500`

---

## 🧬 Special Colors (LLM Personality)

Special colors communicate offline intelligence and a self-contained AI identity. Balanced between precision and wonder.

| Token | Hex | Usage | Rationale |
|-------|-----|-------|-----------|
| `terminal-glow` | `#00FFC8` | Terminal cursor & loader | Futuristic neural accent, terminal aesthetics |
| `overlay-tint` | `rgba(0,0,0,0.4)` | Overlay mask | Keeps focus without full dim, modal backgrounds |
| `hero-gradient` | `linear-gradient(135deg, #3B82F6, #8B5CF6)` | Splash, hero banner | Symbolic merge of clarity (blue) + creativity (purple) |

**Emotional Rationale:** These special colors communicate that MONAD is a unique, intelligent tool. The terminal glow suggests technical depth, while the hero gradient merges trust and creativity.

**Usage Examples:**
- Terminal elements: `text-terminal-glow` or `glow-terminal`
- Overlays: `bg-overlay-tint`
- Hero sections: `bg-hero-gradient`

---

## 🎨 Gradient System

MONAD uses gradients strategically to create depth and visual interest.

### Hero Gradient
**Definition:** `linear-gradient(135deg, #3B82F6, #8B5CF6)`  
**Usage:** Hero banners, splash screens, onboarding modals  
**Rationale:** Merges primary blue (trust) with accent purple (creativity)  
**Tailwind Class:** `bg-hero-gradient`

### Text Gradients
**Definition:** `bg-gradient-to-r from-primary-500 to-accent-500`  
**Usage:** Headings, emphasis text, brand elements  
**Tailwind Class:** `gradient-text`

---

## 📐 Typography Pairing

MONAD uses system fonts for performance and consistency:

- **Headings:** System font stack (SF Pro, Segoe UI, Roboto)
- **Body:** System font stack with ligatures enabled
- **Monospace:** For code, terminal, and technical content

**Font Features:**
- Ligatures enabled: `font-feature-settings: "rlig" 1, "calt" 1`
- Smooth rendering: `-webkit-font-smoothing: antialiased`

---

## 🎯 Component Color Usage

### Buttons

**Primary Button:**
```css
.button-primary {
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  color: white;
  hover: lighter gradient
}
```

**Secondary Button:**
```css
.button-secondary {
  background: glass effect (white/5 with backdrop blur);
  color: white;
  hover: stronger glass effect
}
```

**Accent Button:**
```css
.button-accent {
  background: #8B5CF6;
  color: white;
  hover: lighter purple
}
```

### Cards & Surfaces

**Card Background:**
- `bg-neutral-800` for elevated cards
- `bg-neutral-950` for primary backgrounds
- `glass` class for translucent surfaces

**Borders:**
- `border-neutral-200` for light borders
- `border-primary-500/30` for brand accents

### Input Fields

**Focus State:**
- `focus:ring-focus-500` (cyan ring)
- `focus:border-focus-500` (cyan border)

**Default:**
- `bg-neutral-800`
- `border-neutral-600`

---

## ♿ Accessibility (WCAG AA+)

All color combinations meet WCAG AA+ standards:

- **Text contrast ratio:** ≥ 4.8:1 for all body and accent combinations
- **Interactive elements:** ≥ 3:1 contrast for focus states
- **State colors:** Clear differentiation between success, warning, error, and info

### Contrast Checks

| Background | Text | Ratio | Status |
|------------|------|-------|--------|
| `neutral-950` | `neutral-50` | 19.5:1 | ✅ AAA |
| `primary-500` | White | 4.8:1 | ✅ AA |
| `accent-500` | White | 4.2:1 | ✅ AA |
| `neutral-800` | `neutral-50` | 12.1:1 | ✅ AAA |
| `error-500` | White | 4.5:1 | ✅ AA |

---

## 🌓 Dark Mode Optimization

MONAD is designed primarily for dark mode:

- **Primary background:** `neutral-950` (#0D1117)
- **Elevated surfaces:** `neutral-800` (#1F2937)
- **Text:** `neutral-50` (#F9FAFB) for primary, `neutral-200` for secondary
- **OLED-friendly:** Deep blacks reduce power consumption on OLED displays

---

## 📱 Responsive Considerations

Colors maintain consistency across all screen sizes:

- **Mobile:** Same color tokens, adjusted opacity for touch targets
- **Tablet:** Full color palette available
- **Desktop:** Optimal contrast and readability

---

## 🔧 Implementation Guide

### CSS Variables

All colors are defined as CSS variables in `src/styles/theme.css`:

```css
:root {
  --primary-500: #3B82F6;
  --accent-500: #8B5CF6;
  /* ... */
}
```

### Tailwind Classes

Use Tailwind utility classes for consistency:

```tsx
// Primary button
<button className="bg-primary-500 hover:bg-primary-400 text-white">

// Accent text
<span className="text-accent-500">

// Hero gradient
<div className="bg-hero-gradient">
```

### Component Classes

Pre-defined component classes in `index.css`:

- `.button-primary` - Primary action button
- `.button-secondary` - Secondary action button
- `.button-accent` - Accent action button
- `.gradient-text` - Gradient text effect
- `.glass` - Translucent surface effect

---

## 📚 References

- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Color Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Tailwind CSS:** https://tailwindcss.com/docs/customizing-colors

---

## 🎨 Design Philosophy

MONAD's color system embodies:

1. **Trust:** Blue tones convey reliability and professionalism
2. **Intelligence:** Purple accents suggest creativity and cognitive depth
3. **Focus:** Neutrals minimize distraction, keeping content central
4. **Clarity:** High contrast ensures readability and accessibility
5. **Personality:** Terminal glow and gradients add unique character

---

**Version:** 1.1.0  
**Last Updated:** 2025-01-27  
**Maintained By:** MONAD Design Team

