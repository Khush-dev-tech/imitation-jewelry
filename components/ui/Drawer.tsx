"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Drawer — UI/UX Brief §5.7. Built on Radix's Dialog primitive, which
 * provides focus trapping, Escape-to-close, and return-focus-on-close
 * out of the box (the exact three behaviours §5.7/§10 require). Used for
 * the mobile menu now; the same component will serve the mobile filter
 * sheet and mini-cart drawer in later phases.
 */

const SIDE_CLASSES = {
  left: "inset-y-0 left-0 h-full w-full max-w-xs data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
  right:
    "inset-y-0 right-0 h-full w-full max-w-xs data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
  bottom:
    "inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-lg data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
} as const;

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: keyof typeof SIDE_CLASSES;
  title: string;
  children: ReactNode;
}

export function Drawer({ open, onOpenChange, side = "left", title, children }: DrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-charcoal/40 data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content
          className={cn(
            "fixed z-50 flex flex-col bg-ivory p-6 shadow-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out duration-200",
            SIDE_CLASSES[side],
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="font-heading text-xl text-charcoal">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="flex h-11 w-11 items-center justify-center rounded-md text-charcoal hover:bg-beige focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
