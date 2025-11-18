"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Check, X, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEmailValidation } from "@/hooks/use-email-validation";

interface EmailInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange"
  > {
  value?: string;
  onChange?: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  validateAvailability?: boolean;
}

export const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  (
    {
      value = "",
      onChange,
      onValidationChange,
      validateAvailability = true,
      className,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(value);
    const [touched, setTouched] = React.useState(false);

    const { isValidating, isAvailable, error } = useEmailValidation(
      internalValue,
      validateAvailability && touched
    );

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(internalValue);
    const showValidation = touched && internalValue.length > 0 && isValidFormat;

    React.useEffect(() => {
      setInternalValue(value);
    }, [value]);

    React.useEffect(() => {
      if (onValidationChange && showValidation) {
        onValidationChange(isAvailable === true);
      }
    }, [isAvailable, showValidation, onValidationChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange?.(newValue);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      onBlur?.(e);
    };

    const getStatusIcon = () => {
      if (!showValidation) return null;

      if (isValidating) {
        return (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        );
      }

      if (isAvailable === true) {
        return <Check className="h-4 w-4 text-green-600" />;
      }

      if (isAvailable === false || error) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <X className="h-4 w-4 text-red-600 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{error || "Este correo no está disponible"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      return null;
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="email"
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn("pr-10", className)}
          {...props}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>
    );
  }
);

EmailInput.displayName = "EmailInput";
