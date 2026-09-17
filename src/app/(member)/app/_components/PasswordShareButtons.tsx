"use client";

/** Admin-only: share a member's login (phone + derived password) via SMS or
 *  WhatsApp with a prefilled message. Shown under members in the org chart. */
export default function PasswordShareButtons({ phone, name, password, m }: { phone: string; name: string; password: string; m: Record<string, string> }) {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits || !password) return null;
  const wa = digits.length === 10 ? "91" + digits : digits;
  const who = name && name !== "multiple" ? name : "";

  const msg =
    `${who} Ji, வணக்கம்\n\n` +
    `Your login : ${digits}\n` +
    `your password: ${password}\n\n` +
    `Login link : https://www.arram.org.in/app/login\n\n` +
    `அறம் வளர்த்த நாயகி சேவை மையம்\n` +
    `நன்றி.`;
  const enc = encodeURIComponent(msg);
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <span className="asm-pwshare" onClick={stop}>
      <a className="asm-pwbtn sms" href={`sms:+91${digits}?body=${enc}`} aria-label={m.pw_send_sms} title={m.pw_send_sms}>
        <span aria-hidden>✉️</span>
      </a>
      <a className="asm-pwbtn wa" href={`https://wa.me/${wa}?text=${enc}`} target="_blank" rel="noopener noreferrer" aria-label={m.pw_send_wa} title={m.pw_send_wa}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff" aria-hidden><path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2zm5.8 14.09c-.24.68-1.4 1.3-1.94 1.35-.5.05-1.13.07-1.82-.11-.42-.11-.96-.29-1.65-.58-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.19-1.58-1.19-3.02 0-1.43.75-2.14 1.02-2.43.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2.01.89 2.16.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.56.16.27.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.27.14.43.12.59-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.61-.13.25.09 1.6.75 1.87.89.27.14.45.2.52.31.07.12.07.66-.17 1.34z"/></svg>
      </a>
    </span>
  );
}
