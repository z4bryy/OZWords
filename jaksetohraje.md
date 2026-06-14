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
