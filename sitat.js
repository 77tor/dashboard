/* --- UKENS SITAT (1–52) --- */
const ukeSitat = {
  1: "Hver ny dag er en ny mulighet til å lære noe spennende.",
  2: "Du trenger ikke å kunne alt i dag, det viktigste er at du prøver.",
  3: "Å gjøre en feil betyr bare at hjernen din prøver å lære noe nytt.",
  4: "En god venn er som en solstråle på en regnværsdag.",
  5: "Du er unik, og det er din aller største superkraft.",
  6: "Smil til verden, så smiler verden tilbake til deg.",
  7: "Alt som er vanskelig nå, blir lett når du har øvd litt.",
  8: "Vær stolt av den du er, for det finnes ingen andre som deg!",
  9: "Kindness is a language everyone understands.",
  10: "Ingen kan gjøre alt, men alle kan gjøre litt.",
  11: "Et vennlig ord kan gjøre hele dagen fin for noen andre.",
  12: "Når du hjelper en annen opp, stiger du litt selv også.",
  13: "Nysgjerrighet er nøkkelen til å oppdage verden.",
  14: "Tålmodighet gjør deg sterkere for hver dag som går.",
  15: "Sammen får vi til ting vi ikke klarer alene.",
  16: "Tro på deg selv – du klarer mer enn du tror!",
  17: "Det er helt greit å be om hjelp når ting er vanskelig.",
  18: "Å lytte til andre er å gi dem en fin gave.",
  19: "Gjør noe hyggelig for noen i dag uten at de ber om det.",
  20: "Drøm stort, start lite, og gi aldri opp!",
  21: "Et smil smitter raskere enn noe annet i verden.",
  22: "Tenk gode tanker, for de gjør deg glad på innsiden.",
  23: "Det viktigste i en lek er at alle får være med.",
  24: "Du gjør klasserommet vårt til et bedre sted å være!",
  25: "Bøker er som magiske dører til nye verdener.",
  26: "Vær en som heier på andre – det gjør deg til en vinner selv.",
  27: "Når du deler med andre, blir gleden dobbelt så stor.",
  28: "Det er rom for alle farger i regnbuen, og rom for alle i fellesskapet.",
  29: "Natur og friluft gir god energi til både kropp og hode.",
  30: "Vær modig nok til å være deg selv fullt ut.",
  31: "Små steg hver dag fører til store resultater over tid.",
  32: "Måten vi snakker til hverandre på har stor betydning.",
  33: "Nye utfordringer gjør hjernen din enda sterkere!",
  34: "Du er en viktig brikke i klassefelleskapet vårt.",
  35: "Å bry seg om andre er den fineste egenskapen som finnes.",
  36: "Ingenting er umulig før du har prøvd.",
  37: "Ta vare på jorden vår – den er det eneste hjemmet vi har.",
  38: "Fantasi er å se muligheter der andre ser grenser.",
  39: "Det krever mot å si unnskyld, men det gjør deg utrolig sterk.",
  40: "Du må ikke være best i alt, så lenge du gjør ditt beste.",
  41: "Latter er den korteste avstanden mellom to mennesker.",
  42: "Et godt heiarop kan forandre hele dagen for en som sliter.",
  43: "Lær av i går, drøm om i morgen, lev i dag.",
  44: "Vær som et tre: Stå støtt selv om det blåser litt.",
  45: "Skinnende stjerner trenger mørke for å lyse opp.",
  46: "Det koster ingenting å være snill, men det betyr alt.",
  47: "Det finnes noe godt i hver eneste dag hvis du leter etter det.",
  48: "Kreativitet er å ha det gøy mens du lærer.",
  49: "Glede øker når du gir den videre til andre.",
  50: "Vennlighet gjør vinterdagene mye varmere.",
  51: "Når vi samarbeider, blir tunge tak til lett lek.",
  52: "Takk for alt du har lært og gjort i år – du er super!"
};

/**
 * Henter ukens sitat basert på gjeldende ukenummer.
 * Hvis ukenummer mangler, brukes uke 1 som reserve.
 */
function getQuoteForWeek(weekNum) {
  return ukeSitat[weekNum] || ukeSitat[1];
}

/**
 * Oppdaterer sitat-feltet i HTML basert på dagens dato.
 */
function oppdaterUkensSitat(dato = new Date()) {
  const quoteEl = document.getElementById('modalWeeklyQuote');
  if (!quoteEl) return;

  // Bruker den eksisterende getWeekNumber-funksjonen din hvis den finnes
  const weekNum = typeof getWeekNumber === 'function' ? getWeekNumber(dato) : 1;
  
  quoteEl.textContent = getQuoteForWeek(weekNum);
}