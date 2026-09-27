"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending_confirmation", label: "Pending Confirmation" },
  { value: "paid", label: "Paid" },
  { value: "payment_failed", label: "Payment Failed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "fulfilled", label: "Fulfilled" },
] as const;

export function OrderStatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") ?? "";

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("status", value);
    else params.delete("status");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 font-body text-sm text-charcoal">
      Filter
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-hairline bg-ivory px-3 py-2 font-body text-sm text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
