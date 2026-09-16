"use client";
import { useEffect, useMemo, useState } from "react";
import { ROLE_VALUES, defaultRoleForLevel } from "@/lib/org";
import ContactButtons from "./ContactButtons";

type Node = { id: number; name: string; nameTamil: string | null; level: string; parentId: number | null };
type Asg = { id: number; nodeId: number; personId: number; name: string; phone: string; role: string; fullTime?: boolean };
type Props = {
  nodes: Node[]; assignments: Asg[]; isAdmin: boolean;
  lang: "ta" | "en"; roleLabels: Record<string, string>; m: Record<string, string>;
};

export default function OrgChart({ nodes, assignments, isAdmin, lang, roleLabels, m }: Props) {
  const [asg, setAsg] = useState<Asg[]>(assignments);
  const [edit, setEdit] = useState(false);

  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const childrenBy = useMemo(() => {
    const map = new Map<number | null, Node[]>();
    for (const n of nodes) { const k = n.parentId; if (!map.has(k)) map.set(k, []); map.get(k)!.push(n); }
    return map;
  }, [nodes]);
  const roots = childrenBy.get(null) || nodes.filter((n) => !n.parentId);
  const [currentId, setCurrentId] = useState<number | null>(roots.length === 1 ? roots[0].id : null);

  // URL hash = current unit, so the phone back button walks up the tree.
  useEffect(() => {
    const apply = () => {
      const h = window.location.hash.replace("#", "");
      const id = h ? Number(h) : NaN;
      setCurrentId(h && byId.has(id) ? id : (roots.length === 1 ? roots[0].id : null));
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byId]);
  const go = (id: number | null) => { window.location.hash = id != null ? String(id) : ""; };

  const nodeLabel = (n: Node) => (lang === "ta" && n.nameTamil ? n.nameTamil : n.name);
  const nodeAlt = (n: Node) => (lang === "ta" ? n.name : n.nameTamil || "");
  const peopleAt = (id: number) => asg.filter((a) => a.nodeId === id);
  const scope = (lvl: string) => m[`role_scope_${lvl}`] || lvl;

  const current = currentId != null ? byId.get(currentId) || null : null;
  const kids = childrenBy.get(currentId ?? null) || [];

  const path: Node[] = [];
  { let c = current; while (c) { path.unshift(c); c = c.parentId != null ? byId.get(c.parentId) || null : null; } }

  // ---- editor sheet ----
  const [sheetNode, setSheetNode] = useState<Node | null>(null);
  const [busy, setBusy] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addRole, setAddRole] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [eName, setEName] = useState("");
  const [ePhone, setEPhone] = useState("");
  const [eFullTime, setEFullTime] = useState(false);

  function openSheet(n: Node) { setSheetNode(n); setAddName(""); setAddPhone(""); setAddRole(defaultRoleForLevel(n.level)); setEditId(null); }

  async function doAdd() {
    if (!sheetNode || !addName.trim() || !/^[6-9]\d{9}$/.test(addPhone)) return;
    setBusy(true);
    try {
      const r = await fetch("/api/member/org/assign", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId: sheetNode.id, name: addName, phone: addPhone, role: addRole }) });
      const d = await r.json();
      if (r.ok && d.ok) { setAsg((xs) => [...xs.filter((x) => x.id !== d.assignment.id), d.assignment]); setAddName(""); setAddPhone(""); }
    } finally { setBusy(false); }
  }
  async function doRemove(a: Asg) {
    setBusy(true);
    try {
      const r = await fetch("/api/member/org/unassign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assignmentId: a.id }) });
      const d = await r.json();
      if (r.ok && d.ok) setAsg((xs) => xs.filter((x) => x.id !== a.id));
    } finally { setBusy(false); }
  }
  function startEdit(a: Asg) { setEditId(a.id); setEName(a.name); setEPhone(a.phone); setEFullTime(!!a.fullTime); }
  async function doSaveEdit(a: Asg) {
    if (!eName.trim() || !/^[6-9]\d{9}$/.test(ePhone)) return;
    setBusy(true);
    try {
      const r = await fetch("/api/member/org/person", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId: a.personId, name: eName, phone: ePhone, fullTime: eFullTime }) });
      const d = await r.json();
      if (r.ok && d.ok) { setAsg((xs) => xs.map((x) => x.personId === a.personId ? { ...x, name: eName, phone: ePhone, fullTime: eFullTime } : x)); setEditId(null); }
      else if (d.error === "phone_taken") alert(m.org_phone_taken || "Phone already in use");
    } finally { setBusy(false); }
  }
  const sheetPeople = sheetNode ? peopleAt(sheetNode.id) : [];

  return (
    <main className="asm-main org2">
      <div className="org2-bar">
        <div className="org2-title">{m.org_title}</div>
        {isAdmin ? <button className={`org-editbtn ${edit ? "on" : ""}`} onClick={() => setEdit((e) => !e)}>{edit ? m.org_done : m.org_edit}</button> : null}
      </div>

      <div className="org2-crumbs">
        {roots.length > 1 && (
          <button className={`org2-crumb ${current == null ? "on" : ""}`} onClick={() => go(null)}>{m.org_root}</button>
        )}
        {path.map((n, i) => (
          <span key={n.id} className="org2-crumbwrap">
            {(i > 0 || roots.length > 1) ? <span className="org2-sep">›</span> : null}
            <button className={`org2-crumb ${i === path.length - 1 ? "on" : ""}`} onClick={() => go(n.id)}>{nodeLabel(n)}</button>
          </span>
        ))}
      </div>

      {current && (
        <div className="org2-current">
          <div className="org2-cur-head">
            <div className="org2-cur-names">
              <div className="org2-cur-name">{nodeLabel(current)}</div>
              {nodeAlt(current) ? <div className="org2-cur-alt">{nodeAlt(current)}</div> : null}
            </div>
            <span className="org-level">{scope(current.level)}</span>
          </div>
          <div className="org2-people">
            {peopleAt(current.id).length === 0 ? (
              <div className="org-empty">{m.org_no_people}</div>
            ) : peopleAt(current.id).map((p) => (
              <div key={p.id} className="org2-person">
                <span className="org2-pav">{p.name[0]}</span>
                <span className="org2-pinfo"><b>{p.name}</b><small>{p.phone} · {roleLabels[p.role] || p.role}</small></span>
                <ContactButtons phone={p.phone} m={m} />
              </div>
            ))}
          </div>
          {isAdmin && edit ? <button className="asm-btn ghost org2-manage" onClick={() => openSheet(current)}>✎ {m.org_manage}</button> : null}
        </div>
      )}

      <div className="org2-kids">
        <div className="org2-kids-h">{m.org_subunits}{kids.length ? ` (${kids.length})` : ""}</div>
        {kids.length === 0 ? (
          <div className="org-empty" style={{ marginTop: 8 }}>{m.org_no_subunits}</div>
        ) : (
          <ul className="org2-list">
            {kids.map((k) => {
              const kp = peopleAt(k.id);
              return (
                <li key={k.id} className="org2-row" onClick={() => go(k.id)}>
                  <div className="org2-row-main">
                    <div className="org2-row-name">{nodeLabel(k)}{nodeAlt(k) ? <span className="org2-row-alt"> · {nodeAlt(k)}</span> : null}</div>
                    <div className="org2-row-sub">
                      {kp.length ? kp.slice(0, 2).map((p) => p.name).join(", ") + (kp.length > 2 ? ` +${kp.length - 2}` : "") : m.org_no_people}
                    </div>
                  </div>
                  {isAdmin && edit ? <button className="org2-rowedit" aria-label="edit" onClick={(e) => { e.stopPropagation(); openSheet(k); }}>✎</button> : null}
                  <span className="org2-chev" aria-hidden>›</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {sheetNode ? (
        <>
          <div className="asm-scrim open" onClick={() => setSheetNode(null)} />
          <div className="org-sheet">
            <div className="org-sheet-head">
              <div><b>{nodeLabel(sheetNode)}</b><small>{scope(sheetNode.level)}</small></div>
              <button className="asm-sheet-close" onClick={() => setSheetNode(null)}>✕</button>
            </div>
            <div className="org-sheet-body">
              {sheetPeople.length === 0 ? <p className="asm-note">{m.org_no_people}</p> : sheetPeople.map((a) => (
                <div key={a.id} className="org-erow">
                  {editId === a.id ? (
                    <div className="org-eform">
                      <input className="asm-input" value={eName} onChange={(e) => setEName(e.target.value)} placeholder={m.org_name} />
                      <input className="asm-input" value={ePhone} inputMode="numeric" onChange={(e) => setEPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder={m.org_phone} />
                      <div className="asm-seg" style={{ maxWidth: 240, marginBottom: 8 }}>
                        <button className={eFullTime ? "on" : ""} onClick={() => setEFullTime(true)}>{m.prof_fulltime}: {m.yes}</button>
                        <button className={!eFullTime ? "on" : ""} onClick={() => setEFullTime(false)}>{m.no}</button>
                      </div>
                      <div className="org-erow-btns">
                        <button className="asm-btn" disabled={busy} onClick={() => doSaveEdit(a)}>{m.org_save}</button>
                        <button className="asm-btn ghost" onClick={() => setEditId(null)}>{m.org_cancel}</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="org-erow-info"><b>{a.name}</b><small>{a.phone} · {roleLabels[a.role] || a.role}</small></div>
                      <div className="org-erow-btns">
                        <button className="org-mini" onClick={() => startEdit(a)}>{m.org_edit_person}</button>
                        <button className="org-mini danger" disabled={busy} onClick={() => doRemove(a)}>{m.org_remove}</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              <div className="org-add">
                <div className="org-add-h">{m.org_add_person}</div>
                <input className="asm-input" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder={m.org_name} />
                <input className="asm-input" value={addPhone} inputMode="numeric" onChange={(e) => setAddPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder={m.org_phone} />
                <select className="asm-input asm-select" value={addRole} onChange={(e) => setAddRole(e.target.value)}>
                  {ROLE_VALUES.map((r) => <option key={r} value={r}>{roleLabels[r] || r}</option>)}
                </select>
                <button className="asm-btn" disabled={busy || !addName.trim() || !/^[6-9]\d{9}$/.test(addPhone)} onClick={doAdd}>{m.org_add}</button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
}
