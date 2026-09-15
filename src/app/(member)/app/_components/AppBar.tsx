import Link from "next/link";
import LangToggle from "./LangToggle";

type Props = {
  lang: "ta" | "en";
  title?: string;        // brand text (when no back link)
  backHref?: string;     // if set, show a back arrow + backLabel instead of brand
  backLabel?: string;
};

export default function AppBar({ lang, title, backHref, backLabel }: Props) {
  return (
    <header className="asm-appbar">
      {backHref ? (
        <Link href={backHref} className="asm-back">
          <span className="arw" aria-hidden>←</span>
          <span className="t">{backLabel}</span>
        </Link>
      ) : (
        <div className="asm-brand">
          <span className="asm-om" aria-hidden>ॐ</span>
          <span className="t">{title}</span>
        </div>
      )}
      <LangToggle lang={lang} />
    </header>
  );
}
