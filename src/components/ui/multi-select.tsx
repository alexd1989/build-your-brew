import * as React from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface MultiSelectProps {
  options: { label: string; value: string }[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  className?: string
  maxDisplay?: number
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select items...",
  className,
  maxDisplay = 3,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const handleRemove = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue))
  }

  const selectedOptions = options.filter((option) => value.includes(option.value))
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  )

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target && !(event.target as Element).closest('.multi-select-wrapper')) {
        setOpen(false)
      }
    }
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className={cn("relative multi-select-wrapper", className)}>
      <div
        className="min-h-10 flex flex-wrap gap-1 p-2 border border-input rounded-md cursor-pointer bg-background"
        onClick={() => setOpen(!open)}
      >
        {selectedOptions.length === 0 && (
          <span className="text-muted-foreground text-sm self-center">
            {placeholder}
          </span>
        )}
        {selectedOptions.slice(0, maxDisplay).map((option) => (
          <Badge
            key={option.value}
            variant="secondary"
            className="text-xs gap-1 bg-primary/10 text-primary hover:bg-primary/20"
          >
            {option.label}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove(option.value)
              }}
            />
          </Badge>
        ))}
        {selectedOptions.length > maxDisplay && (
          <Badge variant="secondary" className="text-xs bg-muted">
            +{selectedOptions.length - maxDisplay} more
          </Badge>
        )}
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-border bg-popover text-popover-foreground shadow-md">
          <Command>
            <CommandInput
              placeholder="Search..."
              value={search}
              onValueChange={setSearch}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          value.includes(option.value)
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                      </div>
                      <span>{option.label}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}