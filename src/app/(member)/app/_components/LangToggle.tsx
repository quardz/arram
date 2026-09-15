"use client";
import { useRouter } from "next/navigation";

export default function LangToggle({ lang }: { lang: "ta" | "en" }) {
  const router = useRouter();
  const set = (l: "ta" | "en") => {
    document.cookie = `lang=${l}; path=/; max-age=31536000`;
    router.refresh();
  };
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-neutral-300 text-sm">
      <button onClick={() => set("ta")} className={`px-3 py-1 ${lang === "ta" ? "bg-neutral-900 text-white" : "bg-white"}`}>தமிழ்</button>
      <button onClick={() => set("en")} className={`px-3 py-1 ${lang === "en" ? "bg-neutral-900 text-white" : "bg-white"}`}>EN</button>
    </div>
  );
}
