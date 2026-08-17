import type { Verhaal } from '@/constants/types';
import { industrieleRevolutie } from './personen';
import { industrieleRevolutieGegenereerd } from './gegenereerd';

export const verhalen: Verhaal[] = [...industrieleRevolutie, ...industrieleRevolutieGegenereerd];
