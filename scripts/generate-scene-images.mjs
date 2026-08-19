#!/usr/bin/env node
/**
 * Genereer scènebeelden per hoofdstuk en schrijf ze als asset naar
 * `assets/images/scenes/<verhaal-id>-<hoofdstuk-id>.webp` (LAUNCH-PLAN.md B2).
 *
 * Usage:
 *   node scripts/generate-scene-images.mjs               # alleen ontbrekende beelden
 *   node scripts/generate-scene-images.mjs --force       # ook bestaande overschrijven
 *   node scripts/generate-scene-images.mjs --only julius-caesar        # heel verhaal
 *   node scripts/generate-scene-images.mjs --only julius-caesar-3      # één hoofdstuk
 *   node scripts/generate-scene-images.mjs --list        # toon status, genereer niets
 *
 * Reads REPLICATE_API_TOKEN from the environment or from .env.local.
 *
 * Zelfde opzet als generate-portrait-images.mjs (download de bytes, geen verlopende URL in de
 * code), met drie verschillen:
 *   - `aspect_ratio: '16:9'` — een scène is een filmische onderbreking in een leestekst, geen
 *     portret. De kaart-verhouding 3:4 geldt alleen voor `verhaal-carousel-kaart.tsx`.
 *   - De sleutel is `<verhaal-id>-<hoofdstuk-id>`, exact de sleutel in
 *     `src/constants/scene-images.ts`.
 *   - Eén gedeelde STIJL-suffix, zodat 32 losse generaties als één serie ogen.
 *
 * Nieuw tijdperk toevoegen: prompts hieronder bijschrijven, script draaien, en de regels
 * toevoegen aan `SCENE_IMAGES` (die map is met opzet expliciet, niet `require.context`, zodat een
 * ontbrekend bestand een build-fout geeft in plaats van een leeg vlak).
 */

import Replicate from 'replicate';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const scenesDir = path.join(projectRoot, 'assets/images/scenes');

/** Gedeelde stijl — houdt de serie consistent en houdt tekst uit het beeld. */
const STIJL =
  'Cinematic historical oil painting, museum quality, dramatic natural light, rich earthy palette, painterly brushwork, historically accurate detail, no text, no lettering, no watermark.';

/**
 * Prompts per `<verhaal-id>-<hoofdstuk-id>` — alle 19 verhalen, 152 beelden. De Oudheid was de
 * proef (B2, Fase 5); de overige 15 verhalen zijn er in B2b (Fase 6.5) bij gekomen.
 *
 * Twee dingen om vast te houden bij het bijschrijven:
 *   - `STIJL` bevat al "no text, no lettering". Vraag dus nooit om een bord, spandoek of krant
 *     mét opschrift — beschrijf de scène zo dat er geen letters nodig zijn (een leeg bord, een
 *     kaal drinkfonteintje) in plaats van te hopen dat het model zich inhoudt.
 *   - Bij 20e-eeuwse en hedendaagse figuren beschrijft de prompt een **scène**, geen portret, en
 *     noemt hij de persoon niet bij naam. Dat scheelt geweigerde prompts en gelijkenis-misbaksels,
 *     en het beeld staat toch al naast het portret uit `character-images.ts`.
 *   - **Noem dan wél expliciet wie er te zien is.** Omdat de naam ontbreekt vult het model het
 *     standaardgeval in: de eerste versie van `nelson-mandela-6` liet een wit echtpaar de
 *     gevangenis uit lopen. Elke scène met herkenbare mensen zegt nu "Black South African",
 *     "Pashtun", "African American" enzovoort.
 *   - Voeg bij 20e-eeuwse scènes een **kleurwoord** toe. `martin-luther-king-jr-7` kwam de eerste
 *     keer zwart-wit terug — het model leest "1968 + persfoto" als monochroom en dat breekt de
 *     serie.
 */
