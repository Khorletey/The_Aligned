"use strict";
/* The Aligned · O'Merlin Academy. Offline-first: everything lives on the device. */

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const inl = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
function md(s) {
  let out = "", list = null, para = [];
  const flushP = () => { if (para.length) { out += "<p>" + inl(para.join(" ")) + "</p>"; para = []; } };
  const flushL = () => { if (list) { out += `<${list.t}>` + list.items.map(i => "<li>" + inl(i) + "</li>").join("") + `</${list.t}>`; list = null; } };
  for (const line of String(s).split("\n")) {
    const ul = line.match(/^- (.*)/), ol = line.match(/^\d+\. (.*)/);
    if (ul || ol) { flushP(); const t = ul ? "ul" : "ol"; if (!list || list.t !== t) { flushL(); list = { t, items: [] }; } list.items.push((ul || ol)[1]); }
    else if (!line.trim()) { flushP(); flushL(); }
    else { flushL(); para.push(line.trim()); }
  }
  flushP(); flushL(); return out;
}
const plain = s => String(s).replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1");
const pad = n => String(n).padStart(2, "0");
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => ymd(new Date());
const parseD = s => { const [y, m, d] = String(s).split("-").map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const daysBetween = (a, b) => Math.round((parseD(b) - parseD(a)) / 864e5);
const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return ymd(d); };
const fmtD = s => parseD(s).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
const words = s => (String(s).trim().match(/\S+/g) || []).length;
const uidGen = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
const SVG = (p, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

const ICON = {
  today: SVG('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  programme: SVG('<path d="M3 20h18M5 20V10l7-5 7 5v10M9 20v-6h6v6"/>'),
  journal: SVG('<path d="M5 3h11l3 3v15H5z"/><path d="M9 9h6M9 13h6M9 17h4"/>'),
  tools: SVG('<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>'),
  movement: SVG('<circle cx="8" cy="9" r="3"/><circle cx="17" cy="8" r="2.5"/><path d="M2.5 19c.8-3.3 3-5 5.5-5s4.7 1.7 5.5 5M14 14.5c2.6-.6 5.6.6 6.8 4.5"/>'),
  share: SVG('<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>'),
  download: SVG('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>'),
  print: SVG('<path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/>'),
  calendar: SVG('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  copy: SVG('<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>')
};
const LAW_ICON = {
  mind: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z"/>',
  seed: '<path d="M12 21v-9"/><path d="M12 12C12 8 9 6 5 6c0 4 3 6 7 6zM12 10c0-3 2.5-5 6-5 0 3.5-2.5 5-6 5z"/><path d="M7 21h10"/>',
  value: '<path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18M9 3l3 18 3-18"/>',
  retain: '<rect x="4" y="5" width="16" height="15" rx="2"/><circle cx="12" cy="12.5" r="3.5"/><path d="M12 9v1M7 20v1.5M17 20v1.5"/>',
  rel: '<circle cx="8.5" cy="12" r="4.5"/><circle cx="15.5" cy="12" r="4.5"/>',
  mult: '<path d="M3 20h18"/><path d="M6 16v-3M10.5 16V10M15 16V7M19.5 16V4"/>',
  honor: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
  work: '<path d="M14 4l6 6-3 3-6-6z"/><path d="M11 7L3.5 14.5a2.1 2.1 0 0 0 3 3L14 10"/>',
  dilig: '<path d="M3 20h5v-5h5v-5h5V5h3"/>',
  time: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  season: '<path d="M4 20c0-8 6-14 16-14-1 9-7 14-14 14z"/><path d="M4 20l9-9"/>',
  learn: '<path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6v14"/>'
};
const COURSE_ICON = [
  '<path d="M12 3a8 8 0 0 0-8 8v2M20 13v-2a8 8 0 0 0-3-6.2"/><path d="M8 21c1-2 1-4 1-7a3 3 0 0 1 6 0c0 3-.5 5-1.5 7"/><path d="M12 12v3c0 2-.5 4-1.5 6"/>',
  '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  '<path d="M12 10.5c-1.5-2-4.5-1-4.5 1.2C7.5 14 12 16 12 16s4.5-2 4.5-4.3c0-2.2-3-3.2-4.5-1.2z"/><path d="M3 20c2-2 4-3 6-3h6c2 0 4 1 6 3"/>',
  '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/>',
  '<circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><path d="M12 7v10M12 11l-7 6M12 11l7 6"/>'
];
const glyph = (paths, big) => `<span class="glyph">${SVG(paths, big ? 1.5 : 1.7)}</span>`;
const WAVES = (color = "#c9a849") => `<div class="waves" aria-hidden="true"><svg viewBox="0 0 800 90" preserveAspectRatio="none"><g fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round">${[22, 45, 68].map(y => `<path d="M0 ${y} ${Array.from({ length: 8 }, (_, i) => `Q ${i * 100 + 25} ${y - 14} ${i * 100 + 50} ${y} T ${i * 100 + 100} ${y}`).join(" ")}"/>`).join("")}</g></svg></div>`;

const NAV = [["today", "Today"], ["programme", "Programme"], ["journal", "Journal"], ["tools", "Tools"], ["movement", "Movement"]];
const LINKS = { landing: "https://66-day-total-alignment.netlify.app/", group: "https://www.facebook.com/share/g/1ZZyCurNXT/", pay: "https://paystack.shop/pay/zhn0wv8ugd" };

/* ---------- state (device storage) ---------- */
const DEF = {
  profile: { name: "", start: todayStr(), currency: "GH₵", cohort: "", unlockAll: false, joined: todayStr(), onboarded: false, lastBackup: "", _ts: 0 },
  daily: { days: {}, _ts: 0 },
  prog: { weeks: {}, capstone: { after: "", vision: "", commit: "" }, _ts: 0 },
  logs: { fin: [], honor: [], time: [], reframes: [], checkins: [], mentees: [], split: { give: 10, save: 20, live: 70 }, partner: { name: "", rhythm: "Weekly", report: "" }, _ts: 0 }
};
const DOCS = Object.keys(DEF);
const clone = o => JSON.parse(JSON.stringify(o));
function withDefaults(k, v) {
  const base = clone(DEF[k]); if (!v || typeof v !== "object") return base;
  for (const key of Object.keys(v)) {
    if (base[key] && typeof base[key] === "object" && !Array.isArray(base[key]) && v[key] && typeof v[key] === "object" && !Array.isArray(v[key])) base[key] = Object.assign(base[key], v[key]);
    else base[key] = v[key];
  }
  return base;
}
const S = {}; DOCS.forEach(k => S[k] = clone(DEF[k]));
const LS = "omerlin.aligned.v1";
let storageOK = true;
function loadLocal() { try { const j = JSON.parse(localStorage.getItem(LS) || "null"); if (j) DOCS.forEach(k => { if (j[k]) S[k] = withDefaults(k, j[k]); }); } catch (e) { storageOK = false; } }
let saveTimer;
function saveNow() { try { localStorage.setItem(LS, JSON.stringify(S)); storageOK = true; } catch (e) { storageOK = false; toast("Couldn't save on this device. Download a backup in Settings"); } }
function touch(k) { S[k]._ts = Date.now(); clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 250); }
window.addEventListener("pagehide", saveNow);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") saveNow(); });
const hasData = () => Object.keys(S.daily.days).length || Object.keys(S.prog.weeks).length || S.logs.fin.length;

/* ---------- derived ---------- */
const curDayRaw = () => daysBetween(S.profile.start, todayStr()) + 1;
const curDay = () => Math.min(66, Math.max(1, curDayRaw()));
const phaseOf = d => PHASES.find(p => d >= p.from && d <= p.to);
const lawIdx = d => (d - 1) % 12;
const lawOf = d => LAWS[lawIdx(d)];
const actionOf = d => lawOf(d).acts[Math.floor((d - 1) / 12)];
const dayRec = d => S.daily.days[d] || { m: {}, x: {}, v: {}, note: "", done: false };
const isDone = d => !!(S.daily.days[d] && S.daily.days[d].done);
const doneCount = () => Object.values(S.daily.days).filter(r => r.done).length;
function streak() { let d = curDay(); if (!isDone(d)) d--; let n = 0; while (d >= 1 && isDone(d)) { n++; d--; } return n; }
const rhythmItems = (sec, phase) => RHYTHM[sec].items.map((it, i) => ({ t: it[0], i, ph: it[1] })).filter(it => it.ph <= phase);
const SECKEY = { morning: "m", execution: "x", evening: "v" };
function dayPct(d) {
  const ph = phaseOf(d).n, r = dayRec(d); let tot = 0, got = 0;
  for (const sec of Object.keys(RHYTHM)) for (const it of rhythmItems(sec, ph)) { tot++; if ((r[SECKEY[sec]] || {})[it.i]) got++; }
  return tot ? Math.round(got / tot * 100) : 0;
}
const WEEKS = []; PROGRAMME.courses.forEach(c => c.weeks.forEach(w => WEEKS.push({ c: c.n, w: w.n, key: `${c.n}-${w.n}`, course: c, week: w })));
const wk = key => S.prog.weeks[key] || { ex: {}, ms: "", done: false };
const wkDone = key => !!(S.prog.weeks[key] && S.prog.weeks[key].done);
const wkIndex = key => WEEKS.findIndex(x => x.key === key);
const wkUnlocked = key => { const i = wkIndex(key); return S.profile.unlockAll || i === 0 || wkDone(WEEKS[i - 1].key); };
const progDone = () => WEEKS.filter(x => wkDone(x.key)).length;
const currentWeek = () => WEEKS.find(x => !wkDone(x.key)) || WEEKS[WEEKS.length - 1];
const msReady = key => { const t = (wk(key).ms || "").trim(); return t.length >= 40 && t !== (TEMPLATES[key] || "").trim(); };
const courseWeeksDone = n => [1, 2, 3, 4].filter(w => wkDone(`${n}-${w}`)).length;
function tiers() {
  const aligned = isDone(66) && doneCount() >= 60;
  return [
    { k: "Member", d: "Joined The Aligned", got: true },
    { k: "Initiated", d: "Completed Phase 1 (Day 7)", got: isDone(7) },
    { k: "Aligned", d: "Completed all 66 days", got: aligned },
    { k: "Alignment Leader", d: "Aligned, and mentoring at least one person", got: aligned && S.logs.mentees.length > 0 },
    { k: "Powerhouse", d: "Completed all seven courses of the Powerhouse Programme", got: progDone() === 28 }
  ];
}

/* ---------- routing + transitions ---------- */
let selDay = null, toolTab = "finance", secTab = "morning";
function route() {
  const h = location.hash.replace("#", "") || "today"; let m;
  if ((m = h.match(/^course-(\d)$/))) return { view: "programme", course: +m[1] };
  if ((m = h.match(/^week-(\d)-(\d)$/))) return { view: "programme", key: `${m[1]}-${m[2]}` };
  if (h === "capstone") return { view: "journal", capstone: true };
  return { view: ["today", "programme", "journal", "tools", "movement", "settings"].includes(h) ? h : "today" };
}
function renderNav() {
  const v = route().view;
  $("#nav").innerHTML = NAV.map(([k, l]) => `<a href="#${k}" class="${v === k ? "on" : ""}" ${v === k ? 'aria-current="page"' : ""}>${ICON[k]}<span>${l}</span></a>`).join("");
}
function paint(animate) {
  renderNav();
  const r = route(), el = $("#view");
  el.innerHTML = r.view === "today" ? vToday() : r.view === "programme" ? (r.key ? vWeek(r.key) : r.course ? vCourse(r.course) : vProgramme())
    : r.view === "journal" ? (r.capstone ? vCapstone() : vJournal()) : r.view === "tools" ? vTools() : r.view === "movement" ? vMovement() : vSettings();
  el.className = animate && !document.startViewTransition ? "stack enter" : "stack";
  afterPaint();
}
function render(animate = true) {
  if (animate && document.startViewTransition && !reduceMotion) document.startViewTransition(() => paint(true));
  else paint(animate);
}
window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });
function afterPaint() {
  // animate the progress ring from empty
  document.querySelectorAll(".ring .arc[data-off]").forEach(a => requestAnimationFrame(() => requestAnimationFrame(() => a.setAttribute("stroke-dashoffset", a.dataset.off))));
  document.querySelectorAll(".cell").forEach((c, i) => c.style.animationDelay = (i * 6) + "ms");
  if (route().view === "movement") drawShareCard($("#cardprev"));
}

