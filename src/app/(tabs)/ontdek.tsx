// Deze route is vervangen: "Ontdek" is nu de index-tab ((tabs)/index.tsx).
// Kon niet worden verwijderd (Remove-Item is geblokkeerd in dit project) —
// mag handmatig weggehaald worden.
import { Redirect } from 'expo-router';

export default function OudeOntdekRoute() {
  return <Redirect href="/" />;
}
