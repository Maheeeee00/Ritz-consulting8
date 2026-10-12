/* =========================================================
   Ritz Consulting — shared script
   ---------------------------------------------------------
   SETTINGS: fill these in before going live.
   formEndpoint : where enquiries & assessment results are sent
                  (e.g. a free Formspree form URL: https://formspree.io/f/xxxxxxx)
   bookingUrl   : online meeting booking link (e.g. Calendly / Microsoft Bookings)
   ga4Id        : Google Analytics 4 measurement ID (e.g. G-XXXXXXXXXX)
   ========================================================= */
const RITZ = {
  formEndpoint: '',
  bookingUrl: '',
  ga4Id: '',
  homeTz: 'Australia/Melbourne',
  hours: [8, 19] // consultant availability, Melbourne time, Mon–Fri
};

/* ---------- analytics ---------- */
if (RITZ.ga4Id) {
  const s = document.createElement('script');
  s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + RITZ.ga4Id;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag('js', new Date()); gtag('config', RITZ.ga4Id);
}
const track = (name, params) => { try { window.gtag && gtag('event', name, params || {}); } catch (e) {} };

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const ICON = n => { const t = document.getElementById('i-' + n); return t ? t.innerHTML : ''; };
const data = id => { const el = document.getElementById(id); return el ? JSON.parse(el.textContent) : null; };

/* ---------- reveal + counters ---------- */
function runCount(el) {
  if (el.dataset.done) return; el.dataset.done = 1;
  const to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0), p = el.dataset.prefix || '', s = el.dataset.suffix || '';
  let t0 = null;
  const step = t => { t0 ??= t; const k = Math.min((t - t0) / 1600, 1), v = to * (1 - Math.pow(1 - k, 3));
    el.textContent = p + v.toFixed(dec) + s; if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('show');
  if (e.target.classList.contains('count')) runCount(e.target);
  $$('.count', e.target).forEach(runCount);
  io.unobserve(e.target);
}), { threshold: .15 });
$$('.reveal, .count').forEach(el => io.observe(el));

/* ---------- header, progress, back to top ---------- */
const nav = $('#nav'), bar = $('#progress'), top_ = $('#toTop');
addEventListener('scroll', () => {
  const y = scrollY;
  nav && nav.classList.toggle('scrolled', y > 10);
  top_ && top_.classList.toggle('show', y > 700);
  if (bar) bar.style.width = (y / (document.documentElement.scrollHeight - innerHeight) * 100) + '%';
}, { passive: true });
top_ && top_.addEventListener('click', e => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); });
$$('.menu a').forEach(a => a.addEventListener('click', () => { const t = $('#navtoggle'); if (t) t.checked = false; }));

/* ---------- booking links ---------- */
$$('[data-booking]').forEach(a => {
  if (RITZ.bookingUrl) { a.href = RITZ.bookingUrl; a.target = '_blank'; a.rel = 'noopener'; }
  a.addEventListener('click', () => track('book_meeting_click'));
});

/* ---------- forms (enquiry, assessment lead, newsletter) ---------- */
$$('form.js-form').forEach(f => f.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = $('button[type=submit]', f); if (btn) { btn.disabled = true; btn.dataset.t = btn.innerHTML; btn.textContent = 'Sending…'; }
  const payload = Object.fromEntries(new FormData(f).entries());
  payload.page = location.pathname; payload.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
    if (RITZ.formEndpoint) {
      const r = await fetch(RITZ.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error('send failed');
    } else console.info('[Ritz] Demo mode – set RITZ.formEndpoint in assets/js/main.js to receive this:', payload);
    track('generate_lead', { form: f.dataset.name || 'form' });
    const card = f.closest('.form') || f; card.classList.add('sent');
    if (f.classList.contains('news')) { btn.textContent = '✓'; }
  } catch (err) {
    alert('Sorry, your message could not be sent. Please email us instead.');
    if (btn) { btn.disabled = false; btn.innerHTML = btn.dataset.t; }
  }
}));