/* ---------- views: TODAY ---------- */
function ringSVG(done, size = 124, r = 52) {
  const circ = 2 * Math.PI * r;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1d48a"/><stop offset="1" stop-color="#c9a849"/></linearGradient></defs><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#26324c" stroke-width="8"/><circle class="arc" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="url(#rg)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${circ}" data-off="${circ * (1 - done)}"/></svg>`;
}
function vToday() {
  const cd = curDay(), d = selDay || cd, ph = phaseOf(d), law = lawOf(d), r = dayRec(d);
  const notStarted = curDayRaw() < 1, future = d > cd && !S.profile.unlockAll;
  const hr = new Date().getHours(), greet = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  const done = doneCount(), pct = dayPct(d), cph = phaseOf(cd);
  const phDone = Object.keys(S.daily.days).filter(k => S.daily.days[k].done && +k >= cph.from && +k <= cph.to).length;
  const cw = currentWeek();
  let h = "";
  h += `<div class="card">${WAVES(cph.color)}<div class="hero">
      <div class="ring">${ringSVG(done / 66)}<b class="num">${done}<small>of 66</small></b></div>
      <div><p class="eyebrow">${notStarted ? `Starts ${fmtD(S.profile.start)}` : `Day ${cd} of 66 · ${cph.name}`}</p>
        <h1 style="margin-top:4px">${greet}${S.profile.name ? ", " + esc(S.profile.name) : ""}.</h1>
        <p class="muted" style="margin-top:4px">Phase ${cph.n}: ${cph.name}, days ${cph.from}–${cph.to}. ${esc(cph.aim)}.</p>
        <div class="bar" style="margin-top:10px" role="progressbar" aria-label="Phase progress" aria-valuenow="${phDone}" aria-valuemin="0" aria-valuemax="${cph.to - cph.from + 1}"><i style="width:${phDone / (cph.to - cph.from + 1) * 100}%"></i></div>
      </div></div>
      <div class="stats"><div class="stat"><b class="num">${streak()}</b><span>day streak</span></div><div class="stat"><b class="num">${Math.round(done / 66 * 100)}%</b><span>complete</span></div><div class="stat"><b class="num">${Math.max(0, 66 - cd)}</b><span>days remaining</span></div></div></div>`;
  const lb = S.profile.lastBackup, stale = hasData() && (!lb || daysBetween(lb, todayStr()) >= 14);
  if (stale) h += `<div class="card notice"><div><b>Your progress lives on this phone.</b><p class="muted" style="font-size:14px">${lb ? `Last backup ${fmtD(lb)}.` : "You haven't made a backup yet."} Download one so a lost phone doesn't mean lost work.</p></div><button class="btn sm primary" data-act="backup">${ICON.download}Download backup</button></div>`;
  if (deferredInstall && !isStandalone()) h += `<div class="card notice"><div><b>Install The Aligned</b><p class="muted" style="font-size:14px">Open it from your home screen, full-screen and offline.</p></div><button class="btn sm primary" data-act="install">Install</button></div>`;
  h += `<div class="card law"><span class="num-bg num">${lawIdx(d) + 1}</span>
      <div class="row between"><div class="head">${glyph(LAW_ICON[law.k])}<div><p class="eyebrow">Law ${lawIdx(d) + 1} of 12 · ${law.side}</p><p class="muted" style="font-size:13px">${law.src === "Selman" ? "Apostle Joshua Selman" : "Pastor Sunday Adelaja"}</p></div></div>
      <div class="daynav"><button data-act="day" data-d="${d - 1}" ${d <= 1 ? "disabled" : ""} aria-label="Previous day">‹</button><b class="num">Day ${d}</b><button data-act="day" data-d="${d + 1}" ${d >= 66 ? "disabled" : ""} aria-label="Next day">›</button></div></div>
      <h2 style="margin-top:14px">${esc(law.name)}</h2><blockquote>${esc(law.line)}</blockquote>
      <div class="action"><p class="eyebrow">Today's action step</p><p style="margin-top:4px">${esc(actionOf(d))}</p></div></div>`;
  if (future) h += `<div class="empty">Day ${d} opens on ${fmtD(addDays(S.profile.start, d - 1))}. Finish today first.</div>`;
  else {
    const sec = RHYTHM[secTab], items = rhythmItems(secTab, ph.n), sk = SECKEY[secTab];
    h += `<div class="card"><div class="row between"><h3>Daily rhythm</h3><span class="chip num">${pct}% of Day ${d}</span></div>
      <div class="bar" style="margin:12px 0 14px"><i style="width:${pct}%"></i></div>
      <div class="tabs" role="tablist">${Object.keys(RHYTHM).map(k => { const its = rhythmItems(k, ph.n), g = its.filter(it => (r[SECKEY[k]] || {})[it.i]).length; return `<button role="tab" aria-selected="${k === secTab}" class="${k === secTab ? "on" : ""}" data-act="sec" data-k="${k}">${RHYTHM[k].label} <span class="num muted">${g}/${its.length}</span></button>`; }).join("")}</div>
      <p class="muted" style="font-size:13px;margin:10px 0 4px">${esc(sec.sub)}</p>
      <div>${items.map(it => `<label class="check" for="ck-${sk}-${it.i}"><input type="checkbox" id="ck-${sk}-${it.i}" data-act="tick" data-s="${sk}" data-i="${it.i}" ${(r[sk] || {})[it.i] ? "checked" : ""}><span class="box"><svg viewBox="0 0 16 16"><path d="M3 8.5l3.2 3L13 4.5"/></svg></span><span>${esc(it.t)}</span></label>`).join("")}</div></div>
      <div class="card"><label class="f" for="day-note"><span><b style="color:var(--text)">Reflection</b> · what shifted today?</span><textarea id="day-note" data-act="note" data-d="${d}" placeholder="One honest line is enough.">${esc(r.note || "")}</textarea></label>
      <div class="row between" style="margin-top:14px">${r.done ? `<span class="chip done">Day ${d} complete${r.doneAt ? " · " + fmtD(r.doneAt) : ""}</span><span class="row" style="gap:8px"><button class="btn sm" data-act="sharecard" data-d="${d}">${ICON.share}Share Day ${d}</button><button class="btn sm ghost" data-act="undone" data-d="${d}">Mark not complete</button></span>` : `<button class="btn primary" data-act="complete" data-d="${d}">Complete Day ${d}</button><span class="muted" style="font-size:13px;flex:1;min-width:200px">You can complete the day even if a few items slipped. Be honest in your reflection.</span>`}</div></div>`;
  }
  h += `<a class="card" href="#week-${cw.c}-${cw.w}"><div class="row" style="flex-wrap:nowrap">${glyph(COURSE_ICON[cw.c - 1])}<div style="min-width:0"><p class="eyebrow">This week in the Powerhouse Programme</p><h3 style="margin-top:4px">Course ${cw.c}, Week ${cw.w}: ${esc(cw.week.title)}</h3><p class="muted" style="margin-top:2px;font-size:14px">Milestone: ${esc(cw.week.mname)} · ${progDone()} of 28 weeks complete →</p></div></div></a>`;
  h += `<div class="card map"><div class="row between"><h3>Your 66 days</h3><span class="muted" style="font-size:13px">Tap a day to open it</span></div>${PHASES.map(p => `<div><p class="eyebrow" style="color:${p.color}">${p.name} · Days ${p.from}–${p.to}</p><div class="cells" style="margin-top:8px">${Array.from({ length: p.to - p.from + 1 }, (_, i) => { const n = p.from + i, dn = isDone(n); const cls = ["cell", dn ? "done" : "", n === cd && !notStarted ? "today" : "", n === d ? "sel" : "", n > cd ? "future" : "", !dn && n < cd ? "miss" : ""].join(" "); return `<button class="${cls}" style="${dn ? `background:${p.color}` : ""}" data-act="day" data-d="${n}" aria-label="Day ${n}${dn ? ", complete" : ""}">${dn ? "✓" : n}</button>`; }).join("")}</div></div>`).join("")}</div>`;
  return h;
}

