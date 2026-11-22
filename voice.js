/* The Aligned: Voice & Pen. Speak it, write it, learn a word. Part of the daily rhythm (Execution Zone).
   Loaded before app.js. It only uses app.js globals inside functions, after the app has started.
   Recordings are kept in this device's IndexedDB. They are never uploaded and are not in the backup file. */

const VP_X = 4; // index of the Voice & Pen item in RHYTHM.execution (data.js)

const VP_PROMPTS = [
  "What is one decision you made recently, and why did you make it?",
  "Explain something you know well to a complete beginner.",
  "What does it mean to be a steward and not a victim?",
  "Describe a time you changed your mind, and what changed it.",
  "What is the most useful habit you have, and why?",
  "Convince a friend to start a daily routine.",
  "What problem around you do you wish more people took seriously?",
  "Describe a person who taught you something important, and what they taught you.",
  "What does honesty look like in small things?",
  "Explain why time is capital.",
  "What is the hardest part of finishing what you start?",
  "Describe your ideal morning and why it works.",
  "What advice would you give your younger self?",
  "How do you decide what to say no to?",
  "What skill are you building, and how will you know you are improving?",
  "Explain the difference between being busy and being productive.",
  "Tell the story of a mistake and what it taught you.",
  "Why does accountability work better than willpower alone?",
  "What would you do with one extra hour every day?",
  "Describe a place that matters to you so well that someone wants to go there.",
  "What makes a good teacher?",
  "Explain why reading matters, to someone who does not read.",
  "What is the difference between a complaint and a calling?",
  "How do you handle criticism?",
  "What does it mean to honor someone without asking for anything?",
  "Describe a goal you are pursuing and its first three steps.",
  "What is one belief you hold that most people around you disagree with?",
  "Explain how you manage money, to someone who has never made a budget.",
  "What would make this week a win?",
  "Describe a moment you felt proud, and what led up to it.",
  "Why does consistency beat intensity?",
  "What does a good leader do when no one is watching?",
  "Summarise what you have learned in this challenge, as if telling a friend."
];

const VP_STRETCH = [
  "Say your answer out loud to one real person and ask whether your main point was clear.",
  "Rewrite an old message you sent: point first, then cut the padding.",
  "Explain this week's law to someone in under two minutes.",
  "Write a short message that matters (to a leader, a client or your team) using the full structure.",
  "Give a two-minute talk to a small group, or record one for a friend.",
  "Summarise an article or a sermon in three sentences, out loud.",
  "Lead a short discussion. Ask more questions than you answer.",
  "Write a one-page piece (a post, a letter or a lesson note), then cut it by a quarter.",
  "Present your best idea in three minutes, then ask for honest feedback."
];

const VP_MIC = '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>';
const VP_STOP = '<rect x="7" y="7" width="10" height="10" rx="2"/>';

function vpPrompt(d) {
  if (d % 2 === 0) return VP_PROMPTS[(d / 2 - 1) % VP_PROMPTS.length];
  const n = lawOf(d).name, k = Math.floor(d / 2) % 3;
  return k === 0 ? `Explain "${n}" to someone who has never heard of it, with one example from your own life.`
    : k === 1 ? `Where did you fall short on "${n}" recently, and what did it cost you?`
    : `How will you apply "${n}" tomorrow? Walk through it step by step.`;
}

/* ---------- recordings on this device (IndexedDB) ---------- */
function vpDB() {
  return new Promise((res, rej) => {
    if (!window.indexedDB) return rej(new Error("no indexedDB"));
    const q = indexedDB.open("aligned-voice", 1);
    q.onupgradeneeded = () => q.result.createObjectStore("clips", { keyPath: "day" });
    q.onsuccess = () => res(q.result);
    q.onerror = () => rej(q.error);
  });
}
function vpTx(mode, fn) {
  return vpDB().then(db => new Promise((res, rej) => {
    const t = db.transaction("clips", mode), r = fn(t.objectStore("clips"));
    t.oncomplete = () => { db.close(); res(r && r.result); };
    t.onerror = t.onabort = () => { db.close(); rej(t.error); };
  }));
}
const vpPutClip = (day, blob, secs, mime) => vpTx("readwrite", st => st.put({ day, blob, secs, mime, at: Date.now() }));
const vpGetClip = day => vpTx("readonly", st => st.get(day));
const vpDelClip = day => vpTx("readwrite", st => st.delete(day));
const vpClipDays = () => vpTx("readonly", st => st.getAllKeys()).then(k => (k || []).slice().sort((a, b) => a - b));
function vpWipe() { return vpTx("readwrite", st => st.clear()).catch(() => {}); }
const vpUrls = [];
const vpMakeUrl = blob => { const u = URL.createObjectURL(blob); vpUrls.push(u); return u; };
window.addEventListener("pagehide", () => vpUrls.splice(0).forEach(u => URL.revokeObjectURL(u)));

