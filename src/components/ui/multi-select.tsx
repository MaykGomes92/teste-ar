import React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  maxDisplayed?: number;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Selecione itens...",
  className,
  maxDisplayed = 3,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOptions = options.filter((option) => value.includes(option.value));

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const displayText = () => {
    if (selectedOptions.length === 0) return placeholder;
    if (selectedOptions.length <= maxDisplayed) {
      return selectedOptions.map((option) => option.label).join(", ");
    }
    return `${selectedOptions.slice(0, maxDisplayed).map((option) => option.label).join(", ")} +${selectedOptions.length - maxDisplayed}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-auto min-h-10 px-3 py-2", className)}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : selectedOptions.length <= maxDisplayed ? (
              selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="text-xs px-2 py-1"
                >
                  {option.label}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={(e) => handleRemove(option.value, e)}
                  />
                </Badge>
              ))
            ) : (
              <span className="text-sm">
                {selectedOptions.slice(0, maxDisplayed).map((option) => option.label).join(", ")}
                <Badge variant="secondary" className="ml-1 text-xs">
                  +{selectedOptions.length - maxDisplayed}
                </Badge>
              </span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}