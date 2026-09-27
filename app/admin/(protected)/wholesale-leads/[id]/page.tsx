import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WholesaleLeadStatusControl } from "@/components/admin/WholesaleLeadStatusControl";

interface AdminWholesaleLeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminWholesaleLeadDetailPage({
  params,
}: AdminWholesaleLeadDetailPageProps) {
  const { id } = await params;
  const lead = await prisma.wholesaleLead.findUnique({ where: { id } });

  if (!lead) {
    notFound();
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div>
        <Link
          href="/admin/wholesale-leads"
          className="font-body text-sm text-maroon hover:underline"
        >
          ← Back to Wholesale Leads
        </Link>
        <h1 className="mt-2 font-heading text-2xl text-charcoal">{lead.name}</h1>
        <p className="font-body text-sm text-charcoal-muted">
          Submitted {lead.createdAt.toLocaleString("en-IN")}
          {lead.whatsappDeepLinkOpened ? " · WhatsApp handoff opened" : ""}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-body text-sm font-medium text-charcoal">Lead Status</span>
        <WholesaleLeadStatusControl leadId={lead.id} currentStatus={lead.status} />
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-hairline bg-ivory p-4 font-body text-sm">
        <div>
          <span className="font-medium text-charcoal">Phone</span>
          <p className="text-charcoal-muted">{lead.phone}</p>
        </div>
        <div>
          <span className="font-medium text-charcoal">City</span>
          <p className="text-charcoal-muted">{lead.city}</p>
        </div>
        <div>
          <span className="font-medium text-charcoal">Business Name</span>
          <p className="text-charcoal-muted">{lead.businessName}</p>
        </div>
        <div>
          <span className="font-medium text-charcoal">Product Interest</span>
          <p className="whitespace-pre-line text-charcoal-muted">{lead.productInterest}</p>
        </div>
        <div>
          <span className="font-medium text-charcoal">Quantity Requirement</span>
          <p className="text-charcoal-muted">{lead.quantityRequirement}</p>
        </div>
        {lead.preferredContactTime ? (
          <div>
            <span className="font-medium text-charcoal">Preferred Contact Time</span>
            <p className="text-charcoal-muted">{lead.preferredContactTime}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