/* ---------- entries and numbers ---------- */
const vpE = d => S.voice.entries[d] || null;
const vpDoneList = () => Object.values(S.voice.entries).filter(e => e.done).sort((a, b) => a.day - b.day);
const vpPrep = e => (e.p1 ? 1 : 0) + (e.p2 ? 1 : 0) + (e.p3 ? 1 : 0);
const vpFpm = e => (e.secs >= 10 && e.fillers != null) ? e.fillers / (e.secs / 60) : null;
const vpNum = n => String(Math.round(n * 10) / 10);
const vpMean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const vpClock = s => `${Math.floor(s / 60)}:${pad(Math.floor(s % 60))}`;
function vpSet(d, patch) { S.voice.entries[d] = Object.assign({ day: d, date: todayStr() }, S.voice.entries[d], patch); touch("voice"); }

/* ---------- Today card ---------- */
function vpCard(d) {
  const e = vpE(d), done = !!(e && e.done);
  const fpm = e && vpFpm(e);
  return `<div class="card stack"><div class="row" style="flex-wrap:nowrap">${glyph(VP_MIC)}<div style="min-width:0"><p class="eyebrow">Voice &amp; Pen · 20 minutes</p>
    <h3 style="margin-top:4px">${done ? "Voice &amp; Pen done for Day " + d : "Speak it. Write it. Learn a word."}</h3>
    <p class="muted" style="margin-top:4px;font-size:14px">${esc(vpPrompt(d))}</p></div></div>
    <div class="row" style="align-items:center">${done
      ? `<span class="chip done">Done</span>${e.secs ? `<span class="chip num">${vpClock(e.secs)} spoken</span>` : ""}${fpm != null ? `<span class="chip num">${vpNum(fpm)} fillers/min</span>` : ""}<span class="chip num">PREP ${vpPrep(e)}/3</span><button class="btn sm ghost" data-vp="begin" data-d="${d}">Redo</button>`
      : `<button class="btn primary" data-vp="begin" data-d="${d}">${ICON.play}Begin Voice &amp; Pen</button><span class="muted" style="font-size:13px">Speak 60 seconds, write it, cut 20%, learn one word.</span>`}</div></div>`;
}

