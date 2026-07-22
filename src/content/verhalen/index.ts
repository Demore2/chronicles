import type { Verhaal } from '@/constants/types';
import { verhalen as oudheid } from './oudheid';
import { verhalen as middeleeuwen } from './middeleeuwen';
import { verhalen as vroegmoderneTijd } from './vroegmoderne-tijd';
import { verhalen as industrieleRevolutie } from './industriele-revolutie';
import { verhalen as twintigsteEeuw } from './twintigste-eeuw';
import { verhalen as hedendaags } from './hedendaags';

// Eén bestand per tijdperk (REFACTOR-PLAN.md R3/R7), zodat een agent per tijdperk
// conflictvrij alleen zijn eigen bestand kan schrijven.
export const verhalen: Verhaal[] = [
  ...oudheid,
  ...middeleeuwen,
  ...vroegmoderneTijd,
  ...industrieleRevolutie,
  ...twintigsteEeuw,
  ...hedendaags,
];

export function getVerhaal(id: string): Verhaal | undefined {
  return verhalen.find((verhaal) => verhaal.id === id);
}

export function getVerhalenByTijdperk(tijdperkId: string): Verhaal[] {
  return verhalen.filter((verhaal) => verhaal.tijdperkId === tijdperkId).sort((a, b) => a.jaar - b.jaar);
}

// regioIds is in R3 echt verwijderd van Verhaal — deze functie kan dus niets meer
// filteren. Blijft bestaan omdat de orphaned world-map.tsx/regio/[id].tsx/
// continent/[continentId].tsx (zie CLAUDE.md) er nog naar importeren.
export function getVerhalenByRegio(_regioId: string): Verhaal[] {
  return [];
}
