"use client";
import { useRouter } from "next/navigation";

export default function LangToggle({ lang }: { lang: "ta" | "en" }) {
  const router = useRouter();
  const set = (l: "ta" | "en") => {
    document.cookie = `lang=${l}; path=/; max-age=31536000`;
    router.refresh();
  };
  return (
    <div className="asm-lang">
      <button onClick={() => set("ta")} className={lang === "ta" ? "on" : ""}>தமிழ்</button>
      <button onClick={() => set("en")} className={lang === "en" ? "on" : ""}>EN</button>
    </div>
  );
}
