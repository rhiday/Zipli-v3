'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { enUS, fi } from 'date-fns/locale';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const { language } = useLanguage();

  // Get the appropriate locale based on current language
  const locale = language === 'fi' ? fi : enUS;

  return (
    <DayPicker
      locale={locale}
      weekStartsOn={1}
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      modifiers={{
        today: new Date(),
      }}
      modifiersStyles={{
        today: {
          backgroundColor: '#dbeafe',
          color: '#1e3a8a',
          fontWeight: 'bold',
          border: '2px solid #93c5fd',
          borderRadius: '6px',
        },
        selected: {
          backgroundColor: '#16a34a',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '6px',
        },
      }}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-between items-center pt-1 relative',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium',
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        nav_button_previous: '',
        nav_button_next: '',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: cn(
          'relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md',
          props.mode === 'range'
            ? '[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md'
            : '[&:has([aria-selected])]:rounded-md'
        ),
        day: cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium',
          'bg-transparent hover:bg-accent hover:text-accent-foreground',
          'h-8 w-8 p-0 font-normal aria-selected:opacity-100',
          'transition-colors duration-200'
        ),
        day_range_start: 'day-range-start',
        day_range_end: 'day-range-end',
        day_selected:
          '!bg-green-600 !text-white hover:!bg-green-700 hover:!text-white focus:!bg-green-700 focus:!text-white !font-semibold',
        day_today:
          '!bg-blue-100 !text-blue-900 !font-semibold !border-2 !border-blue-300 hover:!bg-blue-200 hover:!border-blue-400 !rounded-md !shadow-sm',
        day_outside:
          'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
        day_disabled: 'text-muted-foreground opacity-50',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn('h-4 w-4', className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn('h-4 w-4', className)} {...props} />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
