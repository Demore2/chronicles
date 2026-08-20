/**
 * Het datamodel van het uitnodigingssysteem.
 *
 * Staat in `src/types/` en niet in `constants/types.ts`, omdat dat bestand het *content*-model
 * beschrijft (`Verhaal`, `Tijdperk`, `Blok`) en dit over een gebruiker gaat. De namen zijn hier
 * bewust Engels: ze komen één-op-één overeen met de kolommen van `public.referrals`, en een
 * vertaalslag tussen twee lagen is een plek waar velden stilletjes uit de pas gaan lopen.
 */

/** Eén uitgenodigde vriend. Een lijst van kale id's zou het moment weggooien. */
export type UitgenodigdeVriend = {
  /** Het gebruiker-id van de vriend die met deze code binnenkwam. */
  friendId: string;
  /** Epoch-ms, net als `UnlockedCharacter.unlockedAt` — niet als ISO-tekst. */
  invitedAt: number;
};

/**
 * Wat de app over het uitnodigen van deze lezer bewaart.
 *
 * `createdAt` is een `Date` in de opdracht en een getal hier, om dezelfde reden als bij de vier
 * andere sync-stores: `persist` schrijft door `JSON.stringify` heen, en een `Date` komt daar als
 * string weer uit. Een getal overleeft de ronde langs AsyncStorage ongeschonden.
 */
export type ReferralData = {
  userId: string;
  referralCode: string;
  friendsInvited: UitgenodigdeVriend[];
  /** Hoeveel beloningen er in totaal verdiend zijn — één per geslaagde uitnodiging. */
  rewardsEarned: number;
  /** Hoeveel daarvan al ingewisseld zijn. Beschikbaar = `rewardsEarned - rewardsClaimed`. */
  rewardsClaimed: number;
  createdAt: number;
};

/**
 * Wat een beloning kan zijn.
 *
 * Twee soorten en niet één, omdat ze verschillende lezers bedienen: wie tegen de dagelijkse
 * limiet aanloopt wil vandaag één verhaal extra, wie de app dagelijks gebruikt heeft meer aan een
 * week zonder limiet en zonder onderbreking.
 */
export type BeloningSoort = 'verhaal' | 'pro-week';

/** Hoeveel dagen een `pro-week` duurt. Als constante, zodat de tekst en de klok het eens zijn. */
export const PRO_WEEK_DAGEN = 7;
