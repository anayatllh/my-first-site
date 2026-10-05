/*
 * অনুশীলনের লেখা: শব্দ, বাক্য, অনুচ্ছেদ, হিসাব-নিকাশ ও সংখ্যা — বাংলা ও ইংরেজি।
 * পাঠগুলো (lessons) ধাপে ধাপে নতুন কী শেখায়।
 */
(function (root) {
  'use strict';

  const bn = {
    words: (
      'আমি তুমি সে আমরা তোমরা তারা আপনি এবং কিন্তু অথবা যদি তবে কারণ জন্য সাথে থেকে পর্যন্ত দিকে মধ্যে উপর নিচে ' +
      'আগে পরে এখন আজ কাল সকাল বিকাল রাত দিন মাস বছর সময় কাজ অফিস বাড়ি দেশ মানুষ পরিবার বন্ধু ভাই বোন মা বাবা ' +
      'ছেলে মেয়ে শিশু শিক্ষা বই খাতা কলম কাগজ পানি ভাত মাছ ডাল ফল ফুল গাছ নদী আকাশ সূর্য চাঁদ বৃষ্টি বাতাস রাস্তা ' +
      'গাড়ি ট্রেন বাজার দোকান টাকা দাম হিসাব খরচ আয় ব্যয় লাভ ক্ষতি ব্যবসা কারখানা শ্রমিক মালিক প্রতিষ্ঠান কোম্পানি ' +
      'ব্যাংক চেক নগদ বিল চালান রসিদ ভাউচার খতিয়ান জাবেদা ডেবিট ক্রেডিট মজুদ পণ্য ক্রয় বিক্রয় সরবরাহ গ্রাহক দেনাদার ' +
      'পাওনাদার ভ্যাট কর আয়কর রিটার্ন ইস্পাত রড লোহা উৎপাদন পরিমাণ মূল্য মোট বাকি জমা উত্তোলন সুদ ঋণ মূলধন সম্পদ দায় ' +
      'বাজেট প্রতিবেদন নিরীক্ষা অনুমোদন স্বাক্ষর তারিখ নম্বর সুন্দর ভালো বড় ছোট নতুন পুরাতন সহজ কঠিন দ্রুত ধীরে সঠিক ' +
      'ভুল প্রথম শেষ সব কিছু অনেক খুব আরও শিখি লিখি পড়ি বলি দেখি করি যাই আসি খাই হাসি ভাবি চিন্তা স্বপ্ন আশা ' +
      'ভালোবাসা স্বাধীনতা বাংলাদেশ ঢাকা চট্টগ্রাম বাংলা ভাষা কম্পিউটার অ্যাকাউন্ট ইন্টারনেট কাকা দাদা দাদু বাকি কিতাব ' +
      'দিক বুক তাক বাক কাক দুধ ধান খাদ্য তিথি ভিত বিধি ওজন ঔষধ ঐক্য উট ইট এক দুই তিন চার পাঁচ ছয় সাত আট নয় দশ ' +
      'যোগ বিয়োগ গুণ ভাগ শতাংশ হার কিস্তি মাসিক বার্ষিক দৈনিক বেতন ভাতা অগ্রিম সমন্বয় জরিমানা ছাড় কমিশন'
    ).split(' '),

    conjuncts: (
      'শিক্ষা পরীক্ষা ক্ষমা বৃক্ষ স্বাস্থ্য অঙ্ক সঞ্চয় সম্মান উজ্জ্বল বিদ্যুৎ চট্টগ্রাম স্পষ্ট কষ্ট ইস্পাত প্রস্তুত ' +
      'সংখ্যা ব্যবস্থা মধ্য শ্রদ্ধা বুদ্ধি যুদ্ধ গ্রাম ক্রয় বিক্রয় প্রতিষ্ঠান জ্ঞান বিজ্ঞান ঘণ্টা ঠান্ডা আন্তর্জাতিক ' +
      'কর্মকর্তা দক্ষ লক্ষ্য পদ্ধতি উদ্বৃত্ত স্থায়ী অস্থায়ী চুক্তি শক্তি ভক্তি রক্ত মুক্তি যুক্ত সম্পদ সম্পর্ক গল্প ' +
      'শিল্প অল্প বিকল্প দ্রব্য ক্ষুদ্র রাষ্ট্র উষ্ণ কৃষ্ণ তৃষ্ণা পুষ্প নিষ্পত্তি হিসাবরক্ষক অঙ্গ বাঙ্গালি পঞ্চাশ ' +
      'সন্ধ্যা বন্ধ অন্ধ সন্তান পন্থা ব্যক্তি অভ্যাস উচ্চ লজ্জা সত্য মিথ্যা দ্বিতীয় তৃতীয় কর্তন অর্থ পর্ব'
    ).split(' '),

    sentences: [
      'আমি প্রতিদিন সকালে বাংলা টাইপিং অনুশীলন করি।',
      'আমাদের কারখানায় প্রতিদিন অনেক টন রড উৎপাদন হয়।',
      'সঠিক হিসাব রাখা একজন হিসাবরক্ষকের প্রধান দায়িত্ব।',
      'নিয়মিত অনুশীলন করলে টাইপিংয়ের গতি অবশ্যই বাড়বে।',
      'বাংলাদেশ একটি সুন্দর ও সবুজ দেশ।',
      'মাসের শেষে সব ভাউচার যাচাই করে খতিয়ানে পোস্ট করতে হয়।',
      'সময়ের কাজ সময়ে করাই বুদ্ধিমানের কাজ।',
      'আজকের সভায় নতুন বাজেট অনুমোদন করা হয়েছে।',
      'সরবরাহকারীর বিল পরিশোধের আগে চালান মিলিয়ে নিন।',
      'ভালো স্বাস্থ্যের জন্য নিয়মিত হাঁটা দরকার।',
      'কম্পিউটারে দ্রুত টাইপ করতে পারলে অফিসের কাজ অনেক সহজ হয়।',
      'বই পড়ার অভ্যাস মানুষের জ্ঞান বাড়ায়।',
      'ব্যাংক হিসাবের বিবরণী প্রতি মাসে মিলিয়ে দেখতে হয়।',
      'ছোট ছোট সঞ্চয় থেকেই বড় বিনিয়োগ শুরু হয়।',
      'মাতৃভাষার প্রতি আমাদের সবার শ্রদ্ধা থাকা উচিত।',
      'নতুন কিছু শেখার কোনো বয়স নেই।',
      'আগামীকাল সকাল দশটায় নিরীক্ষা দল কারখানা পরিদর্শন করবে।',
      'গ্রাহকের সন্তুষ্টি ব্যবসার সাফল্যের মূল চাবিকাঠি।',
      'বৃষ্টির দিনে গরম খিচুড়ি খেতে সবাই ভালোবাসে।',
      'পরিশ্রম সৌভাগ্যের প্রসূতি।',
      'চট্টগ্রাম বন্দর দিয়ে দেশের বেশিরভাগ পণ্য আমদানি হয়।',
      'প্রতিটি লেনদেনের প্রমাণপত্র যত্ন করে রাখা উচিত।',
      'ধৈর্য ধরে কাজ করলে সাফল্য আসবেই।',
      'একুশে ফেব্রুয়ারি আমাদের আন্তর্জাতিক মাতৃভাষা দিবস।'
    ],

    paragraphs: [
      'টাইপিং শেখার মূল রহস্য হলো নিয়মিত অনুশীলন। প্রথমে গতির দিকে না তাকিয়ে নির্ভুলভাবে টাইপ করার চেষ্টা করুন। ' +
      'আঙুলগুলো সবসময় হোম রো-তে রাখুন এবং কিবোর্ডের দিকে না তাকিয়ে লেখার অভ্যাস করুন। প্রতিদিন মাত্র পনেরো মিনিট ' +
      'অনুশীলন করলে এক মাসের মধ্যেই আপনার গতি দ্বিগুণ হয়ে যাবে।',

      'একটি প্রতিষ্ঠানের আর্থিক অবস্থা বোঝার জন্য হিসাববিজ্ঞান অপরিহার্য। প্রতিটি লেনদেন প্রথমে জাবেদায় লেখা হয়, ' +
      'তারপর খতিয়ানে স্থানান্তর করা হয়। মাস শেষে রেওয়ামিল তৈরি করে দেখা হয় ডেবিট ও ক্রেডিটের যোগফল সমান কিনা। ' +
      'সবশেষে আয় বিবরণী ও আর্থিক অবস্থার বিবরণী প্রস্তুত করা হয়।',

      'বাংলা আমাদের মাতৃভাষা। ভাষার জন্য এদেশের মানুষ জীবন দিয়েছে, যা পৃথিবীর ইতিহাসে বিরল। সেই ত্যাগের স্মরণে ' +
      'একুশে ফেব্রুয়ারি এখন আন্তর্জাতিক মাতৃভাষা দিবস হিসেবে পালিত হয়। তাই শুদ্ধভাবে বাংলা লেখা ও বলা আমাদের সবার দায়িত্ব।',

      'ভবিষ্যতের নিরাপত্তার জন্য সঞ্চয় ও বিনিয়োগ দুটোই জরুরি। আয়ের একটি নির্দিষ্ট অংশ প্রতি মাসে আলাদা করে রাখুন। ' +
      'বিনিয়োগের আগে প্রতিষ্ঠানের আয়, দায় ও লভ্যাংশের ইতিহাস ভালোভাবে যাচাই করুন। ধৈর্য ও জ্ঞানই একজন সফল বিনিয়োগকারীর প্রধান শক্তি।',

      'ইস্পাত শিল্প দেশের অবকাঠামো উন্নয়নের মেরুদণ্ড। সেতু, ভবন ও রাস্তা তৈরিতে মানসম্পন্ন রডের চাহিদা প্রতিনিয়ত বাড়ছে। ' +
      'কাঁচামাল আমদানি থেকে শুরু করে উৎপাদন ও বিক্রয় পর্যন্ত প্রতিটি ধাপের খরচ সঠিকভাবে হিসাব করা এই শিল্পের সাফল্যের চাবিকাঠি।'
    ],

    accounting: [
      'নগদ ৫০,০০০ টাকা দিয়ে ব্যবসা শুরু করা হলো।',
      'সরবরাহকারীর কাছ থেকে বাকিতে ১০ টন রড ক্রয় করা হলো।',
      'বিক্রয়ের উপর ১৫% হারে ভ্যাট আদায় করা হয়েছে।',
      'বেতন বাবদ ৮৫,৫০০ টাকা ব্যাংক চেকের মাধ্যমে পরিশোধ করা হলো।',
      'উৎসে কর কর্তন বাবদ ২% টাকা কেটে রাখা হয়েছে।',
      'মাস শেষে ব্যাংক সমন্বয় বিবরণী প্রস্তুত করতে হবে।',
      'অগ্রিম আয়কর সমন্বয়ের জন্য চালানের কপি সংরক্ষণ করুন।',
      'মজুদ পণ্যের মূল্য ক্রয়মূল্য অথবা বাজারমূল্যের মধ্যে যেটি কম সেটি ধরা হয়।',
      'ডেবিট দিক ও ক্রেডিট দিকের যোগফল সবসময় সমান হতে হবে।',
      'মূসক-৬.৩ চালান ছাড়া কোনো পণ্য সরবরাহ করা যাবে না।',
      'রেওয়ামিল মিলে গেলে আর্থিক বিবরণী প্রস্তুত করা হয়।',
      'অবচয় বাবদ যন্ত্রপাতির মূল্য থেকে ১০% বাদ দেওয়া হলো।',
      'ভাউচার নম্বর ২০২৬/০৪৫ অনুমোদনের জন্য পাঠানো হয়েছে।',
      'পরিবহন খরচ বাবদ ট্রাক ভাড়া ১২,৫০০ টাকা নগদে পরিশোধ করা হলো।',
      'বকেয়া বিদ্যুৎ বিল ৩২,৭৮০ টাকা পরবর্তী মাসে পরিশোধ করা হবে।',
      'দেনাদারের কাছ থেকে ১,২৫,০০০ টাকার চেক পাওয়া গেল।'
    ]
  };

  const en = {
    words: (
      'the of and to in is you that it he was for on are as with his they at be this have from or one had by word but ' +
      'not what all were we when your can said there use an each which she do how their if will up other about out many ' +
      'then them these so some her would make like him into time has look two more write go see number no way could people ' +
      'my than first water been call who oil its now find long down day did get come made may part over new sound take only ' +
      'little work know place year live me back give most very after thing our just name good sentence man think say great ' +
      'where help through much before line right too mean old any same tell boy follow came want show also around form three ' +
      'small set put end does another well large must big even such because turn here why ask went men read need land ' +
      'different home us move try kind hand picture again change off play spell air away animal house point page letter ' +
      'mother answer found study still learn should world high every near add food between own below country plant last school ' +
      'father keep tree never start city earth eye light thought head under story saw left few while along might close something ' +
      'seem next hard open example begin life always those both paper together got group often run important until children ' +
      'side feet car mile night walk white sea began grow took river four carry state once book hear stop without second later'
    ).split(' '),

    business: (
      'account balance budget invoice receipt voucher ledger journal debit credit asset liability equity revenue expense profit ' +
      'loss cash bank cheque payment supplier customer purchase sales stock inventory tax vat audit report salary advance ' +
      'deposit loan interest capital depreciation accrual payable receivable statement reconcile approval factory steel ' +
      'production order delivery transport quantity rate amount total discount commission'
    ).split(' '),

    names: 'Dhaka Chattogram Bangladesh Karim Rahim Nusrat Farhana January March April Monday Friday Excel Google Sheet VAT Invoice Bank Steel Ltd'.split(' '),

    sentences: [
      'Practice every day and your typing speed will grow.',
      'Keep your fingers on the home row and do not look at the keyboard.',
      'Accuracy comes first; speed will follow with time.',
      'The quick brown fox jumps over the lazy dog.',
      'A good accountant checks every voucher before posting it.',
      'Our factory produces steel bars for roads, bridges and buildings.',
      'Please send the signed invoice to the accounts department.',
      'Small savings today can become a large investment tomorrow.',
      'Learning a new skill takes patience and regular practice.',
      'Typing without looking at the keys is called touch typing.',
      'The meeting will start at ten in the morning on Sunday.',
      'Reading books every day makes the mind sharp and calm.',
      'Automation saves time and reduces human error in office work.',
      'Google Sheets and Excel help us analyse data quickly.',
      'Always back up your important files to a safe place.',
      'Honesty is the best policy in business and in life.'
    ],

    paragraphs: [
      'Touch typing is a skill that pays for itself every single day. When you no longer need to look at the keyboard, ' +
      'your eyes stay on the screen and your mind stays on the work. Start slowly, focus on accuracy, and let your ' +
      'fingers learn where each key lives. Within a few weeks of steady practice, your speed will rise naturally.',

      'Every business transaction must be recorded in the journal first and then posted to the ledger. At the end of ' +
      'the month, a trial balance is prepared to check that total debits equal total credits. Finally, the income ' +
      'statement and the balance sheet show the true financial position of the company.',

      'Artificial intelligence is changing the way accountants work. Routine tasks such as data entry, bank ' +
      'reconciliation and invoice matching can now be automated. This gives professionals more time for analysis, ' +
      'planning and advising management on better decisions.',

      'Investing is not about getting rich quickly. It is about buying good businesses at fair prices and holding them ' +
      'with patience. Study the earnings, the debt and the dividend history of a company before you invest your money.'
    ],

    accounting: [
      'Cash Tk 50,000 was introduced as capital into the business.',
      'Purchased 10 tons of steel rod on credit from the supplier.',
      'VAT at 15% was collected on sales of Tk 2,40,000.',
      'Salary of Tk 85,500 was paid through bank cheque no. 457812.',
      'AIT at 2% was deducted at source from the supplier bill.',
      'Prepare the bank reconciliation statement by the 5th of every month.',
      'Debit: Office Rent Expense; Credit: Cash in Hand.',
      'Depreciation at 10% was charged on plant and machinery.',
      'Voucher No. 2026/045 has been sent for approval.',
      'Truck fare of Tk 12,500 was paid in cash for transport.',
      'Outstanding electricity bill of Tk 32,780 will be paid next month.',
      'Received a cheque of Tk 1,25,000 from a debtor.'
    ]
  };

  /* ---------- পাঠ (Lessons) ---------- */
  // keys = এই পাঠে নতুন কী; পূর্বের পাঠের কীগুলো স্বয়ংক্রিয়ভাবে যোগ হয়
  const lessons = {
    en: [
      { id: 'en1', title: 'হোম রো: f j', keys: 'fj', tip: 'দুই তর্জনী f আর j-এর উপর রাখুন। এই দুই কী-তে ছোট দাগ থাকে।' },
      { id: 'en2', title: 'হোম রো: d k', keys: 'dk', tip: 'মধ্যমা দিয়ে d ও k চাপুন।' },
      { id: 'en3', title: 'হোম রো: s l a ;', keys: 'sla;', tip: 'অনামিকা s ও l, কনিষ্ঠা a ও ;' },
      { id: 'en4', title: 'হোম রো: g h', keys: 'gh', tip: 'তর্জনী একটু সরিয়ে g ও h চাপুন, তারপর আবার f/j-তে ফিরুন।' },
      { id: 'en5', title: 'উপরের সারি: e i', keys: 'ei', tip: 'মধ্যমা উপরে তুলে e ও i চাপুন।' },
      { id: 'en6', title: 'উপরের সারি: r u', keys: 'ru', tip: 'তর্জনী দিয়ে r ও u।' },
      { id: 'en7', title: 'উপরের সারি: t y', keys: 'ty', tip: 'তর্জনী একটু ভিতরের দিকে বাড়িয়ে t ও y।' },
      { id: 'en8', title: 'উপরের সারি: w o q p', keys: 'woqp', tip: 'অনামিকা w ও o, কনিষ্ঠা q ও p।' },
      { id: 'en9', title: 'নিচের সারি: c v m ,', keys: 'cvm,', tip: 'আঙুল নিচে নামিয়ে চাপুন, তারপর হোম রো-তে ফিরুন।' },
      { id: 'en10', title: 'নিচের সারি: b n x z . /', keys: 'bnxz./', tip: 'b ও n তর্জনী, x ও . অনামিকা, z ও / কনিষ্ঠা।' },
      { id: 'en11', title: 'বড় হাতের অক্ষর (Shift)', type: 'capitals', tip: 'যে হাতে অক্ষর, তার উল্টো হাতের কনিষ্ঠা দিয়ে Shift চাপুন।' },
      { id: 'en12', title: 'সংখ্যা ও হিসাব', type: 'numbers', tip: 'সংখ্যার সারিতে আঙুল উপরে বাড়ান, কাজ শেষে হোম রো-তে ফিরুন।' },
      { id: 'en13', title: 'সাধারণ শব্দ', type: 'words', tip: 'শব্দগুলো একটানা টাইপ করুন, মাঝে থামবেন না।' },
      { id: 'en14', title: 'বাক্য', type: 'sentences', tip: 'বড় হাতের অক্ষর আর যতিচিহ্ন খেয়াল করুন।' },
      { id: 'en15', title: 'অফিস ও হিসাবের ভাষা', type: 'accounting', tip: 'অফিসে যে লেখা প্রতিদিন লাগে, সেগুলোই অনুশীলন করুন।' }
    ],
    bn: [
      { id: 'bn1', title: 'হোম রো: ক ত দ ব া', keys: 'jklhf', tip: 'ডান হাতের আঙুল j k l-এ, বাম তর্জনী f-এ। h = ব।' },
      { id: 'bn2', title: 'হোম রো: ি ু ৃ ্', keys: 'dsag', tip: 'ি-কার (d) ব্যঞ্জনের আগে চাপুন: কি = d j। g হলো হসন্ত (যুক্তাক্ষর)।' },
      { id: 'bn3', title: 'হোম রো Shift: খ থ ধ ভ অ ী ূ', keys: 'JKLHFDS', tip: 'Shift চেপে একই কী দিলে উপরের অক্ষর আসে।' },
      { id: 'bn4', title: 'উপরের সারি: ঙ য ড প ট', keys: 'qwert', tip: 'বাম হাত উপরের সারিতে।' },
      { id: 'bn5', title: 'উপরের সারি: চ জ হ গ ড়', keys: 'yuiop', tip: 'ডান হাত উপরের সারিতে।' },
      { id: 'bn6', title: 'উপরের সারি Shift: ং য় ঢ ফ ঠ ছ ঝ ঞ ঘ', keys: 'QWERTYUIOP', tip: 'ং = Shift+Q, য় = Shift+W।' },
      { id: 'bn7', title: 'নিচের সারি: র ন স ম ে ও', keys: 'vbnmcx', tip: 'ে-কার (c) ব্যঞ্জনের আগে: কে = c j।' },
      { id: 'bn8', title: 'নিচের সারি Shift: ল ণ ষ শ ৈ', keys: 'VBNMCX', tip: 'ল = Shift+V, শ = Shift+M।' },
      { id: 'bn9', title: 'র-ফলা, য-ফলা, রেফ', keys: 'zZA', tip: 'প্র = r z, ব্য = h Z, রেফ ব্যঞ্জনের পরে: কর্ম = j m A।' },
      { id: 'bn10', title: 'স্বরবর্ণ ও চিহ্ন', type: 'vowels', keys: 'G&\\|', tip: 'আ = g f, ই = g d, উ = g s, এ = g c। ঁ = Shift+7, ৎ = \\, । = Shift+G।' },
      { id: 'bn11', title: 'যুক্তাক্ষর', type: 'conjuncts', tip: 'দুই ব্যঞ্জনের মাঝে g: ক্ত = j g k, ক্ষ = j g N।' },
      { id: 'bn12', title: 'সংখ্যা ও টাকা', type: 'numbers', tip: 'বিজয়ে ১-০ সংখ্যার সারিতে, ৳ = Shift+4।' },
      { id: 'bn13', title: 'সাধারণ শব্দ', type: 'words', tip: 'প্রতিটি শব্দ মনে মনে ভেঙে নিন: আগে কার, তারপর ব্যঞ্জন।' },
      { id: 'bn14', title: 'বাক্য', type: 'sentences', tip: 'দাঁড়ি (।) = Shift+G।' },
      { id: 'bn15', title: 'হিসাব-নিকাশের লেখা', type: 'accounting', tip: 'ভাউচার, চালান, ভ্যাট — অফিসের রোজকার লেখা।' }
    ]
  };

  root.TypingContent = { bn, en, lessons };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.TypingContent;
})(typeof window !== 'undefined' ? window : globalThis);
