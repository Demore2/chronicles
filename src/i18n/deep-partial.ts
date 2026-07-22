// Functiewaarden (bv. pluralisatie-helpers) blijven verplicht compleet —
// alleen platte tekstsleutels en geneste objecten mogen ontbreken. `en.ts`
// gebruikt `as const`, dus literal string types worden hier verbreed naar
// `string` zodat een vertaling andere tekst mag bevatten dan het Engels.
export type DeepPartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends string
    ? string
    : T extends number
      ? number
      : T extends boolean
        ? boolean
        : T extends object
          ? { [K in keyof T]?: DeepPartial<T[K]> }
          : T;
