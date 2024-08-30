"use client"

import * as React from "react"
import { Check, ChevronsUpDown, PlusCircle, Hotel } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useBusinessModal } from "@/hooks/use-business-modal"
import { useParams, useRouter } from "next/navigation"

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface BusinessSwitcherProps extends PopoverTriggerProps {
  items: Record<string, any>[];
}

export default function BusinessSwitcher({ className, items = [] }: BusinessSwitcherProps) {
  const businessModal = useBusinessModal();
  const params = useParams();
  const router = useRouter();

  const formattedItems = items.map((item) => ({
    label: item.name,
    value: item.id
  }));

  const currentBusiness = formattedItems.find((item) => item.value === params.businessId);

  const [open, setOpen] = React.useState(false)

  const onBusinessSelect = (business: { value: string, label: string }) => {
    setOpen(false);
    router.push(`/${business.value}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a business"
          className={cn("w-[200px] justify-between", className)}
        >
          <Hotel className="mr-2 h-4 w-4" />
          {currentBusiness?.label}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search business..." />
            <CommandEmpty>No business found.</CommandEmpty>
            <CommandGroup heading="Businesss">
              {formattedItems.map((business) => (
                <CommandItem
                  key={business.value}
                  onSelect={() => onBusinessSelect(business)}
                  className="text-sm"
                >
                  <Hotel className="mr-2 h-4 w-4" />
                  {business.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentBusiness?.value === business.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false)
                  businessModal.onOpen()
                }}
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Business
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
