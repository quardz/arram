import Link from "next/link";
import Image from "next/image";
import { activities, stats } from "@/content/activities";
import { news } from "@/content/news";
import { site } from "@/content/site";
import { Eyebrow, SectionHeading, Ornament, ArchImage, Stat, Button } from "@/components/ui";
import HeroCarousel from "@/components/HeroCarousel";

const heroSlides = [
  { src: "/images/home/Main-Page-Slider-4.jpg", alt: "Temple festival celebration" },
  { src: "/images/home/eve-learning-scaled.jpg", alt: "Community learning programme" },
  { src: "/images/home/IMG_4067-1-scaled.jpg", alt: "Volunteers serving the community" },
  { src: "/images/home/20221003_065607-scaled.jpg", alt: "Temple programme" },
  { src: "/images/home/20211027_155930-scaled.jpg", alt: "Cultural gathering" },
  { src: "/images/home/IMG_1975-scaled.jpg", alt: "Devotees at a programme" },
];

export default function HomePage() {
  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <HeroCarousel slides={heroSlides}>
        <div className="max-w-2xl text-white">
          <Eyebrow className="!text-gold-light">Aram Valartha Naayaki Sevai Maiyam</Eyebrow>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            Protecting our culture, restoring our way of life
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/90">
            {site.tagline}
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Button href={site.donateUrl} external variant="gold">
              Donate Now
            </Button>
            <Link href="/join" className="cta-animated">
              Join
            </Link>
            <Button href="/volunteer" variant="outlineLight">
              Become a Volunteer
            </Button>
          </div>
        </div>
      </HeroCarousel>

      {/* ---------------- Welcome / About ---------------- */}
      <section className="overflow-hidden py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 lg:grid-cols-2 lg:px-8">
          <div className="relative">
            <ArchImage
              src="/images/home/eve-learning-scaled.jpg"
              alt="Volunteers serving the community"
              className="mx-auto aspect-[3/4] w-72 sm:w-80"
              sizes="320px"
            />
            <div className="absolute -bottom-6 -right-2 hidden w-44 overflow-hidden rounded-2xl border-4 border-cream shadow-xl sm:block lg:right-8">
              <Image
                src="/images/home/IMG_4067-1-scaled.jpg"
                alt="Community programme"
                width={300}
                height={220}
                className="h-32 w-full object-cover"
              />
            </div>
            <div className="absolute -left-4 top-6 hidden rounded-2xl bg-maroon px-6 py-4 text-center text-white shadow-lg lg:block">
              <div className="font-display text-3xl text-saffron-light">25+</div>
              <div className="text-[11px] uppercase tracking-wider text-cream/80">
                Years of Seva
              </div>
            </div>
          </div>

          <div>
            <SectionHeading eyebrow="Who We Are" title="A team of volunteers serving Dharma" />
            <p className="mt-6 leading-relaxed text-ink/80">
              We are a team of volunteers who are inspired, motivated and trained
              by Pujya Swami Dayananda Saraswathi. We work to reclaim and restore
              our Bharatheeya way of life by enlightening Bharatvasis to practise
              our customs, rituals and festivals.
            </p>
            <p className="mt-4 leading-relaxed text-ink/80">
              Aram Valartha Naayaki Sevai Maiyam (ASM) is a non-profit charitable
              trust established in Chennai, with the mission of the upliftment of
              communities across the city.
            </p>
            <blockquote className="mt-7 border-l-4 border-saffron bg-sand/60 px-6 py-4 font-display text-xl italic text-maroon">
              “Sarvam Khalvidam Brahma — the entire Universe is pervaded by
              Divinity.”
            </blockquote>
            <div className="mt-8">
              <Button href="/about">Read More</Button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Stats band ---------------- */}
      <section className="relative isolate overflow-hidden bg-maroon py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 120%, rgba(217,130,43,0.5) 0, transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
            {stats.map((s) => (
              <Stat key={s.label} value={`${s.value}+`} label={s.label} light />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Activities ---------------- */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <SectionHeading center eyebrow="What We Do" title="Our Sacred Work" />
            <Ornament className="mt-5" />
            <p className="mt-5 text-ink/70">
              Through temples and communities across Chennai, we revive the
              customs, rituals and festivals that sustain our way of life.
            </p>
          </div>

          <div className="mt-14 grid gap-9 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gold/15 transition hover:-translate-y-1.5 hover:shadow-2xl"
              >
                <div className="relative aspect-[16/11] overflow-hidden">
                  <Image
                    src={a.image}
                    alt={a.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon/40 to-transparent opacity-0 transition group-hover:opacity-100" />
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="font-display text-2xl text-maroon">{a.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/70">
                    {a.blurb}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-saffron">
                    Know More
                    <span className="transition group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Scripture quote band ---------------- */}
      <section className="relative isolate overflow-hidden bg-sand py-20">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
          <span className="font-display text-5xl text-gold">❝</span>
          <p className="mt-2 font-display text-2xl leading-relaxed text-maroon sm:text-3xl">
            Reclaiming and restoring our Bharatheeya way of life by enlightening
            Bharatvasis to practise customs, rituals and festivals.
          </p>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-saffron">
            — Our Mission
          </p>
        </div>
      </section>

      {/* ---------------- Get involved / donation cards ---------------- */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <SectionHeading center eyebrow="Get Involved" title="How Can You Participate?" />
            <p className="mt-5 text-ink/70">
              We need hands to work on our projects, people with expertise to guide
              us, and funds to carry out our work.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Volunteer",
                text: "Give your time and skills at zonal, ward or area level — in the field, virtually, or through content preparation.",
                href: "/volunteer",
                cta: "Join Us",
                external: false,
              },
              {
                title: "Corporate (CSR)",
                text: "Partner with a non-profit trust deeply connected with the communities of Chennai for your CSR initiatives.",
                href: "/csr",
                cta: "Partner With Us",
                external: false,
              },
              {
                title: "Donate",
                text: "Support our temples, homams and community programs. Every contribution helps us reach more families.",
                href: site.donateUrl,
                cta: "Donate Now",
                external: true,
              },
            ].map((c) => (
              <div
                key={c.title}
                className="flex flex-col items-center rounded-3xl border border-gold/20 bg-white p-9 text-center shadow-sm transition hover:shadow-xl"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-maroon text-2xl text-saffron-light">
                  ✺
                </div>
                <h3 className="mt-5 font-display text-2xl text-maroon">{c.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/70">
                  {c.text}
                </p>
                <div className="mt-6">
                  <Button href={c.href} external={c.external} variant={c.title === "Donate" ? "gold" : "solid"}>
                    {c.cta}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- News teaser ---------------- */}
      {news.length > 0 && (
        <section className="bg-sand/60 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading eyebrow="From Our Community" title="News & Updates" />
              <Button href="/news" variant="outline">
                All News
              </Button>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((item) => (
                <Link
                  key={item.slug}
                  href={`/news/${item.slug}`}
                  className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gold/15 transition hover:-translate-y-1.5 hover:shadow-2xl"
                >
                  {item.image && (
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition duration-700 group-hover:scale-110"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-7">
                    <p className="text-xs font-semibold uppercase tracking-wider text-saffron">
                      {new Date(item.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <h3 className="mt-2 font-display text-xl text-maroon group-hover:underline">
                      {item.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/70">
                      {item.excerpt}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-saffron">
                      Read More <span className="transition group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
