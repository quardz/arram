"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { nav, site } from "@/content/site";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50">
      {/* Main bar */}
      <div className="border-b border-gold/20 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt={site.name} width={64} height={64} priority className="h-14 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex">
            {nav.map((item) =>
              item.children ? (
                <div key={item.label} className="group relative">
                  <button className="flex items-center gap-1 px-3 py-2 text-[13px] font-semibold uppercase tracking-wide text-ink/80 transition hover:text-maroon">
                    {item.label}
                    <span className="text-[10px]">▾</span>
                  </button>
                  <div className="invisible absolute left-0 top-full w-60 translate-y-1 rounded-b-lg border border-gold/20 bg-cream py-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {item.children.map((c) =>
                      c.external ? (
                        <a
                          key={c.href}
                          href={c.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-2 text-sm font-semibold text-saffron transition hover:bg-sand hover:text-maroon"
                        >
                          {c.label}
                        </a>
                      ) : (
                        <Link
                          key={c.href}
                          href={c.href}
                          className="block px-4 py-2 text-sm text-ink/80 transition hover:bg-sand hover:text-maroon"
                        >
                          {c.label}
                        </Link>
                      ),
                    )}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href!}
                  className="px-3 py-2 text-[13px] font-semibold uppercase tracking-wide text-ink/80 transition hover:text-maroon"
                >
                  {item.label}
                </Link>
              ),
            )}
            <Link href="/join" className="cta-animated cta-sm ml-2">
              Join
            </Link>
          </nav>

          {/* Mobile actions: compact Join + toggle */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <Link href="/join" className="cta-animated cta-xs">
              Join
            </Link>
            <button
              aria-label="Toggle menu"
              className="rounded-md p-2 text-maroon"
              onClick={() => setOpen((v) => !v)}
            >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              )}
            </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="border-b border-gold/20 bg-cream lg:hidden">
          <div className="space-y-1 px-4 py-3">
            {nav.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <button
                    className="flex w-full items-center justify-between py-2 text-sm font-semibold uppercase tracking-wide text-ink/80"
                    onClick={() => setOpenGroup((g) => (g === item.label ? null : item.label))}
                  >
                    {item.label}
                    <span className="text-xs">{openGroup === item.label ? "−" : "+"}</span>
                  </button>
                  {openGroup === item.label && (
                    <div className="ml-3 border-l border-gold/30 pl-3">
                      {item.children.map((c) =>
                        c.external ? (
                          <a
                            key={c.href}
                            href={c.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setOpen(false)}
                            className="block py-2 text-sm font-semibold text-saffron hover:text-maroon"
                          >
                            {c.label}
                          </a>
                        ) : (
                          <Link
                            key={c.href}
                            href={c.href}
                            onClick={() => setOpen(false)}
                            className="block py-2 text-sm text-ink/70 hover:text-maroon"
                          >
                            {c.label}
                          </Link>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href!}
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm font-semibold uppercase tracking-wide text-ink/80 hover:text-maroon"
                >
                  {item.label}
                </Link>
              ),
            )}
            <Link
              href="/join"
              onClick={() => setOpen(false)}
              className="cta-animated mt-3 w-full"
            >
              Join
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
