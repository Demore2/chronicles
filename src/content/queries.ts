import { collecties, getCollectie } from '@/content/collecties';
import { getVerhaal, getVerhalenByRegio, verhalen } from '@/content/verhalen';
import type { Verhaal } from '@/constants/types';

const UITGELICHT_VERHAAL_ID = 'crown-for-new-empire';

export function getVerhalenVoorCollectie(collectieId: string): Verhaal[] {
  const collectie = getCollectie(collectieId);
  if (!collectie) return [];
  return collectie.verhaalIds
    .map((id) => getVerhaal(id))
    .filter((verhaal): verhaal is Verhaal => verhaal !== undefined);
}

export function getCollectiesVoorVerhaal(verhaalId: string) {
  return collecties.filter((collectie) => collectie.verhaalIds.includes(verhaalId));
}

export function getUitgelichtVerhaal(): Verhaal {
  return getVerhaal(UITGELICHT_VERHAAL_ID) ?? verhalen[0];
}

export function getNieuwToegevoegd(aantal = 6): Verhaal[] {
  return [...verhalen].slice(-aantal).reverse();
}

export function getVolgendVerhaal(huidigId: string): Verhaal | undefined {
  const index = verhalen.findIndex((verhaal) => verhaal.id === huidigId);
  if (index === -1) return undefined;
  return verhalen[(index + 1) % verhalen.length];
}

export type RegioVoortgang = { totaal: number; gelezen: number };

export function getRegioVoortgang(regioId: string, gelezenIds: Set<string>): RegioVoortgang {
  const verhalenVoorRegio = getVerhalenByRegio(regioId);
  return {
    totaal: verhalenVoorRegio.length,
    gelezen: verhalenVoorRegio.filter((verhaal) => gelezenIds.has(verhaal.id)).length,
  };
}

export function getTijdperkVoortgang(tijdperkId: string, gelezenIds: Set<string>): RegioVoortgang {
  const verhalenVoorTijdperk = verhalen.filter((verhaal) => verhaal.tijdperkId === tijdperkId);
  return {
    totaal: verhalenVoorTijdperk.length,
    gelezen: verhalenVoorTijdperk.filter((verhaal) => gelezenIds.has(verhaal.id)).length,
  };
}