/* ---------- views: PROGRAMME ---------- */
function vProgramme() {
  const done = progDone(), cw = currentWeek();
  let h = `<div><p class="eyebrow">The Powerhouse Programme</p><h1 style="margin-top:6px">From ordinary to thought leader through problem-solving</h1><p class="muted" style="margin-top:8px;max-width:62ch">Seven courses, four weeks each, 28 weeks in all. Each week has a teaching, practical exercises and a milestone you write here. Each milestone opens the next week, because the sequence only works cumulatively.</p></div>`;
  h += `<div class="card gold">${WAVES()}<div class="row between"><div class="row" style="flex-wrap:nowrap">${glyph(COURSE_ICON[cw.c - 1])}<div><p class="eyebrow">Where you are</p><h3 style="margin-top:4px">Course ${cw.c}, Week ${cw.w}: ${esc(cw.week.title)}</h3></div></div><a class="btn primary" href="#week-${cw.c}-${cw.w}">${done ? "Continue" : "Start Week 1"}</a></div>
    <div class="timeline" aria-label="${done} of 28 weeks complete">${PROGRAMME.courses.map(c => `<span class="${courseWeeksDone(c.n) === 4 ? "on" : ""}" title="Course ${c.n}"></span>`).join("")}</div><p class="muted num" style="font-size:13px;margin-top:6px;position:relative">${done} of 28 weeks complete</p></div>`;
  h += `<div class="stack">${PROGRAMME.courses.map(c => { const n = courseWeeksDone(c.n), locked = !wkUnlocked(`${c.n}-1`); const circ = 2 * Math.PI * 16; return `<a class="course ${locked ? "locked" : ""}" href="#course-${c.n}">${glyph(COURSE_ICON[c.n - 1])}<span style="min-width:0"><span class="cn">COURSE ${c.n}</span><b style="display:block">${esc(c.title)}</b><span class="muted" style="display:block;font-size:13px">${esc(c.weeks.map(w => w.mname).join(" · "))}</span></span><span>${locked ? '<span class="chip lock">Locked</span>' : `<svg class="ringlet" viewBox="0 0 40 40" aria-label="${n} of 4 weeks"><circle cx="20" cy="20" r="16" fill="none" stroke="#26324c" stroke-width="4"/><circle cx="20" cy="20" r="16" fill="none" stroke="${n === 4 ? "#7fc4a4" : "#c9a849"}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - n / 4)}" transform="rotate(-90 20 20)"/><text x="20" y="24" text-anchor="middle" fill="#efe8d8" font-size="11" font-weight="700">${n}/4</text></svg>`}</span></a>`; }).join("")}</div>`;
  h += `<div class="card"><h3>The sequence, in order</h3><ol class="principles" style="margin-top:12px">${PROGRAMME.principles.map(([a, b]) => `<li><span><strong style="color:var(--gold-hi)">${inl(a)}</strong> ${inl(b)}</span></li>`).join("")}</ol></div>`;
  h += `<details class="card"><summary style="cursor:pointer;font-weight:600">Facilitator notes</summary><div class="prose" style="margin-top:12px"><ul>${PROGRAMME.facilitator.map(f => `<li>${inl(f)}</li>`).join("")}</ul></div></details>`;
  return h;
}
function vCourse(n) {
  const c = PROGRAMME.courses[n - 1]; if (!c) return `<div class="empty">That course doesn't exist. <a href="#programme">Back to the programme</a></div>`;
  let h = `<a class="back" href="#programme">← All courses</a><div class="course-hero">${glyph(COURSE_ICON[n - 1], true)}<div><p class="eyebrow">Course ${c.n} of 7 · 4 weeks</p><h1 style="margin-top:4px">${esc(c.title)}</h1></div></div>`;
  h += `<div class="card"><div class="prose">${c.overview.map(p => `<p>${inl(p)}</p>`).join("")}</div>${c.prereq ? `<p class="muted" style="margin-top:12px;font-size:14px"><b style="color:var(--text)">Prerequisite:</b> ${inl(c.prereq)}</p>` : ""}</div>`;
  h += `<div class="card gold">${WAVES()}<p class="eyebrow">Non-negotiable principle</p><p style="font-family:var(--display);font-size:19px;margin-top:6px;position:relative">${inl(c.principle)}</p></div>`;
  h += `<div class="card"><h3>Weeks</h3><div style="margin-top:6px">${c.weeks.map(w => { const key = `${c.n}-${w.n}`, un = wkUnlocked(key), dn = wkDone(key), dr = !dn && (wk(key).ms || "").trim(); return `<a class="week ${un ? "" : "locked"}" href="#week-${key}"><span class="w">WEEK ${w.n}</span><span><b>${esc(w.title)}</b><span class="muted" style="display:block;font-size:13px">Milestone: ${esc(w.mname)}</span></span><span class="chip ${dn ? "done" : dr ? "draft" : un ? "" : "lock"}">${dn ? "Done" : dr ? "Draft" : un ? "Open" : "Locked"}</span></a>`; }).join("")}</div></div>`;
  h += `<div class="card"><h3>End-of-course deliverables</h3><div class="list" style="margin-top:8px">${c.deliverables.map(d => `<div><span>${inl(d)}</span></div>`).join("")}</div>${c.bridge ? `<p class="muted" style="margin-top:10px;font-size:14px">${inl(c.bridge)}</p>` : ""}</div>`;
  return h;
}
function vWeek(key) {
  const [cn, wn] = key.split("-").map(Number), c = PROGRAMME.courses[cn - 1], w = c && c.weeks[wn - 1];
  if (!w) return `<div class="empty">That week doesn't exist. <a href="#programme">Back to the programme</a></div>`;
  if (!wkUnlocked(key)) { const prev = WEEKS[wkIndex(key) - 1]; return `<a class="back" href="#course-${cn}">← Course ${cn}</a><div class="empty">This week opens when you complete the milestone for <a href="#week-${prev.key}">Course ${prev.c}, Week ${prev.w}: ${esc(prev.week.mname)}</a>.</div>`; }
  const rec = wk(key), i = wkIndex(key), next = WEEKS[i + 1], ready = msReady(key);
  let h = `<a class="back" href="#course-${cn}">← Course ${cn}: ${esc(c.title)}</a>`;
  h += `<div class="course-hero">${glyph(COURSE_ICON[cn - 1])}<div><p class="eyebrow">Course ${cn} · Week ${wn} of 4 · week ${i + 1} of 28</p><h1 style="margin-top:4px">${esc(w.title)}</h1></div></div>`;
  h += `<div class="card"><p class="eyebrow">Strategic teaching</p><div class="prose" style="margin-top:10px">${md(w.teaching)}</div></div>`;
  h += `<div class="card"><div class="row between"><h3>Exercises</h3><span class="chip num">${w.exercises.filter((_, j) => rec.ex[j] && rec.ex[j].d).length}/${w.exercises.length} done</span></div>${w.exercises.map((e, j) => { const er = rec.ex[j] || {}; return `<div class="ex"><label class="check" for="ex-${j}" style="border:0;padding:0"><input type="checkbox" id="ex-${j}" data-act="ex" data-k="${key}" data-j="${j}" ${er.d ? "checked" : ""}><span class="box"><svg viewBox="0 0 16 16"><path d="M3 8.5l3.2 3L13 4.5"/></svg></span><span>${e.name ? `<b>${inl(e.name)}</b>: ` : ""}${inl(e.text)}</span></label><textarea aria-label="Notes for exercise ${j + 1}" data-act="exnote" data-k="${key}" data-j="${j}" placeholder="Your notes">${esc(er.n || "")}</textarea></div>`; }).join("")}</div>`;
  h += `<div class="card gold"><p class="eyebrow">Milestone</p><h2 style="margin-top:6px">${esc(w.mname)}</h2><div class="prose muted" style="margin-top:8px;font-size:14px">${md(w.milestone)}</div>
    <label class="f" for="ms" style="margin-top:14px"><span class="row between"><span>Write your ${esc(w.mname)}</span><span class="num" id="ms-wc">${words(rec.ms || "")} words</span></span><textarea class="big" id="ms" data-act="ms" data-k="${key}" placeholder="Write it here. It carries forward into the courses that follow.">${esc(rec.ms || "")}</textarea></label>
    <div class="row" style="margin-top:12px">${!rec.ms ? `<button class="btn sm" data-act="tpl" data-k="${key}">Insert a starter outline</button>` : `<button class="btn sm ghost" data-act="printms" data-k="${key}">${ICON.print}Print</button>`}
    ${rec.done ? `<span class="chip done">Milestone complete${rec.doneAt ? " · " + fmtD(rec.doneAt) : ""}</span><button class="btn sm ghost" data-act="msundo" data-k="${key}">Reopen</button>` : `<button class="btn primary" data-act="msdone" data-k="${key}" id="ms-done" ${ready ? "" : "disabled"}>Mark milestone complete</button><span class="muted" style="font-size:13px" id="ms-hint">${ready ? "Ready when you are." : "Write at least a few honest lines (and change the outline) to complete it."}</span>`}</div></div>`;
  if (key === "3-4") h += `<div class="card"><p class="eyebrow">Accountability</p><p style="margin-top:6px">Your Standing Accountability Agreement carries through every remaining course. Keep your partner and check-ins in <a href="#tools" data-act="tooltab" data-k="account">Tools → Accountability</a>.</p></div>`;
  if (wn === 4) h += `<div class="card"><h3>Before you move on: course ${cn} deliverables</h3><div class="list" style="margin-top:8px">${c.deliverables.map(d => `<div><span>${inl(d)}</span></div>`).join("")}</div>${c.bridge ? `<p class="muted" style="margin-top:10px;font-size:14px">${inl(c.bridge)}</p>` : ""}</div>`;
  h += `<div class="row between">${i > 0 ? `<a class="btn ghost" href="#week-${WEEKS[i - 1].key}">← Previous week</a>` : "<span></span>"}${next ? (wkUnlocked(next.key) ? `<a class="btn" href="#week-${next.key}">Next: C${next.c} W${next.w} →</a>` : `<span class="chip lock">Next week opens after this milestone</span>`) : `<a class="btn primary" href="#capstone">Open your Capstone →</a>`}</div>`;
  return h;
}

