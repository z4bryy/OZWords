const ALPHABETS = {
  cs: "AÁBCČDĎEÉĚFGHIÍJKLMNŇOÓPQRŘSŠTŤUÚŮVWXYÝZŽ".split(""),
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
};

const CATEGORY_KEYS = ["name", "city", "country", "animal", "plant", "food", "thing"];

const CATEGORY_ICONS = {
  name: "name",
  city: "city",
  country: "country",
  animal: "animal",
  plant: "plant",
  food: "food",
  thing: "thing",
};

const MODES = {
  classic: { icon: "star", color: "#6366f1", hintsEnabled: true, maxHints: 3, hintPenalty: 2 },
  blitz: { icon: "zap", color: "#f59e0b", hintsEnabled: false, maxHints: 0, hintPenalty: 0 },
  mini: { icon: "target", color: "#10b981", hintsEnabled: true, maxHints: 2, hintPenalty: 1 },
  school: { icon: "school", color: "#3b82f6", hintsEnabled: true, maxHints: 5, hintPenalty: 1 },
  marathon: { icon: "trophy", color: "#ec4899", hintsEnabled: true, maxHints: 2, hintPenalty: 2 },
};

const STRINGS = {
  cs: {
    title: "OZWords",
    subtitle: "Slovní hra do školy — hrajte spolu v síti",
    tagline: "Rychlé kolo · LAN · Zábava pro celou třídu",
    legalNotice:
      "OZWords je open-source hra podle tradičních pravidel. Bez chráněných názvů a cizích assetů.",
    creditsMadeBy: "Hra od",
    gameRules:
      "Piš slova na vylosované písmeno: Jméno · Město · Stát · Zvíře · Rostlina · Jídlo · Věc",
    qrScan: "Naskenuj QR v telefonu",
    leaveRoom: "Opustit místnost",
    homeBtn: "Domů",
    submitReady: "Vše hotovo — odešli!",
    keyboardHint: "Enter = další pole",
    joinRoom: "Připoj se do místnosti",
    yourName: "Tvoje jméno",
    pickAvatar: "Vyber si postavičku",
    join: "Hrát!",
    inRoom: "Jsi v místnosti",
    host: "učitel / hostitel",
    player: "hráč",
    shareUrl: "Spoluhráči otevřou tuto adresu:",
    copyLink: "Kopírovat odkaz",
    copied: "Odkaz zkopírován!",
    players: "Hráči",
    pointsShort: "b.",
    pickMode: "Vyber režim hry",
    pickPlayType: "Jak chceš hrát?",
    playOffline: "Offline",
    playOfflineDesc: "Sám/sama · bez sítě · procvičování",
    playOnline: "Online (LAN)",
    playOnlineDesc: "Celá třída · stejná Wi‑Fi · společně",
    offlineWelcome: "Trénuješ sám/sama. Losuj, piš a zlepšuj se!",
    hintsLeft: "Nápovědy: {left} / {max}",
    hintBtn: "Nápověda",
    hintPenaltyNote: "−{n} b. za nápovědu",
    hintsDisabled: "Tento režim nemá nápovědy",
    noHintsLeft: "Nápovědy vyčerpány",
    hintAlreadyUsed: "Nápověda už použita",
    startRound: "Začít kolo",
    waitHost: "Čeká se na hostitele…",
    letterDraw: "Losujeme písmeno!",
    stop: "STOP!",
    hostDrawing: "Hostitel losuje…",
    roundLetter: "Písmeno",
    roundProgress: "Kolo {current}/{total}",
    roundLabel: "Kolo {n}",
    modeLabel: "Režim",
    time: "Čas",
    timeUp: "Čas!",
    submittedCount: "{done} / {total} hráčů odeslalo",
    submitAnswers: "Odeslat odpovědi",
    submitted: "Odesláno",
    fieldPlaceholder: "Slovo na {letter}…",
    fieldRequired: "{label} — vyplň!",
    fieldMustStart: "Musí začínat na {letter}",
    fixErrors: "Oprav zvýrazněná pole",
    answersSent: "Super! Čekáme na ostatní…",
    scoringNow: "Vyhodnocujeme tvé odpovědi…",
    offlineDone: "Hotovo! Podívej se na své body.",
    roundResults: "Výsledky kola",
    finalResults: "Finále turnaje!",
    letter: "Písmeno",
    standings: "Pořadí",
    scoreLine: "{name} — {total} b. (+{round})",
    nextRound: "Další kolo →",
    newGame: "Nová hra",
    emptyAnswer: "—",
    roundWinner: "Vítěz kola",
    speedKing: "Nejrychlejší",
    speedBonus: "+{n} bonus",
    podium: "Stupně vítězů",
    toastSubmitted: "{name} odeslal/a odpovědi",
    toastFirst: "{name} odeslal/a jako první!",
    soundOn: "Zvuk zap",
    soundOff: "Zvuk vyp",
    statusReady: "Připraven",
    statusDone: "Hotovo",
    statusWaiting: "Píše…",
    stepLobby: "Třída",
    stepSpin: "Losování",
    stepPlay: "Hra",
    stepResults: "Výsledky",
    phaseLobby: "Vítá tě třída!",
    phaseSpin: "Losujeme písmeno!",
    phasePlay: "Piš co nejrychleji!",
    phaseResults: "Výsledky jsou tady!",
    phaseFinal: "Máme vítěze turnaje!",
    teacherWelcome: "Jsi učitel — vedeš celou třídu. Vyber režim a spusť kolo.",
    studentWelcome: "Jsi ve hře! Počkej, až učitel spustí kolo.",
    activityTitle: "Co se děje",
    activityJoin: "{name} se připojil/a",
    activityStart: "Kolo právě začalo",
    activityEmpty: "Čekáme na spoluhráče…",
    fieldsProgress: "Vyplněno {done} / {total} kategorií",
    schoolTips: [
      "Unikátní odpověď = nejvíc bodů!",
      "Kdo odešle první, dostane bonus za rychlost.",
      "Piš slova, která opravdu existují — učitel může kontrolovat.",
      "Spolupracujte fair play — je to hra pro celou třídu.",
    ],
    errNameRequired: "Zadej jméno.",
    errRoundInProgress: "Probíhá kolo — počkej.",
    errEnterNameFirst: "Nejdřív zadej jméno.",
    modes: {
      classic: { name: "Klasik", desc: "2 min · 7 kategorií · 3 nápovědy" },
      blitz: { name: "Blesk", desc: "45 s · bez nápověd · rychle!" },
      mini: { name: "Mini", desc: "1 min · 4 kategorie · 2 nápovědy" },
      school: { name: "Třída", desc: "3 min · 5 nápověd · vyšší body" },
      marathon: { name: "Maraton", desc: "5 kol · 2 nápovědy / kolo" },
    },
    categories: {
      name: "Jméno",
      city: "Město",
      country: "Stát",
      animal: "Zvíře",
      plant: "Rostlina",
      food: "Jídlo",
      thing: "Věc",
    },
  },
  en: {
    title: "OZWords",
    subtitle: "School word game — play together on LAN",
    tagline: "Quick rounds · LAN · Fun for the whole class",
    legalNotice:
      "OZWords is an open-source game based on traditional rules. No trademarked names or third-party assets.",
    creditsMadeBy: "Game by",
    gameRules:
      "Write words for the drawn letter: Name · City · Country · Animal · Plant · Food · Thing",
    qrScan: "Scan QR on your phone",
    leaveRoom: "Leave room",
    homeBtn: "Home",
    submitReady: "All done — submit!",
    keyboardHint: "Enter = next field",
    joinRoom: "Join the room",
    yourName: "Your name",
    pickAvatar: "Pick your avatar",
    join: "Play!",
    inRoom: "You are in the room",
    host: "teacher / host",
    player: "player",
    shareUrl: "Teammates open this address:",
    copyLink: "Copy link",
    copied: "Link copied!",
    players: "Players",
    pointsShort: "pts",
    pickMode: "Choose game mode",
    pickPlayType: "How do you want to play?",
    playOffline: "Offline",
    playOfflineDesc: "Solo · no network · practice",
    playOnline: "Online (LAN)",
    playOnlineDesc: "Whole class · same Wi‑Fi · together",
    offlineWelcome: "Solo practice. Draw, write, and improve!",
    hintsLeft: "Hints: {left} / {max}",
    hintBtn: "Hint",
    hintPenaltyNote: "−{n} pts per hint",
    hintsDisabled: "No hints in this mode",
    noHintsLeft: "No hints left",
    hintAlreadyUsed: "Hint already used",
    startRound: "Start round",
    waitHost: "Waiting for host…",
    letterDraw: "Drawing a letter!",
    stop: "STOP!",
    hostDrawing: "Host is drawing…",
    roundLetter: "Letter",
    roundProgress: "Round {current}/{total}",
    roundLabel: "Round {n}",
    modeLabel: "Mode",
    time: "Time",
    timeUp: "Time's up!",
    submittedCount: "{done} / {total} players submitted",
    submitAnswers: "Submit answers",
    submitted: "Submitted",
    fieldPlaceholder: "Word for {letter}…",
    fieldRequired: "{label} — fill in!",
    fieldMustStart: "Must start with {letter}",
    fixErrors: "Fix highlighted fields",
    answersSent: "Nice! Waiting for others…",
    scoringNow: "Scoring your answers…",
    offlineDone: "Done! Check your score.",
    roundResults: "Round results",
    finalResults: "Tournament finale!",
    letter: "Letter",
    standings: "Standings",
    scoreLine: "{name} — {total} pts (+{round})",
    nextRound: "Next round →",
    newGame: "New game",
    emptyAnswer: "—",
    roundWinner: "Round winner",
    speedKing: "Speed king",
    speedBonus: "+{n} bonus",
    podium: "Winner podium",
    toastSubmitted: "{name} submitted",
    toastFirst: "{name} submitted first!",
    soundOn: "Sound on",
    soundOff: "Sound off",
    statusReady: "Ready",
    statusDone: "Done",
    statusWaiting: "Typing…",
    stepLobby: "Class",
    stepSpin: "Draw",
    stepPlay: "Play",
    stepResults: "Results",
    phaseLobby: "Welcome to class!",
    phaseSpin: "Drawing a letter!",
    phasePlay: "Write as fast as you can!",
    phaseResults: "Results are in!",
    phaseFinal: "We have a tournament winner!",
    teacherWelcome: "You are the teacher — lead the class. Pick a mode and start.",
    studentWelcome: "You are in! Wait for the teacher to start the round.",
    activityTitle: "Live activity",
    activityJoin: "{name} joined",
    activityStart: "Round just started",
    activityEmpty: "Waiting for classmates…",
    fieldsProgress: "Filled {done} / {total} categories",
    schoolTips: [
      "Unique answer = most points!",
      "First to submit gets a speed bonus.",
      "Write real words — the teacher may check.",
      "Play fair — it's a game for the whole class.",
    ],
    errNameRequired: "Enter your name.",
    errRoundInProgress: "Round in progress — wait.",
    errEnterNameFirst: "Enter your name first.",
    modes: {
      classic: { name: "Classic", desc: "2 min · 7 categories · 3 hints" },
      blitz: { name: "Blitz", desc: "45 s · no hints · fast!" },
      mini: { name: "Mini", desc: "1 min · 4 categories · 2 hints" },
      school: { name: "Classroom", desc: "3 min · 5 hints · higher points" },
      marathon: { name: "Marathon", desc: "5 rounds · 2 hints / round" },
    },
    categories: {
      name: "Name",
      city: "City",
      country: "Country",
      animal: "Animal",
      plant: "Plant",
      food: "Food",
      thing: "Thing",
    },
  },
};

