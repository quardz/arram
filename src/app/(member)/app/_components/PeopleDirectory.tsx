"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import ContactButtons from "./ContactButtons";

type P = { id: number; name: string; phone: string; source?: string | null };

export default function PeopleDirectory({ m }: { m: Record<string, string> }) {
  const [q, setQ] = useState("");
  const [people, setPeople] = useState<P[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (term: string, pg: number, append: boolean) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/member/people?q=${encodeURIComponent(term)}&page=${pg}`);
      const d = await r.json();
      if (d.ok) {
        setPeople((xs) => (append ? [...xs, ...d.people] : d.people));
        setHasMore(d.hasMore); setPage(pg);
      }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load("", 1, false); }, [load]);

  function onSearch(v: string) {
    setQ(v);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => load(v, 1, false), 300);
  }

  return (
    <div>
      <div className="asm-search">
        <span className="mag" aria-hidden>🔍</span>
        <input className="asm-input" value={q} onChange={(e) => onSearch(e.target.value)} placeholder={m.ppl_search_ph} />
      </div>
      {loading && people.length === 0 ? (
        <p className="asm-note">{m.att_loading || "…"}</p>
      ) : people.length === 0 ? (
        <div className="asm-empty"><div className="big">🧑‍🤝‍🧑</div>{q ? m.ppl_none : m.ppl_hint}</div>
      ) : (
        <>
          <ul className="asm-people">
            {people.map((p) => (
              <li key={p.id} className="asm-person">
                <span className="asm-avatar">{p.name[0]}</span>
                <span className="asm-pnm">
                  <b>{p.name}{p.source === "join-form" && <span className="asm-badge web" style={{ marginLeft: 6 }}>{m.ppl_web || "Web"}</span>}</b>
                  <small>{p.phone}</small>
                </span>
                <ContactButtons phone={p.phone} m={m} />
              </li>
            ))}
          </ul>
          {hasMore ? (
            <button className="asm-btn ghost" style={{ marginTop: 16 }} disabled={loading} onClick={() => load(q, page + 1, true)}>{m.ppl_more}</button>
          ) : null}
        </>
      )}
    </div>
  );
}