/* ---------- views: JOURNAL ---------- */
function vJournal() {
  const notes = Object.keys(S.daily.days).map(Number).sort((a, b) => b - a).filter(d => (S.daily.days[d].note || "").trim());
  let h = `<div><p class="eyebrow">Journal</p><h1 style="margin-top:6px">Your documents</h1><p class="muted" style="margin-top:6px">Every milestone you write, course by course. Each one is the raw material for the next.</p></div>`;
  h += `<a class="card gold" href="#capstone">${WAVES()}<p class="eyebrow">Programme capstone</p><h3 style="margin-top:6px">Transformation Capstone Document</h3><p class="muted" style="margin-top:4px;position:relative">Pulls your Before statement and key milestones into one Before/After document →</p></a>`;
  h += `<div class="row"><button class="btn sm" data-act="dljournal">${ICON.download}Download all documents</button><button class="btn sm ghost" data-act="printjournal">${ICON.print}Print all</button></div>`;
  h += PROGRAMME.courses.map(c => `<div class="card"><div class="row between"><div class="row" style="flex-wrap:nowrap">${glyph(COURSE_ICON[c.n - 1])}<h3>Course ${c.n}: ${esc(c.title)}</h3></div><span class="chip ${courseWeeksDone(c.n) === 4 ? "done" : ""} num">${courseWeeksDone(c.n)}/4</span></div><div class="list" style="margin-top:6px">${c.weeks.map(w => { const key = `${c.n}-${w.n}`, r = wk(key), dn = wkDone(key), has = (r.ms || "").trim(); return `<div><a href="#week-${key}" style="color:inherit;text-decoration:none;flex:1;min-width:0"><b>${esc(w.mname)}</b><span class="muted" style="display:block;font-size:13px">${has ? esc(r.ms.trim().slice(0, 120)) + (r.ms.trim().length > 120 ? "…" : "") : "Not started"}</span></a><span class="chip ${dn ? "done" : has ? "draft" : ""}">${dn ? "Done" : has ? "Draft" : "Empty"}</span></div>`; }).join("")}</div></div>`).join("");
  h += `<div class="card"><h3>66-day reflections</h3>${notes.length ? `<div class="list" style="margin-top:6px">${notes.map(d => `<div><span><b class="num">Day ${d}</b><span class="muted" style="display:block;font-size:14px;white-space:pre-wrap">${esc(S.daily.days[d].note)}</span></span></div>`).join("")}</div>` : `<div class="empty" style="margin-top:10px">Your daily reflections from Today will collect here.</div>`}</div>`;
  return h;
}
const CAP_SOURCES = [["1-1", "Where I started: my “Before” statement"], ["1-3", "My purpose statement"], ["2-4", "My problem-field commitment"], ["3-1", "Mindset shift log"], ["3-2", "Integrity charter update"], ["3-3", "Discipline log"], ["4-3", "My tested system (v2)"], ["5-4", "Practice Ground report"], ["6-1", "Teaching inventory"], ["7-1", "Multiplication readiness"], ["7-3", "Institution blueprint (v1)"]];
function capstoneText() {
  const cap = S.prog.capstone, n = S.profile.name || "";
  let t = `TRANSFORMATION CAPSTONE DOCUMENT\n${n ? n + " · " : ""}The Powerhouse Programme · O'Merlin Academy\n\nPART 1: BEFORE AND AFTER\n\n`;
  for (const [k, l] of CAP_SOURCES) t += `${l.toUpperCase()}\n${(wk(k).ms || "(not yet written)").trim()}\n\n`;
  t += `WHO I AM NOW (AFTER)\n${cap.after.trim() || "(not yet written)"}\n\nPART 2: SPHERE-LEVEL VISION (5–10 YEARS)\n${cap.vision.trim() || "(not yet written)"}\n\nPART 3: INSTITUTION BLUEPRINT (v1)\n${(wk("7-3").ms || "(not yet written)").trim()}\n\nPART 4: RENEWED COMMITMENTS\n${cap.commit.trim() || "(not yet written)"}\n`;
  return t;
}
function journalText() {
  let t = `THE POWERHOUSE PROGRAMME · MY DOCUMENTS\n${S.profile.name || ""}\nExported ${fmtD(todayStr())}\n\n`;
  PROGRAMME.courses.forEach(c => { t += `\n=== COURSE ${c.n}: ${c.title.toUpperCase()} ===\n\n`; c.weeks.forEach(w => { const r = wk(`${c.n}-${w.n}`); t += `${plain(w.mname).toUpperCase()} (Week ${w.n})${r.done ? " · complete" : ""}\n${(r.ms || "(not yet written)").trim()}\n\n`; }); });
  const notes = Object.keys(S.daily.days).map(Number).sort((a, b) => a - b).filter(d => (S.daily.days[d].note || "").trim());
  if (notes.length) { t += "\n=== 66-DAY REFLECTIONS ===\n\n"; notes.forEach(d => t += `Day ${d}: ${S.daily.days[d].note.trim()}\n`); }
  return t;
}
function vCapstone() {
  const cap = S.prog.capstone;
  let h = `<a class="back" href="#journal">← Journal</a><div><p class="eyebrow">Course 7 · Week 4 · Programme capstone</p><h1 style="margin-top:6px">Transformation Capstone</h1><p class="muted" style="margin-top:6px;max-width:62ch">Your earlier milestones are pulled in below, unchanged. Read them, then write who you are now, your 5–10 year vision and your renewed commitments.</p></div>`;
  h += `<div class="card"><h3>Part 1: Before</h3><div class="stack" style="margin-top:10px">${CAP_SOURCES.map(([k, l]) => { const t = (wk(k).ms || "").trim(); return `<details ${k === "1-1" ? "open" : ""}><summary style="cursor:pointer;font-weight:600">${esc(l)} ${t ? "" : '<span class="chip">not written</span>'}</summary><p style="white-space:pre-wrap;margin-top:8px;color:var(--muted)">${t ? esc(t) : `Write it in <a href="#week-${k}">Course ${k.split("-")[0]}, Week ${k.split("-")[1]}</a>.`}</p></details>`; }).join("")}</div></div>`;
  h += `<div class="card gold stack"><label class="f" for="cap-after"><b style="color:var(--text)">Part 1: After.</b> Who I am now, compared honestly with where I started<textarea id="cap-after" class="big" data-act="cap" data-f="after">${esc(cap.after)}</textarea></label>
    <label class="f" for="cap-vision"><b style="color:var(--text)">Part 2: Sphere-level vision.</b> What changes in my industry, community or generation if this multiplies over 5–10 years<textarea id="cap-vision" class="big" data-act="cap" data-f="vision">${esc(cap.vision)}</textarea></label>
    <label class="f" for="cap-commit"><b style="color:var(--text)">Part 4: Renewed commitments.</b> To my problem-field, to ongoing mentorship and to building my blueprint, and who witnessed them<textarea id="cap-commit" data-act="cap" data-f="commit">${esc(cap.commit)}</textarea></label>
    <p class="muted" style="font-size:13px">Part 3 uses your Institution Blueprint from Course 7, Week 3.</p>
    <div class="row"><button class="btn primary" data-act="printcap">${ICON.print}Print or save as PDF</button><button class="btn" data-act="dlcap">${ICON.download}Download</button><button class="btn ghost" data-act="copycap">${ICON.copy}Copy</button></div></div>`;
  h += `<div class="card"><p style="font-family:var(--display);font-size:18px">${inl(PROGRAMME.closing.split("\n\n")[0])}</p></div>`;
  return h;
}

