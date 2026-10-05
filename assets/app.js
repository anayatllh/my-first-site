/*
 * টাইপ শিখি — অ্যাপের মূল লজিক
 * দুই ধরনের ইনপুট:
 *  - guided: প্রতিটি কী-চাপ যাচাই হয় (ইংরেজি QWERTY / বাংলা বিজয়), পরের কী কিবোর্ডে জ্বলে ওঠে
 *  - free:   নিজের কিবোর্ড (অভ্র, মোবাইল ইত্যাদি) দিয়ে টাইপ, লেখা মিলিয়ে দেখা হয়
 */
(function () {
  'use strict';

  const B = window.Bijoy;
  const C = window.TypingContent;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  const BN_DIGITS = '০১২৩৪৫৬৭৮৯';
  const bnNum = v => String(v).replace(/\d/g, d => BN_DIGITS[d]);
  const rand = n => Math.floor(Math.random() * n);
  const pick = arr => arr[rand(arr.length)];
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = rand(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function fmtTime(sec) {
    sec = Math.max(0, Math.round(sec));
    return bnNum(Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'));
  }

  /* ---------- সংরক্ষণ ---------- */
  const PREFIX = 'typeshikhi:';
  const store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(PREFIX + key);
        return v == null ? fallback : JSON.parse(v);
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
      } catch (e) { /* ব্যক্তিগত মোডে সংরক্ষণ না-ও হতে পারে */ }
    }
  };

  const touchOnly = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches && !matchMedia('(pointer: fine)').matches);
  const settings = Object.assign({
    lang: 'bn',
    view: 'lesson',
    input: touchOnly ? 'free' : 'guided',
    lesson: { bn: 0, en: 0 },
    practiceType: 'sentences',
    testMins: 1,
    testType: 'sentences',
    sound: false,
    fingers: true,
    custom: { bn: '', en: '' }
  }, store.get('settings', {}));
  settings.lesson = Object.assign({ bn: 0, en: 0 }, settings.lesson);
  settings.custom = Object.assign({ bn: '', en: '' }, settings.custom);
  const saveSettings = () => store.set('settings', settings);

  let lessonProgress = store.get('lessons', {});
  let history = store.get('history', []);
  let keyStats = store.get('keystats', { bn: {}, en: {} });

  /* ---------- কিবোর্ড লেআউট ---------- */
  const lettersRow = s => [...s].map(c => [c, c.toUpperCase()]);
  const ROWS = [
    [['`', '~'], ['1', '!'], ['2', '@'], ['3', '#'], ['4', '$'], ['5', '%'], ['6', '^'], ['7', '&'], ['8', '*'], ['9', '('], ['0', ')'], ['-', '_'], ['=', '+'], { id: 'Backspace', label: '⌫', w: 2 }],
    [{ id: 'Tab', label: 'Tab', w: 1.5 }, ...lettersRow('qwertyuiop'), ['[', '{'], [']', '}'], ['\\', '|', 1.5]],
    [{ id: 'Caps', label: 'Caps', w: 1.75 }, ...lettersRow('asdfghjkl'), [';', ':'], ["'", '"'], { id: 'Enter', label: 'Enter', w: 2.25 }],
    [{ id: 'ShiftL', label: 'Shift', w: 2.25 }, ...lettersRow('zxcvbnm'), [',', '<'], ['.', '>'], ['/', '?'], { id: 'ShiftR', label: 'Shift', w: 2.75 }],
    [{ spacer: 4.25 }, { id: 'Space', label: '', w: 6.5 }, { spacer: 4.25 }]
  ];

  const FINGER_KEYS = { lp: '`1qaz', lr: '2wsx', lm: '3edc', li: '45rtfgvb', ri: '67yuhjnm', rm: '8ik,', rr: '9ol.', rp: "0-=p[]\\;'/" };
  const FINGER_OF = { Tab: 'lp', Caps: 'lp', ShiftL: 'lp', Enter: 'rp', ShiftR: 'rp', Backspace: 'rp', Space: 'th' };
  for (const [f, keys] of Object.entries(FINGER_KEYS)) for (const k of keys) FINGER_OF[k] = f;
  const FINGER_NAME = {
    lp: 'বাম কনিষ্ঠা', lr: 'বাম অনামিকা', lm: 'বাম মধ্যমা', li: 'বাম তর্জনী',
    ri: 'ডান তর্জনী', rm: 'ডান মধ্যমা', rr: 'ডান অনামিকা', rp: 'ডান কনিষ্ঠা', th: 'বৃদ্ধাঙ্গুল'
  };

  // e.code -> [সাধারণ, Shift] — কিবোর্ডের ভাষা যা-ই থাকুক, আসল কী-টা বের করতে
  const CODE_MAP = {
    Backquote: '`~', Minus: '-_', Equal: '=+', BracketLeft: '[{', BracketRight: ']}', Backslash: '\\|', IntlBackslash: '\\|',
    Semicolon: ';:', Quote: '\'"', Comma: ',<', Period: '.>', Slash: '/?', Space: '  ',
    NumpadDecimal: '..', NumpadAdd: '++', NumpadSubtract: '--', NumpadMultiply: '**', NumpadDivide: '//'
  };
  [...'1234567890'].forEach((d, i) => {
    CODE_MAP['Digit' + d] = d + '!@#$%^&*()'[i];
    CODE_MAP['Numpad' + d] = d + d;
  });
  for (const c of 'abcdefghijklmnopqrstuvwxyz') CODE_MAP['Key' + c.toUpperCase()] = c + c.toUpperCase();

  function renderKeyboard(container, lang) {
    container.textContent = '';
    container.classList.toggle('kb-bn', lang === 'bn');
    const index = {};
    const specials = {};
    for (const row of ROWS) {
      const r = el('div', 'kb-row');
      for (const k of row) {
        if (k.spacer) {
          const sp = el('div', 'key-spacer');
          sp.style.flexGrow = k.spacer;
          r.append(sp);
          continue;
        }
        const key = el('div', 'key');
        if (Array.isArray(k)) {
          const [base, shift, w] = k;
          key.dataset.finger = FINGER_OF[base];
          if (w) key.style.flexGrow = w;
          const isLetter = /[a-z]/.test(base);
          if (lang === 'bn') {
            const top = B.label(shift) || (isLetter ? '' : shift);
            const main = B.label(base) || base;
            key.append(el('span', 'k-top', top), el('span', 'k-main', main), el('span', 'k-latin', isLetter ? base.toUpperCase() : base));
          } else if (isLetter) {
            key.append(el('span', 'k-main k-letter', base.toUpperCase()));
          } else {
            key.append(el('span', 'k-top', shift), el('span', 'k-main k-letter', base));
          }
          if ('fj'.includes(base)) key.classList.add('home');
          index[base] = { el: key, finger: FINGER_OF[base] };
          if (!index[shift]) index[shift] = { el: key, finger: FINGER_OF[base] };
        } else {
          key.classList.add('key-special');
          key.dataset.finger = FINGER_OF[k.id];
          key.style.flexGrow = k.w;
          key.textContent = k.label;
          specials[k.id] = key;
          if (k.id === 'Space') index[' '] = { el: key, finger: 'th' };
        }
        r.append(key);
      }
      container.append(r);
    }
    return { index, specials };
  }

  /* ---------- লেখা তৈরি ---------- */
  function formatLakh(n) {
    const s = String(Math.floor(n));
    if (s.length <= 3) return s;
    const last3 = s.slice(-3);
    const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    return rest + ',' + last3;
  }

  function numbersText(lang) {
    const items = [];
    for (let i = 0; i < 10; i++) {
      const t = rand(6);
      let s;
      if (t === 0) s = (lang === 'bn' ? '৳' : 'Tk ') + formatLakh(1000 + rand(990000));
      else if (t === 1) s = formatLakh(100 + rand(99000)) + '.' + String(rand(100)).padStart(2, '0');
      else if (t === 2) s = String(1 + rand(28)).padStart(2, '0') + '/' + String(1 + rand(12)).padStart(2, '0') + '/20' + (24 + rand(4));
      else if (t === 3) s = pick([2, 3, 5, 7.5, 10, 15]) + '%';
      else if (t === 4) s = (lang === 'bn' ? 'ভাউচার ' : 'JV-') + '20' + (24 + rand(4)) + '/' + String(1 + rand(999)).padStart(3, '0');
      else s = '01' + pick([3, 5, 6, 7, 8, 9]) + String(rand(100)).padStart(2, '0') + '-' + String(rand(1000000)).padStart(6, '0');
      items.push(lang === 'bn' ? bnNum(s) : s);
    }
    return items.join(' ');
  }

  function pickN(arr, n) {
    const out = [];
    let bag = shuffle(arr);
    while (out.length < n) {
      if (!bag.length) bag = shuffle(arr);
      out.push(bag.pop());
    }
    return out;
  }

  function contentText(lang, type) {
    const D = C[lang];
    switch (type) {
      case 'words': return pickN(lang === 'en' ? D.words.concat(D.business) : D.words, 28).join(' ');
      case 'paragraph': return pick(D.paragraphs);
      case 'accounting': return pickN(D.accounting, 4).join(' ');
      case 'numbers': return numbersText(lang);
      case 'conjuncts': return pickN(C.bn.conjuncts, 20).join(' ');
      case 'sentences':
      default: return pickN(D.sentences, 4).join(' ');
    }
  }

  function allowedKeysFor(lang, idx) {
    const set = new Set([' ']);
    const list = C.lessons[lang];
    for (let i = 0; i <= idx; i++) if (list[i].keys) for (const k of list[i].keys) set.add(k);
    return set;
  }

  function drillEn(allowed, fresh) {
    const pool = C.en.words.concat(C.en.business).filter(w =>
      [...w].every(c => allowed.has(c)) && [...w].some(c => fresh.has(c)));
    const letters = [...allowed].filter(c => /[a-z]/.test(c));
    const freshLetters = [...fresh].filter(c => /[a-z]/.test(c));
    const punct = [...allowed].filter(c => /[;,./]/.test(c));
    const words = [];
    for (let i = 0; i < 22; i++) {
      let w;
      if (pool.length >= 4 && Math.random() < 0.55) {
        w = pick(pool);
      } else {
        const len = 2 + rand(4);
        w = '';
        for (let j = 0; j < len; j++) w += (j === 0 || Math.random() < 0.45) && freshLetters.length ? pick(freshLetters) : pick(letters);
      }
      if (punct.length && Math.random() < 0.18) w += pick(punct);
      words.push(w);
    }
    return words.join(' ');
  }

  const BN_KARS = { 'া': 'f', 'ি': 'd', 'ী': 'D', 'ু': 's', 'ূ': 'S', 'ৃ': 'a', 'ে': 'c', 'ৈ': 'C', 'ো': 'cf', 'ৌ': 'cX' };
  const BN_CONJ = 'ক্ক ক্ত ত্ত দ্দ দ্ব ব্দ ক্ষ স্ত ন্ত ন্দ ম্ব ম্প ঙ্ক ঙ্গ চ্চ জ্জ ট্ট প্ত স্প ষ্ট ণ্ড ল্প স্থ দ্ধ ন্ধ ম্ম ল্ল ন্ন'.split(' ');

  function drillBn(allowed, fresh) {
    const fits = keys => [...keys].every(k => allowed.has(k));
    const hasFresh = keys => [...keys].some(k => fresh.has(k));
    const words = [...new Set(C.bn.words.concat(C.bn.conjuncts))];
    const pool = words.filter(w => {
      const r = B.keysOf(w);
      return r.typeable && fits(r.keys) && hasFresh(r.keys);
    });

    const cons = shuffle([...B.CONSONANTS].filter(c => {
      const k = B.toUnits(c)[0].alts[0];
      return k && k.length === 1 && allowed.has(k[0]);
    }));
    const atoms = cons.slice();
    if (allowed.has('g')) BN_CONJ.forEach(cj => { if (fits(B.keysOf(cj).keys)) atoms.push(cj); });
    if (allowed.has('z')) cons.slice(0, 8).forEach(c => atoms.push(c + '্র'));
    if (allowed.has('Z')) cons.slice(0, 8).forEach(c => atoms.push(c + '্য'));
    if (allowed.has('A')) cons.slice(0, 8).forEach(c => atoms.push('র্' + c));
    const kars = Object.keys(BN_KARS).filter(k => [...BN_KARS[k]].every(x => allowed.has(x)));
    const vowels = ['অ', 'ও'].filter(v => fits(B.keysOf(v).keys));

    function syllable() {
      if (vowels.length && Math.random() < 0.08) return pick(vowels);
      let s = pick(atoms);
      if (kars.length && Math.random() < 0.6) s += pick(kars);
      if (allowed.has('Q') && Math.random() < 0.1) s += 'ং';
      return s;
    }
    function pseudoWord() {
      let best = '';
      for (let tries = 0; tries < 14; tries++) {
        const n = 2 + rand(2);
        let w = '';
        for (let i = 0; i < n; i++) w += syllable();
        best = w;
        if (hasFresh(B.keysOf(w).keys)) break;
      }
      return best;
    }

    const out = [];
    for (let i = 0; i < 18; i++) out.push(pool.length >= 4 && Math.random() < 0.5 ? pick(pool) : pseudoWord());
    if (allowed.has('G')) return out.join(' ') + '।';
    return out.join(' ');
  }

  function lessonText(lang, idx) {
    const L = C.lessons[lang][idx];
    if (L.type === 'capitals') {
      return pickN(C.en.names.concat(pickN(C.en.words, 14).map(w => w[0].toUpperCase() + w.slice(1))), 18).join(' ');
    }
    if (L.type === 'vowels') {
      const all = [...new Set(C.bn.words.concat(C.bn.conjuncts))];
      const pool = all.filter(w => /^[অআইঈউঊঋএঐওঔ]/.test(w) || /[ঁৎঃ]/.test(w));
      const words = pickN(pool, 20);
      return words.map((w, i) => (i % 5 === 4 ? w + '।' : w)).join(' ');
    }
    if (L.type) return contentText(lang, L.type);
    const allowed = allowedKeysFor(lang, idx);
    const fresh = new Set(L.keys);
    return lang === 'en' ? drillEn(allowed, fresh) : drillBn(allowed, fresh);
  }

  /* ---------- অবস্থা ---------- */
  const dom = {
    app: $('.app'),
    workspace: $('#workspace'),
    lessonPanel: $('#lessonPanel'),
    lessonList: $('#lessonList'),
    toolbar: $('#toolbar'),
    text: $('#text'),
    paper: $('#paper'),
    paperScroll: $('#paperScroll'),
    veil: $('#focusVeil'),
    freeWrap: $('#freeWrap'),
    freeInput: $('#freeInput'),
    notice: $('#notice'),
    hint: $('#hint'),
    keyboard: $('#keyboard'),
    wpm: $('#sWpm'),
    acc: $('#sAcc'),
    time: $('#sTime'),
    timeLabel: $('#sTimeLabel'),
    err: $('#sErr'),
    fill: $('#progressFill'),
    result: $('#result'),
    progressView: $('#progressView'),
    guideView: $('#guideView')
  };

  let kb = null;          // কিবোর্ডের কী-সূচি
  let S = null;           // চলতি সেশন
  let ticker = null;
  const IDLE_CAP = 4000;  // এর বেশি থেমে থাকলে সময় গোনা হয় না (পাঠ ও অনুশীলনে)

  const isTypingView = () => ['lesson', 'practice', 'test'].includes(settings.view);

  function newSession(text, meta) {
    clearInterval(ticker);
    const lang = settings.lang;
    const clean = (lang === 'bn' ? B.normalize(text) : text).replace(/\s+/g, ' ').trim();
    const units = lang === 'bn' ? B.toUnits(clean) : B.toUnitsEnglish(clean);
    S = Object.assign({
      lang,
      input: settings.input,
      units,
      spans: [],
      idx: 0,
      typed: [],
      started: false,
      startAt: 0,
      lastAt: 0,
      activeMs: 0,
      correct: 0,
      errors: 0,
      settled: 0,
      finished: false,
      missed: {},
      limitMs: 0,
      more: null
    }, meta);
    dom.freeInput.value = '';
    renderText();
    hideNotice();
    if (S.input === 'guided') skipUntypeable();
    setCurrent();
    updateStats();
    if (S.input === 'free') focusFree();
  }

  function renderText() {
    dom.text.textContent = '';
    S.spans = [];
    appendSpans(0);
    dom.paperScroll.scrollTop = 0;
  }

  function appendSpans(from) {
    const frag = document.createDocumentFragment();
    for (let i = from; i < S.units.length; i++) {
      const u = S.units[i];
      const span = el('span', 'u', u.text);
      if (u.text === ' ') span.classList.add('sp');
      S.spans.push(span);
      frag.append(span);
    }
    dom.text.append(frag);
  }

  function appendMoreText() {
    if (!S.more) return;
    const add = ' ' + S.more();
    const clean = (S.lang === 'bn' ? B.normalize(add) : add).replace(/\s+/g, ' ');
    const units = S.lang === 'bn' ? B.toUnits(clean) : B.toUnitsEnglish(clean);
    const from = S.units.length;
    S.units.push(...units);
    appendSpans(from);
  }

  function skipUntypeable() {
    while (S.idx < S.units.length && !S.units[S.idx].alts.length) {
      S.spans[S.idx].classList.add('skip');
      S.idx++;
    }
  }

  function setCurrent() {
    const prev = dom.text.querySelector('.u.cur');
    if (prev) prev.classList.remove('cur', 'shake');
    const span = S.spans[S.idx];
    if (span) {
      span.classList.add('cur');
      scrollToSpan(span);
    }
    renderHint();
  }

  function scrollToSpan(span) {
    const lh = parseFloat(getComputedStyle(dom.text).lineHeight) || 60;
    const target = Math.max(0, span.offsetTop - lh);
    if (Math.abs(dom.paperScroll.scrollTop - target) > 2) {
      const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      dom.paperScroll.scrollTo({ top: target, behavior: reduce ? 'auto' : 'smooth' });
    }
  }

  function expectedNext(unit, typed) {
    const alt = unit.alts.find(a => typed.every((k, i) => a[i] === k)) || unit.alts[0];
    return alt ? { alt, key: alt[typed.length] } : { alt: null, key: null };
  }

  /* ---------- পরের কী-এর ইঙ্গিত ---------- */
  const SHIFT_BASE = {
    '~': '`', '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
    '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/'
  };

  function keyChip(k, lang) {
    const chip = el('span', 'kc');
    const main = k === ' ' ? 'স্পেস' : (lang === 'bn' ? (B.label(k) || k) : k);
    chip.append(el('span', 'kc-main', main));
    let latin = '';
    if (k === ' ') latin = 'Space';
    else if (B.isShifted(k)) latin = 'Shift + ' + (SHIFT_BASE[k] || k);
    else if (main !== k) latin = k;
    if (latin) chip.append(el('span', 'kc-latin', latin));
    return chip;
  }

  function renderHint() {
    dom.hint.textContent = '';
    clearKeyHighlight();
    if (!S || S.finished) return;
    const unit = S.units[S.idx];
    if (!unit) return;
    if (S.input === 'free') return;
    const { alt, key } = expectedNext(unit, S.typed);
    if (!alt) return;

    dom.hint.append(el('span', 'hint-unit', unit.text === ' ' ? '␣' : unit.text));
    if (S.lang === 'bn' || alt.length > 1 || B.isShifted(alt[0]) || alt[0] === ' ') {
      dom.hint.append(el('span', 'hint-arrow', '→'));
      const keys = el('span', 'hint-keys');
      alt.forEach((k, i) => {
        const chip = keyChip(k, S.lang);
        if (i < S.typed.length) chip.classList.add('done');
        else if (i === S.typed.length) chip.classList.add('next');
        keys.append(chip);
      });
      dom.hint.append(keys);
    }
    const entry = kb && kb.index[key];
    if (entry) {
      const f = entry.finger;
      const finger = el('span', 'hint-finger');
      const dot = el('i');
      dot.style.background = 'var(--f-' + f + ')';
      finger.append(dot, document.createTextNode(FINGER_NAME[f] + (B.isShifted(key) ? ' + ' + (f[0] === 'l' ? 'ডান' : 'বাম') + ' Shift' : '')));
      dom.hint.append(finger);
      highlightKey(key);
    }
  }

  function clearKeyHighlight() {
    $$('.key.next', dom.keyboard).forEach(k => k.classList.remove('next'));
  }

  function highlightKey(k) {
    if (!kb) return;
    const entry = kb.index[k];
    if (!entry) return;
    entry.el.classList.add('next');
    if (B.isShifted(k)) {
      const side = entry.finger && entry.finger[0] === 'l' ? 'ShiftR' : 'ShiftL';
      kb.specials[side].classList.add('next');
    }
  }

  function flashKey(k, cls) {
    if (!kb) return;
    const entry = kb.index[k];
    if (!entry) return;
    entry.el.classList.add(cls);
    setTimeout(() => entry.el.classList.remove(cls), cls === 'miss' ? 260 : 110);
  }

  /* ---------- শব্দ ---------- */
  let audio = null;
  function beep(ok) {
    if (!settings.sound) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = ok ? 'triangle' : 'square';
      o.frequency.value = ok ? 880 : 160;
      g.gain.setValueAtTime(ok ? 0.03 : 0.06, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + (ok ? 0.04 : 0.14));
      o.connect(g).connect(audio.destination);
      o.start();
      o.stop(audio.currentTime + 0.15);
    } catch (e) { /* শব্দ না চললেও সমস্যা নেই */ }
  }

  /* ---------- সময় ও পরিসংখ্যান ---------- */
  function startClock(now) {
    S.started = true;
    S.startAt = now;
    S.lastAt = now;
    ticker = setInterval(onTick, 200);
  }

  function noteActivity(now) {
    if (!S.started) {
      startClock(now);
      return;
    }
    S.activeMs += Math.min(now - S.lastAt, IDLE_CAP);
    S.lastAt = now;
  }

  function elapsedMs(now = performance.now()) {
    if (!S || !S.started) return 0;
    if (S.kind === 'test') return Math.min(now - S.startAt, S.limitMs);
    if (S.finished) return S.activeMs;
    return S.activeMs + Math.min(now - S.lastAt, IDLE_CAP);
  }

  function computeStats() {
    const ms = elapsedMs();
    const minutes = ms / 60000;
    const wpm = minutes > 0.033 ? Math.round(S.correct / 5 / minutes) : 0;
    let acc;
    if (S.input === 'free') acc = S.settled ? Math.max(0, Math.round((1 - S.errors / S.settled) * 100)) : 100;
    else acc = S.correct + S.errors ? Math.round((S.correct / (S.correct + S.errors)) * 100) : 100;
    return { ms, wpm, acc };
  }

  function updateStats() {
    if (!S) return;
    const { ms, wpm, acc } = computeStats();
    dom.wpm.textContent = bnNum(wpm);
    dom.acc.textContent = bnNum(acc);
    dom.err.textContent = bnNum(S.errors);
    if (S.kind === 'test') {
      dom.timeLabel.textContent = 'বাকি সময়';
      dom.time.textContent = fmtTime((S.limitMs - ms) / 1000);
      dom.fill.style.width = (ms / S.limitMs) * 100 + '%';
    } else {
      dom.timeLabel.textContent = 'সময়';
      dom.time.textContent = fmtTime(ms / 1000);
      dom.fill.style.width = (S.units.length ? (S.idx / S.units.length) * 100 : 0) + '%';
    }
  }

  function onTick() {
    if (!S || S.finished) return;
    if (S.kind === 'test' && performance.now() - S.startAt >= S.limitMs) {
      finish();
      return;
    }
    updateStats();
  }

  function recordKey(k, ok) {
    if (k == null) return;
    const bucket = keyStats[S.lang] || (keyStats[S.lang] = {});
    const st = bucket[k] || (bucket[k] = { hit: 0, miss: 0 });
    if (ok) st.hit++;
    else {
      st.miss++;
      S.missed[k] = (S.missed[k] || 0) + 1;
    }
  }

  /* ---------- guided ইনপুট ---------- */
  function keyFromEvent(e) {
    const m = CODE_MAP[e.code];
    const fromCode = m ? (e.shiftKey ? m[1] : m[0]) : null;
    const k = e.key || '';
    const ascii = k.length === 1 && k.charCodeAt(0) >= 32 && k.charCodeAt(0) <= 126;
    const bangla = k.length === 1 && /[ঀ-৿]/.test(k);
    if (S.lang === 'en') {
      if (ascii) return k;
      if (bangla) showNotice('আপনার কম্পিউটারের কিবোর্ড এখন বাংলায় আছে। ইংরেজি অনুশীলনের জন্য ইংরেজিতে বদলে নিন (যেমন Ctrl+Alt+B বা Win+Space)।');
      return fromCode;
    }
    if (bangla) showNotice('বিজয়/অভ্র সফটওয়্যার চালু আছে মনে হচ্ছে। এখানে ওগুলো বন্ধ রেখে (ইংরেজি মোডে) টাইপ করুন — অ্যাপ নিজেই বিজয় লেআউটে বাংলা বানাবে। অথবা নিচে "নিজস্ব কিবোর্ড" বেছে নিন।');
    if (fromCode != null) return fromCode;
    return ascii ? k : null;
  }

  function onKeyDown(e) {
    if (!dom.result.hidden) {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        const btn = e.key === 'Enter' ? $('.res-actions .btn-primary') : $('.res-actions [data-act="retry"]');
        if (btn) btn.click();
      }
      return;
    }
    if (!isTypingView()) return;
    const t = e.target;
    if (t && t !== dom.freeInput && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      restart();
      return;
    }
    if (!S || S.finished || S.input !== 'guided') return;
    if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
    if (e.key === 'Tab') return;
    if (e.key === 'Backspace' || e.key === 'Enter') {
      e.preventDefault();
      return;
    }
    if (S.lang === 'en' && e.getModifierState && e.getModifierState('CapsLock') && /^[a-zA-Z]$/.test(e.key)) {
      showNotice('Caps Lock চালু আছে — বন্ধ করে দিন। বড় হাতের অক্ষরের জন্য Shift ব্যবহার করুন।');
    }
    const k = keyFromEvent(e);
    if (k == null) return;
    e.preventDefault();
    handleKey(k, e.repeat);
  }

  function handleKey(k, isRepeat) {
    const unit = S.units[S.idx];
    if (!unit) return;
    const now = performance.now();
    noteActivity(now);
    const cand = S.typed.concat(k);
    const matching = unit.alts.filter(a => cand.every((x, i) => a[i] === x));
    const { key: expected } = expectedNext(unit, S.typed);
    if (matching.length) {
      S.typed = cand;
      S.correct++;
      recordKey(k, true);
      flashKey(k, 'press');
      beep(true);
      if (matching.some(a => a.length === cand.length)) completeUnit();
      else renderHint();
    } else {
      if (isRepeat) return;
      S.errors++;
      unit.err = true;
      recordKey(expected, false);
      flashKey(k, 'miss');
      beep(false);
      const span = S.spans[S.idx];
      span.classList.remove('shake');
      void span.offsetWidth;
      span.classList.add('shake');
      setTimeout(() => span.classList.remove('shake'), 260);
    }
    updateStats();
  }

  function completeUnit() {
    const span = S.spans[S.idx];
    span.classList.remove('cur', 'shake');
    span.classList.add('done');
    if (S.units[S.idx].err) span.classList.add('err');
    S.idx++;
    S.typed = [];
    skipUntypeable();
    if (S.kind === 'test' && S.units.length - S.idx < 80) appendMoreText();
    if (S.idx >= S.units.length) {
      finish();
      return;
    }
    setCurrent();
  }

  /* ---------- free ইনপুট (অভ্র / মোবাইল) ---------- */
  function onFreeInput() {
    if (!S || S.finished || S.input !== 'free') return;
    noteActivity(performance.now());
    let v = dom.freeInput.value.replace(/\n/g, ' ');
    if (S.lang === 'bn') v = B.normalize(v);
    let p = 0;
    let correct = 0;
    let settled = 0;
    let cur = -1;
    for (let i = 0; i < S.units.length; i++) {
      const u = S.units[i];
      const span = S.spans[i];
      const len = u.text.length;
      let state;
      if (p >= v.length) {
        state = cur === -1 ? 'cur' : '';
        if (cur === -1) cur = i;
      } else if (p + len <= v.length) {
        const ok = v.slice(p, p + len) === u.text;
        state = ok ? 'done' : 'wrong';
        if (ok) correct += len;
        if (p + len < v.length) {
          settled++;
          if (!ok && !u.everWrong) {
            u.everWrong = true;
            S.errors++;
          }
        }
      } else {
        state = 'cur';
        cur = i;
      }
      span.className = 'u' + (u.text === ' ' ? ' sp' : '') + (state ? ' ' + state : '');
      p += len;
    }
    S.correct = correct;
    S.settled = settled;
    S.idx = cur === -1 ? S.units.length : cur;
    const total = p;
    if (S.kind === 'test' && total - v.length < 120) {
      appendMoreText();
      onFreeInput();
      return;
    }
    if (S.spans[S.idx]) scrollToSpan(S.spans[S.idx]);
    updateStats();
    if (S.kind !== 'test' && v.length >= total) {
      S.units.forEach((u, i) => {
        if (!u.everWrong && S.spans[i].classList.contains('wrong')) {
          u.everWrong = true;
          S.errors++;
        }
      });
      S.settled = S.units.length;
      finish();
    }
  }

  function focusFree() {
    if (S && S.input === 'free' && isTypingView()) {
      try { dom.freeInput.focus({ preventScroll: true }); } catch (e) { dom.freeInput.focus(); }
    }
  }

  /* ---------- নোটিশ ---------- */
  let noticeTimer = null;
  function showNotice(msg) {
    dom.notice.textContent = msg;
    dom.notice.hidden = false;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(hideNotice, 7000);
  }
  function hideNotice() {
    dom.notice.hidden = true;
  }

  /* ---------- শেষ ও ফলাফল ---------- */
  const KIND_LABEL = { lesson: 'পাঠ', practice: 'অনুশীলন', test: 'স্পিড টেস্ট' };
  const WPM_TARGETS = { en: [15, 25], bn: [12, 20] };

  function starsFor(lang, wpm, acc) {
    const [t2, t3] = WPM_TARGETS[lang];
    if (acc >= 97 && wpm >= t3) return 3;
    if (acc >= 95 && wpm >= t2) return 2;
    if (acc >= 90) return 1;
    return 0;
  }

  function finish() {
    if (!S || S.finished) return;
    const now = performance.now();
    if (S.started && S.kind !== 'test') S.activeMs += Math.min(now - S.lastAt, IDLE_CAP);
    S.finished = true;
    clearInterval(ticker);
    clearKeyHighlight();
    updateStats();
    dom.hint.textContent = '';
    const { ms, wpm, acc } = computeStats();
    store.set('keystats', keyStats);

    if (!S.started || S.correct === 0) {
      showResult({ wpm: 0, acc: 0, ms: 0, empty: true });
      return;
    }

    let stars = null;
    if (S.kind === 'lesson') {
      stars = starsFor(S.lang, wpm, acc);
      const prev = lessonProgress[S.lessonId] || { stars: 0, wpm: 0, acc: 0 };
      lessonProgress[S.lessonId] = {
        stars: Math.max(prev.stars, stars),
        wpm: Math.max(prev.wpm, wpm),
        acc: Math.max(prev.acc, acc)
      };
      store.set('lessons', lessonProgress);
      renderLessonList();
    }

    history.unshift({
      t: Date.now(), lang: S.lang, kind: S.kind, label: S.label, input: S.input,
      wpm, acc, secs: Math.round(ms / 1000), errors: S.errors
    });
    history = history.slice(0, 200);
    store.set('history', history);

    showResult({ wpm, acc, ms, stars });
  }

  function showResult(r) {
    $('#resKind').textContent = (KIND_LABEL[S.kind] || '') + ' · ' + (S.label || '');
    const title = $('#resTitle');
    if (r.empty) title.textContent = 'সময় শেষ — কিছু টাইপ করা হয়নি';
    else if (r.acc >= 97) title.textContent = 'চমৎকার! নির্ভুল টাইপিং';
    else if (r.acc >= 90) title.textContent = 'ভালো হয়েছে';
    else title.textContent = 'নির্ভুলতা বাড়াতে আরেকবার চেষ্টা করুন';
    $('#resWpm').textContent = bnNum(r.wpm);

    const starsEl = $('#resStars');
    starsEl.hidden = r.stars == null;
    if (r.stars != null) {
      starsEl.textContent = '';
      for (let i = 0; i < 3; i++) starsEl.append(el('span', i < r.stars ? '' : 'off', '★'));
      starsEl.setAttribute('aria-label', bnNum(r.stars) + ' তারা');
    }

    const grid = $('#resGrid');
    grid.textContent = '';
    const items = [
      ['নির্ভুলতা', bnNum(r.acc) + '%'],
      ['সময়', fmtTime(r.ms / 1000)],
      [S.input === 'free' ? 'সঠিক অক্ষর' : 'সঠিক কী-চাপ', bnNum(S.correct)],
      ['ভুল', bnNum(S.errors)]
    ];
    for (const [k, v] of items) {
      const d = el('div');
      d.append(el('dt', null, k), el('dd', null, v));
      grid.append(d);
    }

    const weak = $('#resWeak');
    weak.textContent = '';
    const missed = Object.entries(S.missed).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (missed.length) {
      weak.append(el('span', 'muted', 'বেশি ভুল হয়েছে:'));
      for (const [k, n] of missed) {
        const chip = keyChip(k, S.lang);
        chip.append(el('span', 'kc-latin', '×' + bnNum(n)));
        weak.append(chip);
      }
    }

    const actions = $('#resActions');
    actions.textContent = '';
    const retry = el('button', 'btn', 'আবার করুন');
    retry.type = 'button';
    retry.dataset.act = 'retry';
    retry.addEventListener('click', () => { closeResult(); restart(true); });
    actions.append(retry);
    const list = C.lessons[S.lang];
    if (S.kind === 'lesson' && settings.lesson[S.lang] < list.length - 1 && r.acc >= 90) {
      const next = el('button', 'btn btn-primary', 'পরের পাঠ →');
      next.type = 'button';
      next.addEventListener('click', () => { closeResult(); selectLesson(settings.lesson[S.lang] + 1); });
      actions.append(next);
    } else {
      const fresh = el('button', 'btn btn-primary', S.kind === 'test' ? 'নতুন টেস্ট' : 'নতুন লেখা');
      fresh.type = 'button';
      fresh.addEventListener('click', () => { closeResult(); restart(false); });
      actions.append(fresh);
    }
    dom.result.hidden = false;
    const primary = $('.res-actions .btn-primary');
    if (primary) primary.focus();
  }

  function closeResult() {
    dom.result.hidden = true;
  }

  /* ---------- সেশন শুরু ---------- */
  const PRACTICE_TYPES = [
    ['words', 'শব্দ'], ['sentences', 'বাক্য'], ['paragraph', 'অনুচ্ছেদ'],
    ['accounting', 'হিসাব-নিকাশ'], ['numbers', 'সংখ্যা'], ['custom', 'নিজের লেখা']
  ];
  const TEST_TYPES = [['sentences', 'বাক্য'], ['paragraph', 'অনুচ্ছেদ'], ['accounting', 'হিসাব-নিকাশ'], ['words', 'শব্দ']];
  const typeLabel = (list, id) => (list.find(x => x[0] === id) || ['', ''])[1];

  let lastText = '';
  function restart(sameText) {
    if (!isTypingView()) return;
    closeResult();
    const lang = settings.lang;
    let text;
    let meta;
    if (settings.view === 'lesson') {
      const idx = Math.min(settings.lesson[lang], C.lessons[lang].length - 1);
      const L = C.lessons[lang][idx];
      text = sameText && lastText ? lastText : lessonText(lang, idx);
      meta = { kind: 'lesson', label: L.title, lessonId: L.id };
    } else if (settings.view === 'practice') {
      const type = settings.practiceType;
      if (type === 'custom') {
        text = settings.custom[lang] || (lang === 'bn' ? C.bn.sentences[0] : C.en.sentences[0]);
      } else {
        text = sameText && lastText ? lastText : contentText(lang, type);
      }
      meta = { kind: 'practice', label: typeLabel(PRACTICE_TYPES, type) };
    } else {
      const type = settings.testType;
      text = sameText && lastText ? lastText : contentText(lang, type);
      meta = {
        kind: 'test',
        label: bnNum(settings.testMins) + ' মিনিট · ' + typeLabel(TEST_TYPES, type),
        limitMs: settings.testMins * 60000,
        more: () => contentText(lang, type)
      };
    }
    lastText = text;
    newSession(text, meta);
  }

  /* ---------- টুলবার ---------- */
  function chip(label, pressed, onClick) {
    const b = el('button', 'chip', label);
    b.type = 'button';
    b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    b.addEventListener('click', () => {
      onClick();
      b.blur();
    });
    return b;
  }

  function renderToolbar() {
    const tb = dom.toolbar;
    tb.textContent = '';
    const lang = settings.lang;
    if (settings.view === 'lesson') {
      const list = C.lessons[lang];
      const idx = Math.min(settings.lesson[lang], list.length - 1);
      const L = list[idx];
      const title = el('div', 'tb-title');
      title.append(el('h2', null, 'পাঠ ' + bnNum(idx + 1) + ': ' + L.title), el('p', 'tb-tip', L.tip));
      const nav = el('div', 'tb-group');
      const prev = el('button', 'btn', '← আগের');
      prev.type = 'button';
      prev.disabled = idx === 0;
      prev.addEventListener('click', () => selectLesson(idx - 1));
      const again = el('button', 'btn', 'নতুন লেখা');
      again.type = 'button';
      again.addEventListener('click', () => { again.blur(); restart(false); });
      const next = el('button', 'btn', 'পরের →');
      next.type = 'button';
      next.disabled = idx === list.length - 1;
      next.addEventListener('click', () => selectLesson(idx + 1));
      nav.append(prev, again, next);
      tb.append(title, nav);
    } else if (settings.view === 'practice') {
      const g = el('div', 'tb-group');
      g.append(el('span', 'eyebrow', 'লেখার ধরন'));
      for (const [id, label] of PRACTICE_TYPES) {
        g.append(chip(label, settings.practiceType === id, () => {
          settings.practiceType = id;
          saveSettings();
          renderToolbar();
          restart(false);
        }));
      }
      const again = el('button', 'btn', 'নতুন লেখা');
      again.type = 'button';
      again.addEventListener('click', () => { again.blur(); restart(false); });
      tb.append(g);
      if (settings.practiceType !== 'custom') tb.append(again);
      if (settings.practiceType === 'custom') tb.append(customBox());
    } else if (settings.view === 'test') {
      const g1 = el('div', 'tb-group');
      g1.append(el('span', 'eyebrow', 'সময়'));
      for (const m of [1, 2, 3, 5]) {
        g1.append(chip(bnNum(m) + ' মিনিট', settings.testMins === m, () => {
          settings.testMins = m;
          saveSettings();
          renderToolbar();
          restart(false);
        }));
      }
      const g2 = el('div', 'tb-group');
      g2.append(el('span', 'eyebrow', 'লেখা'));
      for (const [id, label] of TEST_TYPES) {
        g2.append(chip(label, settings.testType === id, () => {
          settings.testType = id;
          saveSettings();
          renderToolbar();
          restart(false);
        }));
      }
      tb.append(g1, g2);
    }
  }

  function customBox() {
    const box = el('div', 'custom-box');
    const ta = el('textarea');
    ta.id = 'customText';
    ta.placeholder = settings.lang === 'bn' ? 'এখানে যেকোনো বাংলা লেখা পেস্ট করুন…' : 'Paste any English text here…';
    ta.value = settings.custom[settings.lang];
    const row = el('div', 'row');
    const go = el('button', 'btn btn-primary', 'এই লেখা দিয়ে শুরু করুন');
    go.type = 'button';
    go.addEventListener('click', () => {
      settings.custom[settings.lang] = ta.value.slice(0, 5000);
      saveSettings();
      go.blur();
      restart(false);
    });
    row.append(go, el('span', 'muted', settings.lang === 'bn'
      ? 'বিজয় মোডে ইংরেজি অক্ষর থাকলে সেগুলো স্বয়ংক্রিয়ভাবে বাদ যাবে।'
      : 'Curly quotes and dashes are converted automatically.'));
    box.append(ta, row);
    return box;
  }

  /* ---------- পাঠের তালিকা ---------- */
  function starsMarkup(n) {
    const s = el('span', 'lesson-stars');
    for (let i = 0; i < 3; i++) s.append(el('span', i < n ? '' : 'off', '★'));
    return s;
  }

  function renderLessonList() {
    const list = C.lessons[settings.lang];
    const current = Math.min(settings.lesson[settings.lang], list.length - 1);
    dom.lessonList.textContent = '';
    list.forEach((L, i) => {
      const li = el('li');
      const b = el('button');
      b.type = 'button';
      if (i === current) b.setAttribute('aria-current', 'true');
      const p = lessonProgress[L.id];
      b.append(el('span', 'lesson-no', bnNum(i + 1)), el('span', null, L.title), starsMarkup(p ? p.stars : 0));
      b.addEventListener('click', () => selectLesson(i));
      li.append(b);
      dom.lessonList.append(li);
    });
    const cur = dom.lessonList.querySelector('[aria-current="true"]');
    if (cur && cur.scrollIntoView && window.innerWidth <= 980) {
      cur.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
  }

  function selectLesson(i) {
    const list = C.lessons[settings.lang];
    settings.lesson[settings.lang] = Math.max(0, Math.min(i, list.length - 1));
    saveSettings();
    renderLessonList();
    renderToolbar();
    restart(false);
  }

  /* ---------- ভিউ ও সেটিংস ---------- */
  function applyLangClass() {
    dom.app.classList.toggle('lang-en', settings.lang === 'en');
    dom.app.classList.toggle('lang-bn', settings.lang === 'bn');
    document.documentElement.lang = settings.lang === 'en' ? 'en' : 'bn';
  }

  function renderInputSwitch() {
    const [g, f] = $$('#inputSwitch button');
    g.textContent = settings.lang === 'bn' ? 'বিজয় (গাইডসহ)' : 'কিবোর্ড গাইড';
    f.textContent = settings.lang === 'bn' ? 'নিজস্ব কিবোর্ড (অভ্র/মোবাইল)' : 'নিজস্ব/মোবাইল কিবোর্ড';
    g.setAttribute('aria-checked', settings.input === 'guided' ? 'true' : 'false');
    f.setAttribute('aria-checked', settings.input === 'free' ? 'true' : 'false');
    const guided = settings.input === 'guided';
    dom.keyboard.hidden = !guided;
    dom.hint.hidden = !guided;
    dom.freeWrap.hidden = guided;
    $('#freeLabel').textContent = settings.lang === 'bn'
      ? 'এখানে টাইপ করুন — অভ্র, বিজয় বা মোবাইলের বাংলা কিবোর্ড ব্যবহার করুন'
      : 'Type here';
    updateVeil();
  }

  function setLang(lang) {
    settings.lang = lang;
    saveSettings();
    $$('#langSwitch button').forEach(b => b.setAttribute('aria-checked', b.dataset.lang === lang ? 'true' : 'false'));
    applyLangClass();
    kb = renderKeyboard(dom.keyboard, lang);
    renderInputSwitch();
    $('#tabs [data-view="guide"]').textContent = lang === 'bn' ? 'বিজয় গাইড' : 'কী-ম্যাপ গাইড';
    if (isTypingView()) {
      renderLessonList();
      renderToolbar();
      restart(false);
    } else {
      renderPage();
    }
  }

  function setView(view) {
    settings.view = view;
    saveSettings();
    $$('#tabs button').forEach(b => b.setAttribute('aria-selected', b.dataset.view === view ? 'true' : 'false'));
    const typing = isTypingView();
    dom.workspace.hidden = !typing;
    dom.progressView.hidden = view !== 'progress';
    dom.guideView.hidden = view !== 'guide';
    dom.lessonPanel.hidden = view !== 'lesson';
    dom.workspace.classList.toggle('no-rail', view !== 'lesson');
    if (typing) {
      clearInterval(ticker);
      renderLessonList();
      renderToolbar();
      restart(false);
    } else {
      clearInterval(ticker);
      renderPage();
    }
  }

  function setInput(mode) {
    settings.input = mode;
    saveSettings();
    renderInputSwitch();
    restart(true);
  }

  function updateVeil() {
    const show = isTypingView() && settings.input === 'guided' && !document.hasFocus();
    dom.veil.hidden = !show;
  }

  function renderPage() {
    if (settings.view === 'progress') renderProgress();
    if (settings.view === 'guide') renderGuide();
  }

  /* ---------- অগ্রগতি ---------- */
  function keyName(k, lang) {
    if (k === ' ') return 'স্পেস';
    return lang === 'bn' ? (B.label(k) || k) + ' (' + k + ')' : k;
  }

  function renderProgress() {
    const v = dom.progressView;
    v.textContent = '';
    const lang = settings.lang;
    const mine = history.filter(h => h.lang === lang);
    const best = mine.reduce((m, h) => Math.max(m, h.wpm), 0);
    const recent = mine.slice(0, 10);
    const avgAcc = recent.length ? Math.round(recent.reduce((s, h) => s + h.acc, 0) / recent.length) : 0;
    const avgWpm = recent.length ? Math.round(recent.reduce((s, h) => s + h.wpm, 0) / recent.length) : 0;
    const totalSec = mine.reduce((s, h) => s + h.secs, 0);
    const lessons = C.lessons[lang];
    const passed = lessons.filter(L => (lessonProgress[L.id] || {}).stars > 0).length;

    const head = el('div');
    head.append(el('h2', null, (lang === 'bn' ? 'বাংলা' : 'ইংরেজি') + ' টাইপিংয়ের অগ্রগতি'));
    v.append(head);

    const tiles = el('div', 'tiles');
    const tile = (label, value, sub) => {
      const t = el('div', 'tile');
      t.append(el('span', 'eyebrow', label), el('strong', null, value), el('span', 'sub', sub));
      return t;
    };
    tiles.append(
      tile('সেরা গতি', bnNum(best), 'শব্দ/মিনিট'),
      tile('সাম্প্রতিক গড়', bnNum(avgWpm), 'শেষ ' + bnNum(recent.length) + ' বারের WPM'),
      tile('গড় নির্ভুলতা', bnNum(avgAcc) + '%', 'শেষ ' + bnNum(recent.length) + ' বার'),
      tile('মোট অনুশীলন', fmtTime(totalSec), bnNum(mine.length) + ' টি সেশন')
    );
    v.append(tiles);

    const two = el('div', 'two-col');
    const lp = el('div', 'panel');
    lp.append(el('h3', null, 'পাঠ সম্পন্ন: ' + bnNum(passed) + ' / ' + bnNum(lessons.length)));
    const bars = el('div', 'lesson-bars');
    const stars = lessons.reduce((s, L) => s + ((lessonProgress[L.id] || {}).stars || 0), 0);
    const row = (label, value, max, note) => {
      const r = el('div', 'lesson-bar-row');
      const bar = el('div', 'bar');
      const fill = el('span');
      fill.style.width = (max ? (value / max) * 100 : 0) + '%';
      bar.append(fill);
      r.append(el('span', null, label), bar, el('span', 'muted', note));
      return r;
    };
    bars.append(
      row('পাঠ', passed, lessons.length, bnNum(passed) + '/' + bnNum(lessons.length)),
      row('তারা', stars, lessons.length * 3, bnNum(stars) + '/' + bnNum(lessons.length * 3))
    );
    lp.append(bars);

    const wk = el('div', 'panel');
    wk.append(el('h3', null, 'যে কী-তে বেশি ভুল হয়'));
    const ks = Object.entries(keyStats[lang] || {})
      .filter(([, s]) => s.miss > 0)
      .map(([k, s]) => [k, s.miss, s.miss / (s.hit + s.miss)])
      .sort((a, b) => b[2] - a[2] || b[1] - a[1])
      .slice(0, 10);
    if (ks.length) {
      const wl = el('div', 'weak-list');
      for (const [k, miss, rate] of ks) {
        const c = keyChip(k, lang);
        c.append(el('span', 'kc-latin', bnNum(Math.round(rate * 100)) + '% ভুল'));
        c.title = keyName(k, lang) + ' — ' + bnNum(miss) + ' বার ভুল';
        wl.append(c);
      }
      wk.append(wl);
      wk.append(el('p', 'muted', 'এই কীগুলো নিয়ে আলাদা করে অনুশীলন করুন।'));
    } else {
      wk.append(el('p', 'empty', 'এখনো কোনো ভুলের তথ্য নেই। কয়েকটি পাঠ শেষ করলে এখানে দেখা যাবে।'));
    }
    two.append(lp, wk);
    v.append(two);

    const hp = el('div', 'panel');
    const hh = el('div', 'panel-head');
    hh.append(el('h3', null, 'সাম্প্রতিক সেশন'));
    if (history.length) {
      const clr = el('button', 'btn btn-danger', 'সব ইতিহাস মুছুন');
      clr.type = 'button';
      clr.addEventListener('click', () => {
        const confirmRow = el('div', 'tb-group');
        const yes = el('button', 'btn btn-danger', 'হ্যাঁ, মুছে ফেলুন');
        yes.type = 'button';
        const no = el('button', 'btn', 'বাতিল');
        no.type = 'button';
        yes.addEventListener('click', () => {
          history = [];
          lessonProgress = {};
          keyStats = { bn: {}, en: {} };
          store.set('history', history);
          store.set('lessons', lessonProgress);
          store.set('keystats', keyStats);
          renderProgress();
        });
        no.addEventListener('click', () => renderProgress());
        confirmRow.append(el('span', 'muted', 'সব ফলাফল, পাঠের তারা ও ভুলের তথ্য মুছে যাবে।'), yes, no);
        clr.replaceWith(confirmRow);
      });
      hh.append(clr);
    }
    hp.append(hh);
    if (mine.length) {
      const wrap = el('div', 'table-wrap');
      const table = el('table');
      const thead = el('thead');
      const tr = el('tr');
      [['তারিখ', ''], ['ধরন', ''], ['বিষয়', ''], ['গতি', 'num'], ['নির্ভুলতা', 'num'], ['সময়', 'num']].forEach(([h, c]) => tr.append(el('th', c, h)));
      thead.append(tr);
      const tbody = el('tbody');
      for (const h of mine.slice(0, 30)) {
        const r = el('tr');
        const d = new Date(h.t);
        const date = bnNum(String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'));
        const accCell = el('td', 'num');
        accCell.append(el('span', 'pill ' + (h.acc >= 95 ? 'good' : h.acc < 85 ? 'bad' : ''), bnNum(h.acc) + '%'));
        r.append(el('td', null, date), el('td', null, KIND_LABEL[h.kind] || ''), el('td', null, h.label || ''),
          el('td', 'num', bnNum(h.wpm)), accCell, el('td', 'num', fmtTime(h.secs)));
        tbody.append(r);
      }
      table.append(thead, tbody);
      wrap.append(table);
      hp.append(wrap);
    } else {
      hp.append(el('p', 'empty', 'এখনো কোনো সেশন নেই। "পাঠ" ট্যাব থেকে প্রথম পাঠটি শুরু করুন।'));
    }
    v.append(hp);
  }

  /* ---------- বিজয় গাইড ---------- */
  function exampleRow(word) {
    const row = el('div', 'example');
    row.append(el('span', 'ex-word', word), el('span', 'hint-arrow', '='));
    for (const u of B.toUnits(word)) {
      if (!u.alts.length) continue;
      for (const k of u.alts[0]) row.append(keyChip(k, 'bn'));
    }
    return row;
  }

  function renderGuide() {
    const v = dom.guideView;
    v.textContent = '';
    if (settings.lang === 'en') {
      v.append(el('h2', null, 'ইংরেজি কিবোর্ড: কোন আঙুলে কোন কী'));
      const p = el('div', 'panel');
      p.append(el('p', 'muted', 'রঙ দেখে বুঝুন কোন আঙুল কোন কী চাপবে। তর্জনী সবসময় F ও J-এর উপর রাখুন (এই দুই কী-তে ছোট দাগ থাকে)। Shift সবসময় উল্টো হাতের কনিষ্ঠা দিয়ে চাপুন।'));
      const k = el('div', 'keyboard fingers');
      renderKeyboard(k, 'en');
      p.append(k);
      v.append(p);
      return;
    }

    v.append(el('h2', null, 'বিজয় কিবোর্ডে বাংলা লেখার নিয়ম'));
    const rules = el('div', 'rules');
    const RULES = [
      ['আগে কার, পরে ব্যঞ্জন', 'ি, ে, ৈ — এই তিনটি কার ব্যঞ্জনবর্ণের আগে চাপতে হয়।', ['কি', 'দেশ']],
      ['ো ও ৌ কার', 'ো = ে + ব্যঞ্জন + া, আর ৌ = ে + ব্যঞ্জন + ৗ (Shift+X)।', ['কোন', 'কৌশল']],
      ['যুক্তাক্ষর', 'দুই ব্যঞ্জনের মাঝে g (হসন্ত) চাপুন।', ['ক্ত', 'ক্ষমা']],
      ['র-ফলা ও য-ফলা', 'র-ফলা = z, য-ফলা = Shift+Z — ব্যঞ্জনের পরে।', ['প্রথম', 'ব্যাংক']],
      ['রেফ (র্)', 'রেফ = Shift+A, যে ব্যঞ্জনের উপর রেফ বসবে তার পরে চাপুন।', ['কর্ম', 'বার্তা']],
      ['স্বরবর্ণ', 'g + কার = স্বরবর্ণ। অ = Shift+F, ও = x।', ['আমি', 'উৎপাদন']],
      ['চিহ্ন', 'ঁ = Shift+7, ং = Shift+Q, ঃ = Shift+\\, ৎ = \\, । = Shift+G, ৳ = Shift+4।', ['চাঁদ', 'দুঃখ']],
      ['সংখ্যা', 'উপরের সংখ্যার সারি দিয়েই বাংলা সংখ্যা ১২৩ আসে।', ['৳১,২৫,০০০']],
      ['দ্রুত শেখার টিপস', 'প্রতিদিন ১৫ মিনিট, আগে নির্ভুলতা পরে গতি। কিবোর্ডের দিকে না তাকানোর চেষ্টা করুন।', ['অনুশীলন']]
    ];
    for (const [title, text, examples] of RULES) {
      const card = el('div', 'panel rule');
      card.append(el('h3', null, title), el('p', null, text));
      examples.forEach(w => card.append(exampleRow(w)));
      rules.append(card);
    }
    v.append(rules);

    const conv = el('div', 'panel');
    conv.append(el('h3', null, 'কোন শব্দ কীভাবে টাইপ করবেন?'));
    conv.append(el('p', 'muted', 'যেকোনো বাংলা শব্দ লিখুন বা পেস্ট করুন — বিজয়ে কোন কী কোন ক্রমে চাপতে হবে তা দেখাবে।'));
    const rowIn = el('div', 'convert-row');
    const input = el('input');
    input.id = 'convertInput';
    input.type = 'text';
    input.value = 'হিসাবরক্ষক';
    input.setAttribute('aria-label', 'বাংলা শব্দ');
    rowIn.append(input);
    const out = el('div', 'convert-out');
    const draw = () => {
      out.textContent = '';
      const words = B.normalize(input.value).trim().split(/\s+/).filter(Boolean).slice(0, 12);
      if (!words.length) {
        out.append(el('p', 'empty', 'উপরের ঘরে একটি বাংলা শব্দ লিখুন।'));
        return;
      }
      for (const w of words) {
        const line = el('div', 'convert-unit');
        line.append(el('span', 'ex-word', w), el('span', 'hint-arrow', '='));
        let any = false;
        for (const u of B.toUnits(w)) {
          if (!u.alts.length) continue;
          any = true;
          u.alts[0].forEach(k => line.append(keyChip(k, 'bn')));
        }
        if (!any) line.append(el('span', 'muted', 'বাংলা অক্ষর পাওয়া যায়নি'));
        out.append(line);
      }
    };
    input.addEventListener('input', draw);
    draw();
    conv.append(rowIn, out);
    v.append(conv);

    const kp = el('div', 'panel');
    kp.append(el('h3', null, 'বিজয় কী-ম্যাপ'));
    kp.append(el('p', 'muted', 'প্রতিটি কী-এর নিচের বড় অক্ষর সাধারণভাবে আসে, উপরের ছোট অক্ষর Shift চেপে।'));
    const k = el('div', 'keyboard fingers');
    renderKeyboard(k, 'bn');
    kp.append(k);
    v.append(kp);
  }

  /* ---------- ইভেন্ট ---------- */
  $$('#langSwitch button').forEach(b => b.addEventListener('click', () => { b.blur(); setLang(b.dataset.lang); }));
  $$('#tabs button').forEach(b => b.addEventListener('click', () => { b.blur(); setView(b.dataset.view); }));
  $$('#inputSwitch button').forEach(b => b.addEventListener('click', () => { b.blur(); setInput(b.dataset.input); }));
  $('#restartBtn').addEventListener('click', e => { e.currentTarget.blur(); restart(true); });

  const optF = $('#optFingers');
  optF.checked = settings.fingers;
  dom.keyboard.classList.toggle('fingers', settings.fingers);
  optF.addEventListener('change', () => {
    settings.fingers = optF.checked;
    dom.keyboard.classList.toggle('fingers', settings.fingers);
    saveSettings();
    optF.blur();
  });
  const optS = $('#optSound');
  optS.checked = settings.sound;
  optS.addEventListener('change', () => {
    settings.sound = optS.checked;
    saveSettings();
    optS.blur();
  });

  document.addEventListener('keydown', onKeyDown);
  dom.freeInput.addEventListener('input', onFreeInput);
  dom.freeInput.addEventListener('paste', e => {
    e.preventDefault();
    showNotice('অনুশীলনের সময় পেস্ট করা যাবে না — নিজে টাইপ করুন।');
  });
  dom.paper.addEventListener('click', () => {
    if (settings.input === 'free') focusFree();
    window.focus();
    updateVeil();
  });
  window.addEventListener('focus', updateVeil);
  window.addEventListener('blur', updateVeil);

  /* ---------- শুরু ---------- */
  $$('#tabs button').forEach(b => b.setAttribute('aria-selected', 'false'));
  setLang(settings.lang);
  setView(settings.view);
})();