/* ---------- the guided session ---------- */
function vpSession(d) {
  const prompt = vpPrompt(d), wk = d % 7 === 0;
  const steps = ["speak", "write", "learn"].concat(wk ? ["week"] : [], ["close"]);
  const st = { step: 0, state: "idle", stream: null, mr: null, chunks: [], t0: 0, timer: null, url: null, blob: null, committed: false, secs: 0, keep: true, mime: "", denied: false, chimed: false, urls: [] };
  const hasMic = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  const e0 = vpE(d);
  if (e0 && e0.secs) { st.state = "review"; st.secs = e0.secs; if (e0.clip) vpGetClip(d).then(c => { if (c && c.blob) { st.url = vpMakeUrl(c.blob); st.committed = true; if (steps[st.step] === "speak" && st.state === "review") draw(); } }).catch(() => {}); }
  const o = document.createElement("div");
  o.className = "ph vp"; o.setAttribute("role", "dialog"); o.setAttribute("aria-modal", "true"); o.setAttribute("aria-label", "Voice and Pen");
  document.body.appendChild(o);
  const C = 2 * Math.PI * 120;
  const e = () => vpE(d) || {};

  const head = `<p class="vq">${esc(prompt)}</p>`;
  const speakHTML = () => {
    const en = e();
    if (st.state === "idle") return `<p class="eyebrow">Step 1 · Speak, about 60 seconds</p>${head}
      <div class="vprep" aria-label="PREP: Point, Reason, Example, Point"><span><b>P</b>oint</span><span><b>R</b>eason</span><span><b>E</b>xample</span><span><b>P</b>oint</span></div>
      <p class="muted">Take 30 seconds to think. Then answer out loud: your point first, one reason, one real example, and your point again.</p>
      ${!hasMic ? `<p class="muted" style="color:var(--warn)">Recording isn't available in this browser, so I'll just time you.</p>` : ""}
      <div class="row" style="justify-content:center"><button class="vrec" data-vp="rec" aria-label="${hasMic ? "Start recording" : "Start the timer"}">${SVG(VP_MIC, 1.6)}</button></div>
      <p class="muted" style="font-size:13px">Tap to start.${hasMic ? " Your recording stays on this device." : ""}</p>`;
    if (st.state === "rec") return `<p class="eyebrow">Step 1 · ${st.mr ? "Recording" : "Timing"}</p>${head}
      <div class="phring"><svg viewBox="0 0 260 260" aria-hidden="true"><circle cx="130" cy="130" r="120" fill="none" stroke="#26324c" stroke-width="10"/><circle id="vparc" cx="130" cy="130" r="120" fill="none" stroke="url(#rg3)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 130 130)"/><defs><linearGradient id="rg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1d48a"/><stop offset="1" stop-color="#c9a849"/></linearGradient></defs></svg><b id="vptime" class="num" role="timer" aria-live="off">0:00</b></div>
      <p class="muted"><i class="recdot"></i> ${st.mr ? "Recording" : "Timing"}. Aim for about 60 seconds.${st.denied ? " Microphone access is blocked, so this is timing only." : ""}</p>
      <div class="row" style="justify-content:center"><button class="btn primary big" data-vp="stop">${SVG(VP_STOP)}Stop</button></div>`;
    return `<p class="eyebrow">Step 1 · Review yourself</p>${head}
      <p class="muted num" style="font-size:14px">${vpClock(st.secs)} spoken.${st.url ? " Listen back, then answer honestly." : " Be honest with yourself."}</p>
      ${st.url ? `<audio controls src="${st.url}"></audio>` : ""}
      <div class="rvform">${[["p1", "I stated my point first"], ["p2", "I gave one real example"], ["p3", "I ended by repeating my point"]].map(([k, t]) => `<label class="check" for="vpc-${k}"><input type="checkbox" id="vpc-${k}" data-vpc="${k}" ${en[k] ? "checked" : ""}><span class="box"><svg viewBox="0 0 16 16"><path d="M3 8.5l3.2 3L13 4.5"/></svg></span><span>${t}</span></label>`).join("")}</div>
      <div class="vfill"><button data-vp="fm" aria-label="One fewer filler word">−</button><div style="text-align:center"><b class="num" id="vpf">${en.fillers || 0}</b><span class="muted" style="display:block;font-size:12px">filler words you heard (um, uh, you know)</span></div><button data-vp="fp" aria-label="One more filler word">+</button></div>
      ${st.blob ? `<label class="check" for="vpc-keep"><input type="checkbox" id="vpc-keep" data-vpc="keep" ${st.keep ? "checked" : ""}><span class="box"><svg viewBox="0 0 16 16"><path d="M3 8.5l3.2 3L13 4.5"/></svg></span><span>Keep this recording on this device</span></label>` : ""}
      <div class="row" style="justify-content:space-between;width:100%"><button class="btn ghost" data-vp="again">Record again</button><button class="btn primary" data-vp="next">Next: Write →</button></div>`;
  };
  const wc = t => words(t);
  const writeHTML = () => {
    const en = e(), txt = en.text || "", n = wc(txt), tgt = en.w0 ? Math.max(1, Math.round(en.w0 * 0.8)) : 0;
    return `<p class="eyebrow">Step 2 · Write</p><h1>Now write the same answer.</h1>
      <p class="muted">${en.w0 ? `You wrote ${en.w0} words. Cut about 20%, to ${tgt} words or fewer, without losing your point or your example.` : "Four to six sentences. Point first. Use specific words instead of vague ones."}</p>
      <div class="rvform"><textarea id="vp-text" data-vpf="text" placeholder="My point is…" style="min-height:170px">${esc(txt)}</textarea></div>
      <div class="row between"><span class="num muted" id="vp-wc">${n} words</span><span class="chip num" id="vp-tgt">${en.w0 ? (n <= tgt ? "On target" : (n - tgt) + " to cut") : ""}</span></div>
      <div class="row" style="justify-content:space-between;width:100%"><button class="btn ghost" data-vp="back">Back</button>${en.w0 ? `<button class="btn primary" data-vp="next">Next: Learn →</button>` : `<button class="btn primary" id="vp-lock" data-vp="lock" ${n < 15 ? "disabled" : ""}>Draft done: now cut 20%</button>`}</div>`;
  };
  const learnHTML = () => {
    const w = S.voice.words.find(x => x.day === d) || {};
    return `<p class="eyebrow">Step 3 · Learn</p><h1>One precise word.</h1>
      <p class="muted">Pick a word you met today, or one you want to own. Use it in a sentence so it sticks. Choosing the simpler, more exact word is what makes people sound articulate.</p>
      <div class="rvform"><input type="text" id="vp-word" data-vpf="word" placeholder="The word" value="${esc(w.word || "")}" autocomplete="off"><input type="text" id="vp-sent" data-vpf="sent" placeholder="My sentence using it" value="${esc(w.sent || "")}" autocomplete="off"></div>
      <div class="row" style="justify-content:space-between;width:100%"><button class="btn ghost" data-vp="back">Back</button><span class="row" style="gap:8px"><button class="btn ghost" data-vp="next">Skip</button><button class="btn primary" data-vp="next">Next →</button></span></div>`;
  };
  const weekHTML = () => {
    const en = e(), t = VP_STRETCH[Math.min(VP_STRETCH.length - 1, d / 7 - 1)];
    return `<p class="eyebrow">Weekly stretch · Day ${d}</p><h1>Take it into real life.</h1>
      <div class="action"><p class="eyebrow">This week's stretch</p><p style="margin-top:4px">${esc(t)}</p></div>
      <label class="check" for="vpc-stretch"><input type="checkbox" id="vpc-stretch" data-vpc="stretch" ${en.stretch ? "checked" : ""}><span class="box"><svg viewBox="0 0 16 16"><path d="M3 8.5l3.2 3L13 4.5"/></svg></span><span>I did it (or I will do it before the week ends)</span></label>
      <div id="vp-cmp" class="stack" style="gap:10px"><p class="muted" style="font-size:14px">Loading your recordings…</p></div>
      <div class="row" style="justify-content:space-between;width:100%"><button class="btn ghost" data-vp="back">Back</button><button class="btn primary" data-vp="next">Next →</button></div>`;
  };
  const loadCompare = () => {
    vpClipDays().then(async days => {
      const box = o.querySelector("#vp-cmp"); if (!box) return;
      if (days.length < 2) { box.innerHTML = `<p class="muted" style="font-size:14px">Keep your recordings for a few days, and this week's page will let you hear your first take next to your latest one.</p>`; return; }
      const a = await vpGetClip(days[0]), b = await vpGetClip(days[days.length - 1]);
      if (!o.isConnected || !a || !b) return;
      st.urls.push(a.blob, b.blob);
      box.innerHTML = `<p class="muted" style="font-size:14px">Listen to your first take, then your latest. Progress is easy to hear and hard to feel.</p><div><p class="eyebrow">First take · Day ${days[0]}</p><audio controls src="${vpMakeUrl(a.blob)}"></audio></div><div><p class="eyebrow">Latest take · Day ${days[days.length - 1]}</p><audio controls src="${vpMakeUrl(b.blob)}"></audio></div>`;
    }).catch(() => { const box = o.querySelector("#vp-cmp"); if (box) box.innerHTML = `<p class="muted" style="font-size:14px">Recordings can't be played in this browser.</p>`; });
  };
  const closeHTML = () => {
    const en = e(), w = S.voice.words.find(x => x.day === d), fpm = vpFpm(en);
    const bits = [en.secs ? `Spoken: ${vpClock(en.secs)}${fpm != null ? ` · ${vpNum(fpm)} fillers a minute` : ""}` : "", `PREP: ${vpPrep(en)} of 3`, en.w0 ? `Written: ${en.w0} words, cut to ${en.w1 != null ? en.w1 : en.w0}` : "", w && w.word ? `New word: ${w.word}` : ""].filter(Boolean);
    return `<p class="eyebrow">Done</p><h1>Day ${d}'s Voice &amp; Pen.</h1><div class="list rvlist">${bits.map(b => `<div><span>${esc(b)}</span></div>`).join("")}</div>
      <p class="muted">${fpm != null && fpm > 6 ? "Try a two-second pause instead of a filler word tomorrow." : "A short pause beats a filler word every time."}</p>
      <div class="row" style="justify-content:space-between;width:100%"><button class="btn ghost" data-vp="back">Back</button><button class="btn primary" data-vp="finish">Finish</button></div>`;
  };

  function draw() {
    const s = steps[st.step];
    const body = s === "speak" ? speakHTML() : s === "write" ? writeHTML() : s === "learn" ? learnHTML() : s === "week" ? weekHTML() : closeHTML();
    o.innerHTML = `${WAVES()}<button class="btn sm ghost phx" data-vp="close" aria-label="Close Voice and Pen">Close</button><div class="phin rvin vpin ${s === "speak" ? "c" : ""}"><p class="eyebrow" style="opacity:.8">Voice &amp; Pen · Day ${d} · ${st.step + 1} of ${steps.length}</p><div class="rvbar"><i style="width:${(st.step + 1) / steps.length * 100}%"></i></div>${body}</div>`;
    o.classList.add("rv-anim");
    if (s === "week") loadCompare();
    if (s === "write" && !reduceMotion) setTimeout(() => { const t = o.querySelector("#vp-text"); t && t.focus({ preventScroll: true }); }, 80);
  }

  /* recording */
  async function startRec() {
    chimeUnlock();
    if (st.url) { URL.revokeObjectURL(st.url); st.url = null; }
    st.blob = null; st.committed = false; st.chunks = []; st.chimed = false; st.mr = null; st.denied = false;
    if (hasMic) {
      try {
        st.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const m = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find(x => MediaRecorder.isTypeSupported(x));
        st.mr = m ? new MediaRecorder(st.stream, { mimeType: m }) : new MediaRecorder(st.stream);
        st.mime = st.mr.mimeType || m || "audio/webm";
        st.mr.ondataavailable = ev => { if (ev.data && ev.data.size) st.chunks.push(ev.data); };
        st.mr.onstop = onRecStop;
        st.mr.start();
      } catch (err) { st.denied = true; releaseStream(); st.mr = null; }
    }
    st.state = "rec"; st.t0 = Date.now(); lockScreen(true); draw(); st.timer = setInterval(tick, 200);
  }
  function releaseStream() { if (st.stream) { st.stream.getTracks().forEach(t => t.stop()); st.stream = null; } }
  function tick() {
    const s = (Date.now() - st.t0) / 1000, t = o.querySelector("#vptime"), a = o.querySelector("#vparc");
    if (t) t.textContent = vpClock(s); if (a) a.setAttribute("stroke-dashoffset", C * (1 - Math.min(1, s / 60)));
    if (s >= 60 && !st.chimed) { st.chimed = true; chime(); }
    if (s >= 180) stopRec();
  }
  function stopRec() {
    if (st.state !== "rec") return;
    clearInterval(st.timer); st.secs = Math.max(1, Math.round((Date.now() - st.t0) / 1000)); lockScreen(false);
    if (st.mr && st.mr.state !== "inactive") { st.mr.stop(); return; }
    afterStop();
  }
  function onRecStop() {
    st.blob = new Blob(st.chunks, { type: st.mime || "audio/webm" });
    st.url = st.blob.size ? vpMakeUrl(st.blob) : null; if (!st.blob.size) st.blob = null;
    releaseStream(); afterStop();
  }
  function afterStop() { st.state = "review"; vpSet(d, { prompt, secs: st.secs }); draw(); }
  function commitClip() {
    if (!st.blob || st.committed) return; st.committed = true;
    if (st.keep) vpPutClip(d, st.blob, st.secs, st.mime).then(() => { vpSet(d, { clip: true }); }).catch(() => toast("Couldn't save the recording on this device"));
    else vpDelClip(d).then(() => vpSet(d, { clip: false })).catch(() => {});
  }
  function saveWord() {
    const w = (o.querySelector("#vp-word") || {}).value, s = (o.querySelector("#vp-sent") || {}).value;
    if (w === undefined) return;
    S.voice.words = S.voice.words.filter(x => x.day !== d);
    if (String(w).trim()) S.voice.words.unshift({ id: uidGen(), day: d, date: todayStr(), word: String(w).trim(), sent: String(s || "").trim() });
    touch("voice");
  }
  function teardown() {
    clearInterval(st.timer); lockScreen(false);
    if (st.mr) { st.mr.onstop = null; try { if (st.mr.state !== "inactive") st.mr.stop(); } catch (err) {} }
    releaseStream(); document.removeEventListener("keydown", onKey);
  }
  function close(save) {
    if (save !== false) { if (steps[st.step] === "learn") saveWord(); commitClip(); }
    teardown(); o.classList.add("out"); setTimeout(() => o.remove(), 300); render(false);
  }
  const onKey = ev => { if (ev.key === "Escape") close(); };
  document.addEventListener("keydown", onKey);
  o.addEventListener("scroll", () => { if (o.scrollLeft) o.scrollLeft = 0; });

  o.addEventListener("click", ev => {
    const b = ev.target.closest("[data-vp]"); if (!b) return; const k = b.dataset.vp, s = steps[st.step];
    if (k === "close") close();
    else if (k === "rec") startRec();
    else if (k === "stop") stopRec();
    else if (k === "again") { if (st.url) { URL.revokeObjectURL(st.url); st.url = null; } st.blob = null; st.committed = false; st.state = "idle"; draw(); }
    else if (k === "fm" || k === "fp") { const n = Math.max(0, (e().fillers || 0) + (k === "fp" ? 1 : -1)); vpSet(d, { fillers: n }); const f = o.querySelector("#vpf"); if (f) f.textContent = n; buzz(8); }
    else if (k === "lock") { const en = e(); vpSet(d, { w0: wc(en.text || ""), w1: wc(en.text || "") }); draw(); }
    else if (k === "next") { if (s === "learn") saveWord(); if (s === "speak") commitClip(); st.step = Math.min(steps.length - 1, st.step + 1); draw(); }
    else if (k === "back") { if (s === "learn") saveWord(); st.step = Math.max(0, st.step - 1); draw(); }
    else if (k === "finish") {
      commitClip(); const en = e();
      vpSet(d, { prompt, done: true, doneAt: todayStr(), w1: en.w0 ? (en.w1 != null ? en.w1 : en.w0) : en.w1 });
      const r = dayRec(d); setDay(d, { x: Object.assign({}, r.x, { [VP_X]: true }) });
      buzz([18, 40, 18]); close(false); toast(`Voice & Pen done. ${vpDoneList().length} of 66 sessions`);
    }
  });
  o.addEventListener("change", ev => {
    const t = ev.target, k = t.dataset && t.dataset.vpc; if (!k) return;
    if (k === "keep") st.keep = t.checked; else vpSet(d, { [k]: t.checked });
    if (t.checked) buzz(8);
  });
  o.addEventListener("input", ev => {
    const t = ev.target, f = t.dataset && t.dataset.vpf; if (!f) return;
    if (f === "text") {
      const en = e(), n = wc(t.value); vpSet(d, en.w0 ? { text: t.value, w1: n } : { text: t.value });
      const c = o.querySelector("#vp-wc"); if (c) c.textContent = n + " words";
      const g = o.querySelector("#vp-tgt"), tgt = en.w0 ? Math.max(1, Math.round(en.w0 * 0.8)) : 0; if (g && en.w0) g.textContent = n <= tgt ? "On target" : (n - tgt) + " to cut";
      const l = o.querySelector("#vp-lock"); if (l) l.disabled = n < 15;
    }
  });
  draw();
  setTimeout(() => { const f = o.querySelector(".vrec,[data-vp=next]"); f && f.focus({ preventScroll: true }); }, 60);
}

