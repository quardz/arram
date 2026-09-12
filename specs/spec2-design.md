# ARRAM — spec2 Design (v1.0, LOCKED)

> All decisions below are agreed. Schema-first: full data model, then module-by-module.
> Config still needed to *run* (not to design): Neon URL, R2 credentials, Fast2SMS key.

---

## 1. Locked decisions

- **Stack:** Next.js 16 (App Router) + React 19 + Tailwind v4 + shadcn/ui, Neon
  (Postgres), Drizzle, **Payload CMS 3** (runs inside the Next app).
- **Payload owns everything** — every module is a Payload collection; Payload gives the
  admin UI, access control, hooks, versioning. Drizzle via Payload's Postgres adapter;
  drop to raw Drizzle only for heavy reads (funnel reports, tree queries).
- **Auth = Payload-native, no extra library.** Custom OTP endpoint sends the code via
  **Fast2SMS default OTP route** (no DLT template / sender ID required), verifies it, then
  calls Payload login → httpOnly token, **30 days, configurable** (`auth.tokenExpiration`).
- **One unified `people` collection.** Phone (10-digit) = single unique ID everywhere.
  Org people are `people` rows that also have an org assignment (grants login + visibility
  + add-rights). Most people never log in.
- **Excel seed.** `FulllistwithNames.xlsx` (62,540 rows) seeds **both** People registry
  **and** the geography master (cleaned distinct values). Excel import is a first-class feature.
- **Geo depth v1.** Full 7-level tree in schema; seed State→Region→Mandalam→District→Union
  in v1. **Region↔Mandalam mapping is assigned manually by admin in the UI (or seeded
  later when data is available)** — not derivable from the Excel. Panchayat/Temple later.
- **Geo dedup.** Nodes carry aliases + a merge mechanism to consolidate spelling variants later.
- **Media storage = Cloudflare R2** (S3-compatible adapter); credentials supplied by Adal.
- **Marketing content kept in BOTH repo files and Payload.** `src/content/*.ts` stays in
  git as seed + fallback; Payload holds an editable, versioned copy. Read prefers Payload,
  falls back to the file.
- **Skill marketplace = org people only** in v1 (posting/claiming needs login).
- **Sequencing:** design the full schema first, then build module by module.

---

## 2. The organization tree (from PDF p18 + p19)

```
State / Head Office
 └─ Region            (4: Pandya, Chozha, Chera, Pallava)   [parent set manually]
     └─ Mandalam/Zone (3 per region ≈ 12)                    [Excel: numbered 1–12]
         └─ District  (≈76: Pandya 22, Chozha 17, Chera 18, Pallava 19)
             └─ Union (≈705)
                 └─ Panchayat        (v1: schema only, seed later)
                     └─ Temple        (v1: schema only, seed later)
```

Paid org roles (p19): 1 backend admin (State), 4 regional organisers (Region), 12 zonal
organisers (Mandalam), ~75 district organisers (District).

**Excel data-quality note:** columns Name/Phone/Mandalam/District/Union/Pincode. Mandalam
numbered 1–12. For Chennai (Mandalam 12) the "District" column holds temple/deity names and
"Union" holds the area — labels are inconsistent, so import normalizes + routes ambiguous
rows to a review queue.

---

## 3. Data model (Payload collections)

Payload auto-adds `id`, `createdAt`, `updatedAt`, and versioning where enabled.

### 3.1 `people`  (auth-enabled)
| field | type | notes |
|---|---|---|
| phone | text, unique, required | 10-digit Indian; login identifier |
| name | text | |
| dob | date | optional |
| gender | select(male,female) | optional |
| pincode | text | 6-digit TN; optional on import, required on self-signup |
| referredBy | relationship→people | who referred (by phone) |
| programId | relationship→projects | which program/project they joined |
| geoNode | relationship→geoNodes | resolved location |
| otpVerified | checkbox | verified via OTP |
| referralCode | text, unique | base-36 of phone, 7-char uppercase (spec1) |
| source | select | signup / excel-import / org-added / event |
| rawGeoText | group | original Mandalam/District/Union strings (for re-mapping after merges) |

- Custom OTP auth strategy (phone identifier, no password, email optional).
- Payload-admin access only for people with an active org assignment (access control).

### 3.2 `personLabels`
`person`→people, `key`, `value`, `setBy`→people. Extensible KV profile ("people_label").

### 3.3 `geoNodes`  (adjacency-list tree)
| field | type | notes |
|---|---|---|
| name / nameTamil | text | |
| level | select | state,region,mandalam,district,union,panchayat,temple |
| parent | relationship→geoNodes | self-ref (null for state; Mandalam→Region set manually) |
| code | text | e.g. Mandalam number |
| aliases | array(text) | spelling variants from imports |
| mergedInto | relationship→geoNodes | non-null ⇒ merged away |
| pincodes | array(text) | optional |

Merge tool sets `mergedInto`, repoints children + people to the canonical node.

### 3.4 `orgAssignments`
`person`→people, `geoNode`→geoNodes, `role` select(state_admin, regional_organiser,
zonal_organiser, district_organiser, union_coordinator, panchayat_coordinator,
temple_coordinator), `active` checkbox, `assignedBy`→people.
- **Schema is many-to-many.** A person **may hold more than one assignment** (occupy
  multiple nodes).
- **UI enforces one person per node** by default. A config flag
  `orgAssignment.allowMultiplePerNode` (default **false**) can relax this to true.
- **Visibility** = union of subtrees under a person's active assignments.
- **Add-rights** = create a person + assign them to a node **directly below** one of yours
  (one level down only).

### 3.5 `projects`
`name`, `slug`, `description` (richText, versioned), `startDate`, `endDate`, `status`.

