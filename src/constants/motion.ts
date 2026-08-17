// Motion-tokens (LAUNCH-PLAN.md B4). Net als `theme.ts` de enige plek is waar kleuren staan, is
// dit de enige plek waar duur en veercurves staan — zodat alle beweging in de app hetzelfde ritme
// heeft en één tweak overal doorwerkt. Waardes zijn bedoeld voor `react-native-reanimated`:
// `duration` gaat naar `withTiming`, `spring` naar `withSpring`.

export const Motion = {
  duration: {
    /** Kleuromslag, indrukken van een knop. */
    snel: 140,
    /** Standaard: entree van een blok, voortgangsbalk. */
    normaal: 260,
    /** Ontgrendelen — mag je zien gebeuren. */
    traag: 460,
  },
  spring: {
    /** Terug naar rust, geen overshoot die opvalt. */
    zacht: { damping: 18, stiffness: 160, mass: 1 },
    /** Zichtbare overshoot: beloningsmomenten (voltooid, ontgrendeld). */
    stuiter: { damping: 9, stiffness: 170, mass: 0.9 },
    /** Kort en stevig: druk-feedback op een Pressable. */
    druk: { damping: 22, stiffness: 400, mass: 0.6 },
  },
  /** Stap tussen twee opeenvolgende items in een gestagger'de entree. */
  staggerMs: 55,
  /**
   * Maximum aantal stagger-stappen. Een hoofdstuk heeft soms 15+ blokken; zonder cap zou het
   * laatste blok bijna een seconde na het eerste binnenkomen en voelt scrollen traag.
   */
  maxStaggerStappen: 8,
  /** Schaal op het diepste punt van een druk-animatie. */
  drukSchaal: 0.97,
} as const;

/** Vertraging voor item `index` in een gestagger'de entree, afgetopt op `maxStaggerStappen`. */
export function staggerVertraging(index: number): number {
  return Math.min(index, Motion.maxStaggerStappen) * Motion.staggerMs;
}
