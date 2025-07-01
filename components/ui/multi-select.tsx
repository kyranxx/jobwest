"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MultiSelectProps {
  options: {
    value: string
    label: string
    flag?: string
  }[]
  selected: string[]
  onChange: (selected: string[]) => void
  className?: string
  placeholder?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  className,
  placeholder = "Select options",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
    onChange(newSelected)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate">
            {selected.length > 0
              ? selected
                  .map(
                    (value) =>
                      options.find((option) => option.value === value)?.label
                  )
                  .join(", ")
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" sideOffset={0}>
        <ScrollArea className="max-h-72 overflow-y-auto">
            <div className="space-y-1 p-1">
                {options.map((option) => (
                    <Label
                        key={option.value}
                        htmlFor={`multiselect-${option.value}`}
                        className="flex items-center space-x-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                    >
                        <Checkbox
                            id={`multiselect-${option.value}`}
                            checked={selected.includes(option.value)}
                            onCheckedChange={() => handleSelect(option.value)}
                        />
                        {option.flag && <div className={`flag flag-${option.flag} shrink-0`} />}
                        <span className="text-sm font-normal w-full cursor-pointer">
                            {option.label}
                        </span>
                    </Label>
                ))}
            </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
