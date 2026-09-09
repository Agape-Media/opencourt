'use client';

import { DayPicker } from '@daypicker/react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type * as React from 'react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        month_caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday:
          'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        week: 'flex w-full mt-2',
        day: 'relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal'
        ),
        range_start: 'rounded-l-md bg-accent',
        range_end: 'rounded-r-md bg-accent',
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        today: 'bg-accent text-accent-foreground',
        outside:
          'text-muted-foreground data-[selected=true]:bg-accent/50 data-[selected=true]:text-muted-foreground',
        disabled: 'text-muted-foreground opacity-50',
        range_middle: 'rounded-none bg-accent text-accent-foreground',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left') {
            return (
              <ChevronLeft className={cn('h-4 w-4', className)} {...props} />
            );
          }
          if (orientation === 'right') {
            return (
              <ChevronRight className={cn('h-4 w-4', className)} {...props} />
            );
          }
          return (
            <ChevronDown className={cn('h-4 w-4', className)} {...props} />
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
