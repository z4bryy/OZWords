const ALPHABETS = {
  cs: "AÁBCČDĎEÉĚFGHIÍJKLMNŇOÓPQRŘSŠTŤUÚŮVWXYÝZŽ".split(""),
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
};

const CATEGORY_KEYS = ["name", "city", "country", "animal", "plant", "food", "thing"];

const MODES = {
  classic: {
    roundSeconds: 120,
    categories: CATEGORY_KEYS,
    uniquePoints: 10,
    duplicatePoints: 5,
    speedBonus: 3,
    targetRounds: null,
    hintsEnabled: true,
    maxHints: 3,
    hintPenalty: 2,
  },
  blitz: {
    roundSeconds: 45,
    categories: CATEGORY_KEYS,
    uniquePoints: 10,
    duplicatePoints: 5,
    speedBonus: 5,
    targetRounds: null,
    hintsEnabled: false,
    maxHints: 0,
    hintPenalty: 0,
  },
  mini: {
    roundSeconds: 60,
    categories: ["name", "city", "animal", "food"],
    uniquePoints: 10,
    duplicatePoints: 5,
    speedBonus: 2,
    targetRounds: null,
    hintsEnabled: true,
    maxHints: 2,
    hintPenalty: 1,
  },
  school: {
    roundSeconds: 180,
    categories: CATEGORY_KEYS,
    uniquePoints: 15,
    duplicatePoints: 8,
    speedBonus: 5,
    targetRounds: null,
    hintsEnabled: true,
    maxHints: 5,
    hintPenalty: 1,
  },
  marathon: {
    roundSeconds: 90,
    categories: CATEGORY_KEYS,
    uniquePoints: 10,
    duplicatePoints: 5,
    speedBonus: 3,
    targetRounds: 5,
    hintsEnabled: true,
    maxHints: 2,
    hintPenalty: 2,
  },
};

const { AVATARS, normalizeAvatarId } = require("./icons");

function getModeConfig(mode) {
  return MODES[mode] || MODES.classic;
}

function normalizeText(text, lang) {
  const locale = lang === "cs" ? "cs" : "en";
  return String(text || "").trim().toLocaleUpperCase(locale);
}

function startsWithLetter(word, letter, lang) {
  const value = normalizeText(word, lang);
  return value.length > 0 && value.startsWith(normalizeText(letter, lang));
}

function pickRandomLetter(lang) {
  const alphabet = ALPHABETS[lang] || ALPHABETS.en;
  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

module.exports = {
  ALPHABETS,
  CATEGORY_KEYS,
  MODES,
  AVATARS,
  normalizeAvatarId,
  getModeConfig,
  normalizeText,
  startsWithLetter,
  pickRandomLetter,
};
