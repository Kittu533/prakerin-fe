# Auth Setup - Prakerin Frontend

## Overview

Clean architecture auth implementation untuk multi-role login system.

## Struktur Files

```
app/
├── composables/
│   ├── auth/
│   │   └── use-auth.ts         # Main auth composable (kebab-case)
│   ├── types-auth/
│   │   └── auth.interface.ts   # TypeScript interfaces
│   └── api-fetch.ts            # API wrapper
├── stores/
│   └── data-store.ts           # Pinia store for auth state
├── middleware/
│   └── auth-token.ts           # Route protection middleware
└── pages/
    └── login.vue               # Login page with role selection
```

## User Roles

| Role | Dashboard Route | Identifier |
|------|-----------------|------------|
| Admin | `/admin` | Email |
| Guru | `/guru` | NIP |
| Siswa | `/siswa` | NIS |
| Mentor | `/mentor` | Email |

## Login Credentials (Development)

```
Admin  : admin@prakerin.id / password123
Guru   : guru@prakerin.id / password123
Siswa  : siswa@prakerin.id / password123
Mentor : mentor@prakerin.id / password123
```

## Usage

### 1. Login

```vue
<script setup>
import { useAuth } from '~/composables/auth/use-auth';

const { login, getDashboardRoute } = useAuth();

async function handleLogin() {
  const result = await login({
    identifier: 'admin@prakerin.id',
    password: 'password123',
    role: 'admin'
  });

  if (result.success) {
    navigateTo(getDashboardRoute());
  }
}
</script>
```

### 2. Check Auth State

```vue
<script setup>
import { useAuth } from '~/composables/auth/use-auth';

const { isAuthenticated, user, userRole } = useAuth();

// Reactive state
console.log(isAuthenticated.value); // true/false
console.log(user.value);            // AuthUser object
console.log(userRole.value);        // 'admin' | 'guru' | 'siswa' | 'mentor'
</script>
```

### 3. Role-based UI

```vue
<template>
  <div v-if="isAdmin()">Admin Only Content</div>
  <div v-if="isGuru()">Guru Only Content</div>
  <div v-if="isSiswa()">Siswa Only Content</div>
  <div v-if="isMentor()">Mentor Only Content</div>
</template>

<script setup>
import { useAuth } from '~/composables/auth/use-auth';

const { isAdmin, isGuru, isSiswa, isMentor } = useAuth();
</script>
```

### 4. Logout

```vue
<script setup>
import { useAuth } from '~/composables/auth/use-auth';

const { logout } = useAuth();

async function handleLogout() {
  await logout();
  navigateTo('/login');
}
</script>
```

### 5. Protected Routes

Add middleware to pages that require authentication:

```vue
<script setup>
definePageMeta({
  middleware: ['auth-token']
});
</script>
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/verify` | Verify token validity |

## Environment Variables

```env
# .env
NUXT_PUBLIC_API_URL=https://prakerin-gateway.onrender.com
```

## Token Storage

Tokens are stored in:
- `localStorage.token` - Access token
- `localStorage.refreshToken` - Refresh token
- `localStorage.profile` - User profile data

## Error Handling

Login errors are returned with:
```typescript
{
  success: false,
  message: 'Invalid credentials' // or other error message
}
```
