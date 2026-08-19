import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 *
 * **Waarom `useSyncExternalStore` en geen `useState` + `useEffect`.** Hier stond de bekende
 * hydratievlag: `useState(false)` met een effect dat hem meteen op `true` zet. Dat is precies het
 * patroon dat `react-hooks/set-state-in-effect` afkeurt — een `setState` in een effectlichaam
 * dwingt een tweede render af waar React er een nodig had. Deze vorm zegt hetzelfde in één stap:
 * de serversnapshot is `false`, de clientsnapshot `true`, en er valt niets te abonneren omdat de
 * waarde na hydratie niet meer verandert (vandaar de lege subscribe).
 */

/** Niets om op te abonneren: de waarde wisselt precies één keer, bij de hydratie zelf. */
const abonneer = () => () => {};
const opDeClient = () => true;
const opDeServer = () => false;

export function useColorScheme() {
  const isGehydrateerd = useSyncExternalStore(abonneer, opDeClient, opDeServer);
  const colorScheme = useRNColorScheme();

  return isGehydrateerd ? colorScheme : 'light';
}
