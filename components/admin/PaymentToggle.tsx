"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function PaymentToggle({
  initialEnabled,
  razorpayConfigured,
}: {
  initialEnabled: boolean;
  razorpayConfigured: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !enabled;
    setLoading(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentGatewayEnabled: next }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast({ title: data.error ?? "Could not update setting", variant: "error" });
        return;
      }
      setEnabled(next);
      toast({
        title: next ? "Online payment turned on" : "Online payment turned off",
        variant: "success",
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <label className="flex items-center gap-2 font-body text-sm font-medium text-charcoal">
        <input
          type="checkbox"
          checked={enabled}
          disabled={loading || (!enabled && !razorpayConfigured)}
          onChange={toggle}
        />
        {enabled ? "Online payment is ON" : "Online payment is OFF"}
      </label>
      <Button
        variant="secondary"
        loading={loading}
        onClick={toggle}
        disabled={!enabled && !razorpayConfigured}
      >
        {enabled ? "Turn Off" : "Turn On"}
      </Button>
    </div>
  );
}
