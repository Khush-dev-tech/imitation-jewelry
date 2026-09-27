import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, resolving Tailwind class conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price in Indian Rupees with standard Indian digit grouping
 * (e.g. ₹1,24,999), per PRD §6 "Indian rupee pricing". Accepts number or
 * numeric string since Prisma Decimal fields serialize as strings.
 */
export function formatINR(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