const scenePrompts = {
  // Julius Caesar
  'julius-caesar-1':
    'A young Roman patrician in his late teens studying rhetoric among marble columns in the Roman Forum, older senators debating in the background, morning light, 1st century BC.',
  'julius-caesar-2':
    'Roman legions besieging a Gallic hill fort, timber palisades and earthworks, siege towers, legionaries in formation with red shields, overcast northern European landscape, 52 BC.',
  'julius-caesar-3':
    'A Roman general on horseback pausing at the edge of a narrow shallow river at dawn, his legion waiting silently behind him in the mist, a boundary stone at the water, tense stillness.',
  'julius-caesar-4':
    'Two Roman armies facing each other across a dusty Greek plain, cavalry on the wings, standards and eagles raised, dust and low sun, the battle of Pharsalus 48 BC.',
  'julius-caesar-5':
    'A Roman dictator in purple-bordered toga presiding over scrolls, maps and surveying instruments in a sunlit basilica, astronomers presenting a calendar, clerks at work.',
  'julius-caesar-6':
    'Senators in white togas closing in around a solitary figure in the portico of a Roman theatre, marble statue of Pompey looming, cold March light, the tense moment before violence, no blood.',
  'julius-caesar-7':
    'A huge funeral pyre burning in the Roman Forum at night, an enormous grieving crowd pressing forward, embers rising against temple facades.',
  'julius-caesar-8':
    'A marble portrait bust of a Roman statesman in a hall of Roman statuary, shafts of dusty golden light, the eternal city visible through an archway beyond.',

  // Spartacus
  'spartacus-1':
    'A powerfully built Thracian captive in chains among a column of prisoners marched along a Roman road by legionary guards, mountains behind, cold grey daylight, 1st century BC.',
  'spartacus-2':
    'The sandy training yard of a Roman gladiator school at Capua, barred cells around the perimeter, men drilling with wooden practice swords under an overseer, harsh midday sun.',
  'spartacus-3':
    'Gladiators escaping a barracks at night armed with kitchen knives and roasting spits, torchlight, an overturned gate, the dark cone of Vesuvius on the horizon.',
  'spartacus-4':
    'A ragged army of freed slaves in captured Roman armour overwhelming a Roman marching camp at dawn, collapsed palisade, scattered standards, chaotic energy.',
  'spartacus-5':
    'An immense column of freed slaves, families, carts and livestock marching through the Italian countryside, olive groves and hill towns, long shadows of late afternoon.',
  'spartacus-6':
    'Disciplined Roman legionaries digging an enormous fortified ditch and rampart across a narrow neck of land, engineers and surveyors at work, a bleak winter sky.',
  'spartacus-7':
    'A last desperate battle at the foot of a volcano, a slave army breaking against Roman lines, dust and spears, a fallen standard, dramatic stormy light, no gore.',
  'spartacus-8':
    'Broken iron shackles lying in the dust of an empty Roman road lined with cypress trees at sunset, quiet and elegiac, no figures.',

  // Rome's Rise
  'rome-rise-1':
    'A humble settlement of thatched huts on green hills above the Tiber river, shepherds and farmers, wooden fences and grazing sheep, soft morning haze, 8th century BC Italy.',
  'rome-rise-2':
    'An Etruscan-influenced early Roman king in ceremonial robes leading a procession through a young city of tufa walls and painted temples, bronze fittings, ritual attendants.',
  'rome-rise-3':
    'The Roman Senate assembled in the Curia, hundreds of men in togas, a speaker standing mid-argument, sunlight from high windows falling on the marble floor.',
  'rome-rise-4':
    'Roman and Carthaginian war galleys locked together in a naval battle, oars shattering, boarding bridges dropping, spray and smoke, Mediterranean blue.',
  'rome-rise-5':
    'Roman legions marching past Greek temples and Hellenistic marble colonnades, local citizens watching from the steps, bright Aegean light.',
  'rome-rise-6':
    'Roman soldiers facing fellow Romans across a barricaded forum, overturned market stalls, an anxious crowd retreating, heavy storm light, civil strife.',
  'rome-rise-7':
    'A young Roman leader in a laurel wreath standing beneath a gleaming new marble portico, senators and citizens gathered below, serene ordered grandeur, golden hour.',
  'rome-rise-8':
    'Panoramic vista of imperial Rome at sunrise: forums, temples, tiled roofs and a great aqueduct striding across the campagna beyond, immense scale.',

  // Pompeii Disaster
  'pompeii-disaster-1':
    'A busy street in Pompeii on an ordinary morning, painted shopfronts, a bakery and a fountain, stepping stones across the paved road, Mount Vesuvius green and peaceful behind the rooftops, 79 AD.',
  'pompeii-disaster-2':
    'Townspeople in a Roman forum shading their eyes to look at a strange pine-shaped column of ash rising from the mountain, first flakes of ash on the paving, uneasy bright daylight.',
  'pompeii-disaster-3':
    'A colossal ash column towering over the Bay of Naples at night, lightning crackling inside the plume, pumice raining on darkened rooftops, terrifying scale.',
  'pompeii-disaster-4':
    'A pyroclastic surge of grey ash and gas racing down the flank of Vesuvius toward a Roman city in the dark, glowing at its base, buildings dwarfed beneath it.',
  'pompeii-disaster-5':
    'A city buried under deep grey ash, only rooftops and the tops of columns breaking the surface, absolute silence, pale ashen light, no people.',
  'pompeii-disaster-6':
    'Eighteenth century excavators in tricorn hats and frock coats uncovering a buried Roman colonnade with baskets and shovels, a fresco emerging from the ash, lantern light.',
  'pompeii-disaster-7':
    'Preserved Roman interiors revealed by excavation: vivid red wall frescoes, a counter of embedded amphorae, carbonised loaves of bread, an archaeologist studying them by lamplight.',
  'pompeii-disaster-8':
    'The archaeological site of Pompeii at sunrise, empty paved streets and roofless houses stretching to the horizon, Vesuvius standing over it all, tourists small in the distance.',

  // Ashoka — het vijfde Oudheid-verhaal, en het enige buiten de Grieks-Romeinse wereld. Elke
  // prompt zegt daarom expliciet "South Asian" / "ancient India": zonder dat levert het model een
  // mediterrane scène, dezelfde standaardinvulling als bij `nelson-mandela-6`. Let op hoofdstuk 6:
  // dat gaat over Ashoka's inscripties, maar `STIJL` verbiedt tekst — de prompt vraagt dus om het
  // gepolijste steenoppervlak en het hakwerk, niet om leesbare letters.
  'ashoka-maurya-1':
    'War elephants and massed infantry of an ancient Indian army before the timber ramparts of a great city on the Ganges plain, South Asian soldiers with cane shields and iron spears, dust and monsoon haze, 4th century BC.',
  'ashoka-maurya-2':
    'A young South Asian prince in fine white cotton and gold armbands walking through a cosmopolitan northwest Indian city of scholars and traders, Persian, Greek and Indian merchants among stone courtyards, mountains beyond, 3rd century BC.',
  'ashoka-maurya-3':
    'A vast ancient Indian capital of teak palisades and moats along a wide river, wooden watchtowers, barges and bathing steps, clerks and officials crossing timber bridges, low golden light, Mauryan Pataliputra.',
  'ashoka-maurya-4':
    'The aftermath of a great battle on the eastern Indian coast, a shallow river running through churned ground, abandoned shields and broken chariots, long lines of South Asian captives being led away, ashen light, no blood, terrible stillness.',
  'ashoka-maurya-5':
    'A South Asian emperor in plain undyed robes sitting alone on the steps of a palace terrace at dusk, crown and weapons set aside on the stone beside him, monsoon clouds over the plain, an expression of exhausted remorse.',
  // Derde poging, en de les zit in het verschil. Poging 1 gaf een gecanneleerde Grieks-Romeinse
  // zuil; poging 2 voegde "no domes, no arches, no classical columns" toe en leverde een vierkante
  // pijler mét koepels op de achtergrond. Dit model leest een ontkenning als een onderwerp: elk
  // ding dat je verbiedt noem je, en genoemd worden is genoeg om het op te roepen. Deze versie
  // beschrijft daarom alléén wat er wél staat — "cylindrical", "circular", "round" in plaats van
  // "not square", en een positief ingevulde achtergrond in plaats van een verboden lijst.
  'ashoka-maurya-6':
    'A single tall cylindrical Mauryan stone pillar of ancient India standing alone in an open dusty plain, one unbroken round column of mirror-smooth polished pale sandstone tapering gently towards the top, crowned by a bell-shaped inverted lotus capital carrying four sculpted seated lions back to back. Beside a rutted earth road across flat empty farmland, a few low flat-roofed mud-brick huts with thatched roofs far off, scrub and dust, travellers with oxcarts passing, hard midday sun, 3rd century BC.',
  'ashoka-maurya-7':
    'A great hemispherical brick and stone stupa under construction in ancient India, bamboo scaffolding and a carved stone railing, Buddhist monks in ochre robes and South Asian labourers on the mound, wooded hills, warm afternoon light.',
  'ashoka-maurya-8':
    'A weathered stone pillar standing alone in an overgrown ancient Indian landscape long after the empire has gone, fallen masonry half buried in grass, a herdsman and cattle passing, soft evening light, elegiac mood.',

  // ── Middeleeuwen ────────────────────────────────────────────────────────────────────────────

  // Joan of Arc
  'joan-of-arc-1':
    'A teenage peasant girl in a plain red woollen dress tending sheep beside a small stone village church in the Meuse valley, ploughed fields and bare poplars, cold grey light, France in the 1420s.',
  'joan-of-arc-2':
    'A young peasant girl kneeling stunned in a walled cottage garden as a shaft of golden light falls between the summer trees, herbs and beehives around her, an ordinary garden made luminous.',
  'joan-of-arc-3':
    'A slight figure with cropped hair in mens riding clothes standing alone before a crowded royal court in the great hall of a Loire castle, courtiers whispering, the dauphin on a dais, 1429.',
  'joan-of-arc-4':
    'French soldiers storming an English siege fort outside a walled river city, a plain white banner raised above the assault, ladders and smoke, evening light, the siege of Orleans 1429.',
  'joan-of-arc-5':
    'A young figure in polished armour on a white warhorse leading French men-at-arms along a summer road past a captured Loire town, lances and pennons, dust and bright June light.',
  'joan-of-arc-6':
    'A young prisoner in mens clothing standing alone before a long bench of black-robed clerics in a vaulted stone hall, clerks writing at a side table, high window light, Rouen 1431.',
  'joan-of-arc-7':
    'A crowd gathered around a stone cross in a French market square at dusk, candles and bowed heads, soldiers riding out through the gate beyond the rooftops, sombre and resolute.',
  'joan-of-arc-8':
    'A gilded equestrian statue of a young woman in armour holding a banner above a Paris square at golden hour, pigeons and passers-by small below, grand city facades behind.',

  // Charlemagne
  'charlemagne-1':
    'A Frankish noble hall of carved timber and hanging shields, a small boy watching bearded warriors and counsellors gathered around a long fire-lit table, eighth century northern Europe.',
  'charlemagne-2':
    'Frankish cavalry in mail riding through a dark Saxon forest of ancient oaks past a felled wooden idol, mist between the trunks, cold northern light, late eighth century.',
  'charlemagne-3':
    'A kneeling Frankish king in a blue cloak crowned with a golden circlet by the pope before the altar of old Saint Peters basilica, gold mosaics, candles and a packed congregation, Christmas 800.',
  'charlemagne-4':
    'The octagonal palace chapel of Aachen under construction, marble columns being hoisted by crane, masons and clerics conferring with the king over plans, scaffolding in northern daylight.',
  'charlemagne-5':
    'An ageing bearded king in mail riding at the head of a long column of Frankish troops through an alpine pass, baggage carts and banners strung out behind, harsh mountain light.',
  'charlemagne-6':
    'A Carolingian scriptorium: monks copying manuscripts at slanted desks in a stone hall, quills, gold leaf and inkhorns, shafts of light from high windows, ninth century.',
  'charlemagne-7':
    'Three crowned Frankish brothers seated apart around a table with a divided map between them, wary armed retainers behind each, a cold hall, an empire coming apart, ninth century.',
  'charlemagne-8':
    'An empty stone throne on a gallery above the octagon of Aachen chapel, golden mosaics and a great hanging chandelier, dust motes in a shaft of light, solemn and timeless.',

  // Richard the Lionheart
  'richard-the-lionheart-1':
    'A boy of the Angevin court riding through the vineyards and castles of Aquitaine with the queen and her retinue, troubadours and falconers alongside, warm southern light, 1160s.',
  'richard-the-lionheart-2':
    'A red-haired warrior prince being crowned in a Romanesque abbey church, barons kneeling in homage, banners and drifting incense, London 1189.',
  'richard-the-lionheart-3':
    'A crusader fleet of galleys and round ships beating through a Mediterranean storm past a rocky coast, crosses on the sails, spray and dark cloud, 1191.',
  'richard-the-lionheart-4':
    'A crusader king halted on a dry ridge above the distant walled city of Jerusalem, his knights waiting behind him, the king shielding his face with his surcoat rather than look, heat haze over the hills.',
  'richard-the-lionheart-5':
    'A king in mail directing the siege of a small French castle, a stone-throwing engine and crossbowmen, scaffolds against the curtain wall, low evening light, the Limousin 1199.',
  'richard-the-lionheart-6':
    'A candlelit medieval hall where an armoured king listens to a troubadour with a lute, tapestries, hounds by the fire, knights and ladies along the long table, warm intimate light.',
  'richard-the-lionheart-7':
    'A crowned English king surrounded by hostile barons in a river meadow, tents and tethered horses, parchment and wax seals on a trestle table, grey overcast light, early thirteenth century.',
  'richard-the-lionheart-8':
    'A painted stone effigy of a crowned king lying with hands folded on a tomb in an abbey church, candle flames, worn flagstones and Romanesque arches, quiet reverence.',

  // ── Vroegmoderne tijd ───────────────────────────────────────────────────────────────────────

  // Leonardo da Vinci
  'leonardo-da-vinci-1':
    'A boy sketching a hovering hawk on a scrap of paper on a terraced Tuscan hillside of olive trees and vines, a stone farmhouse and the Arno valley beyond, soft golden morning, 1460s.',
  'leonardo-da-vinci-2':
    'A busy Florentine artists workshop: apprentices grinding pigment, a bronze being chased, panels on easels, a young painter working on an angel, Renaissance light from tall windows.',
  'leonardo-da-vinci-3':
    'A painter on scaffolding working on an enormous fresco of a long supper table across the end wall of a monastery refectory, monks eating below, cool Milanese light, 1490s.',
  // Geen ontleed lichaamsdeel in beeld en lange mouwen: de eerste versie leverde zowel een
  // nogal bloederige arm als een moderne polshorloge op.
  'leonardo-da-vinci-4':
    'A candlelit Renaissance study, sheets of anatomical drawings of muscles and bones pinned across the wall, a human skull and brass dividers on the table, a bearded scholar in a long-sleeved robe drawing by candlelight, deep shadow.',
  'leonardo-da-vinci-5':
    'A workshop loft hung with wood-and-canvas wing models and studies of birds in flight, a bearded inventor adjusting a flapping-wing frame, Tuscan light through an open loft door.',
  'leonardo-da-vinci-6':
    'An ageing bearded master in a Florentine studio beside a small portrait of a seated woman on an easel, a hazy blue landscape within the painting, muted afternoon light.',
  'leonardo-da-vinci-7':
    'An old bearded man in a red robe seated among stacks of notebooks in a French manor room, a young king listening at his side, Loire valley light through mullioned windows, 1519.',
  'leonardo-da-vinci-8':
    'Open Renaissance notebooks covered in mirror writing, machine sketches and studies of swirling water, spread on a dark table under a museum spotlight, leather bindings and aged paper.',

  // Galileo Galilei
  'galileo-galilei-1':
    'A young student watching a great bronze lamp swing slowly on its chain in the vast nave of Pisa cathedral, timing it against his own pulse, marble arches and cool light, 1580s.',
  'galileo-galilei-2':
    'Two spheres of very different size falling side by side from a leaning marble bell tower while scholars in gowns argue on the grass below, bright Tuscan sky, late sixteenth century Pisa.',
  'galileo-galilei-3':
    'A scholar on a Venetian rooftop terrace at night aiming a long wooden tube at a bright moon, a lantern and open notebook on a stool, the lagoon and campaniles beyond, 1609.',
  'galileo-galilei-4':
    'A candlelit study with a brass armillary sphere and a large drawing of the sun at the centre of circling planets, an astronomer comparing it against his own moon sketches, deep shadow.',
  'galileo-galilei-5':
    'A bearded astronomer offering a small telescope to sceptical cardinals in a frescoed Roman palace room, one turning away toward the window, tense diagonal light, early seventeenth century.',
  'galileo-galilei-6':
    'An old scholar kneeling on the stone floor of a Roman convent hall before a semicircle of seated inquisitors in robes, clerks and a candlelit crucifix, cold austere light, 1633.',
  'galileo-galilei-7':
    'An old blind scholar dictating to a young assistant in the garden room of a Tuscan villa, manuscripts and a pendulum model on the table, warm low sunlight, quiet house arrest.',
  'galileo-galilei-8':
    'Two small antique telescopes resting on velvet in a museum vitrine, a vast field of stars faintly reflected in the glass, reverent low light.',

  // Catherine the Great
  'catherine-the-great-1':
    'A serious young girl reading alone in a modest north German court chamber, a tall glazed tile stove beside her, snow falling beyond the leaded windows, plain eighteenth century interior.',
  'catherine-the-great-2':
    'A young grand duchess sitting apart in a vast gilded Russian palace hall while her husband drills toy soldiers on a table, courtiers whispering, cold winter light through tall windows, 1750s.',
  'catherine-the-great-3':
    'A woman in a green guards officers uniform on horseback at the head of cheering Russian soldiers outside a Saint Petersburg palace, drawn swords and standards, dawn light, 1762.',
  'catherine-the-great-4':
    'An empress in court dress presenting a bound legal code to an assembly of nobles and clergy in a neoclassical hall, secretaries at desks below the dais, chandelier light.',
  'catherine-the-great-5':
    'Russian ships of the line at anchor off a Black Sea shore while an empress and her officers study a map spread on a bluff, Crimean cliffs and bright southern light, 1780s.',
  'catherine-the-great-6':
    'A long gallery of the Winter Palace hung with old master paintings, crates of newly arrived art being prised open, an empress inspecting a canvas with her curators, candlelight and gilding.',
  'catherine-the-great-7':
    'Russian serfs harvesting a vast estate field under an overseer on horseback, a distant white manor house and birch line, heavy grey sky, late eighteenth century.',
  'catherine-the-great-8':
    'An empty gilded throne room of the Winter Palace at dusk, a formal state portrait of an empress on the wall, polished parquet and long shadows.',

  // ── Industriele revolutie ───────────────────────────────────────────────────────────────────

  // James Watt
  'james-watt-1':
    'A boy in a Scottish shipwrights workshop watching steam lift the lid of a kettle on the hearth, tools, half-built models and coiled rope on the benches, grey Clyde light, 1740s.',
  'james-watt-2':
    'A cluttered university instrument makers room with a small brass model of an atmospheric steam engine on the bench, a young man in shirtsleeves studying its cylinder, Glasgow winter light.',
  'james-watt-3':
    'A Birmingham manufactory yard at dusk: a great beam engine being assembled with chains and sheer legs, workmen hauling, two partners in coats conferring, forge glow and smoke, 1770s.',
  'james-watt-4':
    'The interior of an early cotton mill: a steam engine driving line shafts and leather belts to long rows of machines, workers among them, dusty light from tall windows.',
  'james-watt-5':
    'An inventors private workshop crowded with glass retorts, ore samples, rolled drawings and a copying press, an ageing man in a wig taking notes by lamplight.',
  'james-watt-6':
    'An elderly engineer honoured before a gathering of gentlemen scientists in a panelled London hall, a working model engine on the table between them, candlelight and dark portraits.',
  'james-watt-7':
    'A panorama of an early industrial valley: mill chimneys, canal barges, coal wagons and terraced housing under a smoky orange sky, nineteenth century Britain.',
  'james-watt-8':
    'A towering polished beam engine preserved in a museum hall, brass and cast iron gleaming, a single visitor dwarfed at its base, cool skylight from above.',

  // Florence Nightingale
  'florence-nightingale-1':
    'A young woman in a wide crinoline dress standing apart at the window of an English country house drawing room, family taking tea behind her, parkland and cedars beyond, 1840s.',
  'florence-nightingale-2':
    'A determined young Englishwoman in plain travelling dress walking a ward of a German charitable hospital beside a deaconess, iron bedsteads and bare boards, pale northern light, 1850.',
  // Eerste versie leverde een lege gewelfde zaal op: het model liet de gewonden simpelweg weg,
  // terwijl juist die het hoofdstuk zijn. Ze staan nu vooraan in de opsomming — maar wel als
  // "resting soldiers under blankets": met "wounded" en "bandages" sloeg het NSFW-filter aan.
  'florence-nightingale-3':
    'A vast dim barrack hospital ward filled with long crowded rows of resting soldiers lying under grey blankets on straw mattresses, a nurse in a long dress and white cap walking between the rows carrying a small oil lamp, high arched windows, sombre night, Crimean War 1854.',
  'florence-nightingale-4':
    'A Victorian desk covered with mortality tables and a large hand-coloured circular diagram of coloured wedges, ink bottle, dividers and a candle, night study.',
  'florence-nightingale-5':
    'A classroom of young probationer nurses in uniform taking notes as a matron teaches beside an anatomical chart and a neatly made hospital bed, London 1860s.',
  'florence-nightingale-6':
    'An invalid Victorian woman propped up in bed in a plain London room, writing at a bed-desk piled with government reports and correspondence, an oil lamp and a sleeping cat.',
  'florence-nightingale-7':
    'A bright Victorian hospital ward: high windows thrown open, well-spaced iron beds, clean linen, nurses at work in sunlight and fresh air, late nineteenth century.',
  'florence-nightingale-8':
    'A single brass oil lamp on a stone sill beside a folded nurses apron and an open statistical chart, warm lamplight against cool dusk, quiet memorial, no figures.',

  // Thomas Edison
  'thomas-edison-1':
    'A boy running a makeshift chemical laboratory in a farmhouse cellar in Ohio, bottles, jars and a wet battery ranged on plank shelves, lamplight and shadow, 1850s.',
  'thomas-edison-2':
    'A young telegraph operator working a brass key at night in a small railway telegraph office, wires, a pot-bellied stove and a spike of message slips, oil lamp glow, 1860s.',
  'thomas-edison-3':
    'A long two-storey wooden laboratory in rural New Jersey lit up at night, inside rows of benches, glassware, dynamos and shirtsleeved assistants at work, 1878.',
  'thomas-edison-4':
    'A darkened laboratory where a single glass bulb with a glowing filament stands on a bench, a dozen shirtsleeved men leaning in to watch, faces lit from below, 1879.',
  'thomas-edison-5':
    'A generating station of belt-driven dynamos where two rival groups of engineers inspect competing switchboards, sparks and drifting steam, gaslit brick interior, 1880s.',
  'thomas-edison-6':
    'A crowded invention workshop with a tinfoil phonograph, an early motion picture camera, storage batteries and stacks of drawings, an inventor demonstrating to seated visitors.',
  'thomas-edison-7':
    'An elderly inventor in a rumpled suit absorbed at a laboratory bench, young assistants working around him, sunlight through dusty high windows, 1920s.',
  'thomas-edison-8':
    'An American city at night seen from above, streets and windows glowing with electric light, dark countryside beyond the last lit street, early twentieth century.',

  // ── Twintigste eeuw ─────────────────────────────────────────────────────────────────────────

  // Marie Curie
  'marie-curie-1':
    'A serious girl reading by candlelight in a modest Warsaw apartment, snow falling in the gaslit street beyond the window, mourning clothes and a framed family photograph, 1870s.',
  'marie-curie-2':
    'A young woman student in a freezing Paris attic room wrapped in her coat, working at a table with books and a single candle, rooftops and chimney pots through the skylight, 1890s.',
  'marie-curie-3':
    'A leaky wooden shed laboratory where a young couple stir a great vat of pitchblende residue, iron stove, glassware, a faint blue glow from vials on a shelf, night.',
  'marie-curie-4':
    'A woman in black walking away down a rain-wet Paris street past a horse-drawn cart, gaslight on the cobbles and dark umbrellas, grief and distance, 1906.',
  'marie-curie-5':
    'A woman in dark academic dress lecturing to a packed amphitheatre of students at the Sorbonne, blackboard and demonstration apparatus behind her, tall windows, 1906.',
  'marie-curie-6':
    'A canvas-topped motor van fitted out as a mobile X-ray unit parked at a field hospital behind the front, two women carrying equipment through the mud, stretchers and grey light, 1916.',
  'marie-curie-7':
    'An ageing scientists laboratory bench: an open notebook, glassware and fogged photographic plates, thin worn hands resting on the pages, cool northern light.',
  'marie-curie-8':
    'A bright institute laboratory where young women in white coats work with electrometers and radium apparatus, a portrait of their founder on the wall, 1930s.',

  // Winston Churchill
  'winston-churchill-1':
    'A small boy arranging long rows of lead soldiers on the floor of a vast English baroque palace room, tall windows, a distant nurse in the doorway, 1880s.',
  'winston-churchill-2':
    'A politician in a frock coat studying naval charts with admirals in an Admiralty room, models of dreadnoughts on a side table and a wall map of a narrow strait, gaslight, 1915.',
  'winston-churchill-3':
    'An underground map room beneath wartime London: officers moving markers across a great wall chart while a stout figure in a boiler suit watches, telephones and low lamplight, 1940.',
  'winston-churchill-4':
    'Three Allied leaders seated in wicker chairs before a colonnaded palace for a photograph, aides and flags ranged behind them, cold Crimean light, 1945.',
  'winston-churchill-5':
    'An elderly statesman speaking from a podium in an American college hall, heavy curtains behind and a wall map of a divided Europe, flashbulbs and press benches, 1946.',
  'winston-churchill-6':
    'An old prime minister at the cabinet table in a panelled Downing Street room, red despatch boxes and cigar smoke, weary post-war London beyond the window, 1951.',
  'winston-churchill-7':
    'A writers study at night: a standing desk stacked with manuscript pages, a whisky glass and a cigar in a heavy ashtray, bookshelves and a green-shaded lamp.',
  'winston-churchill-8':
    'A river funeral procession: a coffin on a launch passing London dockside cranes that dip in salute, grey Thames water, silent crowds on the embankment, 1965.',

  // Martin Luther King Jr.
  'martin-luther-king-jr-1':
    'A hot southern American street in the 1930s: two drinking fountains side by side, one scrubbed and one battered, a Black family walking past shuttered brick storefronts, harsh afternoon light.',
  'martin-luther-king-jr-2':
    'A young Black minister preaching from the pulpit of a red-brick Baptist church in Alabama, a congregation in Sunday hats listening, warm wooden interior and coloured window light, 1954.',
  'martin-luther-king-jr-3':
    'Black residents walking to work along an Alabama roadside at dawn while an empty city bus passes them, winter coats and lunch pails, long cold shadows, 1956.',
  'martin-luther-king-jr-4':
    'Young Black and white students sitting calmly at a segregated lunch counter while a hostile crowd presses in behind them, chrome stools and glass pie cases, tense fluorescent light, 1960.',
  'martin-luther-king-jr-5':
    'An enormous crowd of Black and white Americans in summer clothes filling the length of a reflecting pool between a white marble memorial and a distant obelisk, a speaker small on the memorial steps, green trees and August heat haze, full colour, Washington 1963.',
  'martin-luther-king-jr-6':
    'A young Black laureate receiving a medal in a grand Scandinavian civic hall, dignitaries in evening dress applauding, chandeliers and cold northern light, Oslo 1964.',
  'martin-luther-king-jr-7':
    'Black American sanitation workers in dark coats marching in silent ranks down a rain-wet Memphis street carrying blank white placards, olive-green National Guard jeeps at the corner, warm brown brick and grey-green spring light, full colour, 1968.',
  'martin-luther-king-jr-8':
    'A candlelight vigil of thousands of Black and white Americans filling a night street beneath a motel balcony, a wreath on the railing above, faces warmly lit by small flames, sorrow and resolve, full colour, April 1968.',

  // ── Hedendaags ──────────────────────────────────────────────────────────────────────────────

  // Steve Jobs
  'steve-jobs-1':
    'A boy and his father at a workbench in a suburban Californian garage taking apart a radio, tract houses and orange trees beyond the open door, warm afternoon light, 1960s.',
  'steve-jobs-2':
    'Two young men soldering circuit boards on a workbench in a cluttered suburban garage, a wooden-cased computer, cardboard boxes and a bicycle against the wall, warm lamplight, 1976.',
  'steve-jobs-3':
    'An open-plan Californian office of the early 1980s: young engineers gathered around a beige desktop computer, pinboards and prototypes, a founder gesturing intently, bright daylight.',
  'steve-jobs-4':
    'A founder alone in a large empty new office at dusk, one desk and a lamp, drawings of a black cube computer pinned to the wall, floor-to-ceiling windows over a Silicon Valley evening.',
  'steve-jobs-5':
    'A packed auditorium in 1997 where a lean man in jeans presents a translucent coloured all-in-one computer on a spotlit pedestal, deep blue stage light, cheering crowd.',
  'steve-jobs-6':
    'A darkened conference stage in 2007: a lone figure in a black turtleneck holding up a small glass-fronted phone, an enormous screen glowing behind, rapt audience in silhouette.',
  'steve-jobs-7':
    'A white industrial design studio: aluminium and glass prototypes lined along a long table, foam models and calipers, designers in quiet discussion, soft even daylight.',
  'steve-jobs-8':
    'A glass-walled flagship store at night with flowers, candles and folded notes left on the pavement outside, passers-by pausing, city lights reflected in the glass, 2011.',

  // Malala Yousafzai
  'malala-yousafzai-1':
    'Girls in blue school uniforms and white headscarves walking home along a river road in a green Himalayan valley, apricot orchards and snow peaks beyond, northern Pakistan, warm afternoon light.',
  'malala-yousafzai-2':
    'An empty village classroom with overturned benches and a wiped blackboard, dust hanging in the light from a broken window, armed figures on the road outside, cold morning, Swat 2008.',
  'malala-yousafzai-3':
    'A Pashtun schoolgirl in a headscarf writing in a notebook by lamplight in a small room at night, a shawl around her shoulders, shuttered window and dark Pakistani mountains beyond, curfew quiet.',
  'malala-yousafzai-4':
    'A hospital corridor where an anxious Pakistani family in shalwar kameez waits on plastic chairs outside a curtained room, medical staff passing quickly, fluorescent light and long shadows, 2012, tense and quiet.',
  'malala-yousafzai-5':
    'A young Pashtun woman in a pink headscarf and shawl speaking from a tall wooden podium to a great international assembly hall of delegates, translation booths and ranked flags, cool institutional light, 2013.',
  'malala-yousafzai-6':
    'A Pakistani teenage girl in a headscarf holding a gold medal in a grand Scandinavian hall of pale marble and white flowers, a full audience applauding, Oslo in December.',
  'malala-yousafzai-7':
    'Open-air classrooms in three different lands seen together — girls with slates beneath a tree, in a canvas tent school, in a bare concrete schoolroom — bright optimistic daylight.',
  'malala-yousafzai-8':
    'A young woman in a headscarf walking through an ancient English university quadrangle with books under her arm, honey-coloured stone and leaning bicycles, autumn light, Oxford.',

  // Nelson Mandela
  'nelson-mandela-1':
    'A young Xhosa boy herding cattle across the rolling green hills of the Transkei, round thatched huts and a winding river below, immense South African sky, 1920s.',
  'nelson-mandela-2':
    'A crowded township meeting hall in 1950s Johannesburg, men in suits addressing a packed room, identity passbooks on the table, mine headgear beyond the window, smoky lamplight.',
  'nelson-mandela-3':
    'A clandestine night meeting in a suburban farmhouse: maps and papers spread on a kitchen table under a shaded lamp, men in shirtsleeves, headlights sweeping the curtains, 1963.',
  'nelson-mandela-4':
    'Black South African prisoners in shorts and rough shirts swinging hammers and picks at a face of white limestone in a blinding quarry on a windswept island, uniformed white warders watching from the rim, glare and dust, 1960s.',
  'nelson-mandela-5':
    'A narrow prison cell with a folded blanket on the concrete floor, a small barred window of blue sky, a stack of law books and a candle stub, worn walls.',
  'nelson-mandela-6':
    'An elderly Black South African man in a grey suit walking out through prison gates hand in hand with his Black wife into a vast cheering crowd and press cameras, raised fists, bright Cape summer light, February 1990.',
  'nelson-mandela-7':
    'An immense queue of Black South African voters of every age winding across open veld toward a rural polling station, folding tables and ballot boxes, patient and joyful, April 1994.',
  'nelson-mandela-8':
    'A bronze statue of an elderly Black South African statesman with a raised fist standing on a hilltop above the rolling Eastern Cape hills at sunset, long grass and a wide burning sky.',
};