/* ---------- Tools tab: your Voice & Pen log ---------- */
function vpTools() {
  const done = vpDoneList(), all = Object.values(S.voice.entries).sort((a, b) => b.day - a.day);
  const fp = done.map(vpFpm).filter(x => x != null), prep = done.map(vpPrep);
  const first = fp.length >= 6 ? vpMean(fp.slice(0, 3)) : null, last = fp.length >= 6 ? vpMean(fp.slice(-3)) : null;
  const recent = done.filter(e => vpFpm(e) != null).slice(-14), mx = Math.max(1, ...recent.map(vpFpm));
  const ad = activeDay();
  let h = `<div class="card stack"><div class="row" style="flex-wrap:nowrap">${glyph(VP_MIC)}<div style="min-width:0"><h3>Voice &amp; Pen</h3><p class="muted" style="font-size:14px;margin-top:2px">Each day: speak your answer in about 60 seconds using PREP (Point, Reason, Example, Point), write it, cut it by 20%, and learn one precise word. Your recordings stay on this device and are not in the backup file.</p></div></div>
    <div class="row"><button class="btn primary" data-vp="begin" data-d="${ad}">${ICON.play}${vpE(ad) && vpE(ad).done ? "Do it again" : "Begin today's session"}</button><a class="btn" href="#lesson-speaking">Read the lesson</a></div></div>`;
  h += `<div class="stats" style="grid-template-columns:repeat(2,1fr)"><div class="stat"><b class="num">${done.length}</b><span>sessions of 66</span></div><div class="stat"><b class="num">${fp.length ? vpNum(vpMean(fp)) : "–"}</b><span>fillers a minute (average)</span></div><div class="stat"><b class="num">${prep.length ? vpNum(vpMean(prep)) : "–"}<small style="font-size:14px"> / 3</small></b><span>PREP score (average)</span></div><div class="stat"><b class="num">${S.voice.words.length}</b><span>words learned</span></div></div>`;
  if (recent.length) h += `<div class="card"><p class="eyebrow">Fillers a minute, latest sessions</p>${first != null ? `<p class="muted" style="font-size:14px;margin-top:4px">First three sessions: ${vpNum(first)}. Latest three: ${vpNum(last)}.${last < first ? " You're getting cleaner." : ""}</p>` : ""}
    <div class="vpbars" role="img" aria-label="Filler words per minute for your latest sessions">${recent.map(e => { const v = vpFpm(e); return `<div title="Day ${e.day}: ${vpNum(v)} a minute"><i style="height:${Math.max(6, v / mx * 100)}%"></i><span class="num">${e.day}</span></div>`; }).join("")}</div></div>`;
  if (S.voice.words.length) h += `<div class="card"><h3>Words I own</h3><div class="list" style="margin-top:6px">${S.voice.words.map(w => `<div><span><b>${esc(w.word)}</b>${w.sent ? `<span class="muted" style="display:block;font-size:14px">${esc(w.sent)}</span>` : ""}<span class="muted" style="display:block;font-size:12px">Day ${w.day}</span></span></div>`).join("")}</div></div>`;
  h += `<div class="card"><h3>Sessions</h3>${all.length ? `<div class="list" style="margin-top:6px">${all.map(e => { const f = vpFpm(e); return `<div style="flex-direction:column;gap:8px"><div class="row between" style="width:100%"><b>Day ${e.day}${e.done ? "" : " · unfinished"}</b><span class="row" style="gap:6px">${e.secs ? `<span class="chip num">${vpClock(e.secs)}</span>` : ""}${f != null ? `<span class="chip num">${vpNum(f)}/min</span>` : ""}<span class="chip num">PREP ${vpPrep(e)}/3</span></span></div>
      <span class="muted" style="font-size:14px">${esc(e.prompt || vpPrompt(e.day))}</span>
      ${e.text ? `<details><summary class="muted" style="cursor:pointer;font-size:14px">${e.w0 ? `Written: ${e.w0} → ${e.w1 != null ? e.w1 : e.w0} words` : "My written answer"}</summary><p style="margin-top:8px;white-space:pre-wrap;font-size:15px">${esc(e.text)}</p></details>` : ""}
      ${e.clip ? `<div class="row" style="gap:8px"><button class="btn sm" data-vp="play" data-d="${e.day}">${ICON.play}Play recording</button><button class="btn sm ghost" data-vp="delclip" data-d="${e.day}">Delete recording</button></div>` : ""}</div>`; }).join("")}</div>` : `<div class="empty">No sessions yet. Begin today's session above.</div>`}</div>`;
  return h;
}

