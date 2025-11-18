import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "./use-debounce";

interface EmailValidationResult {
    isValidating: boolean;
    isAvailable: boolean | null;
    error: string | null;
}

export function useEmailValidation(
    email: string,
    enabled: boolean = true
): EmailValidationResult {
    const [isValidating, setIsValidating] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    const debouncedEmail = useDebounce(email, 500);

    const validateEmail = useCallback(async (emailToValidate: string) => {
        if (!emailToValidate || !enabled) {
            setIsAvailable(null);
            setError(null);
            return;
        }

        // Validar formato de email primero
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailToValidate)) {
            setIsAvailable(null);
            setError(null);
            return;
        }

        setIsValidating(true);
        setError(null);

        try {
            const API_URL =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
            const response = await fetch(
                `${API_URL}/users/check-email/${encodeURIComponent(emailToValidate)}`
            );

            if (!response.ok) {
                throw new Error("Error al validar el correo electrónico");
            }

            const data = await response.json();

            // El backend devuelve { email: string, registrado: boolean }
            // registrado: true = ya está en uso, registrado: false = disponible
            const available = data.registrado === false;

            setIsAvailable(available);
            if (!available) {
                setError("Este correo electrónico ya está registrado");
            }
        } catch (err) {
            console.error("Error validando email:", err);
            setError("No se pudo validar el correo electrónico");
            setIsAvailable(null);
        } finally {
            setIsValidating(false);
        }
    }, [enabled]);

    useEffect(() => {
        validateEmail(debouncedEmail);
    }, [debouncedEmail, validateEmail]);

    return { isValidating, isAvailable, error };
}
