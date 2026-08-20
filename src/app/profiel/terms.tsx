import { Stack } from 'expo-router';

import { JuridischePagina } from '@/components/juridische-pagina';
import { VOORWAARDEN_URL, voorwaardenZijnGepubliceerd } from '@/constants/app-info';
import { VOORWAARDEN_ALINEAS, VOORWAARDEN_TITEL } from '@/constants/juridische-teksten';
import { useVertaling } from '@/hooks/use-vertaling';

/**
 * De algemene voorwaarden (`/profiel/terms`), geopend vanuit Instellingen.
 *
 * Stond daar tot nu toe als "Soon"-regel met een melding erachter: er wás geen document, alleen
 * de zin op het registratiescherm die naar één verwees. Nu is er een document, en het staat in de
 * app zelf — geen link naar buiten, dus het werkt ook offline en er valt niets stuk te gaan aan
 * een URL die nog niet gepubliceerd is.
 *
 * De tekst staat in `constants/juridische-teksten.ts`; de titel in de kopbalk komt van
 * `AppHeader`, die hem uit deze `Stack.Screen`-optie leest.
 */
export default function VoorwaardenScreen() {
  const { t } = useVertaling();

  return (
    <>
      <Stack.Screen options={{ title: t((s) => s.instellingen.voorwaarden) }} />
      <JuridischePagina
        titel={VOORWAARDEN_TITEL}
        alineas={VOORWAARDEN_ALINEAS}
        webUrl={voorwaardenZijnGepubliceerd ? VOORWAARDEN_URL : undefined}
      />
    </>
  );
}
