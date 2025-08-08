import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateRangePickerProps {
  startDate?: Date
  endDate?: Date
  onStartDateChange: (date: Date | undefined) => void
  onEndDateChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  placeholder = "Select date range",
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, "MMM yyyy")} - ${format(endDate, "MMM yyyy")}`
    } else if (startDate) {
      return `${format(startDate, "MMM yyyy")} - Present`
    } else {
      return placeholder
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !startDate && !endDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <div className="flex flex-col space-y-2 p-3">
              <div className="text-sm font-medium">Start Date</div>
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={onStartDateChange}
                initialFocus
                className="pointer-events-auto"
              />
            </div>
            <div className="flex flex-col space-y-2 p-3 border-l">
              <div className="text-sm font-medium">End Date</div>
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={onEndDateChange}
                disabled={(date) => {
                  return startDate ? date < startDate : false
                }}
                className="pointer-events-auto"
              />
              <Button
                variant="outline"
                onClick={() => {
                  onEndDateChange(undefined)
                }}
                className="w-full text-xs"
              >
                Present
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}