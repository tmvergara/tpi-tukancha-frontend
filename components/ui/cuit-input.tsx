"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface CuitInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const CuitInput = React.forwardRef<HTMLInputElement, CuitInputProps>(
  (
    {
      value = "",
      onChange,
      onBlur,
      placeholder = "XX-XXXXXXXX-X",
      disabled = false,
      className,
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState("");
    const [initialized, setInitialized] = React.useState(false);

    // Formatear el CUIT: XX-XXXXXXXX-X
    const formatCuit = (input: string) => {
      // Remover todo excepto números
      const numbers = input.replace(/\D/g, "");

      // Aplicar formato según la longitud
      if (numbers.length <= 2) {
        return numbers;
      } else if (numbers.length <= 10) {
        return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
      } else {
        return `${numbers.slice(0, 2)}-${numbers.slice(2, 10)}-${numbers.slice(
          10,
          11
        )}`;
      }
    };

    // Parsear el valor inicial solo una vez
    React.useEffect(() => {
      if (value && !initialized) {
        const numericValue = value.replace(/\D/g, "");
        const formatted = formatCuit(numericValue);
        setDisplayValue(formatted);
        setInitialized(true);
      }
    }, [value, initialized]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const formatted = formatCuit(input);
      setDisplayValue(formatted);

      // Emitir solo números (sin guiones)
      const cleanNumber = input.replace(/\D/g, "");
      onChange?.(cleanNumber);
    };

    return (
      <Input
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(className)}
        maxLength={13} // XX-XXXXXXXX-X = 13 caracteres
      />
    );
  }
);

CuitInput.displayName = "CuitInput";
