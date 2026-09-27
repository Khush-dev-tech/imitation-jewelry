import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Button — UI/UX Brief §5.1.
 * Variants: primary (maroon, the ONLY colour used for conversion actions),
 * secondary (outline), tertiary (low-emphasis text button), whatsapp
 * (WhatsApp's own brand green, deliberately distinct from site colours so
 * it always reads as "leave the site to chat").
 */

const VARIANT_CLASSES = {
  primary: "bg-maroon text-ivory hover:bg-maroon-dark active:bg-maroon-dark disabled:bg-maroon/40",
  secondary:
    "border border-charcoal text-charcoal bg-transparent hover:bg-charcoal/5 disabled:border-charcoal/30 disabled:text-charcoal/40",
  tertiary: "text-charcoal underline-offset-4 hover:underline disabled:text-charcoal/40",
  whatsapp:
    "bg-whatsapp text-white hover:bg-whatsapp-dark active:bg-whatsapp-dark disabled:bg-whatsapp/40",
} as const;

export type ButtonVariant = keyof typeof VARIANT_CLASSES;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  /** Shows an inline spinner and disables interaction, without changing button width. */
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading = false, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
        className={cn(
          "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-5 py-2.5",
          "font-body text-[15px] font-semibold leading-5 transition-colors duration-150",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal",
          "disabled:cursor-not-allowed",
          VARIANT_CLASSES[variant],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        ) : null}
        <span className={loading ? "opacity-90" : undefined}>{children}</span>
      </button>
    );
  },
);

Button.displayName = "Button";
