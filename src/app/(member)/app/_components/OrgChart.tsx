"use client";
import { useMemo, useRef, useState } from "react";
import { ROLE_VALUES, defaultRoleForLevel } from "@/lib/org";

type Node = { id: number; name: string; nameTamil: string | null; level: string; parentId: number | null };
type Asg = { id: number; nodeId: number; personId: number; name: string; phone: string; role: string };
type Props = {
  nodes: Node[]; assignments: Asg[]; isAdmin: boolean;
  lang: "ta" | "en"; roleLabels: Record<string, string>; m: Record<string, string>;
};

export default function OrgChart({ nodes, assignments, isAdmin, lang, roleLabels, m }: Props) {
  const [asg, setAsg] = useState<Asg[]>(assignments);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [edit, setEdit] = useState(false);
  const [sheetNode, setSheetNode] = useState<Node | null>(null);

  // zoom / pan
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const vp = useRef<HTMLDivElement>(null);
  const ptrs = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchDist = useRef(0);
  const panning = useRef(false);
  const moved = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const childrenBy = useMemo(() => {
    const map = new Map<number | null, Node[]>();
    for (const n of nodes) {
      const k = n.parentId;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(n);
    }
    return map;
  }, [nodes]);
  const roots = childrenBy.get(null) || nodes.filter((n) => !n.parentId);

  const peopleAt = (nodeId: number) => asg.filter((a) => a.nodeId === nodeId);
  const nodeLabel = (n: Node) => (lang === "ta" && n.nameTamil ? n.nameTamil : n.name);
  const nodeAlt = (n: Node) => (lang === "ta" ? n.name : n.nameTamil || "");

  const clamp = (s: number) => Math.min(2.5, Math.max(0.35, s));
  const zoomBy = (f: number) => setScale((s) => clamp(s * f));
  const reset = () => { setScale(1); setTx(0); setTy(0); };

  function onWheel(e: React.WheelEvent) {
    if (!e.ctrlKey && Math.abs(e.deltaY) < 1) return;
    e.preventDefault();
    zoomBy(e.deltaY < 0 ? 1.12 : 0.89);
  }
  function onPointerDown(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.current.size === 1) { panning.current = true; moved.current = false; last.current = { x: e.clientX, y: e.clientY }; }
    else if (ptrs.current.size === 2) {
      const [a, b] = [...ptrs.current.values()];
      pinchDist.current = Math.hypot(a.x - b.x, a.y - b.y);
    }
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!ptrs.current.has(e.pointerId)) return;
    ptrs.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.current.size === 2) {
      const [a, b] = [...ptrs.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist.current) setScale((s) => clamp(s * (d / pinchDist.current)));
      pinchDist.current = d;
      moved.current = true;
      return;
    }
    if (panning.current) {
      const dx = e.clientX - last.current.x, dy = e.clientY - last.current.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
      last.current = { x: e.clientX, y: e.clientY };
      setTx((v) => v + dx); setTy((v) => v + dy);
    }
  }
  function onPointerUp(e: React.PointerEvent) {
    ptrs.current.delete(e.pointerId);
    if (ptrs.current.size < 2) pinchDist.current = 0;
    if (ptrs.current.size === 0) panning.current = false;
  }

  function toggle(id: number) {
    setCollapsed((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function renderNode(n: Node, depth: number): React.ReactNode {
    const kids = childrenBy.get(n.id) || [];
    const isOpen = !collapsed.has(n.id);
    const ppl = peopleAt(n.id);
    return (
      <div key={n.id} className="org-branch" style={{ marginLeft: depth ? 18 : 0 }}>
        <div className={`org-node lvl-${n.level}`} onClick={() => { if (moved.current) return; if (edit) openSheet(n); else if (kids.length) toggle(n.id); }}>
          <div className="org-node-top">
            {kids.length ? <span className="org-caret">{isOpen ? "▾" : "▸"}</span> : <span className="org-caret dot">•</span>}
            <span className="org-name">{nodeLabel(n)}</span>
            <span className="org-level">{m[`role_scope_${n.level}`] || n.level}</span>
          </div>
          {nodeAlt(n) ? <div className="org-alt">{nodeAlt(n)}</div> : null}
          <div className="org-people">
            {ppl.length === 0 ? (
              <div className="org-empty">{m.org_no_people}</div>
            ) : ppl.map((p) => (
              <div key={p.id} className="org-person">
                <span className="org-pn">{p.name}</span>
                <span className="org-pp">{p.phone}</span>
                <span className="org-pr">{roleLabels[p.role] || p.role}</span>
              </div>
            ))}
          </div>
          {edit ? <div className="org-editcue">✎ {m.org_edit_node}</div> : null}
        </div>
        {isOpen && kids.length ? <div className="org-kids">{kids.map((k) => renderNode(k, depth + 1))}</div> : null}
      </div>
    );
  }

  // ---- editor sheet actions ----
  const [busy, setBusy] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addRole, setAddRole] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [eName, setEName] = useState("");
  const [ePhone, setEPhone] = useState("");

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
  function startEdit(a: Asg) { setEditId(a.id); setEName(a.name); setEPhone(a.phone); }
  async function doSaveEdit(a: Asg) {
    if (!eName.trim() || !/^[6-9]\d{9}$/.test(ePhone)) return;
    setBusy(true);
    try {
      const r = await fetch("/api/member/org/person", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId: a.personId, name: eName, phone: ePhone }) });
      const d = await r.json();
      if (r.ok && d.ok) { setAsg((xs) => xs.map((x) => x.personId === a.personId ? { ...x, name: eName, phone: ePhone } : x)); setEditId(null); }
      else if (d.error === "phone_taken") alert(m.org_phone_taken || "Phone already in use");
    } finally { setBusy(false); }
  }

  const sheetPeople = sheetNode ? peopleAt(sheetNode.id) : [];

  return (
    <div className="org-wrap">
      <div className="org-bar">
        <div className="org-title">{m.org_title}</div>
        <div className="org-tools">
          <button onClick={() => zoomBy(0.89)} aria-label="zoom out">−</button>
          <button onClick={() => zoomBy(1.12)} aria-label="zoom in">+</button>
          <button onClick={reset} aria-label="reset">⟳</button>
          {isAdmin ? <button className={`org-editbtn ${edit ? "on" : ""}`} onClick={() => { setEdit((e) => !e); setSheetNode(null); }}>{edit ? m.org_done : m.org_edit}</button> : null}
        </div>
      </div>

      <div className="org-viewport" ref={vp} onWheel={onWheel}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        <div className="org-canvas" style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}>
          {roots.map((r) => renderNode(r, 0))}
        </div>
      </div>

      {edit && sheetNode ? (
        <>
          <div className="asm-scrim open" onClick={() => setSheetNode(null)} />
          <div className="org-sheet">
            <div className="org-sheet-head">
              <div><b>{nodeLabel(sheetNode)}</b><small>{m[`role_scope_${sheetNode.level}`] || sheetNode.level}</small></div>
              <button className="asm-sheet-close" onClick={() => setSheetNode(null)}>✕</button>
            </div>
            <div className="org-sheet-body">
              {sheetPeople.length === 0 ? <p className="asm-note">{m.org_no_people}</p> : sheetPeople.map((a) => (
                <div key={a.id} className="org-erow">
                  {editId === a.id ? (
                    <div className="org-eform">
                      <input className="asm-input" value={eName} onChange={(e) => setEName(e.target.value)} placeholder={m.org_name} />
                      <input className="asm-input" value={ePhone} inputMode="numeric" onChange={(e) => setEPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder={m.org_phone} />
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
    </div>
  );
}