/* ---------- time helpers ---------- */
const fmtTime = (tz, d = new Date()) => d.toLocaleTimeString('en-AU', { timeZone: tz, hour: 'numeric', minute: '2-digit' });
const fmtDay = (tz, d = new Date()) => d.toLocaleDateString('en-AU', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short' });
function tzOffset(tz, d = new Date()) {
  const a = new Date(d.toLocaleString('en-US', { timeZone: tz })), b = new Date(d.toLocaleString('en-US', { timeZone: 'UTC' }));
  return (a - b) / 60000;
}
function clocks() {
  $$('[data-tz]').forEach(el => {
    const tz = el.dataset.tz === 'local' ? undefined : el.dataset.tz;
    $('b', el).textContent = fmtTime(tz); const s = $('span', el); if (s) s.textContent = fmtDay(tz);
  });
}
if ($('[data-tz]')) { clocks(); setInterval(clocks, 30000); }

const tzNote = $('#tz-note');
if (tzNote) {
  const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const diff = (-new Date().getTimezoneOffset()) - tzOffset(RITZ.homeTz);
  const conv = h => { let m = h * 60 + diff, day = ''; if (m < 0) { m += 1440; day = ' (previous day)'; } if (m >= 1440) { m -= 1440; day = ' (next day)'; }
    const hh = Math.floor(m / 60), mm = String(Math.round(m % 60)).padStart(2, '0'), ap = hh >= 12 ? 'pm' : 'am';
    return ((hh % 12) || 12) + ':' + mm + ' ' + ap + day; };
  tzNote.innerHTML = diff === 0
    ? 'Our consultants are available <b>8:00 am – 7:00 pm</b> your time, Monday to Friday.'
    : 'Our consultants are available 8:00 am – 7:00 pm Melbourne time — that’s <b>' + conv(RITZ.hours[0]) + ' – ' + conv(RITZ.hours[1]) + '</b> in your time zone (' + local.replace(/_/g, ' ') + ').';
}

/* ---------- goal selector ---------- */
const goals = data('goal-data');
if (goals) {
  const out = $('#goal-result');
  const show = i => {
    const g = goals[i];
    $$('.goal').forEach((b, j) => b.classList.toggle('on', j === i));
    out.innerHTML = '<div class="fadein"><small>Recommended capability</small><h3>' + g.service + '</h3><p>' + g.text + '</p><ul>' +
      g.points.map(p => '<li><svg class="i" viewBox="0 0 24 24">' + ICON('check') + '</svg>' + p + '</li>').join('') +
      '</ul><div class="actions"><a class="btn btn-gold" href="' + g.url + '">Explore ' + g.short + ' <svg class="i" viewBox="0 0 24 24">' + ICON('arrow') + '</svg></a>' +
      '<a class="btn btn-outline" href="contact.html">Discuss Your Business</a></div></div>';
    track('goal_select', { goal: g.goal });
  };
  $$('.goal').forEach((b, i) => b.addEventListener('click', () => show(i)));
  show(0);
}

/* ---------- industry selector ---------- */
const inds = data('ind-data');
if (inds) {
  const panel = $('#ind-panel');
  const show = i => {
    const d = inds[i];
    $$('.ind-tab').forEach((b, j) => b.classList.toggle('on', j === i));
    panel.classList.remove('fadein'); void panel.offsetWidth; panel.classList.add('fadein');
    panel.innerHTML = '<div class="ph" style="--bg:url(\'' + d.img + '\')"></div><div class="txt"><span class="eyebrow">Industry</span><h3>' + d.title + '</h3><p>' + d.intro + '</p><ul>' +
      d.ch.map(c => '<li><svg class="i" viewBox="0 0 24 24">' + ICON('check') + '</svg>' + c + '</li>').join('') +
      '</ul><a class="btn btn-navy" href="' + d.url + '">See how we help <svg class="i" viewBox="0 0 24 24">' + ICON('arrow') + '</svg></a></div>';
  };
  $$('.ind-tab').forEach((b, i) => b.addEventListener('click', () => show(i)));
  show(0);
}

/* ---------- interactive 12-level framework ---------- */
const FW = data('fw-data');
const meter = (n, total = 12) => Array.from({ length: total }, (_, k) => '<i class="' + (k < n ? 'on' : '') + '"></i>').join('');
if (FW && $('#fw-panel')) {
  const panel = $('#fw-panel');
  const box = (t, ic, arr) => '<div class="fw-box"><h4><svg class="i" viewBox="0 0 24 24">' + ICON(ic) + '</svg>' + t + '</h4><ul>' + arr.map(x => '<li>' + x + '</li>').join('') + '</ul></div>';
  const show = (i, scroll) => {
    const L = FW[i];
    $$('.lvl').forEach((b, j) => b.classList.toggle('on', j === i));
    panel.innerHTML = '<div class="fw-head"><small>Level ' + (i + 1) + ' of 12 · ' + L.stage + '</small><h3>' + L.name + '</h3><div class="fw-meter">' + meter(i + 1) + '</div></div>' +
      '<div class="fw-body fadein">' + box('Typical challenges', 'alert', L.ch) + box('What should be in place', 'check', L.place) +
      box('Key KPIs', 'bar', L.kpi) +
      '<div class="fw-box"><h4><svg class="i" viewBox="0 0 24 24">' + ICON('compass') + '</svg>Related capability</h4><ul><li><a class="link" href="' + L.url + '">' + L.svc + ' <svg class="i" viewBox="0 0 24 24">' + ICON('arrow') + '</svg></a></li></ul></div>' +
      '<div class="fw-help"><h4 style="font:700 .8rem system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--navy);margin-bottom:6px">How Ritz helps</h4><p>' + L.help + '</p></div>' +
      '<div class="fw-foot">' + (i > 0 ? '<button class="btn btn-line" data-go="' + (i - 1) + '">Previous level</button>' : '<span></span>') +
      (i < 11 ? '<button class="btn btn-navy" data-go="' + (i + 1) + '">Next step: ' + FW[i + 1].name + ' <svg class="i" viewBox="0 0 24 24">' + ICON('arrow') + '</svg></button>'
              : '<a class="btn btn-gold" href="contact.html">Talk to a Consultant <svg class="i" viewBox="0 0 24 24">' + ICON('arrow') + '</svg></a>') + '</div></div>';
    $$('[data-go]', panel).forEach(b => b.addEventListener('click', () => show(+b.dataset.go, true)));
    if (scroll && innerWidth < 1025) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(null, '', '#level-' + (i + 1));
    track('framework_level', { level: i + 1 });
  };
  $$('.lvl').forEach((b, i) => b.addEventListener('click', () => show(i, true)));
  const m = location.hash.match(/level-(\d+)/);
  show(m ? Math.min(11, Math.max(0, m[1] - 1)) : 0, false);
}

/* ---------- business growth assessment ---------- */
const Q = data('quiz-data');
if (Q && $('#quiz')) {
  const root = $('#quiz'), answers = new Array(Q.questions.length).fill(null);
  let cur = 0;
  const render = () => {
    const q = Q.questions[cur];
    root.innerHTML = '<div class="quiz-top"><small>Question ' + (cur + 1) + ' of ' + Q.questions.length + '</small><div class="bar"><i style="width:' + (cur / Q.questions.length * 100) + '%"></i></div><small>' + Math.round(cur / Q.questions.length * 100) + '%</small></div>' +
      '<div class="quiz-body fadein"><span class="area">' + q.area + '</span><h3>' + q.q + '</h3><div class="opts">' +
      q.opts.map((o, j) => '<button class="opt' + (answers[cur] === j ? ' on' : '') + '" data-j="' + j + '"><i></i>' + o + '</button>').join('') +
      '</div><div class="quiz-nav">' + (cur > 0 ? '<button class="btn btn-line" id="qback">Back</button>' : '<span></span>') +
      '<button class="btn btn-navy" id="qnext"' + (answers[cur] === null ? ' disabled style="opacity:.45;pointer-events:none"' : '') + '>' + (cur === Q.questions.length - 1 ? 'See my result' : 'Next') +
      ' <svg class="i" viewBox="0 0 24 24">' + ICON('arrow') + '</svg></button></div></div>';
    $$('.opt', root).forEach(b => b.addEventListener('click', () => { answers[cur] = +b.dataset.j; render(); }));
    const n = $('#qnext', root), bk = $('#qback', root);
    n && n.addEventListener('click', () => { if (answers[cur] === null) return; if (cur < Q.questions.length - 1) { cur++; render(); } else result(); });
    bk && bk.addEventListener('click', () => { cur--; render(); });
    if (cur === 0) track('assessment_start');
  };
  const result = () => {
    const total = answers.reduce((a, b) => a + b, 0), max = Q.questions.length * 3;
    const level = Math.max(1, Math.min(12, Math.round(total / max * 11) + 1));
    const name = Q.levels[level - 1];
    const ranked = Q.questions.map((q, i) => ({ q, s: answers[i] })).sort((a, b) => a.s - b.s).slice(0, 3);
    const stage = level <= 4 ? 'Foundation stage' : level <= 8 ? 'Performance stage' : 'Growth & Value stage';
    root.innerHTML = '<div class="result-head fadein"><small>Your approximate business growth level</small><h3>Level ' + level + ': ' + name + '</h3><p>' + stage + ' — ' + Q.stageText[level <= 4 ? 0 : level <= 8 ? 1 : 2] + '</p><div class="fw-meter">' + meter(level) + '</div></div>' +
      '<div class="quiz-body"><h3 style="font-size:1.4rem">Your top areas to improve</h3><div class="improve">' +
      ranked.map(r => '<div class="imp"><div class="sc">' + r.s + '/3</div><div><b>' + r.q.area + '</b><span>' + r.q.tip + '</span></div><a class="link" href="' + r.q.url + '">' + r.q.svc + ' <svg class="i" viewBox="0 0 24 24">' + ICON('arrow') + '</svg></a></div>').join('') +
      '</div><div class="form" style="box-shadow:none;padding:28px"><div class="form-fields"><h3>Get your full results and talk to a consultant</h3><p>We’ll send a summary of your result and suggest practical next steps for your business. No obligation.</p>' +
      '<form class="js-form" data-name="growth-assessment"><input type="hidden" name="form" value="Business Growth Assessment"><input type="hidden" name="result_level" value="Level ' + level + ' – ' + name + '"><input type="hidden" name="score" value="' + total + '/' + max + '"><input type="hidden" name="areas_to_improve" value="' + ranked.map(r => r.q.area).join(', ') + '">' +
      '<div class="row"><div class="field"><label>Full name</label><input name="name" required></div><div class="field"><label>Work email</label><input type="email" name="email" required></div></div>' +
      '<div class="row"><div class="field"><label>Company</label><input name="company"></div><div class="field"><label>Country</label><input name="country" placeholder="e.g. Australia, Singapore, UK"></div></div>' +
      '<button type="submit" class="btn btn-gold">Send My Results <svg class="i" viewBox="0 0 24 24">' + ICON('arrow') + '</svg></button></form></div>' +
      '<div class="form-ok"><div class="ic"><svg class="i" viewBox="0 0 24 24">' + ICON('check') + '</svg></div><h3>Thank you — we’ll be in touch shortly.</h3><p>A Ritz consultant will review your result and contact you within one business day.</p></div></div>' +
      '<div class="actions" style="margin-top:22px"><a class="btn btn-line" href="framework.html#level-' + level + '">Explore Level ' + level + ' in the framework</a><button class="btn btn-line" id="qagain">Retake assessment</button></div></div>';
    $('form.js-form', root).addEventListener('submit', async e => {
      e.preventDefault(); const f = e.target, payload = Object.fromEntries(new FormData(f).entries());
      payload.answers = Q.questions.map((q, i) => q.area + ': ' + q.opts[answers[i]]).join(' | ');
      try { if (RITZ.formEndpoint) { const r = await fetch(RITZ.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) }); if (!r.ok) throw 0; }
        else console.info('[Ritz] Demo mode – assessment lead:', payload);
        f.closest('.form').classList.add('sent'); track('generate_lead', { form: 'growth-assessment', level });
      } catch (err) { alert('Sorry, this could not be sent. Please try again or contact us directly.'); }
    });
    $('#qagain', root).addEventListener('click', () => { answers.fill(null); cur = 0; render(); });
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    track('assessment_complete', { level });
  };
  render();
}

