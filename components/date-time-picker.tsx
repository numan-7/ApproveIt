'use client';
import * as React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  isZoom?: boolean;
}

export function DateTimePicker({
  date,
  setDate,
  isZoom = false,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);
  const now = new Date();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
    if (selectedDay < today) return;
    if (selectedDay.getTime() === today.getTime()) {
      setDate(now);
    } else {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (
    type: 'hour' | 'minute' | 'ampm',
    value: string
  ) => {
    if (date) {
      const newDate = new Date(date);
      if (type === 'hour') {
        const currentAmPm = newDate.getHours() >= 12 ? 'PM' : 'AM';
        const newHour =
          (parseInt(value) % 12) + (currentAmPm === 'PM' ? 12 : 0);
        newDate.setHours(newHour);
      } else if (type === 'minute') {
        newDate.setMinutes(parseInt(value));
      } else if (type === 'ampm') {
        const currentHour = newDate.getHours();
        if (value === 'PM' && currentHour < 12) {
          newDate.setHours(currentHour + 12);
        } else if (value === 'AM' && currentHour >= 12) {
          newDate.setHours(currentHour - 12);
        }
      }
      if (newDate.toDateString() === now.toDateString() && newDate < now)
        return;
      setDate(newDate);
    }
  };

  const isToday = date && date.toDateString() === now.toDateString();

  const isHourDisabled = (hour: number) => {
    if (!date || !isToday) return false;
    const currentAmPm = date.getHours() >= 12 ? 'PM' : 'AM';
    const newHour = (hour % 12) + (currentAmPm === 'PM' ? 12 : 0);
    return newHour < now.getHours();
  };

  const isMinuteDisabled = (minute: number) => {
    if (!date || !isToday) return false;
    if (date.getHours() < now.getHours()) return true;
    if (date.getHours() === now.getHours() && minute < now.getMinutes()) {
      return true;
    }
    return false;
  };

  const isAmPmDisabled = (ampm: 'AM' | 'PM') => {
    if (!date || !isToday) return false;
    const currentHour = date.getHours();
    let newHour: number;
    if (ampm === 'PM') {
      newHour = currentHour < 12 ? currentHour + 12 : currentHour;
    } else {
      newHour = currentHour >= 12 ? currentHour - 12 : currentHour;
    }
    const newDate = new Date(date);
    newDate.setHours(newHour);
    return newDate < now;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Label htmlFor="date-time-picker" className="block mb-1">
        {isZoom ? 'Zoom Meeting Start Time' : 'Due Time'}
        &nbsp;<span className="text-red-500">*</span>
      </Label>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2" />
          {date ? (
            format(date, 'MM/dd/yyyy hh:mm aa')
          ) : (
            <span>MM/DD/YYYY hh:mm aa</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 font-dm">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {hours
                  .slice()
                  .reverse()
                  .map((hour) => (
                    <Button
                      key={hour}
                      size="icon"
                      variant={
                        date && date.getHours() % 12 === hour % 12
                          ? 'default'
                          : 'ghost'
                      }
                      disabled={isHourDisabled(hour)}
                      className="sm:w-full shrink-0 aspect-square"
                      onClick={() => handleTimeChange('hour', hour.toString())}
                    >
                      {hour}
                    </Button>
                  ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {minutes.map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={
                      date && date.getMinutes() === minute ? 'default' : 'ghost'
                    }
                    disabled={isMinuteDisabled(minute)}
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() =>
                      handleTimeChange('minute', minute.toString())
                    }
                  >
                    {minute.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-32 sm:w-auto">
              <div className="flex sm:flex-col p-2">
                {(['AM', 'PM'] as const).map((ampm) => (
                  <Button
                    key={ampm}
                    size="icon"
                    variant={
                      date && (date.getHours() >= 12 ? 'PM' : 'AM') === ampm
                        ? 'default'
                        : 'ghost'
                    }
                    disabled={isAmPmDisabled(ampm)}
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleTimeChange('ampm', ampm)}
                  >
                    {ampm}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
