// Gesplitst in R3 (REFACTOR-PLAN.md) in src/content/verhalen/<tijdperk-id>.ts met een
// index-barrel. Dit bestand kon niet worden verwijderd (Remove-Item is geblokkeerd in dit
// project) — Node/TS resolutie geeft een bestand voorrang boven een gelijknamige map, dus dit
// forwarding-bestand is wat '@/content/verhalen' daadwerkelijk oplevert.
export * from './verhalen/index';