function readStorage(key, legacyKey) {
  const value = localStorage.getItem(key);
  if (value !== null) return value;
  const legacy = localStorage.getItem(legacyKey);
  if (legacy !== null) {
    localStorage.setItem(key, legacy);
  }
  return legacy;
}

function detectLang() {
  const saved = readStorage("ozwords-lang", "alpharound-lang");
  if (saved === "cs" || saved === "en") return saved;
  return navigator.language.toLowerCase().startsWith("cs") ? "cs" : "en";
}

let currentLang = detectLang();

function getLang() {
  return currentLang;
}

function setLang(lang) {
  if (lang !== "cs" && lang !== "en") return;
  currentLang = lang;
  localStorage.setItem("ozwords-lang", lang);
  document.documentElement.lang = lang;
}

function t(key, vars = {}) {
  const parts = key.split(".");
  let value = STRINGS[currentLang];
  for (const part of parts) {
    value = value?.[part];
  }
  if (value === undefined) {
    value = parts.reduce((obj, part) => obj?.[part], STRINGS.en) ?? key;
  }
  if (typeof value !== "string") return key;
  return Object.entries(vars).reduce(
    (text, [name, replacement]) => text.replaceAll(`{${name}}`, String(replacement)),
    value
  );
}

function categoryLabel(key) {
  return STRINGS[currentLang].categories[key] ?? key;
}

