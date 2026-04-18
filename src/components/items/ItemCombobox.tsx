import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { Item } from "@/types/item";

interface ItemComboboxProps {
  items: Item[];
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function ItemCombobox({
  items,
  value,
  onChange,
  placeholder = "Pilih bahan",
  disabled,
}: ItemComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = items.find((it) => it.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected?.name || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command
          filter={(itemValue, search) => {
            return itemValue.toLowerCase().includes(search.toLowerCase())
              ? 1
              : 0;
          }}
        >
          <CommandInput placeholder="Cari bahan..." />
          <CommandList>
            <CommandEmpty>Bahan tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {items.map((it) => (
                <CommandItem
                  key={it.id}
                  value={`${it.name} ${it.id}`}
                  onSelect={() => {
                    if (it.id) onChange(it.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === it.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="truncate">{it.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
