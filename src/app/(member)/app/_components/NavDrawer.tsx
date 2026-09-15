"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Labels = {
  menu: string; home: string; attendance: string; activity: string;
  org: string; impersonate: string; logout: string; appName: string; lang_ta: string; lang_en: string;
  theme: string; theme_light: string; theme_dark: string;
};

export default function NavDrawer({
  lang, loggedIn, nav, isAdmin, userName, userRole, labels,
}: {
  lang: "ta" | "en";
  loggedIn: boolean;
  nav: boolean;
  isAdmin: boolean;
  userName?: string;
  userRole?: string;
  labels: Labels;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") setThemeState(attr);
    else setThemeState(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }, []);

  const setTheme = (t: "light" | "dark") => {
    document.documentElement.setAttribute("data-theme", t);
    document.cookie = `theme=${t}; path=/; max-age=31536000`;
    setThemeState(t);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const setLang = (l: "ta" | "en") => {
    document.cookie = `lang=${l}; path=/; max-age=31536000`;
    setOpen(false);
    router.refresh();
  };

  async function logout() {
    await fetch("/api/member/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/app/login";
  }

  return (
    <>
      <button className="asm-hamburger" aria-label={labels.menu} aria-expanded={open} onClick={() => setOpen(true)}>
        <span /><span /><span />
      </button>

      <div className={`asm-scrim ${open ? "open" : ""}`} onClick={close} aria-hidden={!open} />

      <aside className={`asm-sheet ${open ? "open" : ""}`} role="dialog" aria-modal="true" aria-label={labels.menu} aria-hidden={!open}>
        <div className="asm-sheet-head">
          <div className="asm-brand"><span className="asm-om" aria-hidden>ॐ</span><span className="t">{labels.appName}</span></div>
          <button className="asm-sheet-close" aria-label="close" onClick={close}>✕</button>
        </div>

        {loggedIn && userName && (
          <div className="asm-sheet-user">
            <div className="nm">{userName}</div>
            {userRole && <div className="role">{userRole}</div>}
          </div>
        )}

        {loggedIn && (
          <nav className="asm-sheet-nav">
            {nav && <Link href="/app" className="asm-navlink" onClick={close}><span className="ic" aria-hidden>🏠</span>{labels.home}</Link>}
            {nav && <Link href="/app/attendance" className="asm-navlink" onClick={close}><span className="ic" aria-hidden>📝</span>{labels.attendance}</Link>}
            <Link href="/app/org" className="asm-navlink" onClick={close}><span className="ic" aria-hidden>🗂️</span>{labels.org}</Link>
            <Link href="/app/activity" className="asm-navlink" onClick={close}><span className="ic" aria-hidden>🗒️</span>{labels.activity}</Link>
            {isAdmin && <Link href="/app/impersonate" className="asm-navlink" onClick={close}><span className="ic" aria-hidden>🧑‍🤝‍🧑</span>{labels.impersonate}</Link>}
          </nav>
        )}

        <div className="asm-sheet-section">
          <div className="asm-sheet-label">🌐 {labels.menu}</div>
          <div className="asm-lang-row">
            <button className={lang === "ta" ? "on" : ""} onClick={() => setLang("ta")}>{labels.lang_ta}</button>
            <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>{labels.lang_en}</button>
          </div>
        </div>

        <div className="asm-sheet-section">
          <div className="asm-sheet-label">🎨 {labels.theme}</div>
          <div className="asm-lang-row">
            <button className={theme === "light" ? "on" : ""} onClick={() => setTheme("light")}>{labels.theme_light}</button>
            <button className={theme === "dark" ? "on" : ""} onClick={() => setTheme("dark")}>{labels.theme_dark}</button>
          </div>
        </div>

        {loggedIn && (
          <div className="asm-sheet-foot">
            <button className="asm-btn ghost" onClick={logout}>{labels.logout}</button>
          </div>
        )}
      </aside>
    </>
  );
}
