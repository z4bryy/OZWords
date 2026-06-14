const HINT_WORDS = {
  cs: {
    name: {
      A: ["Adam", "Anna"], B: ["Barbora", "Boris"], C: ["Cyril", "Clara"], D: ["David", "Dana"],
      E: ["Eva", "Erik"], F: ["Filip", "Franta"], H: ["Honza", "Hana"], J: ["Jana", "Jirka"],
      K: ["Karel", "Klára"], L: ["Lucie", "Lukáš"], M: ["Marie", "Martin"], P: ["Petr", "Pavla"],
      T: ["Tomáš", "Tereza"], V: ["Věra", "Vít"],
    },
    city: {
      B: ["Brno", "Beroun"], H: ["Hradec"], K: ["Kolín"], L: ["Liberec"], O: ["Olomouc"],
      P: ["Praha", "Plzeň"], Ú: ["Ústí"], Z: ["Zlín"],
    },
    country: {
      A: ["Austrálie"], B: ["Belgie", "Bulharsko"], Č: ["Česko"], D: ["Dánsko"],
      E: ["Estonsko"], F: ["Finsko", "Francie"], I: ["Itálie"], J: ["Japonsko"],
      K: ["Kanada", "Korea"], M: ["Maďarsko", "Mexiko"], N: ["Norsko", "Německo"],
      P: ["Polsko", "Portugalsko"], R: ["Rakousko", "Rusko"], S: ["Slovensko", "Španělsko"],
      T: ["Turecko"], U: ["Ukrajina"], V: ["Vietnam"],
    },
    animal: {
      A: ["antilopa", "anakonda"], B: ["brouk", "bobr"], D: ["delfín", "divočák"],
      E: ["elefant"], H: ["had", "hlodavec"], K: ["kočka", "koza"], L: ["lev", "labrador"],
      M: ["medvěd", "myš"], O: ["opice", "osel"], P: ["pes", "panda"], R: ["ryba", "rys"],
      S: ["slon", "sova"], T: ["tygr", "tučňák"], V: ["vrabec", "vlk"], Z: ["zebra", "zajíc"],
    },
    plant: {
      B: ["borůvka", "břečťan"], D: ["dub", "daisy"], J: ["jablko", "jitrocel"],
      K: ["kopřiva", "květina"], L: ["lípa", "levandule"], M: ["máta", "mochyně"],
      P: ["pampeliška", "petržel"], R: ["růže", "rakytník"], S: ["smrk", "sluneflower"],
      T: ["tulipán", "tráva"], V: ["violka", "vinná réva"],
    },
    food: {
      B: ["banán", "brambora"], C: ["cukr", "citrón"], H: ["houska", "hruška"],
      J: ["jablko", "jogurt"], K: ["koláč", "klobása"], M: ["máslo", "med"],
      O: ["ovoce", "olej"], P: ["pizza", "paprika"], R: ["rýže", "rohlík"],
      S: ["syr", "salát"], T: ["těstoviny", "toast"], V: ["voda", "vařečka"],
    },
    thing: {
      A: ["auto", "album"], B: ["batoh", "boty"], C: ["ciferník", "clona"],
      D: ["deska", "dveře"], H: ["hodiny", "hřeben"], K: ["kniha", "klíč"],
      L: ["lamba", "lahev"], M: ["mobil", "míč"], N: ["nůž", "notebook"],
      P: ["pero", "počítač"], S: ["stůl", "sešit"], T: ["telefon", "taška"],
      V: ["vlak", "vana"], Z: ["zrcadlo", "zámek"],
    },
  },
  en: {
    name: {
      A: ["Alice", "Andrew"], B: ["Ben", "Betty"], C: ["Chris", "Claire"], D: ["David", "Diana"],
      E: ["Emma", "Ethan"], F: ["Frank", "Fiona"], G: ["George", "Grace"], H: ["Henry", "Hannah"],
      J: ["Jack", "Julia"], K: ["Kate", "Kevin"], L: ["Lucy", "Leo"], M: ["Mike", "Maria"],
      P: ["Paul", "Penny"], R: ["Ryan", "Rose"], S: ["Sam", "Sarah"], T: ["Tom", "Tina"],
    },
    city: {
      A: ["Amsterdam", "Athens"], B: ["Berlin", "Boston"], C: ["Chicago", "Cairo"],
      D: ["Dublin", "Dubai"], L: ["London", "Lisbon"], M: ["Madrid", "Moscow"],
      N: ["New York", "Nairobi"], P: ["Paris", "Prague"], R: ["Rome", "Riga"],
      S: ["Sydney", "Stockholm"], T: ["Tokyo", "Toronto"], V: ["Vienna", "Venice"],
    },
    country: {
      A: ["Australia", "Austria"], B: ["Belgium", "Brazil"], C: ["Canada", "China"],
      D: ["Denmark"], E: ["Egypt", "England"], F: ["Finland", "France"],
      G: ["Germany", "Greece"], I: ["India", "Italy"], J: ["Japan"],
      M: ["Mexico", "Morocco"], N: ["Norway", "Netherlands"], P: ["Poland", "Portugal"],
      S: ["Spain", "Sweden"], T: ["Turkey", "Thailand"], U: ["USA", "Ukraine"],
    },
    animal: {
      A: ["ant", "alligator"], B: ["bear", "bee"], C: ["cat", "cow"], D: ["dog", "duck"],
      E: ["eagle", "elephant"], F: ["fox", "frog"], G: ["goat", "gorilla"],
      H: ["horse", "hamster"], L: ["lion", "lizard"], M: ["mouse", "monkey"],
      P: ["pig", "panda"], R: ["rabbit", "rhino"], S: ["snake", "sheep"],
      T: ["tiger", "turtle"], W: ["whale", "wolf"], Z: ["zebra"],
    },
    plant: {
      A: ["apple tree", "aloe"], B: ["bamboo", "basil"], C: ["cactus", "clover"],
      D: ["daisy", "dandelion"], F: ["fern", "fig"], G: ["grass", "grape"],
      L: ["lily", "lavender"], O: ["oak", "orange tree"], P: ["palm", "peony"],
      R: ["rose", "reed"], S: ["sunflower", "spruce"], T: ["tulip", "tree"],
      V: ["violet", "vine"],
    },
    food: {
      A: ["apple", "avocado"], B: ["bread", "banana"], C: ["cake", "cheese"],
      E: ["egg", "energy bar"], F: ["fish", "fries"], G: ["grape", "garlic"],
      H: ["honey", "ham"], I: ["ice cream"], M: ["milk", "muffin"],
      O: ["orange", "olive"], P: ["pizza", "pasta"], R: ["rice", "roll"],
      S: ["soup", "salad"], T: ["toast", "tea"], W: ["watermelon", "waffle"],
    },
    thing: {
      A: ["apple", "alarm"], B: ["book", "bag"], C: ["chair", "clock"],
      D: ["door", "desk"], E: ["eraser"], G: ["game", "glasses"],
      H: ["hat", "house"], K: ["key", "kite"], L: ["lamp", "laptop"],
      M: ["map", "mirror"], P: ["pen", "phone"], R: ["ruler", "radio"],
      S: ["spoon", "shoe"], T: ["table", "ticket"], U: ["umbrella"],
      W: ["watch", "wallet"],
    },
  },
};

const CATEGORY_LABELS = {
  cs: {
    name: "jméno", city: "město", country: "stát", animal: "zvíře",
    plant: "rostlina", food: "jídlo", thing: "věc",
  },
  en: {
    name: "name", city: "city", country: "country", animal: "animal",
    plant: "plant", food: "food", thing: "thing",
  },
};

function getHint(lang, category, letter) {
  const L = String(letter || "A").trim().toLocaleUpperCase(lang === "cs" ? "cs" : "en");
  const pool = HINT_WORDS[lang === "cs" ? "cs" : "en"]?.[category]?.[L];
  const catLabel = CATEGORY_LABELS[lang === "cs" ? "cs" : "en"]?.[category] || category;

  if (pool?.length) {
    const word = pool[Math.floor(Math.random() * pool.length)];
    return lang === "cs"
      ? `Tip pro ${catLabel} na „${L}": např. „${word}"`
      : `Hint for ${catLabel} with „${L}": e.g. „${word}"`;
  }

  return lang === "cs"
    ? `Tip: vymysli ${catLabel} na písmeno „${L}"`
    : `Hint: think of a ${catLabel} starting with „${L}"`;
}

if (typeof module !== "undefined") {
  module.exports = { getHint, HINT_WORDS };
}
