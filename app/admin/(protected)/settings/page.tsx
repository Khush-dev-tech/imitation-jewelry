import { prisma } from "@/lib/prisma";
import { isRazorpayConfigured } from "@/lib/payments/razorpay";
import { PaymentToggle } from "@/components/admin/PaymentToggle";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findFirst();
  const razorpayConfigured = isRazorpayConfigured();

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="font-heading text-2xl text-charcoal">Settings</h1>

      <div className="flex flex-col gap-4 rounded-md border border-hairline bg-ivory p-5">
        <div>
          <h2 className="font-heading text-lg text-charcoal">Online Payment</h2>
          <p className="mt-1 font-body text-sm text-charcoal-muted">
            When off, checkout places orders as <strong>Pending Confirmation</strong> and your team
            follows up manually (PRD §8.6 soft-launch mode). When on, customers pay online through
            Razorpay at checkout.
          </p>
        </div>

        {!razorpayConfigured ? (
          <p className="rounded-md border border-hairline bg-beige p-3 font-body text-sm text-charcoal">
            Razorpay credentials aren&apos;t set up yet — online payment can&apos;t be turned on
            until <code>RAZORPAY_KEY_ID</code>/<code>RAZORPAY_KEY_SECRET</code> are added to the
            environment.
          </p>
        ) : null}

        <PaymentToggle
          initialEnabled={settings?.paymentGatewayEnabled ?? false}
          razorpayConfigured={razorpayConfigured}
        />
      </div>
    </div>
  );
}
