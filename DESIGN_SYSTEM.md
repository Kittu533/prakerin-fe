# Design System - Prakerin FE

## 📐 Typography Scale

### Display (Hero Sections)
- **Large**: `text-4xl font-bold` - Untuk hero utama
- **Medium**: `text-3xl font-bold` - Untuk hero sekunder
- **Small**: `text-2xl font-bold` - Untuk hero kecil

### Heading (Section Titles)
- **H1**: `text-2xl font-semibold` - Page title
- **H2**: `text-xl font-semibold` - Section title
- **H3**: `text-lg font-semibold` - Subsection title
- **H4**: `text-base font-semibold` - Card title

### Body (Content)
- **Large**: `text-base font-normal` - Konten utama
- **Medium**: `text-sm font-normal` - Konten standar (DEFAULT)
- **Small**: `text-xs font-normal` - Konten kecil

### Label (Forms & Badges)
- **Large**: `text-sm font-medium` - Form label
- **Medium**: `text-xs font-medium` - Badge text
- **Small**: `text-xs font-medium` - Small badge

### Caption (Helper Text)
- **Large**: `text-sm font-normal` - Helper text
- **Medium**: `text-xs font-normal` - Subtext (DEFAULT)
- **Small**: `text-xs font-light` - Tiny text

---

## 🎨 Color System

### Primary (Blue)
- **50**: `bg-blue-50` / `text-blue-50` - Background light
- **100**: `bg-blue-100` / `text-blue-100` - Background
- **500**: `bg-blue-500` / `text-blue-500` - Default
- **600**: `bg-blue-600` / `text-blue-600` - Primary action (DEFAULT)
- **700**: `bg-blue-700` / `text-blue-700` - Hover state

### Success (Green)
- **50**: `bg-green-50` / `text-green-50` - Background light
- **500**: `bg-green-500` / `text-green-500` - Default
- **600**: `bg-green-600` / `text-green-600` - Success state (DEFAULT)

### Warning (Yellow)
- **50**: `bg-yellow-50` / `text-yellow-50` - Background light
- **500**: `bg-yellow-500` / `text-yellow-500` - Default
- **600**: `bg-yellow-600` / `text-yellow-600` - Warning state (DEFAULT)

### Danger (Red)
- **50**: `bg-red-50` / `text-red-50` - Background light
- **500**: `bg-red-500` / `text-red-500` - Default
- **600**: `bg-red-600` / `text-red-600` - Danger state (DEFAULT)

### Neutral (Slate)
- **50**: `bg-slate-50` / `text-slate-50` - Background lightest
- **100**: `bg-slate-100` / `text-slate-100` - Background light
- **200**: `bg-slate-200` / `text-slate-200` - Border
- **500**: `text-slate-500` - Text tertiary
- **600**: `text-slate-600` - Text secondary (DEFAULT)
- **900**: `text-slate-900` - Text primary (DEFAULT)

---

## 🎯 Usage Guidelines

### Text Colors
```vue
<!-- Primary text (default untuk konten utama) -->
<p class="text-slate-900">Primary text</p>

<!-- Secondary text (untuk deskripsi) -->
<p class="text-slate-600">Secondary text</p>

<!-- Tertiary text (untuk helper/caption) -->
<p class="text-slate-500">Tertiary text</p>

<!-- Colored text -->
<p class="text-blue-600">Primary action</p>
<p class="text-green-600">Success message</p>
<p class="text-yellow-600">Warning message</p>
<p class="text-red-600">Error message</p>
```

### Background Colors
```vue
<!-- Card backgrounds -->
<div class="bg-white">White card</div>
<div class="bg-slate-50">Light gray card</div>

<!-- Colored backgrounds -->
<div class="bg-blue-50">Primary light background</div>
<div class="bg-green-50">Success light background</div>
<div class="bg-yellow-50">Warning light background</div>
<div class="bg-red-50">Danger light background</div>
```

