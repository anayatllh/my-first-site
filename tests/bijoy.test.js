// চালান: node tests/bijoy.test.js
const assert = require('assert');
const Bijoy = require('../assets/bangla.js');

function keys(text) {
  return Bijoy.toUnits(text).map(u => (u.alts[0] || []).join('')).join('');
}

const cases = [
  ['আমি', 'gfdm'],
  ['বাংলাদেশ', 'hfQVfclM'],
  ['ক্ষমা', 'jgNmf'],
  ['কি', 'dj'],
  ['কো', 'cjf'],
  ['কৌশল', 'cjXMV'],
  ['প্রিয়', 'drzW'],
  ['ব্যবসা', 'hZhnf'],
  ['কর্ম', 'jmA'],
  ['ধর্ম', 'LmA'],
  ['কীর্তি', 'jDdkA'],
  ['বার্তা', 'hfkAf'],
  ['ভর্ৎসনা', 'H\\Anbf'],
  ['চাঁদ', 'yf&l'],
  ['অ্যাকাউন্ট', 'FZfjfgsbgt'],
  ['স্বাস্থ্য', 'nghfngKZ'],
  ['উজ্জ্বল', 'gsugughV'],
  ['ঐক্য', 'gCjZ'],
  ['ঔষধ', 'gXNL'],
  ['ঋণ', 'gaB'],
  ['ওজন', 'xub'],
  ['উৎপাদন', 'gs\\rflb'],
  ['বাড়ি', 'hfdp'],
  ['৳ ১২,৫০০।', '$ 12,500G'],
  ['দুঃখ', 'ls|J'],
  ['শ্রদ্ধা', 'MzlgLf']
];

let failed = 0;
for (const [text, expected] of cases) {
  const got = keys(text);
  try {
    assert.strictEqual(got, expected);
    console.log('ok   ', text, '=>', got);
  } catch (e) {
    failed++;
    console.log('FAIL ', text, 'expected', expected, 'got', got);
  }
}

// বিকল্প ক্রম: রেফ কারের পরে, চন্দ্রবিন্দু কারের আগে
const barta = Bijoy.toUnits('র্তা')[0].alts.map(a => a.join(''));
assert.deepStrictEqual(barta, ['kAf', 'kfA']);
const chan = Bijoy.toUnits('চাঁ')[0].alts.map(a => a.join(''));
assert.deepStrictEqual(chan, ['yf&', 'y&f']);

// বিজয়ে টাইপ করা যায় না এমন অক্ষর বাদ যায়
assert.strictEqual(Bijoy.toUnits('VAT')[0].alts.length, 0);

if (failed) {
  console.error(`\n${failed} টি টেস্ট ব্যর্থ`);
  process.exit(1);
}
console.log('\nসব টেস্ট পাস ✔');
