// Deze route is vervangen door de nieuwe navigatie via /continent, /collectie,
// /tijdperk en /verhaal. Kon niet worden verwijderd (Remove-Item is geblokkeerd
// in dit project) — mag handmatig weggehaald worden.
import { Redirect } from 'expo-router';

export default function OudeLandRoute() {
  return <Redirect href="/" />;
}