function loadTokenFromEnvFile() {
  if (process.env.REPLICATE_API_TOKEN) return process.env.REPLICATE_API_TOKEN;
  const envPath = path.join(projectRoot, '.env.local');
  if (!fs.existsSync(envPath)) return undefined;
  const match = fs.readFileSync(envPath, 'utf8').match(/^REPLICATE_API_TOKEN=(.+)$/m);
  return match ? match[1].trim() : undefined;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Replicate throttlet het aanmaken van predictions hard (6/min, burst 1) zolang het saldo onder
 * $5 staat, dus een platte loop 429't gegarandeerd. Zelfde aanpak als generate-portrait-images.mjs.
 */
async function withRetry(fn, attempts = 6) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const retryAfter = Number(err?.response?.headers?.get?.('retry-after'));
      const isThrottle = err?.response?.status === 429 || /429|throttled/i.test(err?.message ?? '');
      if (!isThrottle || attempt >= attempts) throw err;
      const waitMs = (Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 10 * attempt) * 1000;
      process.stdout.write(`throttled, waiting ${waitMs / 1000}s... `);
      await sleep(waitMs);
    }
  }
}

async function downloadTo(url, destination) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`download failed (${response.status}) for ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(destination, bytes);
  return bytes.length;
}

const assetPath = (sceneId) => path.join(scenesDir, `${sceneId}.webp`);

function parseArgs(argv) {
  const onlyIndex = argv.indexOf('--only');
  return {
    force: argv.includes('--force'),
    list: argv.includes('--list'),
    only:
      onlyIndex === -1
        ? undefined
        : (argv[onlyIndex + 1] ?? '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
  };
}

/** `--only julius-caesar` pakt het hele verhaal, `--only julius-caesar-3` één hoofdstuk. */
function matchesOnly(sceneId, only) {
  if (!only) return true;
  return only.some((prefix) => sceneId === prefix || sceneId.startsWith(`${prefix}-`));
}

async function main() {
  const { force, list, only } = parseArgs(process.argv.slice(2));

  const alleIds = Object.keys(scenePrompts);
  const ids = alleIds.filter((id) => matchesOnly(id, only));
  if (only) {
    for (const prefix of only) {
      if (!alleIds.some((id) => id === prefix || id.startsWith(`${prefix}-`))) {
        console.warn(`! geen prompt bekend voor "${prefix}" — overgeslagen`);
      }
    }
  }

  if (list) {
    let aanwezig = 0;
    for (const id of alleIds) {
      const bestaat = fs.existsSync(assetPath(id));
      if (bestaat) aanwezig++;
      console.log(`${bestaat ? 'aanwezig ' : 'ONTBREEKT'}  ${id}.webp`);
    }
    console.log(`\n${aanwezig}/${alleIds.length} scènebeelden aanwezig.`);
    return;
  }

  const todo = ids.filter((id) => force || !fs.existsSync(assetPath(id)));
  if (todo.length === 0) {
    console.log('Alle scènebeelden staan al in assets/images/scenes/ — niets te doen (--force overschrijft).');
    return;
  }

  const auth = loadTokenFromEnvFile();
  if (!auth) {
    console.error('REPLICATE_API_TOKEN not set (env or .env.local).');
    process.exit(1);
  }

  fs.mkdirSync(scenesDir, { recursive: true });
  const replicate = new Replicate({ auth });

  console.log(`Genereren van ${todo.length} scènebeeld(en)...\n`);

  const mislukt = [];
  for (const [index, sceneId] of todo.entries()) {
    process.stdout.write(`  [${index + 1}/${todo.length}] ${sceneId}... `);

    try {
      const output = await withRetry(() =>
        replicate.run('black-forest-labs/flux-1.1-pro', {
          input: {
            prompt: `${scenePrompts[sceneId]} ${STIJL}`,
            aspect_ratio: '16:9',
            output_format: 'webp',
            output_quality: 90,
            safety_tolerance: 2,
          },
        })
      );

      const url = typeof output === 'string' ? output : (output?.url?.() ?? output?.[0]);
      const size = await downloadTo(String(url), assetPath(sceneId));
      console.log(`opgeslagen (${Math.round(size / 1024)} KB)`);
    } catch (err) {
      // Eén geweigerde of mislukte prompt mag een run van 32 niet afbreken; aan het eind volgt
      // een overzicht en kun je die ene met --only opnieuw draaien.
      console.log(`MISLUKT — ${err.message}`);
      mislukt.push(sceneId);
    }

    if (index < todo.length - 1) await sleep(12000); // blijf onder de 6/min prediction-limiet
  }

  console.log(`\nGeschreven naar ${scenesDir}`);
  if (mislukt.length > 0) {
    console.log(`Mislukt (${mislukt.length}): ${mislukt.join(', ')}`);
    console.log(`Opnieuw proberen: node scripts/generate-scene-images.mjs --only ${mislukt.join(',')}`);
  }
  console.log('Controleer daarna dat elke sleutel een regel heeft in src/constants/scene-images.ts,');
  console.log('en draai: npx tsc --noEmit && npm run validate:content');
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
