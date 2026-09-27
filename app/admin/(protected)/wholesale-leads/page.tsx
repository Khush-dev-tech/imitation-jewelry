import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { prisma } from "@/lib/prisma";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};

export default async function AdminWholesaleLeadsPage() {
  const leads = await prisma.wholesaleLead.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl text-charcoal">Wholesale Leads</h1>

      {leads.length === 0 ? (
        <p className="font-body text-sm text-charcoal-muted">No wholesale leads yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-hairline bg-ivory">
          <table className="w-full text-left font-body text-sm">
            <thead className="border-b border-hairline text-charcoal-muted">
              <tr>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Business</th>
                <th className="p-3 font-medium">City</th>
                <th className="p-3 font-medium">Quantity</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="p-3 text-charcoal">
                    {lead.name}
                    <br />
                    <span className="text-charcoal-muted">{lead.phone}</span>
                  </td>
                  <td className="p-3 text-charcoal-muted">{lead.businessName}</td>
                  <td className="p-3 text-charcoal-muted">{lead.city}</td>
                  <td className="p-3 text-charcoal-muted">{lead.quantityRequirement}</td>
                  <td className="p-3">
                    <Badge variant={lead.status === "new" ? "new" : "outOfStock"}>
                      {STATUS_LABELS[lead.status] ?? lead.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-charcoal-muted">
                    {lead.createdAt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-3">
                    <Link
                      href={`/admin/wholesale-leads/${lead.id}`}
                      className="text-maroon hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
