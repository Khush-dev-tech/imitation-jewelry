"use client";

import * as RadixToast from "@radix-ui/react-toast";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Toast — UI/UX Brief §5.9/§6. Built on Radix's Toast primitive so the
 * aria-live announcement (required by §5.9 — "remain screen-reader
 * announced so the confirmation isn't purely visual") is handled
 * correctly by default, rather than hand-rolled.
 */

type ToastVariant = "success" | "error";

interface ToastMessage {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: Omit<ToastMessage, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: "border-success text-success",
  error: "border-error text-error",
};

const VARIANT_ICON: Record<ToastVariant, string> = {
  success: "✓",
  error: "⚠",
};

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: Omit<ToastMessage, "id">) => {
    nextId += 1;
    const id = nextId;
    setMessages((current) => [...current, { ...message, id }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setMessages((current) => current.filter((m) => m.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToast.Provider swipeDirection="right" duration={4000}>
        {children}
        {messages.map((message) => (
          <RadixToast.Root
            key={message.id}
            onOpenChange={(open) => {
              if (!open) dismiss(message.id);
            }}
            className={cn(
              "flex items-start gap-2 rounded-md border bg-ivory px-4 py-3 shadow-none",
              "font-body text-sm text-charcoal",
              "data-[state=open]:animate-in data-[state=open]:fade-in",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out",
              VARIANT_CLASSES[message.variant],
            )}
          >
            <span aria-hidden="true">{VARIANT_ICON[message.variant]}</span>
            <div>
              <RadixToast.Title className="font-semibold">{message.title}</RadixToast.Title>
              {message.description ? (
                <RadixToast.Description className="text-charcoal-muted">
                  {message.description}
                </RadixToast.Description>
              ) : null}
            </div>
          </RadixToast.Root>
        ))}
        <RadixToast.Viewport className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 outline-none" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
