"use client";
import { useMemo, useState } from "react";

// Per-district attendance stats for one campaign, within the viewer's area.
export type DistrictStat = { districtId: number; name: string; sessionId: number; eligible: number; checked: number; started: boolean };
type Node = { id: number; name: string; nameTamil: string | null; level: string; parentId: number | null };

type Props = {
  stats: DistrictStat[];
  nodes: Node[];
  startNodeId: number | null;   // where drill-down begins (viewer's own node)
  heldNodeIds: number[];        // nodes the viewer holds → can open the session
  admin: boolean;
  lang: "ta" | "en";
  m: Record<string, string>;
};

type Group = {
  nodeId: number; name: string; level: string;
  eligible: number; checked: number; districts: number; started: number;
  isDistrict: boolean; sessionId?: number; districtIds: number[];
};

// A compact SVG donut showing overall completion %.
function Donut({ pct, label, sub }: { pct: number; label: string; sub: string }) {
  const r = 34, c = 2 * Math.PI * r, dash = (Math.min(100, Math.max(0, pct)) / 100) * c;
  return (
    <div className="cc-donut">
      <svg viewBox="0 0 84 84" width="84" height="84" aria-hidden>
        <circle cx="42" cy="42" r={r} fill="none" stroke="var(--asm-line)" strokeWidth="10" />
        <circle cx="42" cy="42" r={r} fill="none" stroke="var(--asm-ok)" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`} transform="rotate(-90 42 42)" />
        <text x="42" y="46" textAnchor="middle" className="cc-donut-pct">{pct}%</text>
      </svg>
      <div className="cc-donut-meta"><b>{label}</b><small>{sub}</small></div>
    </div>
  );
}

export default function CampaignCharts({ stats, nodes, startNodeId, heldNodeIds, admin, lang, m }: Props) {
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const childrenBy = useMemo(() => {
    const map = new Map<number | null, Node[]>();
    for (const n of nodes) { const k = n.parentId; if (!map.has(k)) map.set(k, []); map.get(k)!.push(n); }
    return map;
  }, [nodes]);
  const held = useMemo(() => new Set(heldNodeIds), [heldNodeIds]);
  const nodeLabel = (n: Node) => (lang === "ta" && n.nameTamil ? n.nameTamil : n.name);

  // For each node, the set of district ids (present in stats) beneath it —
  // built by walking each district up its parent chain.
  const districtsUnder = useMemo(() => {
    const map = new Map<number, Set<number>>();
    for (const s of stats) {
      let cur: number | null = s.districtId;
      const seen = new Set<number>();
      while (cur != null && !seen.has(cur)) {
        seen.add(cur);
        if (!map.has(cur)) map.set(cur, new Set());
        map.get(cur)!.add(s.districtId);
        cur = byId.get(cur)?.parentId ?? null;
      }
    }
    return map;
  }, [stats, byId]);

  const statByDistrict = useMemo(() => new Map(stats.map((s) => [s.districtId, s])), [stats]);

  // Deepest ancestor that still contains ALL districts in the area — so drill
  // starts somewhere meaningful even if startNodeId is broad (e.g. state).
  const rootId = useMemo(() => {
    if (startNodeId != null && districtsUnder.has(startNodeId)) return startNodeId;
    // else the shallowest node covering everything: pick the node with the most districts
    let best: number | null = null, bestN = -1;
    for (const [id, set] of districtsUnder) { if (set.size > bestN) { best = id; bestN = set.size; } }
    return best;
  }, [startNodeId, districtsUnder]);

  const [focusId, setFocusId] = useState<number | null>(rootId);
  const focus = focusId != null ? byId.get(focusId) ?? null : null;

  // Breadcrumb path from rootId down to focus.
  const path = useMemo(() => {
    const out: Node[] = [];
    let c = focus;
    while (c) { out.unshift(c); if (c.id === rootId) break; c = c.parentId != null ? byId.get(c.parentId) ?? null : null; }
    return out;
  }, [focus, rootId, byId]);

  const sumOf = (districtIds: Iterable<number>) => {
    let eligible = 0, checked = 0, districts = 0, started = 0;
    for (const d of districtIds) {
      const s = statByDistrict.get(d); if (!s) continue;
      eligible += s.eligible; checked += s.checked; districts++; if (s.started) started++;
    }
    return { eligible, checked, districts, started };
  };

  const overall = useMemo(() => {
    const set = focusId != null ? districtsUnder.get(focusId) : undefined;
    return sumOf(set ?? statByDistrict.keys());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId, districtsUnder, statByDistrict]);

  // Child groups shown as bars for the current focus.
  const groups = useMemo<Group[]>(() => {
    if (focusId == null) return [];
    const focusNode = byId.get(focusId);
    // If focus is a district, it is a leaf — show just itself.
    if (focusNode && focusNode.level === "district") {
      const s = statByDistrict.get(focusId);
      if (!s) return [];
      return [{ nodeId: focusId, name: nodeLabel(focusNode), level: "district", eligible: s.eligible, checked: s.checked, districts: 1, started: s.started ? 1 : 0, isDistrict: true, sessionId: s.sessionId, districtIds: [focusId] }];
    }
    const kids = (childrenBy.get(focusId) || []).filter((k) => districtsUnder.has(k.id) && districtsUnder.get(k.id)!.size > 0);
    const built = kids.map((k) => {
      const set = districtsUnder.get(k.id)!;
      const agg = sumOf(set);
      const isDistrict = k.level === "district";
      const s = isDistrict ? statByDistrict.get(k.id) : undefined;
      return { nodeId: k.id, name: nodeLabel(k), level: k.level, ...agg, isDistrict, sessionId: s?.sessionId, districtIds: [...set] } as Group;
    });
    return built.sort((a, b) => {
      const pa = a.eligible ? a.checked / a.eligible : 0, pb = b.eligible ? b.checked / b.eligible : 0;
      return pb - pa || a.name.localeCompare(b.name);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId, childrenBy, districtsUnder, statByDistrict, byId, lang]);

  const pct = (c: number, e: number) => (e ? Math.round((c / e) * 100) : 0);
  const openable = (g: Group) => g.isDistrict && g.sessionId != null && (admin || held.has(g.nodeId));

  function onBar(g: Group) {
    if (g.isDistrict) {
      if (openable(g)) window.location.href = `/app/attendance/${g.sessionId}`;
      return; // leaf, nothing to drill
    }
    setFocusId(g.nodeId);
  }

  return (
    <div className="cc">
      <Donut pct={pct(overall.checked, overall.eligible)} label={m.cst_overall || "Overall"}
        sub={`✓ ${overall.checked} / ${overall.eligible}`} />

      <div className="cc-crumbs">
        {path.map((n, i) => (
          <span key={n.id} className="cc-crumbwrap">
            {i > 0 ? <span className="cc-sep">›</span> : null}
            <button className={`cc-crumb ${i === path.length - 1 ? "on" : ""}`} onClick={() => setFocusId(n.id)}>{nodeLabel(n)}</button>
          </span>
        ))}
      </div>

      <div className="cc-bars">
        {groups.map((g) => {
          const p = pct(g.checked, g.eligible);
          const clickable = !g.isDistrict || openable(g);
          return (
            <button key={g.nodeId} className={`cc-bar ${clickable ? "" : "static"}`} onClick={() => onBar(g)} disabled={!clickable}>
              <span className="cc-bar-top">
                <span className="cc-bar-name">{g.name}</span>
                <span className="cc-bar-val">✓ {g.checked}/{g.eligible} · {p}%</span>
              </span>
              <span className="cc-track"><span className="cc-fill" style={{ width: `${Math.max(2, p)}%` }} /></span>
              <span className="cc-bar-sub">
                {g.isDistrict
                  ? <span className={`cc-dot ${g.started ? "open" : "closed"}`}>{g.started ? (m.att_status_open || "Open") : (m.att_status_closed || "Closed")}</span>
                  : `${g.started}/${g.districts} ${m.att_stat_districts || "districts open"}`}
                {clickable ? <span className="cc-go" aria-hidden>{g.isDistrict ? "›" : "⤵"}</span> : null}
              </span>
            </button>
          );
        })}
        {groups.length === 0 && <p className="asm-note">{m.att_none_found || "—"}</p>}
      </div>
      {groups.some((g) => !g.isDistrict) ? <p className="cc-hint">{m.cst_tap_drill}</p> : null}
    </div>
  );
}
