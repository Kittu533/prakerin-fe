# Design System Usage Guide

## 📚 Cara Menggunakan Design System

Design system sudah didefinisikan di `app/assets/css/main.css` menggunakan Tailwind CSS `@apply` directive.

---

## 🎯 Typography Classes

### Display (Hero Sections)
```vue
<h1 class="text-display-lg">Large Display</h1>
<h1 class="text-display-md">Medium Display</h1>
<h1 class="text-display-sm">Small Display</h1>
```

### Heading (Section Titles)
```vue
<h1 class="text-heading-1">Page Title</h1>
<h2 class="text-heading-2">Section Title</h2>
<h3 class="text-heading-3">Subsection Title</h3>
<h4 class="text-heading-4">Card Title</h4>
```

### Body (Content)
```vue
<p class="text-body-lg">Large body text</p>
<p class="text-body-md">Medium body text (DEFAULT)</p>
<p class="text-body-sm">Small body text</p>
```

### Label (Forms & Badges)
```vue
<label class="text-label-lg">Form Label</label>
<span class="text-label-md">Badge Text</span>
<span class="text-label-sm">Small Badge</span>
```

### Caption (Helper Text)
```vue
<p class="text-caption-lg">Large caption</p>
<p class="text-caption-md">Medium caption (DEFAULT)</p>
<p class="text-caption-sm">Small caption</p>
```

---

## 🎨 Color Classes

### Text Colors
```vue
<!-- Primary -->
<p class="text-primary">Primary text</p>
<a class="text-primary text-primary-hover">Primary link</a>

<!-- Status Colors -->
<p class="text-success">Success text</p>
<p class="text-warning">Warning text</p>
<p class="text-danger">Danger text</p>

<!-- Neutral -->
<p class="text-default">Default text (slate-900)</p>
<p class="text-secondary">Secondary text (slate-600)</p>
<p class="text-tertiary">Tertiary text (slate-500)</p>
<p class="text-disabled">Disabled text (slate-400)</p>
```

### Background Colors
```vue
<!-- Primary -->
<div class="bg-primary">Primary background</div>
<button class="bg-primary bg-primary-hover">Primary button</button>
<div class="bg-primary-light">Primary light background</div>

<!-- Status Colors -->
<div class="bg-success">Success background</div>
<div class="bg-success-light">Success light background</div>
<div class="bg-warning-light">Warning light background</div>
<div class="bg-danger-light">Danger light background</div>

<!-- Neutral -->
<div class="bg-surface">White surface</div>
<div class="bg-surface-secondary">Light gray surface</div>
<div class="bg-surface-tertiary">Medium gray surface</div>
```

### Border Colors
```vue
<div class="border border-default">Default border</div>
<div class="border border-light">Light border</div>
<div class="border border-medium">Medium border</div>
<div class="border border-primary">Primary border</div>
```

---

## 📦 Component Classes

### Card
```vue
<!-- Basic Card -->
<div class="card">
  <h3 class="text-heading-3">Card Title</h3>
  <p class="text-body-md">Card content</p>
</div>

<!-- Card with Hover -->
<div class="card card-hover">
  <h3 class="text-heading-3">Hoverable Card</h3>
</div>
```

### KPI Card
```vue
<div class="kpi-card">
  <div class="flex items-center gap-4">
    <div class="kpi-icon bg-primary-light text-primary">
      <UIcon name="i-heroicons-user-group" class="w-6 h-6" />
    </div>
    <div class="flex-1">
      <p class="kpi-label">Label</p>
      <p class="kpi-value">42</p>
      <p class="kpi-caption">Caption text</p>
    </div>
  </div>
</div>
```

### Buttons
```vue
<!-- Primary Button -->
<button class="btn-primary">Primary Action</button>

<!-- Secondary Button -->
<button class="btn-secondary">Secondary Action</button>

<!-- Outline Button -->
<button class="btn-outline">Outline Action</button>
```

### Badges
```vue
<span class="badge-primary">Primary</span>
<span class="badge-success">Success</span>
<span class="badge-warning">Warning</span>
<span class="badge-danger">Danger</span>
```

### Icon Container
```vue
<div class="icon-container icon-sm bg-primary text-white">
  <UIcon name="i-heroicons-user" class="w-4 h-4" />
</div>

<div class="icon-container icon-md bg-success text-white">
  <UIcon name="i-heroicons-check" class="w-5 h-5" />
</div>

<div class="icon-container icon-lg bg-danger text-white">
  <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
</div>
```

---

## 📐 Layout Classes

### Section
```vue
<section class="section">
  <!-- Content with consistent spacing -->
</section>
```

### Grid Layouts
```vue
<!-- 4 Column Grid (responsive) -->
<div class="grid-cards">
  <div class="card">Card 1</div>
  <div class="card">Card 2</div>
  <div class="card">Card 3</div>
  <div class="card">Card 4</div>
</div>

<!-- 2 Column Grid -->
<div class="grid-2-cols">
  <div class="card">Column 1</div>
  <div class="card">Column 2</div>
</div>
```

### Flex Utilities
```vue
<!-- Flex Between -->
<div class="flex-between">
  <span>Left</span>
  <span>Right</span>
</div>

<!-- Flex Center -->
<div class="flex-center">
  <span>Centered</span>
</div>
```

---

