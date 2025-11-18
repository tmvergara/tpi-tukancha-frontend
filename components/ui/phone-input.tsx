"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

const COUNTRY_CODES = [
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+1", country: "Estados Unidos", flag: "🇺🇸" },
  { code: "+52", country: "México", flag: "🇲🇽" },
  { code: "+34", country: "España", flag: "🇪🇸" },
  { code: "+55", country: "Brasil", flag: "🇧🇷" },
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+51", country: "Perú", flag: "🇵🇪" },
  { code: "+598", country: "Uruguay", flag: "🇺🇾" },
  { code: "+595", country: "Paraguay", flag: "🇵🇾" },
  { code: "+591", country: "Bolivia", flag: "🇧🇴" },
  { code: "+593", country: "Ecuador", flag: "🇪🇨" },
  { code: "+58", country: "Venezuela", flag: "🇻🇪" },
  { code: "+44", country: "Reino Unido", flag: "🇬🇧" },
  { code: "+33", country: "Francia", flag: "🇫🇷" },
  { code: "+49", country: "Alemania", flag: "🇩🇪" },
  { code: "+39", country: "Italia", flag: "🇮🇹" },
];

interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      value = "",
      onChange,
      onBlur,
      placeholder = "(XXX) XXX-XXXX",
      disabled = false,
      className,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);
    const [selectedCode, setSelectedCode] = React.useState("+54");
    const [phoneNumber, setPhoneNumber] = React.useState("");
    const [initialized, setInitialized] = React.useState(false);

    // Parsear el valor inicial solo una vez
    React.useEffect(() => {
      if (value && !initialized) {
        // Intentar extraer código de país del número (asumiendo que viene sin +)
        const numericValue = value.replace(/\D/g, "");

        // Buscar código de país que coincida
        const country = COUNTRY_CODES.find((c) => {
          const codeDigits = c.code.replace(/\D/g, "");
          return numericValue.startsWith(codeDigits);
        });

        if (country) {
          setSelectedCode(country.code);
          const codeDigits = country.code.replace(/\D/g, "");
          const number = numericValue.substring(codeDigits.length);
          const formatted = formatPhoneNumber(number);
          setPhoneNumber(formatted);
        } else {
          const formatted = formatPhoneNumber(numericValue);
          setPhoneNumber(formatted);
        }
        setInitialized(true);
      }
    }, [value, initialized]);

    // Formatear el número de teléfono (XXX) XXX-XXXX
    const formatPhoneNumber = (input: string) => {
      // Remover todo excepto números
      const numbers = input.replace(/\D/g, "");

      // Aplicar formato según la longitud
      if (numbers.length <= 3) {
        return numbers;
      } else if (numbers.length <= 6) {
        return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
      } else {
        return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(
          6,
          10
        )}`;
      }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const formatted = formatPhoneNumber(input);
      setPhoneNumber(formatted);

      // Emitir solo números: código de país + número (sin + ni espacios)
      const cleanNumber = input.replace(/\D/g, "");
      const codeWithoutPlus = selectedCode.replace(/\D/g, "");
      const fullValue = `${codeWithoutPlus}${cleanNumber}`;
      onChange?.(fullValue);
    };

    const handleCountryCodeChange = (code: string) => {
      setSelectedCode(code);
      setOpen(false);

      // Emitir solo números: código de país + número (sin + ni espacios)
      const cleanNumber = phoneNumber.replace(/\D/g, "");
      const codeWithoutPlus = code.replace(/\D/g, "");
      const fullValue = `${codeWithoutPlus}${cleanNumber}`;
      onChange?.(fullValue);
    };

    return (
      <div className={cn("flex relative", className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="rounded-r-none border-r-0 w-[90px] justify-between px-3"
              disabled={disabled}
            >
              {COUNTRY_CODES.find((country) => country.code === selectedCode)
                ?.flag || "🌍"}{" "}
              {selectedCode}
              <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0">
            <Command>
              <CommandInput placeholder="Buscar país..." />
              <CommandList>
                <CommandEmpty>No se encontró el país.</CommandEmpty>
                <CommandGroup>
                  {COUNTRY_CODES.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={`${country.country} ${country.code}`}
                      onSelect={() => handleCountryCodeChange(country.code)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedCode === country.code
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      <span className="mr-2">{country.flag}</span>
                      <span className="flex-1">{country.country}</span>
                      <span className="text-muted-foreground">
                        {country.code}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Input
          ref={ref}
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 rounded-l-none"
          maxLength={14} // (XXX) XXX-XXXX
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";
