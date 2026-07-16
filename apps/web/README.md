# React Frontend Architecture

Professional enterprise React architecture with TypeScript, authentication, and state management.

## Tech Stack

- **Vite** - Fast build tool
- **React 19** - UI framework
- **TypeScript** - Type safety
- **React Router v7** - Routing
- **TanStack Query** - Server state management
- **Axios** - HTTP client
- **Zod** - Runtime validation

## Project Structure

```
src/
├── app/                    # Application entry and providers
│   └── App.tsx            # Main app with routing and providers
├── config/                 # Configuration
│   ├── env.ts             # Environment variables
│   └── theme.ts           # Theme configuration
├── lib/                    # Core utilities
│   └── api-client.ts      # Axios instance with interceptors
├── features/              # Feature-based modules
│   └── auth/
│       ├── api/           # API calls
│       ├── hooks/         # React Query hooks
│       ├── context/       # Auth context provider
│       ├── components/    # Feature components
│       └── pages/         # Feature pages
├── components/            # Shared components
│   └── layouts/          # Layout components
├── pages/                 # Top-level pages
├── types/                 # Shared TypeScript types
└── styles/               # Global styles
```

## Features

### ✅ Authentication System
- **Login/Register** - Full authentication flow
- **JWT Tokens** - Access & refresh token handling
- **Auto Refresh** - Automatic token refresh on 401
- **Protected Routes** - Route guards
- **Role Guards** - Role-based access control
- **Auth Context** - Centralized auth state

### ✅ Routing
- React Router v7 with nested routes
- Protected routes with authentication
- Role-based guards
- 404 & 403 error pages
- Layout-based routing

### ✅ State Management
- TanStack Query for server state
- React Context for auth state
- Query key management
- Optimistic updates ready
- DevTools for debugging

### ✅ API Client
- Axios instance with base URL
- Request interceptor (add auth token)
- Response interceptor (handle refresh)
- Type-safe API calls
- Error handling

### ✅ Layout System
- Dashboard layout with header & sidebar
- Auth layout for login/register
- Responsive design
- Role-based navigation

### ✅ Theme System
- Centralized theme configuration
- CSS variables
- Consistent design tokens
- Professional color palette

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3000
```

## Usage Examples

### Protected Route
```tsx
<Route element={<ProtectedRoute />}>
  <Route path="/" element={<Dashboard />} />
</Route>
```

### Role-Based Access
```tsx
<RoleGuard allowedRoles={['admin']}>
  <AdminPanel />
</RoleGuard>
```

### API Call with TanStack Query
```tsx
const { data, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: () => api.get('/users'),
});
```

### Using Auth Context
```tsx
const { user, login, logout, isAuthenticated } = useAuth();
```

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm --filter @ai-publishing/web dev

# Build for production
pnpm --filter @ai-publishing/web build
```

## Architecture Principles

1. **Feature-based folders** - Code organized by feature
2. **Separation of concerns** - API, hooks, components separate
3. **Type safety** - Zod schemas + TypeScript
4. **Reusability** - Shared components and hooks
5. **Performance** - Code splitting ready
6. **Scalability** - Easy to add new features
