/*
 * বিজয় (Bijoy) লেআউট ইঞ্জিন
 * বাংলা ইউনিকোড লেখাকে টাইপিং "ইউনিট"-এ ভাগ করে, আর প্রতিটি ইউনিট টাইপ করতে
 * বিজয় কিবোর্ডে কোন কোন কী চাপতে হবে তা বের করে।
 *
 * নিয়ম (বিজয়):
 *  - ি ে ৈ কার ব্যঞ্জনের আগে চাপতে হয়:   কি = d j
 *  - ো = ে + া,  ৌ = ে + ৗ :               কো = c j f
 *  - যুক্তাক্ষর g (হসন্ত) দিয়ে:             ক্ত = j g k
 *  - র-ফলা z, য-ফলা Z:                      প্র = r z,  ব্য = h Z
 *  - রেফ (র্) Shift+A, ব্যঞ্জনের পরে:        র্ম = m A
 *  - স্বরবর্ণ g + কার (অ = F, ও = x):        আ = g f
 */
(function (root) {
  'use strict';

  // ইংরেজি কী -> বিজয়ে যে বাংলা অক্ষর আসে
  const BIJOY_KEYS = {
    q: 'ঙ', Q: 'ং', w: 'য', W: 'য়', e: 'ড', E: 'ঢ', r: 'প', R: 'ফ', t: 'ট', T: 'ঠ',
    y: 'চ', Y: 'ছ', u: 'জ', U: 'ঝ', i: 'হ', I: 'ঞ', o: 'গ', O: 'ঘ', p: 'ড়', P: 'ঢ়',
    a: 'ৃ', A: 'র্', s: 'ু', S: 'ূ', d: 'ি', D: 'ী', f: 'া', F: 'অ', g: '্', G: '।',
    h: 'ব', H: 'ভ', j: 'ক', J: 'খ', k: 'ত', K: 'থ', l: 'দ', L: 'ধ',
    z: '্র', Z: '্য', x: 'ও', X: 'ৗ', c: 'ে', C: 'ৈ', v: 'র', V: 'ল', b: 'ন', B: 'ণ',
    n: 'স', N: 'ষ', m: 'ম', M: 'শ',
    '\\': 'ৎ', '|': 'ঃ', '&': 'ঁ', '$': '৳',
    '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯', '0': '০'
  };

  const HASANT = '্';
  const NUKTA = '়';
  const CONSONANTS = new Set([...normalize('কখগঘঙচছজঝঞটঠডঢণতথদধনপফবভমযরলশষসহড়ঢ়য়ৎ')]);

  // একক বাংলা অক্ষর -> কী (ড়, ঢ়, য় একক কোডপয়েন্টে রাখা হয়)
  const CHAR_KEY = {};
  for (const k of Object.keys(BIJOY_KEYS)) {
    const ch = (BIJOY_KEYS[k] = normalize(BIJOY_KEYS[k]));
    if ([...ch].length === 1) CHAR_KEY[ch] = k;
  }

  const VOWEL_KEYS = {
    'অ': ['F'], 'আ': ['g', 'f'], 'ই': ['g', 'd'], 'ঈ': ['g', 'D'], 'উ': ['g', 's'], 'ঊ': ['g', 'S'],
    'ঋ': ['g', 'a'], 'এ': ['g', 'c'], 'ঐ': ['g', 'C'], 'ও': ['x'], 'ঔ': ['g', 'X']
  };

  // কার: [ব্যঞ্জনের আগে চাপার কী, ব্যঞ্জনের পরে চাপার কী]
  const KAR = {
    'া': [[], ['f']], 'ি': [['d'], []], 'ী': [[], ['D']], 'ু': [[], ['s']], 'ূ': [[], ['S']],
    'ৃ': [[], ['a']], 'ে': [['c'], []], 'ৈ': [['C'], []], 'ো': [['c'], ['f']], 'ৌ': [['c'], ['X']],
    'ৗ': [[], ['X']]
  };

  const SIGN_KEY = { 'ঁ': '&', 'ং': 'Q', 'ঃ': '|' };

  // বিজয়ে এই ASCII কীগুলো বাংলা চিহ্ন দেয়, তাই এগুলো হুবহু টাইপ করা যায় না
  const BIJOY_RESERVED_ASCII = new Set(['&', '$', '|', '\\']);

  const SHIFT_SYMBOLS = new Set([...'~!@#$%^&*()_+{}|:"<>?']);

  function isShifted(key) {
    return (key >= 'A' && key <= 'Z') || SHIFT_SYMBOLS.has(key);
  }

  function normalize(text) {
    return String(text)
      .normalize('NFC')
      .replace(/ড়/g, 'ড়')
      .replace(/ঢ়/g, 'ঢ়')
      .replace(/য়/g, 'য়')
      .replace(/ো/g, 'ো')
      .replace(/ৌ/g, 'ৌ')
      .replace(/[‌‍]/g, '');
  }

  function sameSeq(a, b) {
    return a.length === b.length && a.every((x, i) => x === b[i]);
  }

  function pushUnique(list, seq) {
    if (!list.some(s => sameSeq(s, seq))) list.push(seq);
  }

  function consonantAlts(cons, trailingHasant, kar, signs) {
    let reph = false;
    if (cons[0] === 'র' && cons.length > 1) {
      reph = true;
      cons = cons.slice(1);
    }
    const core = [CHAR_KEY[cons[0]]];
    for (let k = 1; k < cons.length; k++) {
      const c = cons[k];
      if (c === 'র') core.push('z');
      else if (c === 'য') core.push('Z');
      else core.push('g', CHAR_KEY[c]);
    }
    if (trailingHasant) core.push('g');

    const [pre, post] = kar ? KAR[kar] : [[], []];
    const R = reph ? ['A'] : [];
    const sig = signs.map(x => SIGN_KEY[x]);
    const alts = [];
    // প্রধান বিজয় ক্রম: আগের-কার, ব্যঞ্জন/যুক্তাক্ষর, রেফ, পরের-কার, চিহ্ন
    pushUnique(alts, [...pre, ...core, ...R, ...post, ...sig]);
    // অনেকে রেফ কারের পরে দেন — সেটাও গ্রহণযোগ্য
    if (reph && post.length) pushUnique(alts, [...pre, ...core, ...post, ...R, ...sig]);
    // চন্দ্রবিন্দু কারের আগে দিলেও গ্রহণযোগ্য
    if (sig[0] === '&' && post.length) {
      const rest = sig.slice(1);
      pushUnique(alts, [...pre, ...core, ...R, '&', ...post, ...rest]);
      if (reph) pushUnique(alts, [...pre, ...core, '&', ...post, ...R, ...rest]);
    }
    return alts;
  }

  function singleAlts(ch) {
    if (ch >= '০' && ch <= '৯') return [[String(ch.charCodeAt(0) - 0x09E6)]];
    if (ch === '।') return [['G']];
    if (ch === '৳') return [['$']];
    if (SIGN_KEY[ch]) return [[SIGN_KEY[ch]]];
    if (KAR[ch]) return [[...KAR[ch][0], ...KAR[ch][1]]];
    if (ch === HASANT) return [['g']];
    if (CONSONANTS.has(ch)) return [[CHAR_KEY[ch]]];
    const code = ch.charCodeAt(0);
    if (ch.length === 1 && code >= 32 && code <= 126) {
      if (/[A-Za-z]/.test(ch) || BIJOY_RESERVED_ASCII.has(ch)) return [];
      return [[ch]];
    }
    return []; // টাইপ করা যায় না — স্বয়ংক্রিয়ভাবে বাদ যাবে
  }

  /**
   * বাংলা লেখা -> ইউনিট তালিকা। প্রতিটি ইউনিট: { text, alts }
   * alts = গ্রহণযোগ্য কী-ক্রমের তালিকা (প্রথমটি প্রধান)। খালি হলে ইউনিটটি টাইপ করতে হয় না।
   */
  function toUnits(text) {
    const s = [...normalize(text)];
    const units = [];
    let i = 0;
    while (i < s.length) {
      const start = i;
      const ch = s[i];
      let alts;
      if (CONSONANTS.has(ch)) {
        const cons = [ch];
        i++;
        if (s[i] === NUKTA) i++;
        while (s[i] === HASANT && CONSONANTS.has(s[i + 1])) {
          cons.push(s[i + 1]);
          i += 2;
          if (s[i] === NUKTA) i++;
        }
        let trailingHasant = false;
        if (s[i] === HASANT) {
          trailingHasant = true;
          i++;
        }
        let kar = null;
        if (!trailingHasant && KAR[s[i]]) {
          kar = s[i];
          i++;
        }
        const signs = [];
        while (SIGN_KEY[s[i]]) {
          signs.push(s[i]);
          i++;
        }
        alts = consonantAlts(cons, trailingHasant, kar, signs);
      } else if (VOWEL_KEYS[ch]) {
        i++;
        const seq = VOWEL_KEYS[ch].slice();
        // অ্যা, এ্যা — স্বরবর্ণের সাথে য-ফলা
        if (s[i] === HASANT && s[i + 1] === 'য') {
          seq.push('Z');
          i += 2;
        }
        if (KAR[s[i]]) {
          seq.push(...KAR[s[i]][0], ...KAR[s[i]][1]);
          i++;
        }
        while (SIGN_KEY[s[i]]) {
          seq.push(SIGN_KEY[s[i]]);
          i++;
        }
        alts = [seq];
      } else {
        i++;
        alts = singleAlts(ch);
      }
      units.push({ text: s.slice(start, i).join(''), alts });
    }
    return units;
  }

  /** ইংরেজি লেখা -> ইউনিট (প্রতিটি অক্ষর একটি ইউনিট) */
  function toUnitsEnglish(text) {
    const clean = String(text)
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[–—]/g, '-')
      .replace(/…/g, '...');
    return [...clean].map(ch => {
      const code = ch.charCodeAt(0);
      const ok = ch.length === 1 && code >= 32 && code <= 126;
      return { text: ch, alts: ok ? [[ch]] : [] };
    });
  }

  /** একটি বাংলা শব্দ/লেখা টাইপ করতে কোন কোন কী লাগে (প্রধান ক্রম অনুযায়ী) */
  function keysOf(text) {
    const set = new Set();
    let typeable = true;
    for (const u of toUnits(text)) {
      if (!u.alts.length) {
        typeable = false;
        continue;
      }
      u.alts[0].forEach(k => set.add(k));
    }
    return { keys: set, typeable };
  }

  /** কী-এর পাশে দেখানোর জন্য বাংলা লেবেল (কার/চিহ্নের আগে ◌ বসে) */
  function label(key) {
    const ch = BIJOY_KEYS[key];
    if (!ch) return '';
    const first = ch.codePointAt(0);
    const combining = (first >= 0x0981 && first <= 0x0983) || (first >= 0x09BC && first <= 0x09D7) || ch[0] === HASANT;
    return combining ? '◌' + ch : ch;
  }

  const api = {
    BIJOY_KEYS, VOWEL_KEYS, KAR, SIGN_KEY, CONSONANTS,
    normalize, toUnits, toUnitsEnglish, keysOf, label, isShifted
  };

  root.Bijoy = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