/* ---------- views: TOOLS ---------- */
const TOOLTABS = [["finance", "Finance"], ["honor", "Honor log"], ["time", "Time audit"], ["reframe", "Reframes"], ["account", "Accountability"], ["mentees", "Mentees"]];
const money = n => `${S.profile.currency} ${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
function vTools() {
  let h = `<div><p class="eyebrow">Tools</p><h1 style="margin-top:6px">Stewardship tools</h1><p class="muted" style="margin-top:6px">The trackers the challenge and the programme ask you to keep.</p></div>`;
  h += `<div class="tabs" role="tablist">${TOOLTABS.map(([k, l]) => `<button role="tab" aria-selected="${k === toolTab}" class="${k === toolTab ? "on" : ""}" data-act="tooltab" data-k="${k}">${l}</button>`).join("")}</div>`;
  const L = S.logs;
  if (toolTab === "finance") {
    const sum = t => L.fin.filter(e => e.type === t).reduce((a, e) => a + Number(e.amt || 0), 0);
    const inc = sum("income"), inv = sum("investment"), exp = sum("expense"), giv = sum("giving"), sp = L.split, tot = (+sp.give) + (+sp.save) + (+sp.live);
    const out = inv + exp + giv, seg = (v, c) => out ? `<i style="width:${v / out * 100}%;background:${c}"></i>` : "";
    h += `<div class="grid2"><div class="card"><p class="eyebrow">Totals</p><div class="stats" style="grid-template-columns:repeat(2,1fr)"><div class="stat"><b class="num">${money(inc)}</b><span>income</span></div><div class="stat"><b class="num">${money(inv)}</b><span>investment</span></div><div class="stat"><b class="num">${money(exp)}</b><span>expense</span></div><div class="stat"><b class="num">${money(giv)}</b><span>giving</span></div></div>
      <div style="display:flex;height:10px;border-radius:10px;overflow:hidden;background:var(--line);margin-top:14px" aria-hidden="true">${seg(inv, "#c9a849")}${seg(giv, "#7fc4a4")}${seg(exp, "#5f7396")}</div>
      <p class="muted" style="font-size:13px;margin-top:8px">${out ? `<span style="color:var(--gold-hi)">■</span> investment <span style="color:var(--good)">■</span> giving <span style="color:#5f7396">■</span> expense. ` : ""}${inv + giv >= exp && (inv + giv) > 0 ? "Investment and giving are keeping pace with expense." : exp > 0 ? `Expense is ${money(exp - inv - giv)} ahead of investment and giving.` : "Log your first entry to see the balance."}</p></div>
      <div class="card"><p class="eyebrow">Stewardship proportions</p><p class="muted" style="font-size:13px;margin-top:4px">From Course 4, Week 4. Set a fixed share for giving, saving and investing, and living.</p>
      <div class="row" style="margin-top:10px">${[["give", "Giving"], ["save", "Saving"], ["live", "Living"]].map(([k, l]) => `<label class="f" for="sp-${k}" style="flex:1;min-width:80px">${l} %<input type="number" min="0" max="100" id="sp-${k}" data-act="split" data-k="${k}" value="${esc(sp[k])}" inputmode="numeric"></label>`).join("")}</div>
      <p class="num" style="margin-top:10px;font-size:14px;color:${tot === 100 ? "var(--good)" : "var(--warn)"}">${tot === 100 ? `Of ${money(inc)} income: give ${money(inc * sp.give / 100)}, save ${money(inc * sp.save / 100)}, live on ${money(inc * sp.live / 100)}.` : `Your proportions add up to ${tot}%. Adjust them to 100%.`}</p></div></div>`;
    h += `<div class="card"><h3>Add an entry</h3><div class="row" style="margin-top:10px;align-items:flex-end"><label class="f" for="fi-type" style="flex:1;min-width:120px">Type<select id="fi-type"><option value="income">Income</option><option value="investment">Investment</option><option value="expense">Expense</option><option value="giving">Giving</option></select></label><label class="f" for="fi-amt" style="flex:1;min-width:100px">Amount (${esc(S.profile.currency)})<input type="number" id="fi-amt" min="0" step="0.01" inputmode="decimal"></label><label class="f" for="fi-note" style="flex:2;min-width:160px">What for<input type="text" id="fi-note" placeholder="e.g. Book on leadership"></label><button class="btn primary" data-act="addfin">Add</button></div></div>`;
    h += `<div class="card"><h3>Entries</h3>${L.fin.length ? `<div class="list" style="margin-top:6px">${L.fin.map(e => `<div><span><span class="chip" style="margin-right:8px">${esc(e.type)}</span>${esc(e.note || "")}<span class="muted" style="display:block;font-size:12px">${fmtD(e.date)}</span></span><span class="row" style="gap:6px;flex-wrap:nowrap"><b class="num">${money(e.amt)}</b><button class="x" data-act="del" data-l="fin" data-id="${e.id}" aria-label="Delete entry">×</button></span></div>`).join("")}</div>` : `<div class="empty" style="margin-top:10px">No entries yet. The evening review asks for a daily financial audit.</div>`}</div>`;
  } else if (toolTab === "honor") {
    h += `<div class="card"><h3>Log an act of honor</h3><p class="muted" style="font-size:13px;margin-top:4px">Who you honored and how, with no request attached.</p><div class="row" style="margin-top:10px;align-items:flex-end"><label class="f" for="ho-name" style="flex:1;min-width:140px">Who<input type="text" id="ho-name"></label><label class="f" for="ho-note" style="flex:2;min-width:180px">How<input type="text" id="ho-note" placeholder="e.g. Thanked my old teacher by phone"></label><button class="btn primary" data-act="addhonor">Add</button></div></div>`;
    h += `<div class="card">${L.honor.length ? `<div class="list">${L.honor.map(e => `<div><span><b>${esc(e.name)}</b><span class="muted" style="display:block;font-size:14px">${esc(e.note)} · ${fmtD(e.date)}</span></span><button class="x" data-act="del" data-l="honor" data-id="${e.id}" aria-label="Delete">×</button></div>`).join("")}</div>` : `<div class="empty">Your honor log is empty.</div>`}</div>`;
  } else if (toolTab === "time") {
    const cats = ["Assignment", "Production", "Study", "Family & rest", "Leak"], since = addDays(todayStr(), -6);
    const wkE = L.time.filter(e => e.date >= since), byC = cats.map(c => [c, wkE.filter(e => e.cat === c).reduce((a, e) => a + Number(e.hrs || 0), 0)]), max = Math.max(1, ...byC.map(x => x[1]));
    h += `<div class="card"><h3>Last 7 days</h3><p class="muted" style="font-size:13px;margin-top:4px">Track your real time, not your intended schedule.</p><div class="stack" style="margin-top:12px;gap:10px">${byC.map(([c, v]) => `<div><div class="row between" style="font-size:14px"><span>${c}</span><span class="num muted">${v} h</span></div><div class="bar" style="margin-top:4px"><i style="width:${v / max * 100}%;${c === "Leak" ? "background:var(--bad)" : c === "Assignment" ? "" : "background:#5f7396"}"></i></div></div>`).join("")}</div></div>`;
    h += `<div class="card"><h3>Log a block of time</h3><div class="row" style="margin-top:10px;align-items:flex-end"><label class="f" for="ti-act" style="flex:2;min-width:160px">Activity<input type="text" id="ti-act" placeholder="e.g. Drafted system document"></label><label class="f" for="ti-cat" style="flex:1;min-width:130px">Category<select id="ti-cat">${cats.map(c => `<option>${c}</option>`).join("")}</select></label><label class="f" for="ti-hrs" style="width:90px">Hours<input type="number" id="ti-hrs" min="0" step="0.25" inputmode="decimal"></label><button class="btn primary" data-act="addtime">Add</button></div></div>`;
    h += `<div class="card">${L.time.length ? `<div class="list">${L.time.slice(0, 60).map(e => `<div><span>${esc(e.act)}<span class="muted" style="display:block;font-size:12px">${esc(e.cat)} · ${fmtD(e.date)}</span></span><span class="row" style="gap:6px;flex-wrap:nowrap"><b class="num">${e.hrs} h</b><button class="x" data-act="del" data-l="time" data-id="${e.id}" aria-label="Delete">×</button></span></div>`).join("")}</div>` : `<div class="empty">No time logged yet.</div>`}</div>`;
  } else if (toolTab === "reframe") {
    h += `<div class="card"><h3>Scarcity → Dominion</h3><p class="muted" style="font-size:13px;margin-top:4px">From Course 3, Week 1. Don't deny the difficulty. Own the response.</p><div class="grid2" style="margin-top:10px"><label class="f" for="rf-a">Scarcity statement<input type="text" id="rf-a" placeholder="I can't afford to…"></label><label class="f" for="rf-b">Dominion statement<input type="text" id="rf-b" placeholder="I haven't found the resource path yet. Three ways are…"></label></div><div style="margin-top:10px"><button class="btn primary" data-act="addreframe">Add reframe</button></div></div>`;
    h += `<div class="card">${L.reframes.length ? `<div class="list">${L.reframes.map(e => `<div><span><span class="muted" style="text-decoration:line-through">${esc(e.a)}</span><span style="display:block;color:var(--gold-hi)">${esc(e.b)}</span></span><button class="x" data-act="del" data-l="reframes" data-id="${e.id}" aria-label="Delete">×</button></div>`).join("")}</div>` : `<div class="empty">No reframes yet.</div>`}</div>`;
  } else if (toolTab === "account") {
    const p = L.partner;
    h += `<div class="card"><h3>Accountability structure</h3><p class="muted" style="font-size:13px;margin-top:4px">Name one person by Course 1, Week 4, and formalise the rhythm by Course 3, Week 4.</p><div class="grid2" style="margin-top:10px"><label class="f" for="pa-name">Accountability partner(s)<input type="text" id="pa-name" data-act="partner" data-k="name" value="${esc(p.name)}"></label><label class="f" for="pa-rhythm">Check-in rhythm<select id="pa-rhythm" data-act="partner" data-k="rhythm">${["Weekly", "Every two weeks", "Monthly"].map(o => `<option ${p.rhythm === o ? "selected" : ""}>${o}</option>`).join("")}</select></label></div><label class="f" for="pa-report" style="margin-top:10px">What I report each time<textarea id="pa-report" data-act="partner" data-k="report" placeholder="Mindset shifts, integrity gaps, discipline log, progress on my problem-field">${esc(p.report)}</textarea></label></div>`;
    h += `<div class="card"><h3>Log a check-in</h3><label class="f" for="ci-note" style="margin-top:10px">What we covered, and what they said<textarea id="ci-note"></textarea></label><div style="margin-top:10px"><button class="btn primary" data-act="addcheckin">Save check-in</button></div></div>`;
    h += `<div class="card">${L.checkins.length ? `<div class="list">${L.checkins.map(e => `<div><span><b class="num">${fmtD(e.date)}</b><span class="muted" style="display:block;white-space:pre-wrap;font-size:14px">${esc(e.note)}</span></span><button class="x" data-act="del" data-l="checkins" data-id="${e.id}" aria-label="Delete">×</button></div>`).join("")}</div>` : `<div class="empty">No check-ins logged yet.</div>`}</div>`;
  } else {
    const stages = ["Not started", "66-Day Challenge"].concat(WEEKS.map(x => `Course ${x.c}, Week ${x.w}`)).concat(["Programme complete"]);
    h += `<div class="card"><h3>People you're walking through the process</h3><p class="muted" style="font-size:13px;margin-top:4px">From Course 7. You haven't finished until someone else has gone through it because of you.</p><div class="row" style="margin-top:10px;align-items:flex-end"><label class="f" for="me-name" style="flex:1;min-width:150px">Name<input type="text" id="me-name"></label><label class="f" for="me-stage" style="flex:1;min-width:170px">Where they are<select id="me-stage">${stages.map(s => `<option>${s}</option>`).join("")}</select></label><button class="btn primary" data-act="addmentee">Add</button></div></div>`;
    h += `<div class="card">${L.mentees.length ? `<div class="list">${L.mentees.map(e => `<div style="flex-wrap:wrap"><span style="flex:1;min-width:160px"><b>${esc(e.name)}</b><span class="muted" style="display:block;font-size:12px">Since ${fmtD(e.date)}</span></span><select aria-label="Stage for ${esc(e.name)}" data-act="menteestage" data-id="${e.id}" style="width:auto;flex:1;min-width:170px">${stages.map(s => `<option ${e.stage === s ? "selected" : ""}>${s}</option>`).join("")}</select><button class="x" data-act="del" data-l="mentees" data-id="${e.id}" aria-label="Remove">×</button></div>`).join("")}</div>` : `<div class="empty">No mentees yet. Course 7, Week 1 helps you name 2–3 candidates.</div>`}</div>`;
  }
  return h;
}

/* ---------- views: MOVEMENT ---------- */
let shareDay = null, shareText = "";
function vMovement() {
  const T = tiers(), cd = curDay(), sd = shareDay || (isDone(cd) ? cd : Math.max(1, cd - 1));
  let h = `<div><p class="eyebrow">The movement</p><h1 style="margin-top:6px">We are The Aligned</h1><p class="muted" style="margin-top:6px;max-width:62ch">O'Merlin Academy is the home. The 66-Day Total Alignment Challenge is the entry point. The Powerhouse Programme is the deeper road. The Aligned are the people.</p></div>`;
  h += `<div class="card gold"><div class="grid2" style="align-items:center"><div class="stack" style="gap:10px"><p class="eyebrow">Declare it</p><h2>Share your Day ${sd} card</h2><p class="muted" style="font-size:14px">A branded image for WhatsApp status, Instagram or Facebook. Movements spread when people declare who they're becoming.</p>
    <label class="f" for="sc-day">Day<select id="sc-day" data-act="scday">${Array.from({ length: 66 }, (_, i) => i + 1).filter(n => n <= Math.max(cd, 1)).map(n => `<option value="${n}" ${n === sd ? "selected" : ""}>Day ${n}${isDone(n) ? " ✓" : ""}</option>`).join("")}</select></label>
    <label class="f" for="sc-text">Your line (optional)<input type="text" id="sc-text" data-act="sctext" maxlength="90" value="${esc(shareText || (dayRec(sd).note || "").split("\n")[0].slice(0, 90))}" placeholder="One line about what shifted"></label>
    <div class="row"><button class="btn primary" data-act="sharecard" data-d="${sd}">${ICON.share}Share card</button><button class="btn sm ghost" data-act="dlcard" data-d="${sd}">${ICON.download}Save image</button></div></div>
    <canvas id="cardprev" class="cardprev" width="540" height="675" aria-label="Preview of your share card"></canvas></div></div>`;
  h += `<div class="grid2"><div class="card"><p class="eyebrow">Your standing</p><div style="margin-top:6px">${T.map((t, i) => `<div class="tier ${t.got ? "got" : ""}"><span class="dot">${t.got ? "✓" : i + 1}</span><span><b>${t.k}</b><span class="muted" style="display:block;font-size:13px">${t.d}</span></span></div>`).join("")}</div></div>
    <div class="card"><p class="eyebrow">How it grows</p><div class="arch" style="margin-top:10px"><div><b>O'Merlin Academy</b><span class="muted" style="font-size:13px">The parent organisation</span></div><span class="arrow">↓</span><div><b>66-Day Total Alignment Challenge</b><span class="muted" style="font-size:13px">The entry point: two systems, 12 laws</span></div><span class="arrow">↓</span><div><b>The Powerhouse Programme</b><span class="muted" style="font-size:13px">7 courses · 28 weeks · from purpose to legacy</span></div><span class="arrow">↓</span><div style="border-color:rgba(201,168,73,.5)"><b>Alignment Leaders</b><span class="muted" style="font-size:13px">Graduates who guide the next cohort</span></div></div></div></div>`;
  h += `<div class="card"><img class="lockup" src="icons/logo-lockup.jpg" alt="O'Merlin: Ignite Expression · Shape Your World" style="margin-bottom:18px"><p class="eyebrow">The manifesto</p><div class="manifesto" style="margin-top:14px">${MANIFESTO.map(s => `<section><h3>${esc(s.h)}</h3>${s.p ? s.p.map(p => `<p style="margin-top:8px">${esc(p)}</p>`).join("") : ""}${s.list ? `<ul style="margin-top:8px">${s.list.map(l => `<li>${esc(l)}</li>`).join("")}</ul>` : ""}</section>`).join("")}</div><div class="row" style="margin-top:18px"><button class="btn sm" data-act="copyman">${ICON.copy}Copy the manifesto</button></div></div>`;
  const invite = `I'm doing the 66-Day Total Alignment Challenge, a daily system for faith that lands. Days 1–7 are free: ${LINKS.landing}`;
  h += `<div class="card"><p class="eyebrow">Bring someone with you</p><p style="margin-top:6px">${esc(invite)}</p><div class="row" style="margin-top:12px"><button class="btn primary" data-act="invite" data-t="${esc(invite)}">${ICON.share}Send invite</button><a class="btn" href="${LINKS.group}" target="_blank" rel="noopener">Community group</a><a class="btn ghost" href="${LINKS.landing}" target="_blank" rel="noopener">Challenge page</a><a class="btn ghost" href="${LINKS.pay}" target="_blank" rel="noopener">Full access ($17)</a></div></div>`;
  return h;
}

