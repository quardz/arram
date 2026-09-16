import Link from "next/link";
import { tr } from "@/lib/i18n";
import NavDrawer from "./NavDrawer";

type Props = {
  lang: "ta" | "en";
  title?: string;
  backHref?: string;
  backLabel?: string;
  loggedIn?: boolean;
  nav?: boolean;
  isAdmin?: boolean;
  userName?: string;
  userRole?: string;
};

export default function AppBar({ lang, title, backHref, backLabel, loggedIn, nav, isAdmin, userName, userRole }: Props) {
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
      <NavDrawer
        lang={lang}
        loggedIn={!!loggedIn}
        nav={!!nav}
        isAdmin={!!isAdmin}
        userName={userName}
        userRole={userRole}
        labels={{
          menu: tr(lang, "menu_title"),
          home: tr(lang, "nav_home"),
          attendance: tr(lang, "home_attendance"),
          org: tr(lang, "nav_org"),
          people: tr(lang, "nav_people"),
          profile: tr(lang, "nav_profile"),
          activity: tr(lang, "act_title"),
          impersonate: tr(lang, "nav_impersonate"),
          logout: tr(lang, "home_logout"),
          appName: tr(lang, "appName"),
          lang_ta: "தமிழ்",
          lang_en: "EN",
          theme: tr(lang, "theme_label"),
          theme_light: tr(lang, "theme_light"),
          theme_dark: tr(lang, "theme_dark"),
        }}
      />
    </header>
  );
}
