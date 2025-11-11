# Sistema de Autenticación JWT

Este proyecto implementa un sistema completo de autenticación basado en JSON Web Tokens (JWT) que se comunica con el backend.

## 🔐 Flujo de Autenticación

1. **Registro** → El usuario se registra creando un club y usuario admin
2. **Login** → El usuario inicia sesión con email y contraseña
3. **Tokens** → El backend genera dos tokens:
   - **Access Token** (1 hora) - Para autenticar requests
   - **Refresh Token** (30 días) - Para renovar access tokens
4. **Almacenamiento** → Los tokens se guardan en localStorage
5. **Autenticación** → El Access Token se incluye en cada request
6. **Validación** → El backend valida el token y rol antes de ejecutar

## 📁 Estructura de Archivos

```
lib/
  auth.ts                    # Funciones de autenticación y gestión de tokens
  types.ts                   # Tipos TypeScript (User, Club, etc.)
  config.ts                  # Configuración (API_URL)

hooks/
  use-auth.ts               # Hooks personalizados para autenticación

components/
  protected-route.tsx       # Componente para proteger rutas
  login-form.tsx           # Formulario de login
  register-form.tsx        # Formulario de registro
  nav-user.tsx            # Menú de usuario con logout

app/
  login/page.tsx          # Página de login
  register/page.tsx       # Página de registro
  admin/layout.tsx        # Layout protegido del admin
```

## 🔧 Funciones Principales

### `lib/auth.ts`

#### Gestión de Tokens

- `setTokens(accessToken, refreshToken)` - Guarda tokens en localStorage
- `getAccessToken()` - Obtiene el access token
- `getRefreshToken()` - Obtiene el refresh token
- `clearTokens()` - Elimina todos los tokens

#### Gestión de Usuario

- `setUser(user)` - Guarda datos del usuario
- `getUser()` - Obtiene datos del usuario desde localStorage
- `getCurrentUser()` - Obtiene datos actualizados del servidor

#### Autenticación

- `login(credentials)` - Inicia sesión y guarda tokens
- `logout()` - Cierra sesión y limpia tokens
- `refreshAccessToken()` - Renueva el access token usando el refresh token
- `isAuthenticated()` - Verifica si hay un token válido
- `isAdmin()` - Verifica si el usuario es admin

#### Request Helper

- `authenticatedFetch(url, options)` - Hace requests autenticados con renovación automática de token

### `hooks/use-auth.ts`

#### Hooks Personalizados

- `useAuth()` - Hook para obtener usuario y estado de autenticación
- `useRequireAuth()` - Hook que redirige a login si no está autenticado

## 🌐 Endpoints del Backend

### Login

```typescript
POST /api/v1/auth/login
Body: { email: string, password: string }
Response: { access_token, refresh_token, user }
```

### Refresh Token

```typescript
POST / api / v1 / auth / refresh;
Headers: Authorization: Bearer<refresh_token>;
Response: {
  access_token;
}
```

### Get Current User

```typescript
GET / api / v1 / auth / me;
Headers: Authorization: Bearer<access_token>;
Response: User;
```

### Logout

```typescript
POST / api / v1 / auth / logout;
Headers: Authorization: Bearer<access_token>;
Response: {
  message;
}
```

## 💡 Uso en Componentes

### Proteger una Ruta

```tsx
import { ProtectedRoute } from "@/components/protected-route";

export default function AdminLayout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
```

### Usar Hook de Autenticación

```tsx
import { useAuth } from "@/hooks/use-auth";

export function MyComponent() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div>Cargando...</div>;
  if (!isAuthenticated) return <div>No autenticado</div>;

  return <div>Hola {user?.nombre}</div>;
}
```

### Hacer Request Autenticado

```tsx
import { authenticatedFetch } from "@/lib/auth";
import { API_URL } from "@/lib/config";

async function fetchData() {
  const response = await authenticatedFetch(`${API_URL}/api/v1/clubes`);
  const data = await response.json();
  return data;
}
```

### Logout

```tsx
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return <button onClick={handleLogout}>Cerrar Sesión</button>;
}
```

## 🔄 Renovación Automática de Tokens

El sistema incluye renovación automática de tokens:

- Si un request retorna 401 (no autorizado)
- Automáticamente intenta renovar el access token
- Reintenta el request original con el nuevo token
- Si falla, limpia los tokens y redirige a login

## 🛡️ Seguridad

- Los tokens se almacenan en localStorage (considera httpOnly cookies para producción)
- Los access tokens expiran en 1 hora
- Los refresh tokens expiran en 30 días
- Todos los requests a rutas protegidas requieren un access token válido
- El middleware protege las rutas del admin

## 🚀 Próximos Pasos

Para usar en producción, considera:

1. Mover tokens a httpOnly cookies en lugar de localStorage
2. Implementar CSRF protection
3. Agregar rate limiting
4. Implementar 2FA (autenticación de dos factores)
5. Logging de eventos de seguridad
