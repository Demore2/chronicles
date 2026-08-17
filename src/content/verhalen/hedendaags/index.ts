import type { Verhaal } from '@/constants/types';
import { hedendaags } from './personen';
import { hedendaagsGegenereerd } from './gegenereerd';

export const verhalen: Verhaal[] = [...hedendaags, ...hedendaagsGegenereerd];
