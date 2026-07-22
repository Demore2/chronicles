import type { Verhaal } from '@/constants/types';
import { oudheidPersonen } from './personen';
import { oudheidGebeurtennissen } from './gebeurtenissen';

export const verhalen: Verhaal[] = [
  ...oudheidPersonen,
  ...oudheidGebeurtennissen,
];