## 📱 Responsive Utilities
```vue
<!-- Hide on mobile -->
<div class="hide-mobile">
  Hidden on mobile devices
</div>

<!-- Show only on mobile -->
<div class="show-mobile">
  Visible only on mobile
</div>
```

---

## ✅ Complete Example - Dashboard Page

```vue
<template>
  <div class="bg-surface min-h-screen">
    <section class="section">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-caption-md mb-6">
        <span class="font-medium text-primary">Dashboard</span>
      </nav>

      <!-- Header Card -->
      <div class="card">
        <h1 class="text-heading-1">Welcome, User</h1>
        <p class="text-caption-lg mt-2">
          This is your dashboard overview
        </p>
      </div>

      <!-- KPI Cards Grid -->
      <div class="grid-cards">
        <div class="kpi-card">
          <div class="flex items-center gap-4">
            <div class="kpi-icon bg-primary-light text-primary">
              <UIcon name="i-heroicons-user-group" class="w-6 h-6" />
            </div>
            <div class="flex-1">
              <p class="kpi-label">Total Users</p>
              <p class="kpi-value">1,234</p>
              <p class="kpi-caption">Active users</p>
            </div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="flex items-center gap-4">
            <div class="kpi-icon bg-success-light text-success">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6" />
            </div>
            <div class="flex-1">
              <p class="kpi-label">Completed</p>
              <p class="kpi-value">89%</p>
              <p class="kpi-caption">Success rate</p>
            </div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="flex items-center gap-4">
            <div class="kpi-icon bg-warning-light text-warning">
              <UIcon name="i-heroicons-clock" class="w-6 h-6" />
            </div>
            <div class="flex-1">
              <p class="kpi-label">Pending</p>
              <p class="kpi-value">12</p>
              <p class="kpi-caption">Need review</p>
            </div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="flex items-center gap-4">
            <div class="kpi-icon bg-danger-light text-danger">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6" />
            </div>
            <div class="flex-1">
              <p class="kpi-label">Issues</p>
              <p class="kpi-value">3</p>
              <p class="kpi-caption">Requires attention</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid-2-cols">
        <div class="card">
          <div class="flex-between mb-4">
            <h2 class="text-heading-2">Recent Activity</h2>
            <button class="btn-outline">View All</button>
          </div>
          <p class="text-body-md">Content goes here...</p>
        </div>

        <div class="card">
          <div class="flex-between mb-4">
            <h2 class="text-heading-2">Statistics</h2>
            <button class="btn-outline">Details</button>
          </div>
          <p class="text-body-md">Chart or stats here...</p>
        </div>
      </div>

      <!-- Action Cards -->
      <div class="grid-cards">
        <div class="card card-hover cursor-pointer">
          <div class="flex items-center gap-4">
            <div class="kpi-icon bg-purple-50 text-purple-600">
              <UIcon name="i-heroicons-document" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-heading-4">Documents</h3>
              <p class="text-caption-md">Manage files</p>
            </div>
          </div>
        </div>

        <div class="card card-hover cursor-pointer">
          <div class="flex items-center gap-4">
            <div class="kpi-icon bg-indigo-50 text-indigo-600">
              <UIcon name="i-heroicons-chart-bar" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-heading-4">Reports</h3>
              <p class="text-caption-md">View analytics</p>
            </div>
          </div>
        </div>

        <div class="card card-hover cursor-pointer">
          <div class="flex items-center gap-4">
            <div class="kpi-icon bg-teal-50 text-teal-600">
              <UIcon name="i-heroicons-cog" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-heading-4">Settings</h3>
              <p class="text-caption-md">Configure app</p>
            </div>
          </div>
        </div>

        <div class="card card-hover cursor-pointer">
          <div class="flex items-center gap-4">
            <div class="kpi-icon bg-orange-50 text-orange-600">
              <UIcon name="i-heroicons-bell" class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-heading-4">Notifications</h3>
              <p class="text-caption-md">View alerts</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
```

---

## 🎯 Design Tokens Reference

### Typography Scale
- **Display**: 4xl (36px), 3xl (30px), 2xl (24px)
- **Heading**: 2xl (24px), xl (20px), lg (18px), base (16px)
- **Body**: base (16px), sm (14px), xs (12px)
- **Label**: sm (14px), xs (12px)
- **Caption**: sm (14px), xs (12px)

### Font Weights
- **Light**: 300
- **Normal**: 400 (DEFAULT untuk body)
- **Medium**: 500 (untuk labels)
- **Semibold**: 600 (untuk headings)
- **Bold**: 700 (untuk display)

### Color Palette
- **Primary**: Blue-600 (#2563eb)
- **Success**: Green-600 (#16a34a)
- **Warning**: Yellow-600 (#ca8a04)
- **Danger**: Red-600 (#dc2626)
- **Neutral**: Slate (50-900)

### Spacing
- **Section**: p-6 (24px)
- **Card**: p-6 (24px)
- **Gap**: gap-6 (24px) untuk grid
- **Gap**: gap-4 (16px) untuk flex items

### Border Radius
- **Card**: rounded-xl (12px)
- **Button**: rounded-lg (8px)
- **Badge**: rounded-full
- **Icon**: rounded-xl (12px)

### Shadows
- **Card**: shadow-sm
- **Hover**: shadow-md
- **Modal**: shadow-lg