### 3.6 `projectStages`
`project`→projects, `name`, `order` (int), `description`. Ordered funnel stages.

### 3.7 `events`  (project instance at place/time)
`project`→projects, `stage`→projectStages, `geoNode`→geoNodes, `date`, `name`
("Pongal 2026 – Coimbatore"), `organisers` relationship→people (district reps).

### 3.8 `lists`  (per-project acquisition group)
`name`, `project`→projects, `acquisitionChannel` select(social_media, otp_verification,
event, import, other), `geoScope`→geoNodes (optional).

### 3.9 `listMembers`
`list`→lists, `person`→people, `enteredAtStage`→projectStages, `status`.

### 3.10 `attendance`  (drives funnel progression)
`event`→events (implies project+stage+geo), `person`→people, `present`,
`recordedBy`→people, `recordedAt`.
- Present at stage N ⇒ eligible/invited for stage N+1. "Serious volunteers" = present
  across many stages. Reports derived from `attendance`.

### 3.11 `socialPosts`
`author`→people, `geoNode`→geoNodes (must be within author's downward scope),
`images` relationship→media (multiple), `caption`, `status` select(published),
`curatedForSocial` checkbox, `curatedBy`→people.
- Public feed = all published posts. Author posts to own node or any node below it.
- Higher-level org people set `curatedForSocial` → signals the social-media team.

### 3.12 `media`  (Payload upload → Cloudflare R2)
Images for posts/gallery/news. S3-compatible adapter pointed at R2 (creds from Adal).

### 3.13 `skills`  (marketplace, org people only)
`person`→people, `skills` (tags), `description`, `availability`, `status`
select(open,claimed,closed).
### 3.14 `skillClaims`
`skill`→skills, `claimedBy`→people, `note`, `status`.

### 3.15 Content collections (files + Payload)
`pages`, `news`, `activities`, `galleryAlbums`, `siteSettings` (global). Seeded from
`src/content/*.ts`; Payload copy is editable + versioned. Runtime read prefers Payload,
falls back to the repo file. Files stay in git.

### 3.16 Auth support
`otpRequests`: phone, codeHash, expiresAt, attempts, consumed. Payload manages the session token.

---

## 4. Key flows

### 4.1 Phone-OTP login (org people)
1. Phone → `POST /api/auth/otp/request` → generate code, store hash, send via **Fast2SMS
   default OTP route**, rate-limit per phone/IP.
2. Code → `POST /api/auth/otp/verify` → check hash+expiry+attempts → set `otpVerified=true`,
   Payload login → httpOnly token (30-day).
3. Access control: only people with an active `orgAssignment` reach the member area / admin.

### 4.2 Excel import (62.5k rows)
Parse (Name, Phone, Mandalam, District, Union, Pincode) → normalize phone → upsert `people`
by phone → resolve geo strings to `geoNodes` by name/alias (create on first sight) →
ambiguous/inconsistent rows to a **review queue** → keep original strings in `rawGeoText`.
Geo **merge tool** consolidates variants later.

### 4.3 Referral (spec1, now DB-backed)
Base-36 encode 10-digit phone → 7-char uppercase; decode back. Prefill priority URL param →
cookie (1yr). `referralCode` stored on `people`.

---

## 5. Build order (schema first, then modules)

0. **Foundation** — add Payload 3 + Drizzle + Neon to the repo; R2 media adapter; base config.
1. **Full schema** — all collections in §3 (migrations), with access-control scaffolding.
2. **Geo + import** — geoNodes, Excel importer, review queue, merge tool; seed geography.
3. **People + auth** — Fast2SMS OTP login, sessions, unified people registry; seed people.
4. **Org structure** — assignments, tree visibility, "add just below", the one-per-node switch.
5. **Projects/Events/Lists/Attendance** — funnel + attendance capture + reports.
6. **Social posts** — geo-scoped posting, public feed, curation label.
7. **Skill marketplace** — org-people posting/claiming.
8. **Content migration** — seed marketing content into Payload (files retained).

---

## 6. Config needed before running (not before design)
- **Neon** Postgres connection string.
- **Cloudflare R2**: account id, bucket, access key id, secret, public URL.
- **Fast2SMS** API key (default OTP route).

---

## 7. Non-negotiable constraints (added)

### 7.1 The existing website must never be disrupted
- All new functionality is **additive**. Existing routes, components, content
  (`src/content/*.ts`) and public pages (home, about, activities, gallery, news, join,
  contact, forms, legal) stay exactly as they are.
- New app lives under its own route groups: `/(app)` member area, `/(payload)/admin`,
  and `/api/*` endpoints. No existing page imports Payload/DB directly.
- Content pages that gain a Payload copy read Payload **inside try/catch with the repo
  file as fallback**, so a DB/Payload failure renders the current file-based page unchanged.

### 7.2 Graceful degradation on missing config
A single `src/lib/env.ts` exposes capability flags derived from env vars. Every feature
checks its flag and **degrades instead of crashing**:

| Missing config | Behavior |
|---|---|
| `DATABASE_URL` (Neon) | Payload not initialized; `/admin`, member area & data APIs return a friendly "not configured" state; **public marketing site runs normally from repo files** |
| R2 credentials | Media uploads disabled (upload UI hidden / API returns 501); everything else works |
| `FAST2SMS_API_KEY` | OTP send is skipped and (dev) logged to console; login flow shows "SMS not configured" instead of erroring |
| `PAYLOAD_SECRET` | Auth/admin disabled; public site unaffected |

- Guard: every `getPayload()` call is wrapped; if `hasDB` is false it is never called.
- The app must **build and boot with zero env vars set** and serve the existing site.