### Border Colors
```vue
<!-- Default border -->
<div class="border border-slate-100">Light border</div>
<div class="border border-slate-200">Default border</div>

<!-- Colored borders -->
<div class="border border-blue-600">Primary border</div>
```

---

## 📦 Component Examples

### Card dengan Design System
```vue
<template>
  <div class="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
    <!-- Title -->
    <h3 class="text-lg font-semibold text-slate-900">Card Title</h3>
    
    <!-- Description -->
    <p class="mt-2 text-sm text-slate-600">
      Card description text
    </p>
    
    <!-- Caption -->
    <p class="mt-1 text-xs text-slate-500">
      Helper text or caption
    </p>
  </div>
</template>
```

### KPI Card
```vue
<template>
  <div class="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
    <div class="flex items-center gap-4">
      <!-- Icon -->
      <div class="p-3 rounded-xl bg-blue-50 text-blue-600">
        <UIcon name="i-heroicons-user-group" class="w-6 h-6" />
      </div>
      
      <!-- Content -->
      <div class="flex-1">
        <!-- Label -->
        <p class="text-sm font-medium text-slate-500">
          Label Text
        </p>
        
        <!-- Value -->
        <p class="mt-1 text-2xl font-bold text-slate-900">
          42
        </p>
        
        <!-- Caption -->
        <p class="mt-1 text-xs text-slate-500">
          Additional info
        </p>
      </div>
    </div>
  </div>
</template>
```

### Button dengan Design System
```vue
<template>
  <!-- Primary Button -->
  <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
    Primary Action
  </button>
  
  <!-- Secondary Button -->
  <button class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">
    Secondary Action
  </button>
</template>
```

---

## 🔧 Using the Composable

```vue
<script setup lang="ts">
const { typography, textColors, bgColors, borderColors } = useDesignSystem()
</script>

<template>
  <div>
    <!-- Using typography -->
    <h1 :class="typography.heading.h1">Page Title</h1>
    <p :class="typography.body.medium">Body text</p>
    
    <!-- Using colors -->
    <div :class="[bgColors.neutral.white, borderColors.neutral.light]">
      <p :class="textColors.neutral.default">Content</p>
    </div>
  </div>
</template>
```

---

## 📏 Spacing & Layout

### Padding/Margin
- **xs**: `p-2` / `m-2` (8px)
- **sm**: `p-4` / `m-4` (16px)
- **md**: `p-6` / `m-6` (24px) - DEFAULT
- **lg**: `p-8` / `m-8` (32px)
- **xl**: `p-10` / `m-10` (40px)

### Border Radius
- **sm**: `rounded-lg` (8px)
- **md**: `rounded-xl` (12px) - DEFAULT
- **lg**: `rounded-2xl` (16px)
- **full**: `rounded-full`

### Shadow
- **sm**: `shadow-sm` - DEFAULT untuk cards
- **md**: `shadow-md` - Hover state
- **lg**: `shadow-lg` - Modal/dropdown
- **none**: `shadow-none`

---

## ✅ Best Practices

1. **Konsistensi Typography**
   - Gunakan `text-sm` untuk body text standar
   - Gunakan `text-xs` untuk caption/helper text
   - Gunakan `text-lg` atau `text-xl` untuk section titles

2. **Konsistensi Font Weight**
   - `font-normal` untuk body text
   - `font-medium` untuk labels
   - `font-semibold` untuk headings
   - `font-bold` untuk display/hero

3. **Konsistensi Warna**
   - `text-slate-900` untuk text utama
   - `text-slate-600` untuk text sekunder
   - `text-slate-500` untuk caption
   - `text-blue-600` untuk links dan primary actions

4. **Spacing**
   - Gunakan `gap-4` atau `gap-6` untuk spacing antar elemen
   - Gunakan `p-6` untuk padding card standar
   - Gunakan `mt-2` untuk spacing text

5. **Border & Shadow**
   - Gunakan `border-slate-100` untuk border card
   - Gunakan `shadow-sm` untuk card default
   - Gunakan `rounded-xl` untuk border radius standar
