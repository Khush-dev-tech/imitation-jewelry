"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
] as const;

export function WholesaleLeadStatusControl({
  leadId,
  currentStatus,
}: {
  leadId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const dirty = status !== currentStatus;

  async function save() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/wholesale-leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        toast({ title: "Could not update lead status", variant: "error" });
        return;
      }
      toast({ title: "Lead status updated", variant: "success" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor="lead-status">
        Lead status
      </label>
      <select
        id="lead-status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-md border border-hairline bg-ivory px-3 py-2 font-body text-sm text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Button variant="secondary" loading={loading} disabled={!dirty} onClick={save}>
        Save
      </Button>
    </div>
  );
}
