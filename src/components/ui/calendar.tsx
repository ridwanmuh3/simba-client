import * as React from "react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type CalendarProps = {
  mode?: "single";
  selected?: Date;
  onSelect?: (date?: Date) => void;
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
  showOutsideDays?: boolean;
  className?: string;
  classNames?: Record<string, string>;
};

const weekdays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function Calendar({
  selected,
  onSelect,
  disabled,
  initialFocus,
  showOutsideDays = true,
  className,
}: CalendarProps) {
  const [visibleMonth, setVisibleMonth] = React.useState(() =>
    dayjs(selected ?? new Date()).startOf("month"),
  );

  const days = React.useMemo(() => {
    const start = visibleMonth.startOf("month").startOf("week");
    return Array.from({ length: 42 }, (_, index) => start.add(index, "day"));
  }, [visibleMonth]);

  const selectedDay = selected ? dayjs(selected).startOf("day") : null;
  const today = dayjs().startOf("day");

  return (
    <div className={cn("p-3", className)}>
      <div className="relative flex items-center justify-center pt-1">
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          )}
          onClick={() => setVisibleMonth((month) => month.subtract(1, "month"))}
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-medium">
          {visibleMonth.locale("id").format("MMMM YYYY")}
        </div>
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          )}
          onClick={() => setVisibleMonth((month) => month.add(1, "month"))}
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1">
        {weekdays.map((day) => (
          <div
            key={day}
            className="h-9 w-9 rounded-md text-center text-[0.8rem] font-normal leading-9 text-muted-foreground"
          >
            {day}
          </div>
        ))}
        {days.map((day) => {
          const date = day.toDate();
          const isOutside = !day.isSame(visibleMonth, "month");
          const isSelected = selectedDay?.isSame(day, "day") ?? false;
          const isToday = today.isSame(day, "day");
          const isDisabled = disabled?.(date) ?? false;
          const isHidden = isOutside && !showOutsideDays;

          return (
            <button
              key={day.format("YYYY-MM-DD")}
              type="button"
              autoFocus={initialFocus && (isSelected || (!selected && isToday))}
              disabled={isDisabled || isHidden}
              onClick={() => onSelect?.(date)}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                isSelected &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                isToday && !isSelected && "bg-accent text-accent-foreground",
                isOutside &&
                  "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                isDisabled && "text-muted-foreground opacity-50",
                isHidden && "invisible",
              )}
              aria-selected={isSelected}
            >
              {day.date()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
