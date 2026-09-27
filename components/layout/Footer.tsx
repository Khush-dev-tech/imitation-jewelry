import Link from "next/link";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { buildGeneralEnquiryLink } from "@/lib/whatsapp";

/**
 * Footer — UI/UX Brief §5.3: contact details, policy links, WhatsApp
 * link, on charcoal background with ivory text. No social-media links in
 * v1 (deferred feature, not approved scope). Contact details below are
 * the confirmed business details from the App Brief — not placeholders.
 */
export function Footer() {
  return (
    <footer className="mt-auto bg-charcoal text-ivory">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Logo className="h-11 w-auto" />
          <p className="mt-3 font-body text-sm text-ivory/70">
            Manufacturer of imitation jewellery, specializing in micro gold-plated jewellery.
          </p>
        </div>

        <div className="font-body text-sm text-ivory/90">
          <p className="font-semibold text-ivory">Contact</p>
          <ul className="mt-2 space-y-1.5">
            <li>
              <a href="tel:+918849999457" className="hover:underline">
                +91 88499 99457
              </a>
            </li>
            <li>
              <a href="mailto:harshsindhav9@gmail.com" className="hover:underline">
                harshsindhav9@gmail.com
              </a>
            </li>
            <li className="text-ivory/70">
              Satelite Chowk, Maruti Nagar Main Road,
              <br />
              Near Shree Atal Bihari Vajpayee Auditorium,
              <br />
              Rajkot - 360003, Gujarat, India
            </li>
            <li>
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

        <div className="font-body text-sm">
          <p className="font-semibold text-ivory">Policies</p>
          <ul className="mt-2 space-y-1.5 text-ivory/90">
            <li>
              <Link href="/policies/shipping" className="hover:underline">
                Shipping
              </Link>
            </li>
            <li>
              <Link href="/policies/returns" className="hover:underline">
                Returns
              </Link>
            </li>
            <li>
              <Link href="/policies/privacy" className="hover:underline">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/policies/terms" className="hover:underline">
                Terms
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-ivory/10 py-4">
        <Container>
          <p className="font-body text-xs text-ivory/60">
            © {new Date().getFullYear()} Maruti Imitation Jewelry. All rights reserved.
          </p>
        </Container>
      </div>
    </footer>
  );
}