function modeLabel(mode) {
  return t(`modes.${mode}.name`);
}

function modeDesc(mode) {
  return t(`modes.${mode}.desc`);
}

function getAlphabet(lang = currentLang) {
  return ALPHABETS[lang] ?? ALPHABETS.en;
}

function normalizeText(text, lang = currentLang) {
  return String(text || "").trim().toLocaleUpperCase(lang === "cs" ? "cs" : "en");
}

function startsWithLetter(word, letter, lang = currentLang) {
  const value = normalizeText(word, lang);
  return value.length > 0 && value.startsWith(normalizeText(letter, lang));
}

function translateError(code) {
  const map = {
    NAME_REQUIRED: "errNameRequired",
    ROUND_IN_PROGRESS: "errRoundInProgress",
  };
  const key = map[code];
  return key ? t(key) : code;
}

function getClientModeConfig(mode) {
  return MODES[mode] || MODES.classic;
}

function modeHintsDesc(mode) {
  const cfg = getClientModeConfig(mode);
  if (!cfg.hintsEnabled) return t("hintsDisabled");
  return t("hintsLeft", { left: cfg.maxHints, max: cfg.maxHints }) + " · " + t("hintPenaltyNote", { n: cfg.hintPenalty });
}

function getActiveCategories(state) {
  return state?.activeCategories || CATEGORY_KEYS;
}

function getPlayType() {
  const saved = readStorage("ozwords-play", "alpharound-play");
  return saved === "offline" ? "offline" : "online";
}

function setPlayType(type) {
  if (type !== "offline" && type !== "online") return;
  localStorage.setItem("ozwords-play", type);
}

if (typeof module !== "undefined") {
  module.exports = {
    ALPHABETS,
    CATEGORY_KEYS,
    CATEGORY_ICONS,
    MODES,
    getLang,
    setLang,
    t,
    categoryLabel,
    modeLabel,
    modeDesc,
    getAlphabet,
    normalizeText,
    startsWithLetter,
    translateError,
    getActiveCategories,
    getPlayType,
    setPlayType,
    getClientModeConfig,
    modeHintsDesc,
  };
}
