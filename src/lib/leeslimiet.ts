import { supabase } from '@/lib/supabase';
import { vandaagSleutel } from '@/store/voortgang-store';

/**
 * De serverkant van de dagelijkse leeslimiet: `public.user_daily_reads`.
 *
 * **De limiet zelf wordt lokaal beslist, niet hier.** `abonnement-store.magVerhaalOpenen` is en
 * blijft de poort — die is zuiver, werkt offline en antwoordt binnen een frame. Deze module doet
 * twee dingen ernaast:
 *
 * 1. **Schrijven.** Elk verhaal dat voor het eerst opengaat krijgt een rij. De tabel is
 *    append-only (select + insert, geen update of delete) en wordt vandaag door niets anders
 *    gelezen; hij bestaat zodat de Billing-fase kan zien wat een gratis lezer werkelijk
 *    verbruikte, zonder dat daarvoor een teller op het toestel vertrouwd hoeft te worden.
 * 2. **Lezen.** Welke verhalen dit account vandaag al opende, ongeacht op welk toestel. Dat sluit
 *    het gat dat in CLAUDE.md onder "Known gaps" staat: twee toestellen gaven elk hun eigen
 *    dagvoorraad, want `gestarteVerhalen` staat in AsyncStorage.
 *
 * **De dag is de lokale dag van dít toestel**, dezelfde `vandaagSleutel()` als de streak en als
 * `abonnement-store`. Niet UTC en niet een vaste Europese zone: dan reset de teller voor een lezer
 * in Sydney midden op de middag. De grenzen gaan als echte momenten naar Postgres, dus de vraag
 * "wat viel er binnen mijn dag" wordt aan beide kanten hetzelfde beantwoord.
 *
 * Zoals `haptics.ts`, `dialoog.ts` en `deel.ts`: **niets hier gooit ooit.** Een mislukte ronde
 * betekent "de server weet het even niet", en dan beslist de lokale stand — nooit andersom. Een
 * leeslimiet die dichtklapt zodra het netwerk wegvalt is erger dan een limiet die een keer te
 * ruim is.
 */

/** Een rij zoals we hem teruglezen. Alleen het verhaal-id doet ertoe; de tijd zit in de filter. */
type LeesRij = { story_id: string };

/**
 * Het begin en het einde van de lokale dag, als ISO-momenten.
 *
 * `new Date(jaar, maand, dag)` bouwt middernacht in de zone van het toestel, en `toISOString()`
 * zet dat om naar het bijbehorende UTC-moment. Zo komt er in Amsterdam `22:00Z` van de vorige dag
 * uit, wat precies klopt. De valkuil die hier vermeden wordt is `setUTCHours(0,0,0,0)`: dat is
 * middernacht in Greenwich, niet hier, en het schuift bovendien twee keer per jaar mee met de
 * zomertijd terwijl de gebruiker daar niets van merkt.
 *
 * Het einde wordt uit de kalender gehaald (`dag + 1`) en niet uit "+ 24 uur": op de nacht van de
 * klokverzetting duurt de dag 23 of 25 uur.
 */
function dagGrenzen(nu: Date = new Date()): { van: string; tot: string } {
  const begin = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate());
  const eind = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate() + 1);
  return { van: begin.toISOString(), tot: eind.toISOString() };
}

/**
 * Noteert op de server dat dit verhaal is opengegaan.
 *
 * Fire-and-forget met opzet: de lezer staat op dit moment naar het hoofdstukoverzicht te kijken en
 * mag daar niet op wachten. `user_id` wordt meegestuurd omdat de insert-policy
 * (`auth.uid() = user_id`) er een `with check` op doet — een rij met andermans id wordt geweigerd,
 * en een rij zonder id kan de tabel niet aan.
 *
 * Er is bewust **geen unique constraint** op `(user_id, story_id, dag)` en dus ook geen
 * `ignoreDuplicates`: de tabel is een logboek. Dubbele rijen voor hetzelfde verhaal zijn geen
 * fout, en `haalVerhalenVandaagOp` telt daarom unieke id's in plaats van rijen.
 */
export function logVerhaalGeopend(userId: string, verhaalId: string): void {
  void supabase
    .from('user_daily_reads')
    .insert({ user_id: userId, story_id: verhaalId, read_at: new Date().toISOString() })
    .then(({ error }) => {
      if (error && __DEV__) {
        console.warn('[leeslimiet] opslaan van geopend verhaal mislukt:', error.message);
      }
    });
}

/**
 * Welke verhalen dit account vandaag al opende, volgens de server.
 *
 * Geeft `null` terug als het antwoord er niet is — offline, een 401, of gewoon te traag. Dat is
 * iets anders dan een lege lijst ("de server weet zeker dat je vandaag nog niets opende") en de
 * aanroeper moet dat onderscheid kunnen maken: bij `null` blijft de lokale stand staan.
 *
 * `timeoutMs` staat er omdat dit vóór de poort gebeurt. Een gate die op een hangende verbinding
 * wacht is een scherm dat niet opengaat, en dan is een dagvoorraad die per toestel telt veruit het
 * kleinere kwaad.
 */
export async function haalVerhalenVandaagOp(
  userId: string,
  timeoutMs = 2500
): Promise<{ dagSleutel: string; verhaalIds: string[] } | null> {
  const nu = new Date();
  const { van, tot } = dagGrenzen(nu);

  const opvraging = supabase
    .from('user_daily_reads')
    .select('story_id')
    .eq('user_id', userId)
    .gte('read_at', van)
    .lt('read_at', tot);

  // `Promise.race` en geen `AbortController`: supabase-js geeft zijn signal niet door op elke
  // transportlaag, en het enige dat hier nodig is, is dat de poort doorloopt. De opvraging zelf
  // mag rustig later alsnog binnenkomen en in het niets verdwijnen.
  const verlopen = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));

  try {
    const uitkomst = await Promise.race([opvraging, verlopen]);
    if (!uitkomst) return null;

    const { data, error } = uitkomst;
    if (error) {
      if (__DEV__) console.warn('[leeslimiet] ophalen van vandaag mislukt:', error.message);
      return null;
    }

    const rijen = (data ?? []) as LeesRij[];
    return {
      // De sleutel gaat mee terug zodat de aanroeper hem naast zijn eigen dag kan leggen. Rond
      // middernacht kan de dag tussen het opvragen en het verwerken omslaan, en dan hoort dit
      // antwoord bij gisteren.
      dagSleutel: vandaagSleutel(nu),
      verhaalIds: [...new Set(rijen.map((rij) => rij.story_id))],
    };
  } catch (fout: unknown) {
    if (__DEV__) console.warn('[leeslimiet] ophalen van vandaag mislukt:', fout);
    return null;
  }
}
