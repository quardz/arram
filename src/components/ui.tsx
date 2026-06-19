import Image from "next/image";
import Link from "next/link";

/** Small uppercase label shown above a heading. */
export function Eyebrow({
  children,
  center,
  className = "",
}: {
  children: React.ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <span className={`eyebrow ${center ? "center" : ""} ${className}`}>
      {children}
    </span>
  );
}

/** Eyebrow + serif title block. */
export function SectionHeading({
  eyebrow,
  title,
  center,
  light,
  className = "",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  center?: boolean;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={`${center ? "text-center" : ""} ${className}`}>
      {eyebrow && <Eyebrow center={center}>{eyebrow}</Eyebrow>}
      <h2
        className={`mt-3 text-3xl sm:text-4xl ${
          light ? "!text-white" : ""
        }`}
      >
        {title}
      </h2>
    </div>
  );
}

/** Decorative gold divider with a lotus glyph. */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`ornament ${className}`}>
      <span className="text-lg leading-none">✺</span>
    </div>
  );
}

/** Temple-window arch image. */
export function ArchImage({
  src,
  alt,
  priority,
  sizes = "(max-width: 1024px) 100vw, 50vw",
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  return (
    <div className={`arch-soft relative shadow-xl ring-1 ring-gold/20 ${className}`}>
      <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
    </div>
  );
}

/** Animated-feel stat with a leading "+" style. */
export function Stat({
  value,
  label,
  light,
}: {
  value: string;
  label: string;
  light?: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className={`font-display text-4xl font-semibold sm:text-5xl ${
          light ? "text-saffron-light" : "text-saffron"
        }`}
      >
        {value}
      </div>
      <div
        className={`mt-1 text-xs font-semibold uppercase tracking-[0.18em] sm:text-sm ${
          light ? "text-cream/80" : "text-ink/70"
        }`}
      >
        {label}
      </div>
    </div>
  );
}

/** Pill button — filled or outline. */
export function Button({
  href,
  children,
  variant = "solid",
  external,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline" | "outlineLight" | "gold";
  external?: boolean;
  className?: string;
}) {
  const styles = {
    solid: "bg-maroon text-white hover:bg-maroon-600",
    gold: "bg-saffron text-white hover:bg-saffron-light hover:text-maroon",
    outline:
      "border border-maroon text-maroon hover:bg-maroon hover:text-white",
    outlineLight:
      "border border-white/70 text-white hover:bg-white hover:text-maroon",
  }[variant];
  const cls = `inline-flex items-center justify-center rounded-full px-7 py-3 text-sm font-semibold uppercase tracking-wider transition ${styles} ${className}`;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
