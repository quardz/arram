import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { Ornament } from "@/components/ui";

export default function Footer() {
  return (
    <footer className="relative bg-maroon text-cream/80">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <Ornament className="mb-12 text-gold/70" />

        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Image
              src="/logo.png"
              alt={site.name}
              width={64}
              height={64}
              className="h-14 w-auto"
            />
            <p className="mt-4 text-sm leading-relaxed text-cream/70">
              A team of volunteers inspired and trained by Pujya Swami Dayananda
              Saraswathi, working to reclaim and restore our Bharatheeya way of
              life.
            </p>
          </div>

          <div>
            <h3 className="font-heading text-base uppercase tracking-wide text-gold-light">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-saffron-light">About Us</Link></li>
              <li><Link href="/gallery" className="hover:text-saffron-light">Gallery</Link></li>
              <li><Link href="/news" className="hover:text-saffron-light">News &amp; Updates</Link></li>
              <li><Link href="/family-welfare-homam" className="hover:text-saffron-light">Homam Registration</Link></li>
              <li><Link href="/contact" className="hover:text-saffron-light">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-base uppercase tracking-wide text-gold-light">
              Our Activities
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/hindu-kudumbam" className="hover:text-saffron-light">Hindu Kudumbam</Link></li>
              <li><Link href="/family-welfare-homam" className="hover:text-saffron-light">Family Welfare Homam</Link></li>
              <li><Link href="/kovil-maiyam" className="hover:text-saffron-light">Kovil Maiyam</Link></li>
              <li><Link href="/voice-of-dharma" className="hover:text-saffron-light">Voice of Dharma</Link></li>
              <li><Link href="/volunteer" className="hover:text-saffron-light">Volunteer</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-base uppercase tracking-wide text-gold-light">
              Reach Us
            </h3>
            <address className="mt-4 space-y-3 text-sm not-italic text-cream/70">
              <p>{site.contact.address}</p>
              <p>
                <a href={`tel:${site.contact.phoneHref}`} className="hover:text-saffron-light">
                  {site.contact.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${site.contact.email}`} className="hover:text-saffron-light">
                  {site.contact.email}
                </a>
              </p>
            </address>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-cream/50 sm:flex-row lg:px-8">
          <p>
            Copyright © {new Date().getFullYear()} {site.shortName}. All rights
            reserved.
          </p>
          <p className="space-x-3">
            <Link href="/terms" className="hover:text-saffron-light">Terms &amp; Conditions</Link>
            <span>|</span>
            <Link href="/privacy" className="hover:text-saffron-light">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
