import { Ornament } from "@/components/ui";

export default function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
  /** kept for backwards-compat; no longer rendered */
  breadcrumb?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-maroon">
      {/* warm glow + subtle mandala motif */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% -10%, rgba(217,130,43,0.55) 0, transparent 55%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full border border-gold/20"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 py-8 text-center sm:py-10 lg:px-8">
        <Ornament className="mb-3 text-gold-light/80" />
        <h1 className="text-3xl text-saffron-light sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-2.5 max-w-2xl text-sm text-cream/85 sm:text-base">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
