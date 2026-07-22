// Deze route is vervangen door /verhaal/[id]. Kon niet worden verwijderd
// (Remove-Item is geblokkeerd in dit project) — mag handmatig weggehaald worden.
import { Redirect } from 'expo-router';

export default function OudeDetailRoute() {
  return <Redirect href="/" />;
}
