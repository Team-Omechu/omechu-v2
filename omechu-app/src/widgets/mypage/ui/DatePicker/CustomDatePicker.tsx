//* 26.01.18 작업

"use client";

import { useState } from "react";

import { isBefore, isSameMonth, startOfMonth } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { CustomInput } from "./CustomInput";
import { DatePickerHeader } from "./DatePickerHeader";
import "./datepicker.css";

function getDayClassName(viewMonth: Date, date: Date) {
  const monthStart = startOfMonth(viewMonth);

  if (isBefore(date, monthStart)) {
    return "dp-prev-month";
  }

  if (!isSameMonth(date, viewMonth)) {
    return "dp-next-month";
  }

  return "";
}

interface CustomDatePickerProps {
  onChange?: (start: Date | null, end: Date | null) => void;
  value?: {
    startDate: Date | null;
    endDate: Date | null;
  };
}

export function CustomDatePicker({ onChange, value }: CustomDatePickerProps) {
  const [startDate, setStartDate] = useState<Date | null>(
    value?.startDate ?? null,
  );
  const [endDate, setEndDate] = useState<Date | null>(value?.endDate ?? null);
  const [viewMonth, setViewMonth] = useState<Date>(new Date());

  const applyChange = (next: { start: Date | null; end: Date | null }) => {
    setStartDate(next.start);
    setEndDate(next.end);
    onChange?.(next.start, next.end);
  };

  return (
    <section className="flex w-full flex-col items-end">
      <section className="relative flex w-full items-center justify-center gap-4">
        <DatePicker
          selected={startDate}
          dateFormat="yyyy.MM.dd"
          customInput={<CustomInput />}
          onChange={(date: Date | null) => {
            const nextEnd = endDate && date && date > endDate ? null : endDate;
            applyChange({ start: date, end: nextEnd });
          }}
          selectsStart
          startDate={startDate}
          endDate={endDate ?? undefined}
          renderCustomHeader={(props) => <DatePickerHeader {...props} />}
          popperPlacement="bottom-start"
          formatWeekDay={(day) => day.slice(0, 2)}
          onMonthChange={(date) => setViewMonth(date)}
          dayClassName={(date) => getDayClassName(viewMonth, date)}
        />
        <span> ~ </span>
        <DatePicker
          selected={endDate}
          dateFormat="yyyy.MM.dd"
          customInput={<CustomInput />}
          onChange={(date: Date | null) => {
            if (startDate && date && date.getTime() < startDate.getTime())
              return;
            applyChange({ start: startDate, end: date });
          }}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate ?? undefined}
          dayClassName={(date) => getDayClassName(viewMonth, date)}
          renderCustomHeader={(props) => <DatePickerHeader {...props} />}
          popperPlacement="bottom-end"
        />
      </section>
      {startDate && endDate && (
        <button
          onClick={() => applyChange({ start: null, end: null })}
          className="mt-2 mr-1 items-end text-xs text-gray-500"
        >
          선택 초기화
        </button>
      )}
    </section>
  );
}
