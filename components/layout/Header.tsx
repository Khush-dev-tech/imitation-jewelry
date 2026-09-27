import Link from "next/link";
import { Search, ShoppingBag, User } from "lucide-react";
import { Container } from "./Container";
import { MobileMenu } from "./MobileMenu";
import { CartBadge } from "./CartBadge";
import { Logo } from "./Logo";

/**
 * Header — UI/UX Brief §5.3. Desktop: logo, primary category nav, search,
 * account, cart. Mobile: logo, search, cart, hamburger (full category nav
 * moves into the mobile menu). Cart is fully live (state + page).
 * Wholesale/About/Contact and Account (login/register, PRD §8.11 — not
 * yet built; checkout is guest-only for now) still link to routes built
 * in later phases — the icons/links point at their future routes now
 * rather than doing nothing, which is normal mid-build, not invented
 * content.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-hairline bg-ivory">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="shrink-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
        >
          <Logo className="h-10 w-auto sm:h-11" />
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-6 lg:flex">
          <Link
            href="/shop"
            className="font-body text-sm font-medium text-charcoal hover:text-maroon"
          >
            Shop
          </Link>
          <Link
            href="/wholesale"
            className="font-body text-sm font-medium text-charcoal hover:text-maroon"
          >
            Wholesale
          </Link>
          <Link
            href="/about"
            className="font-body text-sm font-medium text-charcoal hover:text-maroon"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="font-body text-sm font-medium text-charcoal hover:text-maroon"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/search"
            aria-label="Search"
            className="flex h-11 w-11 items-center justify-center rounded-md text-charcoal hover:bg-beige focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
          >
            <Search aria-hidden="true" className="h-5 w-5" />
          </Link>
          <Link
            href="/account/login"
            aria-label="Account"
            className="hidden h-11 w-11 items-center justify-center rounded-md text-charcoal hover:bg-beige focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal lg:flex"
          >
            <User aria-hidden="true" className="h-5 w-5" />
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex h-11 w-11 items-center justify-center rounded-md text-charcoal hover:bg-beige focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
          >
            <ShoppingBag aria-hidden="true" className="h-5 w-5" />
            <CartBadge />
          </Link>
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
