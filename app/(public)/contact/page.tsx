import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { prisma } from "@/lib/prisma";
import { buildGeneralEnquiryLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Reach Maruti Imitation Jewelry by phone, email, WhatsApp, or in person in Rajkot.",
};

// Contact details are admin-editable via site_settings (Backend Schema
// §4.17), so this must always read the live row, not a cached/static one.
export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await prisma.siteSetting.findFirst();

  const addressLines = [
    settings?.businessAddressLine1 ?? "Satelite Chowk, Maruti Nagar Main Road",
    settings?.businessAddressLine2 ?? "Near Shree Atal Bihari Vajpayee Auditorium",
    `${settings?.businessCity ?? "Rajkot"} - ${settings?.businessPincode ?? "360003"}, ${settings?.businessState ?? "Gujarat"}, India`,
  ];
  const fullAddress = addressLines.join(", ");
  const phone = settings?.whatsappNumber ?? "918849999457";
  const email = settings?.businessEmail ?? "harshsindhav9@gmail.com";

  // No API key needed — Google's plain address-search embed format.
  const mapEmbedSrc =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL ||
    `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`;

  return (
    <Container className="flex flex-col gap-10 py-8 lg:flex-row lg:gap-16">
      <div className="flex flex-1 flex-col gap-6">
        <div>
          <h1 className="font-heading text-3xl text-charcoal">Contact Us</h1>
          <p className="mt-2 font-body text-charcoal-muted">
            We&apos;re happy to help with product questions, orders, and wholesale enquiries.
          </p>
        </div>

        <ul className="flex flex-col gap-4 font-body text-charcoal">
          <li className="flex items-start gap-3">
            <Phone aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-maroon" />
            <a href={`tel:+${phone}`} className="hover:underline">
              +{phone.slice(0, 2)} {phone.slice(2, 7)} {phone.slice(7)}
            </a>
          </li>
          <li className="flex items-start gap-3">
            <Mail aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-maroon" />
            <a href={`mailto:${email}`} className="hover:underline">
              {email}
            </a>
          </li>
          <li className="flex items-start gap-3">
            <MapPin aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-maroon" />
            <span className="text-charcoal-muted">
              {addressLines[0]}
              <br />
              {addressLines[1]}
              <br />
              {addressLines[2]}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <WhatsAppIcon className="mt-0.5 h-5 w-5 shrink-0 text-whatsapp" />
            <a
              href={buildGeneralEnquiryLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-whatsapp hover:underline"
            >
              Chat on WhatsApp
            </a>
          </li>
        </ul>
      </div>

      <div className="flex-1">
        <div className="aspect-square w-full overflow-hidden rounded-md border border-hairline sm:aspect-video">
          <iframe
            title="Maruti Imitation Jewelry location"
            src={mapEmbedSrc}
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </Container>
  );
}
