import { type InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Input — UI/UX Brief §5.2. Label always visible above the field (never
 * placeholder-only). Error shown as icon + text below the field, never
 * colour alone.
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, required, id, className, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="font-body text-sm font-medium text-charcoal">
          {label}
          {required ? (
            <span aria-hidden="true" className="ml-0.5 text-error">
              *
            </span>
          ) : null}
        </label>
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-required={required || undefined}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={cn(errorId, helperId) || undefined}
          className={cn(
            "min-h-11 rounded-md border bg-ivory px-3.5 py-2.5 font-body text-base text-charcoal",
            "placeholder:text-charcoal-muted",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal",
            error ? "border-error" : "border-hairline",
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={errorId} className="flex items-center gap-1 font-body text-sm text-error">
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="font-body text-sm text-charcoal-muted">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