/* ---------- companion lesson: Speaking & Writing ---------- */
function vpLessonCard() {
  return `<a class="card" href="#lesson-speaking"><div class="row" style="flex-wrap:nowrap">${glyph(VP_MIC)}<div style="min-width:0"><p class="eyebrow">Companion lesson · open to everyone</p><h3 style="margin-top:4px">Speak and write clearly</h3><p class="muted" style="margin-top:2px;font-size:14px">The PREP structure and three other frameworks, plus the daily Voice &amp; Pen practice that builds them. About 8 minutes to read. →</p></div></div></a>`;
}
function vpLesson() {
  const sec = (t, body) => `<div class="card"><h3>${t}</h3><div class="prose" style="margin-top:10px">${body}</div></div>`;
  let h = `<a class="back" href="#programme">← The programme</a><div class="course-hero">${glyph(VP_MIC, true)}<div><p class="eyebrow">Companion lesson · Course 6 skill</p><h1 style="margin-top:4px">Speak and write clearly</h1></div></div>`;
  h += sec("Why this comes first", `<p>Voice follows proof, but proof that nobody can follow does not travel. Course 6 asks you to teach, document and speak in public. This lesson gives you the structure to do that, and Voice &amp; Pen gives you daily practice.</p><p>Being articulate is three skills: <strong>thinking clearly</strong>, <strong>structuring what you say</strong> and <strong>delivering it well</strong>. If you cannot state your point in one sentence, the problem is not your delivery. It is your thinking, so fix that first.</p>`);
  h += `<div class="card gold">${WAVES()}<p class="eyebrow">The everyday framework</p><h2 style="margin-top:6px;position:relative">PREP: Point, Reason, Example, Point</h2>
    <div class="prose" style="margin-top:10px;position:relative"><ol><li><strong>Point.</strong> Say your answer in one sentence.</li><li><strong>Reason.</strong> Say why, in one or two sentences.</li><li><strong>Example.</strong> Give one concrete case, story or number.</li><li><strong>Point.</strong> Repeat your takeaway in a sentence.</li></ol>
    <p><em>Why should I wake up early?</em></p><p><strong>Point:</strong> an early hour gives you one protected hour. <strong>Reason:</strong> nobody has made a demand on you yet. <strong>Example:</strong> when I started a 5 AM hour, I finished my planning before the phone rang once. <strong>Point:</strong> so an early hour is the cheapest way to take charge of the day.</p>
    <p>Use PREP for impromptu questions, meetings, explanations and short messages. It stops rambling because you commit to a conclusion before you start explaining.</p></div></div>`;
  h += sec("Three more frameworks for specific jobs", `<ul><li><strong>The Pyramid.</strong> Lead with your conclusion, then group your supporting arguments underneath it. Best for reports, proposals and busy readers who need the answer first.</li><li><strong>What? So what? Now what?</strong> Say what happened, why it matters, and what should happen next. Best for updates and on-the-spot answers.</li><li><strong>Past, Present, Future.</strong> Where it began, where it stands, where it is going. Best for telling a story, introducing yourself or reporting progress.</li></ul>`);
  h += sec("Delivery: what makes you sound clear", `<ul><li><strong>Pause instead of filling silence.</strong> A two-second pause sounds more confident than "um" or "you know".</li><li><strong>Choose the simpler word.</strong> Articulate people are the ones the listener never has to ask to repeat.</li><li><strong>Slow down at your point.</strong> Say the main sentence a little slower than the rest.</li><li><strong>Look for the person, not the page.</strong> Speak to one listener at a time.</li></ul>`);
  h += sec("Writing: the same clarity on paper", `<ul><li><strong>Point first.</strong> Put the answer in the opening sentence, not the last one.</li><li><strong>Cut 20%.</strong> After your first draft, remove padding and repeated ideas without losing the point or the example.</li><li><strong>Use specific words.</strong> Replace "things", "stuff" and "very" with the exact word.</li><li><strong>Read it aloud.</strong> Anywhere you stumble, a reader will too.</li></ul>`);
  h += sec("The practice that makes it stick", `<p>The frameworks only work with repetition. That is why Voice &amp; Pen sits in your daily rhythm:</p><ol><li><strong>Speak</strong> a 60-second answer in PREP and listen back.</li><li><strong>Write</strong> the same answer, then cut it by 20%.</li><li><strong>Learn</strong> one precise word and use it in a sentence.</li></ol><p>Once a week there is a stretch task that takes it into real life. After a month, compare your first recording with your latest. Progress is easy to hear and hard to feel.</p>`);
  h += sec("Self-check", `<ul><li>Can I state my point in one sentence before I start?</li><li>Did I give one real example, not just an opinion?</li><li>Did I end by repeating my takeaway?</li><li>How many filler words did I use, compared with last week?</li><li>Could I cut a fifth of my draft and lose nothing?</li></ul>`);
  h += `<div class="row"><button class="btn primary" data-vp="begin" data-d="${activeDay()}">${ICON.play}Begin today's Voice &amp; Pen</button><a class="btn" href="#tools" data-act="tooltab" data-k="voice">See my progress</a></div>`;
  return h;
}

/* buttons on Today and in Tools (the guided session handles its own buttons) */
document.addEventListener("click", ev => {
  const b = ev.target.closest("[data-vp]"); if (!b || b.closest(".vp")) return; const k = b.dataset.vp, d = +b.dataset.d;
  if (k === "begin") vpSession(d);
  else if (k === "play") {
    vpGetClip(d).then(c => {
      if (!c || !c.blob) { toast("No recording for that day on this device"); return; }
      b.outerHTML = `<audio controls autoplay src="${vpMakeUrl(c.blob)}"></audio>`;
    }).catch(() => toast("Couldn't open the recording"));
  } else if (k === "delclip") vpDelClip(d).then(() => { vpSet(d, { clip: false }); render(false); toast("Recording deleted"); }).catch(() => toast("Couldn't delete the recording"));
});
