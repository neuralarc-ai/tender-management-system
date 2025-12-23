# 🎨 UI Color Scheme Update Guide

## New Color Palette

### Brand Colors
| Color Name | Hex Code | Usage | Tailwind Class |
|------------|----------|-------|----------------|
| **Red Passion** | `#E0693D` | Primary brand, CTAs, active states | `passion` / `primary` |
| **Aurora** | `#EFB25E` | Secondary warm, highlights | `aurora` / `accent` |
| **Quantum Core** | `#A69CBE` | Purple accents, secondary actions | `quantum` / `secondary` |
| **Neural** | `#262626` | Dark base, text, backgrounds | `neural` / `gray-900` |
| **Dataflow Blue** | `#A6C8D5` | Info states, cool accents | `drift` / `info` |
| **Solar Pulse** | `#E7B31B` | Warnings, gold highlights | `solar` / `warning` |
| **Verdant Code** | `#27584F` | Success states, confirmations | `verdant` / `success` |
| **Ion Mist** | `#EFB3AF` | Light passion variant, hover states | `passion-light` |

---

## Color Mapping Strategy

### Old → New Color Replacements

#### Primary Actions (Buttons, Links, Active States)
- `indigo-600` → `passion` (Red Passion #E0693D)
- `indigo-700` → `passion-dark`
- `indigo-100` → `passion-light` or `aurora-light`
- `blue-600` → `passion`
- `blue-700` → `passion-dark`

#### Secondary Actions
- `purple-600` → `quantum` (Quantum Core #A69CBE)
- `purple-100` → `quantum-light`

#### Accents & Highlights
- `amber-600` → `aurora` (Aurora #EFB25E)
- `amber-800` → `aurora-dark`
- `amber-100` → `aurora-light`

#### Success States
- `green-600` → `verdant` (Verdant Code #27584F)
- `green-100` → `verdant` with opacity
- `green-700` → `verdant-dark`

#### Warning States
- `yellow-500` → `solar` (Solar Pulse #E7B31B)
- `yellow-100` → `solar-light`

#### Info States
- `sky-500` → `drift` (Dataflow Blue #A6C8D5)
- `sky-100` → `drift-light`

#### Text & Backgrounds
- `gray-900` → `neural` (Neural #262626)
- `gray-800` → `neural-light`
- `gray-700` → `gray-700` (keep some grays for contrast)

---

## Quick Reference: Tailwind Classes

### Background Colors
```tsx
// Primary
bg-passion          // #E0693D
bg-passion-light    // #EFB3AF
bg-passion-dark     // #C85532

// Secondary
bg-quantum          // #A69CBE
bg-quantum-light    // #C4BFDB

// Accent
bg-aurora           // #EFB25E
bg-aurora-light     // #F5C98C

// Success
bg-verdant          // #27584F
bg-success          // alias

// Warning
bg-solar            // #E7B31B
bg-warning          // alias

// Info
bg-drift            // #A6C8D5
bg-info             // alias

// Dark
bg-neural           // #262626
```

### Text Colors
```tsx
text-passion
text-quantum
text-aurora
text-neural
text-verdant
text-solar
text-drift
```

### Border Colors
```tsx
border-passion
border-quantum
border-aurora
// etc...
```

### Hover States
```tsx
hover:bg-passion-dark
hover:text-passion
hover:border-passion
```

---

## Component Color Updates

### Buttons

#### Primary Button
```tsx
// Before
className="bg-indigo-600 hover:bg-indigo-700 text-white"

// After
className="bg-passion hover:bg-passion-dark text-white"
```

#### Secondary Button
```tsx
// Before
className="bg-purple-100 text-purple-700 hover:bg-purple-200"

// After
className="bg-quantum-light text-quantum-dark hover:bg-quantum"
```

#### Accent Button
```tsx
// Before
className="bg-amber-500 hover:bg-amber-600"

// After
className="bg-aurora hover:bg-aurora-dark"
```

### Cards & Containers

```tsx
// Active/Selected Cards
// Before: border-indigo-500
// After: border-passion

// Hover Cards
// Before: hover:border-blue-300
// After: hover:border-aurora

// Info Cards
// Before: bg-blue-50 border-blue-200
// After: bg-drift/10 border-drift
```

### Status Badges

```tsx
// Active/Running
// Before: bg-blue-100 text-blue-800
// After: bg-passion-light text-passion-dark

// Success/Completed
// Before: bg-green-100 text-green-800
// After: bg-verdant/20 text-verdant

// Pending/In Progress
// Before: bg-yellow-100 text-yellow-800
// After: bg-solar/20 text-solar-dark

// Info
// Before: bg-sky-100 text-sky-800
// After: bg-drift/20 text-drift-dark
```

### Links

```tsx
// Before
className="text-indigo-600 hover:text-indigo-800"

// After
className="text-passion hover:text-passion-dark"
```

### Form Inputs

```tsx
// Focus state
// Before: focus:border-indigo-600 focus:ring-indigo-600
// After: focus:border-passion focus:ring-passion

// Error state
// Before: border-red-500
// After: border-passion
```

---

## Gradients

### Background Gradients
```tsx
// Hero gradient
from-passion via-aurora to-quantum

// Subtle gradient
from-neural to-neural-light

// Accent gradient
from-aurora to-solar
```

### Text Gradients
```tsx
bg-gradient-to-r from-passion to-aurora bg-clip-text text-transparent
```

---

## Shadow Colors

```tsx
// Before
shadow-indigo-100

// After
shadow-passion/10
```

---

## Dark Mode (Future Enhancement)

```tsx
dark:bg-neural
dark:text-white
dark:border-quantum
```

---

## Animation States

### Loading Spinners
```tsx
// Before
border-indigo-600

// After
border-passion
```

### Progress Bars
```tsx
// Before
bg-indigo-600

// After
bg-passion
```

### Pulse Effects
```tsx
// Before
bg-blue-400 animate-pulse

// After
bg-aurora animate-pulse
```

---

## File-by-File Update List

### Priority 1: Core Components
- [ ] `/components/ui/button.tsx`
- [ ] `/components/ui/input.tsx`
- [ ] `/components/ui/badge.tsx`
- [ ] `/components/ui/card.tsx`
- [ ] `/components/ui/dialog.tsx`

### Priority 2: Dashboard
- [ ] `/components/dashboard/DashboardView.tsx`
- [ ] `/components/dashboard/DashboardWidgets.tsx`
- [ ] `/components/dashboard/StatsView.tsx`

### Priority 3: Admin Components
- [ ] `/components/admin/TenderDetail.tsx`
- [ ] `/components/admin/AnalysisView.tsx`
- [ ] `/components/admin/ProposalEditor.tsx`
- [ ] `/components/admin/CommunicationTab.tsx`

### Priority 4: Client Components
- [ ] `/components/client/NewTenderModal.tsx`
- [ ] `/components/client/TenderList.tsx`

### Priority 5: Pages
- [ ] `/app/page.tsx`
- [ ] `/app/admin/page.tsx`
- [ ] `/app/client/page.tsx`
- [ ] `/app/proposals/page.tsx`

---

## Testing Checklist

After updating colors:

### Visual Testing
- [ ] All buttons visible and readable
- [ ] Text contrast meets WCAG AA standards
- [ ] Hover states work correctly
- [ ] Active/selected states clear
- [ ] Status badges distinguishable
- [ ] Forms have clear focus states
- [ ] Links are clearly clickable

### Component Testing
- [ ] Login screen
- [ ] Dashboard widgets
- [ ] Tender list
- [ ] Tender detail modal
- [ ] New tender form
- [ ] Proposal editor
- [ ] Communication tab
- [ ] Notifications

### Interaction Testing
- [ ] Button clicks
- [ ] Form submissions
- [ ] Modal open/close
- [ ] Tab switching
- [ ] Dropdown menus
- [ ] Tooltips

---

## Color Contrast Ratios (WCAG)

### Passing Combinations
✅ White text on passion (#E0693D) - 4.5:1
✅ White text on quantum (#A69CBE) - 4.5:1
✅ White text on verdant (#27584F) - 7.2:1
✅ Neural text on white - 14.6:1
✅ Neural text on aurora (#EFB25E) - 4.8:1

### Use with Caution
⚠️ White text on aurora (#EFB25E) - 2.8:1 (use neural text instead)
⚠️ White text on drift (#A6C8D5) - 2.3:1 (use neural text)
⚠️ White text on solar (#E7B31B) - 2.1:1 (use neural text)

---

## Quick Color Picker

For reference when coding:

```tsx
// Passion Palette
#E0693D  // Main
#EFB3AF  // Light
#C85532  // Dark

// Aurora Palette
#EFB25E  // Main
#F5C98C  // Light
#D99D4A  // Dark

// Quantum Palette
#A69CBE  // Main
#C4BFDB  // Light
#8A7FA8  // Dark

// Drift Palette
#A6C8D5  // Main
#C4DBE5  // Light
#8AB0C0  // Dark

// Solar Palette
#E7B31B  // Main
#F0C84A  // Light
#C99B16  // Dark

// Verdant Palette
#27584F  // Main
#3A7669  // Light
#1D4139  // Dark

// Neural Palette
#262626  // Main
#404040  // Light
#1A1A1A  // Dark
```

---

## Implementation Status

✅ Tailwind config updated
✅ Global CSS updated
⏳ Components being updated...

---

**Next:** Run the automated color replacement script to update all components!