/* ---------- share card (canvas) ---------- */
const markImg = new Image(); markImg.src = "icons/mark.png";
function wrap(ctx, text, maxW) { const ws = String(text).split(/\s+/); const lines = []; let line = ""; for (const w of ws) { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; } if (line) lines.push(line); return lines; }
function paintCard(cv, d, line) {
  const ctx = cv.getContext("2d"), W = cv.width, H = cv.height, k = W / 1080, law = lawOf(d), ph = phaseOf(d);
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#0e1b33"); g.addColorStop(1, "#070d1a"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rg = ctx.createRadialGradient(W * .85, H * .05, 10, W * .85, H * .05, W * .9); rg.addColorStop(0, "rgba(201,168,73,.28)"); rg.addColorStop(1, "rgba(201,168,73,0)"); ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgba(201,168,73,.16)"; ctx.lineWidth = 3 * k;
  for (let j = 0; j < 3; j++) { ctx.beginPath(); for (let x = 0; x <= W; x += 6) { const y = H * .84 + j * 34 * k + Math.sin(x / (95 * k) + j * .9) * 16 * k; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
  ctx.strokeStyle = "rgba(201,168,73,.55)"; ctx.lineWidth = 2 * k; ctx.strokeRect(36 * k, 36 * k, W - 72 * k, H - 72 * k);
  if (markImg.complete && markImg.naturalWidth) ctx.drawImage(markImg, 90 * k, 96 * k, 150 * k, 150 * k);
  ctx.fillStyle = "#c9a849"; ctx.font = `600 ${30 * k}px "Instrument Sans", sans-serif`; ctx.textBaseline = "alphabetic";
  ctx.fillText("THE ALIGNED", 268 * k, 158 * k); ctx.fillStyle = "#9ba4b7"; ctx.font = `500 ${24 * k}px "Instrument Sans", sans-serif`; ctx.fillText("O'MERLIN ACADEMY", 268 * k, 196 * k);
  ctx.fillStyle = "#f1d48a"; ctx.font = `700 ${200 * k}px "Playfair Display", Georgia, serif`; ctx.fillText(`Day ${d}`, 82 * k, 500 * k);
  ctx.fillStyle = "#efe8d8"; ctx.font = `500 ${42 * k}px "Instrument Sans", sans-serif`; ctx.fillText(`of 66  ·  Phase ${ph.n}: ${ph.name}`, 92 * k, 572 * k);
  const segW = (W - 184 * k) / 66; for (let i = 1; i <= 66; i++) { ctx.fillStyle = isDone(i) ? phaseOf(i).color : i <= d ? "rgba(201,168,73,.35)" : "rgba(255,255,255,.08)"; ctx.fillRect(92 * k + (i - 1) * segW, 616 * k, segW - 3 * k, 18 * k); }
  ctx.fillStyle = "#c9a849"; ctx.font = `600 ${28 * k}px "Instrument Sans", sans-serif`; ctx.fillText(`LAW ${lawIdx(d) + 1} OF 12  ·  ${law.side.toUpperCase()}`, 92 * k, 730 * k);
  ctx.fillStyle = "#efe8d8"; ctx.font = `700 ${66 * k}px "Playfair Display", Georgia, serif`;
  let y = 810 * k; wrap(ctx, law.name, W - 184 * k).slice(0, 2).forEach(l => { ctx.fillText(l, 92 * k, y); y += 78 * k; });
  if (line) { ctx.fillStyle = "#d8cfba"; ctx.font = `italic 500 ${44 * k}px "Playfair Display", Georgia, serif`; y += 18 * k; wrap(ctx, `\u201c${line}\u201d`, W - 184 * k).slice(0, 3).forEach(l => { ctx.fillText(l, 92 * k, y); y += 58 * k; }); }
  if (S.profile.name) { ctx.fillStyle = "#9ba4b7"; ctx.font = `500 ${32 * k}px "Instrument Sans", sans-serif`; ctx.fillText(`\u2014 ${S.profile.name}${S.profile.cohort ? ", " + S.profile.cohort : ""}`, 92 * k, Math.min(y + 14 * k, H - 170 * k)); }
  ctx.fillStyle = "#c9a849"; ctx.font = `700 ${38 * k}px "Instrument Sans", sans-serif`; ctx.fillText("#TheAligned", 92 * k, H - 96 * k);
  ctx.fillStyle = "#9ba4b7"; ctx.font = `500 ${28 * k}px "Instrument Sans", sans-serif`; const tag = "66-Day Total Alignment"; ctx.fillText(tag, W - 92 * k - ctx.measureText(tag).width, H - 98 * k);
}
async function drawShareCard(cv) {
  if (!cv) return; try { await document.fonts.ready; } catch (e) {}
  const d = +((($("#sc-day") || {}).value) || shareDay || curDay()), line = ($("#sc-text") || {}).value ?? shareText;
  paintCard(cv, d, line);
}
function cardBlob(d, line) {
  return new Promise(res => { const cv = document.createElement("canvas"); cv.width = 1080; cv.height = 1350; paintCard(cv, d, line); cv.toBlob(b => res(b), "image/png"); });
}
async function shareCard(d, line) {
  await document.fonts.ready.catch(() => {});
  const blob = await cardBlob(d, line), file = new File([blob], `the-aligned-day-${d}.png`, { type: "image/png" });
  const text = `Day ${d} of 66. ${lawOf(d).name}. #TheAligned #TotalAlignmentChallenge`;
  if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], text }); return; } catch (e) { if (e && e.name === "AbortError") return; } }
  download(blob, file.name); toast("Image saved. Post it with #TheAligned");
}

/* ---------- views: SETTINGS ---------- */
let confirmReset = false;
function vSettings() {
  const p = S.profile, lb = p.lastBackup;
  return `<div><p class="eyebrow">Settings</p><h1 style="margin-top:6px">Your setup</h1></div>
  <div class="card stack"><div class="grid2"><label class="f" for="st-name">First name<input type="text" id="st-name" data-act="prof" data-k="name" value="${esc(p.name)}" autocomplete="given-name"></label><label class="f" for="st-start">66-day challenge Day 1<input type="date" id="st-start" data-act="prof" data-k="start" value="${esc(p.start)}"></label><label class="f" for="st-cohort">Cohort (optional)<input type="text" id="st-cohort" data-act="prof" data-k="cohort" value="${esc(p.cohort)}" placeholder="e.g. Cohort 2"></label><label class="f" for="st-cur">Currency<select id="st-cur" data-act="prof" data-k="currency">${["GH₵", "₦", "$", "£", "€", "KSh", "R"].map(c => `<option ${p.currency === c ? "selected" : ""}>${c}</option>`).join("")}</select></label></div>
  <label class="check" for="st-unlock" style="border:0"><input type="checkbox" id="st-unlock" data-act="unlock" ${p.unlockAll ? "checked" : ""}><span class="box"><svg viewBox="0 0 16 16"><path d="M3 8.5l3.2 3L13 4.5"/></svg></span><span><b>Facilitator mode</b><span class="muted" style="display:block;font-size:13px">Opens every programme week and every challenge day so you can review or teach ahead. Leave it off for your own journey.</span></span></label></div>
  <div class="card stack"><div class="row" style="flex-wrap:nowrap">${glyph('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>')}<div><h3>Daily reminders</h3><p class="muted" style="font-size:14px">Add the 5:00 AM Power Hour and the 7:00 PM review to your phone's calendar for all 66 days. Your calendar app sends the alerts, even offline.</p></div></div><div><button class="btn" data-act="ics">${ICON.calendar}Add to my calendar</button></div></div>
  <div class="card stack"><div class="row" style="flex-wrap:nowrap">${glyph('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>')}<div><h3>Backup &amp; restore</h3><p class="muted" style="font-size:14px">Everything is stored on this device, and the app works without internet for the whole programme. ${lb ? `Last backup: ${fmtD(lb)}.` : "No backup yet."} Keep a backup file in WhatsApp, Google Drive or email, and restore it on a new phone.</p></div></div>
  <div class="row"><button class="btn primary" data-act="backup">${ICON.download}Download backup</button><label class="btn" for="imp-file" style="cursor:pointer">Restore from file<input type="file" id="imp-file" accept="application/json,.json" data-act="importfile" class="sr"></label></div>
  <p class="muted" style="font-size:13px">${storageOK ? "Saving on this device is working." : "This browser is blocking device storage. Turn off private browsing, then download a backup."}${persisted ? " Storage is protected from automatic clean-up." : ""}</p></div>
  <div class="card stack"><h3>App</h3><p class="muted" style="font-size:14px">${isStandalone() ? "You're using the installed app." : deferredInstall ? "Install it to open from your home screen, full-screen and offline." : isIOS() ? "On iPhone: tap the Share button in Safari, then Add to Home Screen." : "Use your browser's menu and choose Install app or Add to Home screen."}</p>
  <div class="row">${deferredInstall && !isStandalone() ? `<button class="btn primary" data-act="install">Install the app</button>` : ""}<button class="btn ghost" data-act="replayintro">Replay the welcome</button><button class="btn ghost" data-act="reset" style="border-color:${confirmReset ? "var(--bad)" : "var(--line)"};color:${confirmReset ? "var(--bad)" : "inherit"}">${confirmReset ? "Tap again to erase everything" : "Start over"}</button></div></div>
  <div class="card"><p class="muted" style="font-size:13px">The 12 law names follow the challenge page. Their one-line summaries and daily actions are written for this app in plain language. They're not quotations. The Powerhouse Programme text follows the master document. Version ${APP_VERSION}.</p></div>`;
}

