import type { Verhaal } from '@/constants/types';
import { twintigsteEeuw } from './personen';
import { twintigsteEeuwGegenereerd } from './gegenereerd';

export const verhalen: Verhaal[] = [...twintigsteEeuw, ...twintigsteEeuwGegenereerd];