/* ---------- insights filter ---------- */
$$('.filter').forEach(b => b.addEventListener('click', () => {
  $$('.filter').forEach(x => x.classList.toggle('on', x === b));
  const c = b.dataset.cat;
  $$('.post').forEach(p => p.classList.toggle('hide', c !== 'all' && p.dataset.cat !== c));
}));

/* ---------- price list search ---------- */
const feeQ = document.getElementById('fee-q');
if (feeQ) {
  $$('.ftable td').forEach(td => td.dataset.orig = td.innerHTML);
  const run = () => {
    const q = feeQ.value.trim().toLowerCase();
    $$('.fsec').forEach(sec => {
      const t = $('.ftable', sec); if (!t) return;
      let any = false;
      const title = $('thead th', sec).textContent.toLowerCase();
      $$('tbody tr', sec).forEach(tr => {
        const tds = $$('td', tr); tds.forEach(td => td.innerHTML = td.dataset.orig);
        if (!q) { tr.hidden = false; return; }
        const hit = tr.classList.contains('frow') && (tr.textContent.toLowerCase().includes(q) || title.includes(q));
        tr.hidden = !hit; if (hit) any = true;
        if (hit && tr.textContent.toLowerCase().includes(q)) {
          const td = tds[0], esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          if (!td.querySelector('details')) td.innerHTML = td.innerHTML.replace(new RegExp('(' + esc + ')(?![^<]*>)', 'gi'), '<mark class="fhit">$1</mark>');
        }
      });
      sec.classList.toggle('nomatch', !!q && !any);
      sec.hidden = !!q && !any;
    });
  };
  feeQ.addEventListener('input', run);
}
