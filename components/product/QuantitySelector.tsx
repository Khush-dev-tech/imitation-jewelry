"use client";

import { Minus, Plus } from "lucide-react";

/** Quantity stepper — UI/UX Brief §5.3: large tap targets, not tiny +/- text links. */
export function QuantitySelector({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex items-center rounded-md border border-hairline">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex h-11 w-11 items-center justify-center text-charcoal disabled:opacity-40"
      >
        <Minus aria-hidden="true" className="h-4 w-4" />
      </button>
      <span
        className="w-10 text-center font-body text-sm font-semibold text-charcoal"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled}
        onClick={() => onChange(value + 1)}
        className="flex h-11 w-11 items-center justify-center text-charcoal disabled:opacity-40"
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}
