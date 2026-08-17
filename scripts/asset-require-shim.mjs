// Geïmporteerd door elk script dat de .ts-content in Node laadt (validate-content.mjs,
// recalculate-read-times.mjs).
//
// `src/constants/character-images.ts` gebruikt `require('../../assets/.../x.webp')` omdat dat de
// manier is waarop Metro een asset in de bundel opneemt (LAUNCH-PLAN.md B1). In Node draaien die
// files als ESM: daar bestaat `require` niet, en een .webp is sowieso niet importeerbaar. Deze
// shim zet een globale `require` neer die het pad simpelweg teruggeeft.
//
// Dat is veilig omdat geen enkel script `Verhaal.afbeelding` inhoudelijk gebruikt — validatie
// kijkt naar VertaaldVelden en Blok-types, de leestijdberekening telt woorden. Het enige wat de
// shim moet garanderen is dat het laden van de content-modules niet klapt.
if (typeof globalThis.require === 'undefined') {
  globalThis.require = (specifier) => specifier;
}
