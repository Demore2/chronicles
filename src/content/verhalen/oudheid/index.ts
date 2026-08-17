import type { Verhaal } from '@/constants/types';
import { oudheidPersonen } from './personen';
import { oudheidGebeurtennissen } from './gebeurtenissen';
import { oudheidGegenereerd } from './gegenereerd';

export const verhalen: Verhaal[] = [
  ...oudheidPersonen,
  ...oudheidGebeurtennissen,
  ...oudheidGegenereerd,
];
