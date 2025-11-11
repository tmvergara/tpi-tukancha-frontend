"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    isAuthenticated,
    getUser,
    getCurrentUser,
    type User,
} from "@/lib/auth";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function checkAuth() {
            if (!isAuthenticated()) {
                setLoading(false);
                return;
            }

            try {
                // Intentar obtener el usuario desde localStorage primero
                let currentUser = getUser();

                // Si no está en localStorage, obtenerlo del servidor
                if (!currentUser) {
                    currentUser = await getCurrentUser();
                }

                setUser(currentUser);
            } catch (error) {
                console.error("Error al verificar autenticación:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, []);

    return { user, loading, isAuthenticated: !!user };
}

export function useRequireAuth() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    return { user, loading };
}
