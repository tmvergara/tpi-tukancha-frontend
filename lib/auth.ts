import { API_URL } from "./config";

export interface User {
    id: number;
    nombre: string;
    email: string;
    rol: "admin" | "encargado" | "org_torneos";
    club_id: number;
    club_nombre?: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

// Claves para localStorage
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";

// ============= Gestión de Tokens =============

export function setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== "undefined") {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
}

export function getAccessToken(): string | null {
    if (typeof window !== "undefined") {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
}

export function getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
}

export function clearTokens(): void {
    if (typeof window !== "undefined") {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }
}

// ============= Gestión de Usuario =============

export function setUser(user: User): void {
    if (typeof window !== "undefined") {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
}

export function getUser(): User | null {
    if (typeof window !== "undefined") {
        const userStr = localStorage.getItem(USER_KEY);
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
    }
    return null;
}

// ============= Funciones de Autenticación =============

export async function login(
    credentials: LoginCredentials
): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al iniciar sesión");
    }

    const data: AuthResponse = await response.json();

    // Guardar tokens y usuario
    setTokens(data.access_token, data.refresh_token);
    setUser(data.user);

    return data;
}

export async function logout(): Promise<void> {
    const token = getAccessToken();

    if (token) {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error("Error al cerrar sesión en el servidor:", error);
        }
    }

    // Limpiar tokens locales
    clearTokens();
}

export async function refreshAccessToken(): Promise<string> {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        throw new Error("No hay refresh token disponible");
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${refreshToken}`,
        },
    });

    if (!response.ok) {
        clearTokens();
        throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
    }

    const data = await response.json();
    const newAccessToken = data.access_token;

    // Actualizar access token
    if (typeof window !== "undefined") {
        localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
    }

    return newAccessToken;
}

export async function getCurrentUser(): Promise<User> {
    const token = getAccessToken();

    if (!token) {
        throw new Error("No hay token de acceso");
    }

    const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        // Intentar refrescar el token
        try {
            const newToken = await refreshAccessToken();
            const retryResponse = await fetch(`${API_URL}/auth/me`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${newToken}`,
                },
            });

            if (!retryResponse.ok) {
                throw new Error("Error al obtener usuario");
            }

            const user = await retryResponse.json();
            setUser(user);
            return user;
        } catch {
            clearTokens();
            throw new Error("Sesión expirada");
        }
    }

    const user = await response.json();
    setUser(user);
    return user;
}

// ============= Utilidades =============

export function isAuthenticated(): boolean {
    return getAccessToken() !== null;
}

export function isAdmin(): boolean {
    const user = getUser();
    return user?.rol === "admin";
}

// Función helper para hacer requests autenticados
export async function authenticatedFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    let token = getAccessToken();

    if (!token) {
        throw new Error("No autenticado");
    }

    // Agregar el token al header
    const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    let response = await fetch(url, { ...options, headers });

    // Si el token expiró (401), intentar refrescar
    if (response.status === 401) {
        try {
            token = await refreshAccessToken();
            headers.Authorization = `Bearer ${token}`;
            response = await fetch(url, { ...options, headers });
        } catch {
            clearTokens();
            throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        }
    }

    return response;
}
