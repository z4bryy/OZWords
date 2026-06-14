# OZWords — jak to funguje

Slovní hra do školy od [ozdigitals.com](https://ozdigitals.com). Open-source projekt na [GitHubu](https://github.com/z4bryy/OZWords).

## Pravidla

1. Vylosuje se **písmeno** (abeceda se točí, hostitel zmáčkne STOP).
2. Každý hráč napíše slova na toto písmeno do kategorií:
   **Jméno → Město → Stát → Zvíře → Rostlina → Jídlo → Věc**
3. Po odeslání odpovědí se kolo **ukončí hned** — nemusíte čekat do konce časomíry (solo i když jste sami v místnosti).
4. **Unikátní odpověď** = nejvíc bodů. Stejná odpověď u více hráčů = méně bodů.
5. **První odeslaný** hráč může dostat bonus za rychlost.

## Režimy hry

| Režim | Popis |
|-------|--------|
| Klasik | 2 min, 7 kategorií, 3 nápovědy |
| Blesk | 45 s, bez nápověd |
| Mini | 1 min, 4 kategorie |
| Třída | 3 min, 5 nápověd, vyšší body |
| Maraton | 5 kol za sebou |

## Jak spustit (učitel / hostitel)

```powershell
cd c:\Users\admin\Desktop\mmsk
npm install
npm start
```

Otevřete **http://localhost:3000** na počítači učitele.

- **Online (LAN):** Spoluhráči na stejné Wi‑Fi naskenují QR kód nebo otevřou zobrazenou adresu (např. `http://192.168.x.x:3000`).
- **Offline:** Procvičování sólo v prohlížeči bez sítě.

## Ovládání během hry

- **Enter** — skok na další pole
- **💡** — nápověda (pokud režim povoluje, − body)
- Zelené tlačítko **Odeslat** — až jsou všechna pole vyplněna správně

## Tipy pro třídu

- Učitel vede hru jako hostitel — vybere režim a spustí kolo.
- Žáci se připojí mobilem nebo tablety přes QR kód.
- Zapněte zvuk 🔊 pro lepší atmosféru ve třídě.

---

## Plán na zítra: kontrola slov

> **Stav dnes:** hra kontroluje jen to, že pole není prázdné a že slovo **začíná správným písmenem**.  
> Neověřuje, jestli slovo existuje, dává smysl v dané kategorii, nebo jestli je vhodné pro děti.

### Proč to potřebujeme

Bez kontroly může hráč napsat cokoliv — např. **„nic“** jako město, stát i věc, nebo vymyšlená slova jen proto, aby prošla kontrola písmene. Ve školní hře musí platit:

1. **Slovo musí být reálné** — existuje v jazyce (CS/EN podle místnosti).
2. **Slovo musí sedět do kategorie** — „Praha“ je město, „nic“ není stát ani věc.
3. **Slovo musí být vhodné pro děti** — žádné sprosté výrazy, urážky, rasismus, násilí, sexuální obsah apod.

### Co budeme kontrolovat

| Typ kontroly | Příklad špatné odpovědi | Co chceme |
|--------------|------------------------|-----------|
| Prázdné / písmeno | (už funguje) | ✅ hotovo |
| Nesmysl / placeholder | „nic“, „xxx“, „aaa“, „–“ | zamítnout |
| Neexistující slovo | „blablabla“ | zamítnout nebo upozornit |
| Špatná kategorie | stát = „auto“, jídlo = „stůl“ | zamítnout nebo snížit body |
| Nevhodný obsah | sprostá slova, rasismus, urážky | **tvrdě zamítnout** + hláška |

### Návrh řešení (implementace zítra)

**1. Seznam zakázaných slov (blocklist)**  
- Lokální soubor `data/blocklist-cs.json` / `data/blocklist-en.json`  
- Sprostá slova, urážky, rasistické výrazy, běžné obcházení (např. hvězdičky, mezery)  
- Kontrola **před odesláním** i **na serveru** (aby nešlo obejít klientem)

**2. Seznam / databáze povolených nebo ověřených slov**  
- Minimálně pro kategorie **město, stát, zvíře, rostlina, jídlo** — slovníky nebo JSON se známými položkami  
- U **jména** a **věci** složitější — kombinace whitelistu + pravidel (min. délka, ne jen opakování písmen)

**3. Pravidla proti „nic“ a nesmyslům**  
- Zamítnout krátké placeholdery: `nic`, `n/a`, `xxx`, `-`, `.`, stejné písmeno opakované  
- Volitelně: kontrola proti frekvenčnímu slovníku (slovo musí být v češtině/angličtině známé)

**4. Chování ve hře**  
- **Před odesláním:** červené pole + srozumitelná hláška (CS/EN)  
- **Po odeslání (online):** server stejnou kontrolu znovu; neplatné = 0 bodů v kategorii  
- **Učitel/hostitel:** možnost ručně označit odpověď jako neplatnou ve výsledcích (záloha)

**5. Soubory / místa v kódu**  
- `shared.js` — společná funkce `validateWord(word, category, lang)`  
- `app.js` — kontrola ve formuláři před odesláním  
- `server.js` / `offline.js` — stejná logika při bodování  
- `i18n.js` — nové hlášky (`invalidWord`, `inappropriateWord`, `wrongCategory`, …)

### Úkoly na zítra (checklist)

- [ ] Připravit blocklist CS (+ EN) — školní verze, pravidelně doplňovat
- [ ] Připravit slovníky kategorií (města, státy, zvířata, …) nebo napojit jednoduchý zdroj
- [ ] Implementovat `validateWord()` v `shared.js`
- [ ] Napojit validaci v klientovi i na serveru
- [ ] Přidat přeložené chybové hlášky
- [ ] Otestovat: „nic“, sprosté slovo, správné slovo, špatná kategorie
- [ ] Dopsat do tohoto MD finální pravidla pro učitele

### Otevřené otázky (rozhodnout zítra)

- **Striktní vs. mírný režim:** zamítnout hned, nebo jen varování a učitel rozhodne?
- **Jména:** povolit cizí/raritní jména, nebo jen seznam běžných?
- **Offline:** stačí lokální slovníky, nebo později API (slovník.cz, Wiktionary)?
- **Kdo spravuje blocklist:** ručně v repu, nebo export z existující školní filtrace?

---

## Plán na zítra: patička, landing page a recenze

### 1. Patička — text na ikony

> **Stav dnes:** v patičce je text  
> *„Hra od ozdigitals.com · Instagram @ozdigitals · GitHub z4bryy“*  
> (viz `index.html` → `.legal-footer` / `.credits`).

**Cíl:** místo dlouhého textu řada **ikon s odkazem** (Lucide / Iconify, stejně jako zbytek UI):

| Ikona | Odkaz | Popisek (aria / title) |
|-------|--------|-------------------------|
| 🌐 web | https://ozdigitals.com | ozdigitals.com |
| 📷 Instagram | https://instagram.com/ozdigitals | @ozdigitals |
| 💻 GitHub | https://github.com/z4bryy/OZWords | GitHub z4bryy |

- Krátký text typu „Hra od“ může zůstat, nebo jen ikony + tooltip
- Stejný styl jako `.icon-btn` / sociální řádek v patičce
- CS/EN popisky v `i18n.js`

**Soubory:** `index.html`, `styles.css`, `icons.js`, `i18n.js`, `app.js` (render ikon)

---

### 2. Informační stránka (landing / About)

**Cíl:** samostatná stránka (např. `/info.html` nebo sekce `#info` / tlačítko „O hře“ na úvodní obrazovce) s textem pro návštěvníky, učitele a rodiče.

**Obsah stránky (návrh textu):**

- **Co je OZWords** — slovní hra na vylosované písmeno do kategorií (jméno, město, stát, zvíře, rostlina, jídlo, věc).
- **Inspirace** — hra vychází z **tradiční / známé kategoriové hry** (jako „Město, jméno…“), převedené do moderní podoby pro školu a LAN multiplayer.
- **Pro koho je určená** — **do škol** (učitel jako hostitel, žáci přes QR), **s kamarády** doma nebo na stejné Wi‑Fi, **offline** procvičování sólo.
- **Jak funguje** — stručný přehled pravidel (odkaz na tuto příručku nebo stejný obsah zkráceně).
- **Kdo ji vytvořil**
  - **Autor hry / vývoj:** **z4bryy** — Instagram [@z4bryy](https://instagram.com/z4bryy)
  - **Projekt / značka:** **ozdigitals.com** — web, sociální sítě níže
- **Open source** — MIT, kód na GitHubu [z4bryy/OZWords](https://github.com/z4bryy/OZWords)

**Sociální sítě na stránce (ikony + odkazy):**

| Kdo | Odkaz |
|-----|--------|
| ozdigitals.com | https://ozdigitals.com |
| ozdigitals Instagram | https://instagram.com/ozdigitals |
| z4bryy Instagram | https://instagram.com/z4bryy |
| GitHub (repozitář) | https://github.com/z4bryy/OZWords |

*(Později doplnit další sítě ozdigitals, pokud existují — Facebook, YouTube, LinkedIn…)*

**UX:**
- Odkaz „O hře“ / „Jak to funguje?“ v hero nebo patičce hlavní hry
- Landing může být první obrazovka pro nepřipojené návštěvníky, nebo jen informační podstránka
- Design ve stejném glass / fialovém stylu jako hra
- CS + EN verze textů (`i18n.js` nebo `info-cs.html` / `info-en.html`)

**Soubory (návrh):**
- `info.html` (nebo `about.html`) + styly z `styles.css`
- případně `server.js` — statická route pro `/info`
- `i18n.js` — klíče `infoTitle`, `infoIntro`, `infoInspired`, …

---

### 3. Recenze (zítra)

**Cíl:** připravit a nasadit **recenze / hodnocení** — upřesnit zítra formát:

- [ ] **Ve hře po kole?** — krátký dotaz „Líbila se ti hra?“ (palce / hvězdičky)
- [ ] **Na informační stránce?** — sekce s citacemi od učitelů / žáků (statický obsah)
- [ ] **Externí?** — odkaz na Google recenze, formulář, nebo GitHub Discussions

**Minimum na zítra:**
- [ ] Rozhodnout typ recenze (viz výše)
- [ ] Pokud ve hře: komponenta + volitelné odeslání (localStorage / jednoduchý endpoint)
- [ ] Pokud na landing page: 2–3 ukázkové recenze + místo pro další
- [ ] Texty CS/EN

---

### Celkový checklist na zítra

**Kontrola slov** (viz sekce výše)
- [ ] blocklist, slovníky, `validateWord()`, hlášky

**Patička a branding**
- [ ] Patička: ikony místo textových odkazů (ozdigitals, @ozdigitals, GitHub)
- [ ] Informační / landing stránka s popisem hry, inspirací, školou, autorem z4bryy a ozdigitals
- [ ] Sociální sítě na info stránce (ozdigitals + @z4bryy + GitHub)
- [ ] Odkaz „O hře“ z hlavní obrazovky

**Recenze**
- [ ] Navrhnout a implementovat recenze (forma dle domluvy zítra)

**Postavičky (avataři)**
- [ ] Opravit načítání všech postaviček v „Vyber si postavičku“

---

## Plán na zítra: postavičky se nenačítají všechny

> **Stav dnes:** sekce **„Vyber si postavičku“** (`#avatarGrid`) má **16 avatarů** v `icons.js` (`AVATARS`), ale **ne všechny se zobrazí** — některé buňky zůstanou prázdné nebo bez ikony.

### Co je v kódu teď

- Seznam: `cat`, `dog`, `rabbit`, `bird`, `fish`, `bug`, `squirrel`, `turtle`, `butterfly`, `fox`, `panda`, `lion`, `frog`, `unicorn`, `octopus`, `owl`
- Vykreslení: `renderAvatars()` v `app.js` → `renderAvatar()` v `icons.js`
- Ikony přes **Iconify CDN** (`iconify-icon` + `lucide:` / `mdi:` prefixy)
- Prvních 10 avatarů = Lucide, posledních 6 = Material Design Icons (`mdi:fox`, `mdi:panda`, …)

### Pravděpodobné příčiny (ověřit zítra)

1. **Neplatné nebo chybějící názvy ikon** u `mdi:*` (fox, octopus, unicorn-variant, owl…) — Iconify ikonu nenačte → prázdné tlačítko
2. **Smíšené sady** Lucide + MDI — různá dostupnost na CDN / pomalejší načítání
3. **Školní síť / offline** — blokace `code.iconify.design` nebo pomalé načtení skriptu
4. **Layout** — mřížka `repeat(8, 1fr)` na úzkém displeji (mobil 4 sloupce) — avatary jsou v DOM, ale některé ikony chybí vizuálně

### Cíl opravy

- **Všech 16 postaviček** spolehlivě viditelných hned po otevření lobby
- Jednotný styl (doporučení: **jen Lucide**, nebo lokální SVG fallback)
- Pokud ikona selže → záložní ikona `lucide:user` + console log pro debug

### Návrh řešení (implementace zítra)

1. **Audit ikon** — projít každý `AVATAR_ICONS` záznam v prohlížeči / Iconify docs, opravit neexistující názvy
2. **Sjednotit na Lucide** (kde existuje ekvivalent) — méně závislostí
3. **Fallback v `renderAvatar()`** — pokud `iconify-icon` nevykreslí obsah do 1 s, nahradit známou ikonou
4. **Volitelně: lokální SVG** v `icons/` — funguje i bez internetu ve škole
5. **CSS** — min. výška/šířka `.avatar-btn`, aby prázdné buňky byly vidět při testu
6. **Test:** desktop + mobil, throttling sítě, offline režim

### Soubory

- `icons.js` — `AVATARS`, `AVATAR_ICONS`, `renderAvatar()`
- `app.js` — `renderAvatars()`
- `index.html` — skript Iconify
- `styles.css` — `.avatar-grid`, `.avatar-btn`

### Checklist

- [ ] Zjistit, které konkrétní avatary nejdou (fox, octopus, …?)
- [ ] Opravit / nahradit názvy ikon
- [ ] Přidat fallback pro neúspěšné načtení
- [ ] Otestovat na mobilu a v síti školy
- [ ] (Volitelně) lokální SVG pro offline

---

*Poslední aktualizace plánu: červen 2026.*