/* ---------- files, print, calendar ---------- */
function download(blob, name) { const u = URL.createObjectURL(blob), a = document.createElement("a"); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); }
const dlText = (text, name) => download(new Blob([text], { type: "text/plain;charset=utf-8" }), name);
function printText(text) { $("#print").textContent = text; window.print(); }
function backup() {
  S.profile.lastBackup = todayStr(); touch("profile"); saveNow();
  download(new Blob([JSON.stringify({ app: "the-aligned", v: 1, saved: new Date().toISOString(), ...S }, null, 1)], { type: "application/json" }), `the-aligned-backup-${todayStr()}.json`);
  toast("Backup downloaded"); render(false);
}
function restore(json) {
  try { const j = JSON.parse(json); if (j.app !== "the-aligned") throw 0; DOCS.forEach(k => { if (j[k]) { S[k] = withDefaults(k, j[k]); touch(k); } }); S.profile.onboarded = true; saveNow(); selDay = null; location.hash = "today"; render(); toast("Backup restored"); }
  catch (err) { toast("That file isn't a backup from this app"); }
}
function ics() {
  const st = S.profile.start.replace(/-/g, ""), now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const ev = (id, t1, t2, sum, desc) => ["BEGIN:VEVENT", `UID:aligned-${id}-${st}@omerlin.academy`, `DTSTAMP:${now}`, `DTSTART:${st}T${t1}`, `DTEND:${st}T${t2}`, "RRULE:FREQ=DAILY;COUNT=66", `SUMMARY:${sum}`, `DESCRIPTION:${desc}`, "BEGIN:VALARM", "TRIGGER:-PT10M", "ACTION:DISPLAY", `DESCRIPTION:${sum}`, "END:VALARM", "END:VEVENT"].join("\r\n");
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//O'Merlin Academy//The Aligned//EN", "CALSCALE:GREGORIAN",
    ev("power", "050000", "063000", "Power Hour · The Aligned", "40 min worship and soaking prayer\\n30 min targeted reading in your field\\n20 min writing your top 3 objectives"),
    ev("review", "190000", "193000", "Evening review · The Aligned", "Financial audit\\nHonor one strategic relationship\\nReview the day and prepare tomorrow\\nComplete today in The Aligned app"),
    "END:VCALENDAR"].join("\r\n");
  download(new Blob([body], { type: "text/calendar" }), "the-aligned-66-days.ics"); toast("Open the file to add it to your calendar");
}

/* ---------- interactions ---------- */
let tToast;
function toast(t, action) {
  const el = $("#toast"); el.innerHTML = `<span>${esc(t)}</span>${action ? `<button type="button">${esc(action.label)}</button>` : ""}`;
  if (action) el.querySelector("button").onclick = action.fn;
  el.style.pointerEvents = action ? "auto" : "none";
  el.classList.add("on"); clearTimeout(tToast); tToast = setTimeout(() => el.classList.remove("on"), action ? 9000 : 2400);
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast("Copied"); }
  catch (e) { const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch (e2) {} ta.remove(); toast(ok ? "Copied" : "Copy blocked. Select the text and copy it"); }
}
function setDay(d, patch) { S.daily.days[d] = Object.assign(dayRec(d), patch); touch("daily"); }
function setWeek(key, patch) { S.prog.weeks[key] = Object.assign(wk(key), patch); touch("prog"); }
function addLog(list, item, cap = 400) { S.logs[list].unshift({ id: uidGen(), date: todayStr(), ...item }); S.logs[list] = S.logs[list].slice(0, cap); touch("logs"); render(false); toast("Added"); }
const val = id => ($("#" + id) || {}).value || "";

document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  const a = b.dataset.act;
  if (b.tagName === "INPUT" || b.tagName === "TEXTAREA" || b.tagName === "SELECT") return;
  if (a === "day") { const d = +b.dataset.d; if (d >= 1 && d <= 66) { selDay = d === curDay() ? null : d; render(false); } }
  else if (a === "sec") { secTab = b.dataset.k; render(false); }
  else if (a === "complete") { const d = +b.dataset.d; setDay(d, { done: true, doneAt: todayStr() }); buzz([18, 40, 18]); render(false); celebrate(d); }
  else if (a === "undone") { setDay(+b.dataset.d, { done: false }); render(false); }
  else if (a === "tpl") { setWeek(b.dataset.k, { ms: TEMPLATES[b.dataset.k] || "" }); render(false); const t = $("#ms"); if (t) t.focus(); }
  else if (a === "msdone") { const k = b.dataset.k; if (!msReady(k)) return; setWeek(k, { done: true, doneAt: todayStr() }); buzz([18, 40, 18]); render(false); celebrateWeek(k, WEEKS[wkIndex(k) + 1]); }
  else if (a === "msundo") { setWeek(b.dataset.k, { done: false }); render(false); }
  else if (a === "printms") { const k = b.dataset.k, w = WEEKS[wkIndex(k)]; printText(`${plain(w.week.mname).toUpperCase()}\nCourse ${w.c}, Week ${w.w}: ${w.week.title}\n${S.profile.name || ""}\n\n${wk(k).ms || ""}`); }
  else if (a === "tooltab") { toolTab = b.dataset.k; if (location.hash !== "#tools") { location.hash = "tools"; } else render(false); }
  else if (a === "addfin") { const amt = parseFloat(val("fi-amt")); if (!(amt > 0)) { toast("Enter an amount above zero"); return; } addLog("fin", { type: val("fi-type"), amt, note: val("fi-note").trim() }); }
  else if (a === "addhonor") { const n = val("ho-name").trim(); if (!n) { toast("Add who you honored"); return; } addLog("honor", { name: n, note: val("ho-note").trim() }); }
  else if (a === "addtime") { const hrs = parseFloat(val("ti-hrs")); if (!val("ti-act").trim() || !(hrs > 0)) { toast("Add the activity and its hours"); return; } addLog("time", { act: val("ti-act").trim(), cat: val("ti-cat"), hrs }, 600); }
  else if (a === "addreframe") { const x = val("rf-a").trim(), y = val("rf-b").trim(); if (!x || !y) { toast("Fill in both statements"); return; } addLog("reframes", { a: x, b: y }); }
  else if (a === "addcheckin") { const n = val("ci-note").trim(); if (!n) { toast("Write what you covered"); return; } addLog("checkins", { note: n }); }
  else if (a === "addmentee") { const n = val("me-name").trim(); if (!n) { toast("Add their name"); return; } addLog("mentees", { name: n, stage: val("me-stage") }); }
  else if (a === "del") { const l = b.dataset.l, removed = S.logs[l].find(x => x.id === b.dataset.id), idx = S.logs[l].indexOf(removed); S.logs[l] = S.logs[l].filter(x => x.id !== b.dataset.id); touch("logs"); render(false); toast("Deleted", { label: "Undo", fn: () => { S.logs[l].splice(idx, 0, removed); touch("logs"); render(false); $("#toast").classList.remove("on"); } }); }
  else if (a === "sharecard") shareCard(+b.dataset.d, route().view === "movement" ? val("sc-text").trim() : (dayRec(+b.dataset.d).note || "").split("\n")[0].slice(0, 90));
  else if (a === "dlcard") cardBlob(+val("sc-day"), val("sc-text").trim()).then(bl => { download(bl, `the-aligned-day-${val("sc-day")}.png`); toast("Image saved"); });
  else if (a === "invite") { const t = b.dataset.t; if (navigator.share) navigator.share({ text: t }).catch(() => {}); else copy(t); }
  else if (a === "copyman") copy("THE ALIGNED: A MANIFESTO\n\n" + MANIFESTO.map(s => s.h.toUpperCase() + "\n" + (s.p || []).join("\n") + (s.list ? s.list.map(l => "• " + l).join("\n") : "")).join("\n\n"));
  else if (a === "copycap") copy(capstoneText());
  else if (a === "dlcap") dlText(capstoneText(), "transformation-capstone.txt");
  else if (a === "printcap") printText(capstoneText());
  else if (a === "dljournal") dlText(journalText(), "powerhouse-documents.txt");
  else if (a === "printjournal") printText(journalText());
  else if (a === "backup") backup();
  else if (a === "ics") ics();
  else if (a === "install") doInstall();
  else if (a === "replayintro") onboarding(true);
  else if (a === "reset") {
    if (!confirmReset) { confirmReset = true; render(false); setTimeout(() => { confirmReset = false; if (route().view === "settings") render(false); }, 5000); return; }
    confirmReset = false; DOCS.forEach(k => { S[k] = clone(DEF[k]); }); saveNow(); location.hash = "today"; render(); toast("Everything was cleared"); onboarding();
  }
});
document.addEventListener("input", e => {
  const t = e.target, a = t.dataset && t.dataset.act; if (!a) return;
  if (a === "note") setDay(+t.dataset.d, { note: t.value });
  else if (a === "exnote") { const r = wk(t.dataset.k); r.ex[t.dataset.j] = Object.assign(r.ex[t.dataset.j] || {}, { n: t.value }); setWeek(t.dataset.k, { ex: r.ex }); }
  else if (a === "ms") {
    setWeek(t.dataset.k, { ms: t.value }); const wc = $("#ms-wc"); if (wc) wc.textContent = words(t.value) + " words";
    const btn = $("#ms-done"), hint = $("#ms-hint"), ok = msReady(t.dataset.k); if (btn) btn.disabled = !ok; if (hint) hint.textContent = ok ? "Ready when you are." : "Write at least a few honest lines (and change the outline) to complete it.";
  }
  else if (a === "cap") { S.prog.capstone[t.dataset.f] = t.value; touch("prog"); }
  else if (a === "partner") { S.logs.partner[t.dataset.k] = t.value; touch("logs"); }
  else if (a === "prof" && t.tagName === "INPUT" && t.type === "text") { S.profile[t.dataset.k] = t.value; touch("profile"); }
  else if (a === "sctext") { shareText = t.value; drawShareCard($("#cardprev")); }
});
document.addEventListener("change", e => {
  const t = e.target, a = t.dataset && t.dataset.act; if (!a) return;
  if (a === "tick") { const d = selDay || curDay(), r = dayRec(d), s = t.dataset.s; r[s] = Object.assign({}, r[s], { [t.dataset.i]: t.checked }); setDay(d, { [s]: r[s] }); if (t.checked) buzz(10); render(false); }
  else if (a === "ex") { const r = wk(t.dataset.k); r.ex[t.dataset.j] = Object.assign(r.ex[t.dataset.j] || {}, { d: t.checked }); setWeek(t.dataset.k, { ex: r.ex }); if (t.checked) buzz(10); render(false); }
  else if (a === "split") { S.logs.split[t.dataset.k] = Math.max(0, Math.min(100, Number(t.value) || 0)); touch("logs"); render(false); }
  else if (a === "menteestage") { const m = S.logs.mentees.find(x => x.id === t.dataset.id); if (m) { m.stage = t.value; touch("logs"); } }
  else if (a === "prof" && (t.type === "date" || t.tagName === "SELECT")) { if (t.value) { S.profile[t.dataset.k] = t.value; touch("profile"); selDay = null; } }
  else if (a === "unlock") { S.profile.unlockAll = t.checked; touch("profile"); }
  else if (a === "scday") { shareDay = +t.value; shareText = (dayRec(shareDay).note || "").split("\n")[0].slice(0, 90); render(false); }
  else if (a === "importfile") { const f = t.files && t.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => restore(String(rd.result)); rd.readAsText(f); t.value = ""; }
});

