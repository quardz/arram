"use client";

/** Call + WhatsApp quick actions for a phone number (India, +91). */
export default function ContactButtons({ phone, m }: { phone: string; m: Record<string, string> }) {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return null;
  const wa = digits.length === 10 ? "91" + digits : digits;
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <span className="asm-contact">
      <a className="asm-call" href={`tel:${digits}`} aria-label={m.contact_call} title={m.contact_call} onClick={stop}>
        <span aria-hidden>📞</span>
      </a>
      <a className="asm-wa" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" aria-label={m.contact_whatsapp} title={m.contact_whatsapp} onClick={stop}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff" aria-hidden><path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38a9.9 9.9 0 0 0 4.74 1.2h.01c5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2zm5.8 14.09c-.24.68-1.4 1.3-1.94 1.35-.5.05-1.13.07-1.82-.11-.42-.11-.96-.29-1.65-.58-2.9-1.25-4.8-4.17-4.94-4.36-.15-.19-1.19-1.58-1.19-3.02 0-1.43.75-2.14 1.02-2.43.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.66.5.24.58.82 2.01.89 2.16.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.56.16.27.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.21 1.37.27.14.43.12.59-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.61-.13.25.09 1.6.75 1.87.89.27.14.45.2.52.31.07.12.07.66-.17 1.34z"/></svg>
      </a>
    </span>
  );
}
