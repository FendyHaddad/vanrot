import { signal, type WritableSignal } from '@vanrot/runtime';

export interface CalendarDay {
  date: Date;
  currentMonth: boolean;
  selected: boolean;
  disabled: boolean;
}

export interface CalendarControllerOptions {
  month: Date;
  selectedDate?: Date;
  minDate?: Date;
  maxDate?: Date;
}

export interface CalendarController {
  readonly month: WritableSignal<Date>;
  readonly selectedDate: WritableSignal<Date | null>;
  readonly weeks: WritableSignal<readonly (readonly CalendarDay[])[]>;
  readonly label: WritableSignal<string>;
  previousMonth(): void;
  nextMonth(): void;
  selectDate(date: Date): void;
  isSelected(date: Date): boolean;
}

export interface DatePickerController extends CalendarController {
  readonly open: WritableSignal<boolean>;
  openPicker(): void;
  closePicker(): void;
}

export function createCalendarController(
  options: CalendarControllerOptions,
): CalendarController {
  const month = signal(startOfMonth(options.month));
  const selectedDate = signal<Date | null>(
    options.selectedDate === undefined ? null : startOfDay(options.selectedDate),
  );
  const weeks = signal<readonly (readonly CalendarDay[])[]>([]);
  const label = signal('');

  function refresh(): void {
    label.set(
      month().toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    );
    weeks.set(buildWeeks(month(), selectedDate(), options.minDate, options.maxDate));
  }

  function selectDate(date: Date): void {
    const nextDate = startOfDay(date);
    if (isDisabled(nextDate, options.minDate, options.maxDate)) {
      return;
    }

    selectedDate.set(nextDate);
    refresh();
  }

  const controller: CalendarController = {
    month,
    selectedDate,
    weeks,
    label,
    previousMonth() {
      month.set(new Date(month().getFullYear(), month().getMonth() - 1, 1));
      refresh();
    },
    nextMonth() {
      month.set(new Date(month().getFullYear(), month().getMonth() + 1, 1));
      refresh();
    },
    selectDate,
    isSelected(date) {
      const selected = selectedDate();
      return selected !== null && sameDay(selected, date);
    },
  };

  refresh();

  return controller;
}

export function createDatePickerController(
  options: CalendarControllerOptions,
): DatePickerController {
  const calendar = createCalendarController(options);
  const open = signal(false);

  return {
    ...calendar,
    open,
    openPicker() {
      open.set(true);
    },
    closePicker() {
      open.set(false);
    },
    selectDate(date) {
      calendar.selectDate(date);
      open.set(false);
    },
  };
}

function buildWeeks(
  month: Date,
  selectedDate: Date | null,
  minDate: Date | undefined,
  maxDate: Date | undefined,
): readonly (readonly CalendarDay[])[] {
  const first = startOfMonth(month);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());
  const weeks: CalendarDay[][] = [];

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const week: CalendarDay[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + weekIndex * 7 + dayIndex);
      week.push({
        date,
        currentMonth: date.getMonth() === month.getMonth(),
        selected: selectedDate !== null && sameDay(date, selectedDate),
        disabled: isDisabled(date, minDate, maxDate),
      });
    }
    weeks.push(week);
  }

  return weeks;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(left: Date, right: Date): boolean {
  return startOfDay(left).getTime() === startOfDay(right).getTime();
}

function isDisabled(date: Date, minDate: Date | undefined, maxDate: Date | undefined): boolean {
  const time = startOfDay(date).getTime();
  if (minDate !== undefined && time < startOfDay(minDate).getTime()) {
    return true;
  }

  return maxDate !== undefined && time > startOfDay(maxDate).getTime();
}
