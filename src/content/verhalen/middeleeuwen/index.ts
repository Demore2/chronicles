import type { Verhaal } from '@/constants/types';
import { middeleeuwen } from './personen';
import { middeleeuwenGegenereerd } from './gegenereerd';

export const verhalen: Verhaal[] = [...middeleeuwen, ...middeleeuwenGegenereerd];