/* ---------- celebration ---------- */
function burst(host) {
  if (reduceMotion) return;
  const c = document.createElement("canvas"); host.appendChild(c); const x = c.getContext("2d"), dpr = Math.min(2, devicePixelRatio || 1);
  const W = c.width = innerWidth * dpr, H = c.height = innerHeight * dpr; c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px";
  const cols = ["#f1d48a", "#c9a849", "#efe8d8", "#9b7a2b"];
  const ps = Array.from({ length: 150 }, () => ({ x: W / 2, y: H * .42, vx: (Math.random() - .5) * 26 * dpr, vy: (-Math.random() * 22 - 6) * dpr, s: (3 + Math.random() * 6) * dpr, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: cols[(Math.random() * 4) | 0] }));
  let f = 0; (function tick() { x.clearRect(0, 0, W, H); ps.forEach(p => { p.vy += .55 * dpr; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); }); if (++f < 150) requestAnimationFrame(tick); else c.remove(); })();
}
function overlay(html, extra = "") {
  const o = document.createElement("div"); o.className = "overlay"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true");
  o.innerHTML = `<div class="card gold stack">${WAVES()}<img class="medal" src="icons/mark.png" alt="">${html}<div class="row" style="justify-content:center;position:relative">${extra}<button class="btn primary" data-close>Continue</button></div></div>`;
  document.body.appendChild(o); burst(o);
  const close = () => { o.style.transition = "opacity .25s"; o.style.opacity = "0"; setTimeout(() => o.remove(), 250); };
  o.addEventListener("click", ev => { if (ev.target === o || ev.target.closest("[data-close]")) close(); if (ev.target.closest("[data-act]")) close(); });
  document.addEventListener("keydown", function k(ev) { if (ev.key === "Escape") { close(); document.removeEventListener("keydown", k); } });
  o.querySelector("[data-close]").focus();
}
function celebrate(d) {
  const msg = d === 66 ? ["You are Aligned.", "Sixty-six days. The rhythm is now part of who you are. Your next step is to bring someone through it with you."]
    : d === 21 ? ["Structure is built.", "Phase 2 complete. From Day 22, excellence becomes identity."]
    : d === 7 ? ["Initiation complete.", "You've broken the first patterns. Phase 2 builds habits that stick."]
    : [`Day ${d} complete.`, `${streak()} day streak. ${66 - doneCount()} days to go.`];
  overlay(`<p class="eyebrow" style="position:relative">#TheAligned</p><h2 style="position:relative">${msg[0]}</h2><p class="muted" style="position:relative">${msg[1]}</p>`, `<button class="btn" data-act="sharecard" data-d="${d}">${ICON.share}Share</button>`);
}
function celebrateWeek(k, next) {
  const [c, w] = k.split("-");
  overlay(`<p class="eyebrow" style="position:relative">Course ${c} · Week ${w}</p><h2 style="position:relative">${esc(WEEKS[wkIndex(k)].week.mname)} complete</h2><p class="muted" style="position:relative">${next ? (w === "4" ? `Course ${c} is complete. Course ${next.c} is open: ${esc(next.course.title)}.` : `Week ${next.w} is open: ${esc(next.week.title)}.`) : "The full programme is complete. Open your Capstone to assemble the final document."}</p>`);
}

/* ---------- onboarding ---------- */
function onboarding(replay) {
  const spirit = LAWS.filter(l => l.src === "Selman"), engine = LAWS.filter(l => l.src === "Adelaja");
  const o = document.createElement("div"); o.className = "onb"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true"); o.setAttribute("aria-label", "Welcome to The Aligned");
  const slides = [
    `<img class="lockup" src="icons/logo-lockup.jpg" alt="O'Merlin: Ignite Expression · Shape Your World" style="animation:popIn .8s var(--spring) both"><p class="eyebrow">Welcome to</p><h1>The Aligned</h1><p class="muted">A daily system for faith that lands. Sixty-six days to align your spirit and your systems, then a 28-week road from purpose to legacy.</p>`,
    `<p class="eyebrow">The 66-Day Total Alignment Challenge</p><h2>Two systems. One unified path.</h2><div class="twosys"><div><b>The Spirit System</b><p class="muted" style="font-size:12px">Apostle Joshua Selman</p><ol>${spirit.map(l => `<li>${esc(l.name.replace("The Law of ", ""))}</li>`).join("")}</ol></div><div><b>The Systems Engine</b><p class="muted" style="font-size:12px">Pastor Sunday Adelaja</p><ol>${engine.map(l => `<li>${esc(l.name.replace("The Law of ", ""))}</li>`).join("")}</ol></div></div><p class="muted" style="font-size:14px">One law each day, with a Power Hour at 5:00 AM, an Execution Zone and an evening review.</p>`,
    `<p class="eyebrow">Then the deeper road</p><h2>The Powerhouse Programme</h2><div class="steps7">${PROGRAMME.courses.map(c => `<div><b>${c.n}</b>${esc(c.title)}</div>`).join("")}</div><p class="muted" style="font-size:14px">Each week's milestone opens the next. Everything stays on your phone and works offline.</p>`,
    `<img src="icons/mark.png" alt="" style="width:96px;height:96px"><h2>Let's begin</h2><div class="stack" style="width:100%;text-align:left"><label class="f" for="ob-name">Your first name<input type="text" id="ob-name" autocomplete="given-name" value="${esc(S.profile.name)}" placeholder="e.g. Isaac"></label><label class="f" for="ob-start">Day 1 of the challenge<input type="date" id="ob-start" value="${esc(S.profile.start)}"></label><label class="f" for="ob-file" style="font-size:13px">Moving from another phone? <span style="color:var(--gold-hi);cursor:pointer;text-decoration:underline">Restore a backup file</span><input type="file" id="ob-file" class="sr" accept="application/json,.json"></label></div>`
  ];
  o.innerHTML = `<div class="track">${slides.map(s => `<section class="slide">${s}</section>`).join("")}</div><div class="foot"><button class="btn ghost sm" data-ob="back">Back</button><div class="dots">${slides.map(() => "<i></i>").join("")}</div><button class="btn primary" data-ob="next">Next</button></div>`;
  document.body.appendChild(o);
  let i = 0; const n = slides.length, track = o.querySelector(".track");
  const go = j => { i = Math.max(0, Math.min(n - 1, j)); track.style.transform = `translateX(-${i * 100}%)`; o.querySelectorAll(".dots i").forEach((d, k) => d.classList.toggle("on", k === i)); o.querySelector('[data-ob="back"]').style.visibility = i ? "visible" : "hidden"; o.querySelector('[data-ob="next"]').textContent = i === n - 1 ? "Begin Day 1" : "Next"; if (i === n - 1) setTimeout(() => { const f = o.querySelector("#ob-name"); if (f && !f.value) f.focus(); }, 500); };
  const finish = () => {
    const name = o.querySelector("#ob-name").value.trim(); if (!name) { toast("Add your first name"); o.querySelector("#ob-name").focus(); return; }
    S.profile.name = name; S.profile.start = o.querySelector("#ob-start").value || todayStr(); S.profile.onboarded = true; touch("profile"); saveNow();
    o.style.transition = "opacity .4s"; o.style.opacity = "0"; setTimeout(() => o.remove(), 400); selDay = null; render(); toast(`Welcome to The Aligned, ${name}`);
  };
  o.addEventListener("click", e => { const b = e.target.closest("[data-ob]"); if (!b) return; if (b.dataset.ob === "back") go(i - 1); else if (i === n - 1) finish(); else go(i + 1); });
  o.querySelector("#ob-file").addEventListener("change", e => { const f = e.target.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { o.remove(); restore(String(rd.result)); }; rd.readAsText(f); });
  let x0 = null; track.addEventListener("touchstart", e => x0 = e.touches[0].clientX, { passive: true });
  track.addEventListener("touchend", e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1)); x0 = null; });
  o.addEventListener("keydown", e => { if (e.key === "ArrowRight" && e.target.tagName !== "INPUT") go(i + 1); if (e.key === "ArrowLeft" && e.target.tagName !== "INPUT") go(i - 1); });
  go(0); o.querySelector('[data-ob="next"]').focus();
  if (replay) { const close = document.createElement("button"); close.className = "btn sm ghost"; close.textContent = "Close"; close.style.cssText = "position:absolute;top:calc(14px + env(safe-area-inset-top));right:14px;z-index:2"; close.onclick = () => o.remove(); o.appendChild(close); }
}

/* ---------- PWA: install, offline, updates ---------- */
const APP_VERSION = "1.0.0";
let deferredInstall = null, persisted = false;
const isStandalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredInstall = e; $("#install-rail").hidden = false; if (["today", "settings"].includes(route().view)) render(false); });
window.addEventListener("appinstalled", () => { deferredInstall = null; $("#install-rail").hidden = true; toast("Installed. Open The Aligned from your home screen"); });
async function doInstall() { if (!deferredInstall) return; deferredInstall.prompt(); try { await deferredInstall.userChoice; } catch (e) {} deferredInstall = null; $("#install-rail").hidden = true; render(false); }
$("#install-rail").addEventListener("click", doInstall);
function netStatus() { const s = $("#status"); if (!s) return; s.classList.toggle("off", !navigator.onLine); s.querySelector("span").textContent = navigator.onLine ? (navigator.serviceWorker && navigator.serviceWorker.controller ? "Ready offline" : "Works offline") : "Offline · all saved on this device"; }
window.addEventListener("online", () => { netStatus(); });
window.addEventListener("offline", () => { netStatus(); toast("You're offline. Everything keeps working"); });
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").then(reg => {
      reg.addEventListener("updatefound", () => { const nw = reg.installing; nw && nw.addEventListener("statechange", () => { if (nw.state === "installed" && navigator.serviceWorker.controller) toast("A new version is ready", { label: "Update", fn: () => { saveNow(); nw.postMessage("skipWaiting"); } }); }); });
      netStatus();
    }).catch(() => {});
    const hadController = !!navigator.serviceWorker.controller; let reloaded = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => { netStatus(); if (!hadController || reloaded) return; reloaded = true; saveNow(); location.reload(); });
  });
}
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().then(p => persisted = p).catch(() => {});

/* ---------- boot ---------- */
loadLocal(); paint(false); netStatus();
(function splash() {
  const sp = $("#splash"), first = !sessionStorage.getItem("aligned.splash");
  try { sessionStorage.setItem("aligned.splash", "1"); } catch (e) {}
  const hide = () => { sp.classList.add("out"); setTimeout(() => sp.remove(), 500); if (!S.profile.onboarded && !S.profile.name) onboarding(); };
  setTimeout(hide, first && !reduceMotion ? 1100 : 0);
})();
