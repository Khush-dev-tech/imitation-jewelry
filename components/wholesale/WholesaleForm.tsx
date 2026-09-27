"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { buildWholesaleEnquiryLink } from "@/lib/whatsapp";

interface FormState {
  name: string;
  phone: string;
  city: string;
  businessName: string;
  quantityRequirement: string;
  productInterest: string;
  preferredContactTime: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  phone: "",
  city: "",
  businessName: "",
  quantityRequirement: "",
  productInterest: "",
  preferredContactTime: "",
};

/**
 * Wholesale enquiry form — PRD §8.9. On submit: the lead is stored first
 * (durable regardless of what happens next), then a WhatsApp handoff is
 * opened with the same details pre-filled (App Flow Screen 10) — both
 * mechanisms exist so the lead is never lost even if the buyer closes
 * WhatsApp without sending.
 */
export function WholesaleForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function updateField(field: keyof FormState) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/wholesale-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(
          "Something went wrong submitting your enquiry. Please try again — your details haven't been lost.",
        );
        return;
      }

      setSubmitted(true);

      const whatsappUrl = buildWholesaleEnquiryLink({
        name: form.name,
        city: form.city,
        businessName: form.businessName,
        productInterest: form.productInterest,
        quantityRequirement: form.quantityRequirement,
        preferredContactTime: form.preferredContactTime || null,
      });
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      void fetch(`/api/wholesale-leads/${data.leadId}`, { method: "PATCH" });
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-md border border-hairline bg-beige p-6 text-center">
        <p className="font-heading text-lg text-charcoal">Enquiry received!</p>
        <p className="mt-2 font-body text-sm text-charcoal-muted">
          We&apos;ve noted your details and opened WhatsApp with them pre-filled — send that message
          for the fastest response, or our team will reach out directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Your Name" required value={form.name} onChange={updateField("name")} />
      <Input
        label="Phone Number"
        type="tel"
        required
        value={form.phone}
        onChange={updateField("phone")}
      />
      <Input label="City" required value={form.city} onChange={updateField("city")} />
      <Input
        label="Business Name"
        required
        value={form.businessName}
        onChange={updateField("businessName")}
      />
      <label className="flex flex-col gap-1.5">
        <span className="font-body text-sm font-medium text-charcoal">
          Products You&apos;re Interested In<span className="ml-0.5 text-error">*</span>
        </span>
        <textarea
          required
          rows={2}
          value={form.productInterest}
          onChange={updateField("productInterest")}
          className="min-h-11 rounded-md border border-hairline bg-ivory px-3.5 py-2.5 font-body text-base text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
        />
      </label>
      <Input
        label="Approximate Quantity Needed"
        required
        placeholder="e.g. 500 pieces, mixed styles"
        value={form.quantityRequirement}
        onChange={updateField("quantityRequirement")}
      />
      <Input
        label="Preferred Contact Time (optional)"
        value={form.preferredContactTime}
        onChange={updateField("preferredContactTime")}
      />

      {error ? (
        <p role="alert" className="flex items-center gap-1 font-body text-sm text-error">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      ) : null}

      <Button type="submit" variant="primary" loading={loading} className="w-full">
        Submit Enquiry
      </Button>
    </form>
  );
}
