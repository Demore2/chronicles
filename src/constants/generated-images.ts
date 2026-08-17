/**
 * @deprecated Vervangen door `CHARACTER_IMAGES` in `./character-images` (LAUNCH-PLAN.md B1).
 *
 * Hier stonden 4 `replicate.delivery`-URL's voor de Oudheid-verhalen. Die verlopen, dus in een
 * gepubliceerde build zouden ze breken. De bytes staan nu in `assets/images/characters/` en
 * worden via `require()` meegebundeld. Deze file blijft als re-export-shim bestaan omdat de
 * no-delete-conventie geldt (zie CLAUDE.md) — importeer in nieuwe code `CHARACTER_IMAGES`.
 */

export { CHARACTER_IMAGES as GENERATED_IMAGES } from './character-images';
