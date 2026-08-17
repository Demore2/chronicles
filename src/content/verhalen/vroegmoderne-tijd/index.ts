import type { Verhaal } from '@/constants/types';
import { vroegmoderneTijd } from './personen';
import { vroegmoderneTijdGegenereerd } from './gegenereerd';

export const verhalen: Verhaal[] = [...vroegmoderneTijd, ...vroegmoderneTijdGegenereerd];
