/**
 * Eén bron voor "staat Firebase aan?", gelezen door `app.config.js` én `react-native.config.js`.
 *
 * Waarom een apart bestandje en niet twee keer `process.env.EXPO_PUBLIC_FIREBASE_ENABLED`:
 * die twee configuraties draaien in **verschillende processen**. `app.config.js` wordt door de
 * Expo-CLI geladen, en die heeft `.env` al ingelezen; `react-native.config.js` wordt tijdens het
 * autolinken aangeroepen vanuit Gradle, dat niets van `.env` weet. Zouden ze los van elkaar naar
 * `process.env` kijken, dan kan de ene Firebase weglaten terwijl de andere hem verwacht — en dan
 * is het resultaat een build die pas in de manifest-merger omvalt, precies waar we vandaan komen.
 *
 * Dus: eerst `process.env` (daar zet EAS zijn projectvariabelen neer), dan `.env.local`, dan
 * `.env` — dezelfde volgorde die de Expo-CLI aanhoudt.
 *
 * **De veilige stand is `false`.** Kan de vlag nergens gevonden worden, dan blijft Firebase eruit
 * en bouwt de app gewoon; de omgekeerde gok levert een build op die stukloopt op een ontbrekend
 * `google-services.json`.
 */

const fs = require('fs');
const path = require('path');

const SLEUTEL = 'EXPO_PUBLIC_FIREBASE_ENABLED';

/** Leest één sleutel uit een .env-bestand. Geen dotenv-afhankelijkheid voor twee regels werk. */
function uitBestand(bestand) {
  const pad = path.join(__dirname, bestand);
  let inhoud;
  try {
    inhoud = fs.readFileSync(pad, 'utf8');
  } catch {
    return undefined;
  }
  for (const regel of inhoud.split(/\r?\n/)) {
    const schoon = regel.trim();
    if (!schoon || schoon.startsWith('#')) continue;
    const scheiding = schoon.indexOf('=');
    if (scheiding === -1) continue;
    if (schoon.slice(0, scheiding).trim() !== SLEUTEL) continue;
    return schoon
      .slice(scheiding + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
  return undefined;
}

function leesVlag() {
  const waarde = process.env[SLEUTEL] ?? uitBestand('.env.local') ?? uitBestand('.env');
  return waarde === 'true';
}

module.exports = { FIREBASE_AAN: leesVlag(), SLEUTEL };
