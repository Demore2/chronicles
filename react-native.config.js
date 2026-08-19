/**
 * Autolinking-overrides voor de React Native-CLI.
 *
 * **Let op: dit bestand is niet wat Firebase uitzet.** Dat doet `expo.autolinking.exclude` in
 * `package.json`. Deze regel staat er zodat de volgende persoon die dit probeert niet dezelfde
 * middag kwijt is: `expo-modules-autolinking` (SDK 57) laadt dit bestand wél — het komt netjes
 * binnen als `projectConfig` — maar de `dependencies`-overrides bereiken de Android-resolver niet,
 * dus `platforms: { android: null }` heeft er geen effect. Wat het wél leest is de
 * `exclude`-lijst uit `package.json`, en die is statische JSON en kan de vlag dus niet lezen.
 * Vandaar de bewaking in `app.config.js`.
 *
 * Waarom de modules überhaupt uitgesloten moeten worden: `@react-native-firebase/*` zijn gewone
 * React Native-modules, geen Expo-modules. Ze worden dus ook geautolinkt als `app.config.js` de
 * `@react-native-firebase/app`-plugin al uit de configuratie heeft gefilterd, en dan valt de build
 * alsnog om — niet meer op een ontbrekend `google-services.json`, maar op de manifest-merger:
 *
 *     Attribute meta-data#com.google.firebase.messaging.default_notification_color
 *     ... value=(@color/notification_icon_color) from AndroidManifest.xml
 *     is also present at [:react-native-firebase_messaging] value=(@color/white)
 *
 * `expo-notifications` en `react-native-firebase/messaging` claimen allebei die meta-data. Zolang
 * Firebase uit staat is de oplossing niet om die botsing met een `tools:replace` te beslechten,
 * maar om de modules niet te koppelen: zonder `google-services.json` valt er niets te
 * initialiseren en zou de native code alleen ruimte innemen.
 *
 * De overrides hieronder blijven staan voor de paden die ze wél honoreren (de kale
 * `@react-native-community/cli`). Ze zijn afgeleid van dezelfde vlag, dus ze kunnen niet uit de
 * pas lopen met `package.json`.
 */

const { FIREBASE_AAN } = require('./firebase-vlag');

const FIREBASE_PAKKETTEN = [
  '@react-native-firebase/app',
  '@react-native-firebase/analytics',
  '@react-native-firebase/messaging',
];

module.exports = FIREBASE_AAN
  ? {}
  : {
      dependencies: Object.fromEntries(
        FIREBASE_PAKKETTEN.map((naam) => [naam, { platforms: { android: null, ios: null } }])
      ),
    };
