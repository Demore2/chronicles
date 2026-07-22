// Genereert src/constants/map-data.ts eenmalig uit Natural Earth 110m data.
// Draai met: npm run generate:map-data

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { geoCentroid, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import countries from 'world-countries';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 1000;
const CANVAS_MARGIN = 10;
const CROP_PADDING = 8;

// Landen die we voorlopig helemaal uitsluiten omdat hun grondgebied over
// onze continent-indeling heen ligt en er nog geen besluit is hoe dat op
// te lossen (bv. splitsen langs een grens die deze dataset niet kent).
// Rusland ligt ook over Europa en Azië, maar wordt gewoon getekend (als
// inactief/grijs land, want er is geen regio-entry voor) in plaats van
// uitgesloten — zo blijft de wereldkaart compleet.
const EXCLUDED_CCA3 = new Set([]);

// Landen waarvan losse polygon-onderdelen (overzeese gebieden) geografisch
// bij een ander continent horen dan het moederland. Elk onderdeel wordt op
// basis van zijn eigen centroid geclassificeerd; deze functies geven een
// override-continentId terug, of null om de standaardregio te gebruiken.
const OVERSEAS_PART_OVERRIDES = {
  // Frans-Guyana zit als los polygon-onderdeel in de FRA-multipolygon van
  // Natural Earth, maar hoort geografisch bij Zuid-Amerika.
  FRA: ([lon]) => (lon < -20 ? 'zuid-amerika' : null),
};

function continentIdForCountry(country) {
  switch (country.region) {
    case 'Europe':
      return 'europa';
    case 'Africa':
      return 'afrika';
    case 'Asia':
      return 'azie';
    case 'Oceania':
      return 'oceanie';
    case 'Antarctic':
      return 'antarctica';
    case 'Americas':
      return country.subregion === 'South America' ? 'zuid-amerika' : 'noord-amerika';
    default:
      return null;
  }
}

function splitIntoPolygonParts(geometry) {
  if (geometry.type === 'Polygon') {
    return [geometry];
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map((coordinates) => ({ type: 'Polygon', coordinates }));
  }
  return [];
}

const topology = require('world-atlas/countries-110m.json');
const featureCollection = feature(topology, topology.objects.countries);

const byCcn3 = new Map(countries.map((c) => [c.ccn3, c]));

const skipped = [];
const parts = [];

for (const geoFeature of featureCollection.features) {
  const ccn3 = geoFeature.id;
  const country = ccn3 ? byCcn3.get(String(ccn3)) : undefined;

  if (!country) {
    skipped.push(`${ccn3 ?? '(geen id)'} — ${geoFeature.properties?.name ?? 'onbekend'} (geen match)`);
    continue;
  }
  if (EXCLUDED_CCA3.has(country.cca3)) {
    continue;
  }

  const baseContinentId = continentIdForCountry(country);
  if (!baseContinentId || baseContinentId === 'antarctica') {
    continue;
  }

  const polygonParts = splitIntoPolygonParts(geoFeature.geometry);
  const override = OVERSEAS_PART_OVERRIDES[country.cca3];

  polygonParts.forEach((partGeometry, index) => {
    const partFeature = { type: 'Feature', geometry: partGeometry, properties: {} };
    const centroid = geoCentroid(partFeature);
    const continentId = (override && override(centroid)) || baseContinentId;

    parts.push({
      id: polygonParts.length > 1 ? `${country.cca3}-${index}` : country.cca3,
      ccn3: String(ccn3),
      iso2: country.cca2,
      naam: country.translations?.nld?.common ?? country.name.common,
      continentId,
      feature: partFeature,
    });
  });
}

const partsFeatureCollection = {
  type: 'FeatureCollection',
  features: parts.map((p) => p.feature),
};

const projection = geoNaturalEarth1().fitExtent(
  [
    [CANVAS_MARGIN, CANVAS_MARGIN],
    [CANVAS_WIDTH - CANVAS_MARGIN, CANVAS_HEIGHT - CANVAS_MARGIN],
  ],
  partsFeatureCollection
);
const pathGenerator = geoPath(projection);

const countryPaths = [];
for (const part of parts) {
  const d = pathGenerator(part.feature);
  if (!d) {
    skipped.push(`${part.id} — ${part.naam} (leeg pad)`);
    continue;
  }
  countryPaths.push({
    id: part.id,
    ccn3: part.ccn3,
    iso2: part.iso2,
    naam: part.naam,
    continentId: part.continentId,
    d,
  });
}

countryPaths.sort((a, b) => a.continentId.localeCompare(b.continentId) || a.naam.localeCompare(b.naam));

const continentBounds = {};
for (const continentId of new Set(countryPaths.map((c) => c.continentId))) {
  const featuresInContinent = parts
    .filter((p) => p.continentId === continentId)
    .map((p) => p.feature);
  const [[x0, y0], [x1, y1]] = pathGenerator.bounds({
    type: 'FeatureCollection',
    features: featuresInContinent,
  });
  continentBounds[continentId] = [x0, y0, x1 - x0, y1 - y0];
}

// Kaartvlak strak bijsnijden rond de daadwerkelijk getekende inhoud, zodat
// er geen lege marge overblijft (bv. door het weglaten van Antarctica/Rusland).
const [[bx0, by0], [bx1, by1]] = pathGenerator.bounds(partsFeatureCollection);
const viewBox = [
  Math.floor(bx0 - CROP_PADDING),
  Math.floor(by0 - CROP_PADDING),
  Math.ceil(bx1 - bx0 + CROP_PADDING * 2),
  Math.ceil(by1 - by0 + CROP_PADDING * 2),
].join(' ');

if (skipped.length) {
  console.warn(`Overgeslagen (${skipped.length}):`);
  skipped.forEach((line) => console.warn(`  - ${line}`));
}

const outPath = path.join(__dirname, '..', 'src', 'constants', 'map-data.ts');

const header = `// Dit bestand is automatisch gegenereerd door \`npm run generate:map-data\`.
// Bron: Natural Earth 110m (via world-atlas) + world-countries.
// Niet handmatig bewerken — pas in plaats daarvan scripts/generate-map-data.mjs aan
// en draai het script opnieuw.

export const MAP_VIEWBOX = '${viewBox}';

export type CountryPath = {
  id: string;
  ccn3: string;
  iso2: string;
  naam: string;
  continentId: string;
  d: string;
};

export const countryPaths: CountryPath[] = ${JSON.stringify(countryPaths, null, 2)};

export const continentBounds: Record<string, [number, number, number, number]> = ${JSON.stringify(
  continentBounds,
  null,
  2
)};
`;

fs.writeFileSync(outPath, header);
console.log(`Geschreven: ${outPath} (${countryPaths.length} landdelen, viewBox "${viewBox}")`);
