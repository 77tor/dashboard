/* --- KOMPLETT NORSK NAVNEDAGSKALENDER OG DATO-CALCULATOR --- */
const navnedagerNorge = {
  "1-1": "Ingen navnedag (1. nyttårsdag)", "1-2": "Dagfinn, Dagfrid", "1-3": "Alfred, Alf, Alva", "1-4": "Roar, Roger", "1-5": "Hanna, Hanne", "1-6": "Aslaug, Aisha, Alex", "1-7": "Eldbjørg, Knut", "1-8": "Turid, Torfinn", "1-9": "Gunnar, Gunn", "1-10": "Sigmund, Sigrun, Sina",
  "1-11": "Børge, Børre", "1-12": "Nelly, Nataniel", "1-13": "Gisle, Gislaug", "1-14": "Herbjørn, Herbjørg, Hermine", "1-15": "Laurits, Laura, Lykke", "1-16": "Hjalmar, Hilmar, Hassan", "1-17": "Anton, Tønnes, Tony", "1-18": "Hildur, Hild", "1-19": "Marius, Margunn, Matheo", "1-20": "Fabian, Sebastian, Bastian",
  "1-21": "Agnes, Agnete, Abdul", "1-22": "Ivan, Vanja, Vanessa", "1-23": "Emil, Emilie, Emma", "1-24": "Joar, Jarle, Jarl", "1-25": "Paul, Pål", "1-26": "Øystein, Esten", "1-27": "Gaute, Gry", "1-28": "Karl, Karoline, Carlos", "1-29": "Herdis, Hermod, Hermann", "1-30": "Gunnhild, Gunda", "1-31": "Idun, Ivar",
  
  "2-1": "Birte, Bjarte", "2-2": "Jomar, Jostein, Omar, Bianca", "2-3": "Ansgar, Asgeir, Angelika", "2-4": "Veronika, Vera", "2-5": "Agate, Ågot", "2-6": "Dortea, Dorte, Dominik", "2-7": "Rikard, Rigmor", "2-8": "Åshild, Åsne, Ådne", "2-9": "Lone, Leikny, Levi", "2-10": "Ingfrid, Ingrid",
  "2-11": "Ingve, Yngve", "2-12": "Randi, Ronja", "2-13": "Svanhild, Scott", "2-14": "Valentin, Valentina", "2-15": "Sigbjørn, Silas, Sienna", "2-16": "Julian, Juliane, Jill", "2-17": "Aleksandra, Sandra, Sondre", "2-18": "Frøydis, Frode, Fatima", "2-19": "Ella, Elna, Ebba", "2-20": "Halldis, Halldor",
  "2-21": "Samuel, Selma, Celine", "2-22": "Tina, Tim, Tilde", "2-23": "Torstein, Torunn", "2-24": "Mattias, Mattis, Mats", "2-25": "Viktor, Viktoria, Vincent", "2-26": "Inger, Ingjerd", "2-27": "Leander, Laila, Lill", "2-28": "Marina, Maren, Mira", "2-29": "Skuddårsdagen",
  
  "3-1": "Audny, Audun", "3-2": "Erna, Ernst", "3-3": "Gunnbjørg, Gunnveig, Gunnlaug", "3-4": "Ada, Adrian, Adele", "3-5": "Patrick, Patricia", "3-6": "Annfrid, Aida, Alida", "3-7": "Arild, Are, Ali", "3-8": "Beate, Betty, Bettina", "3-9": "Sverre, Sindre", "3-10": "Edel, Edle",
  "3-11": "Edvin, Tale", "3-12": "Gregor, Gro", "3-13": "Greta, Grete", "3-14": "Mathilde, Mette, Mille", "3-15": "Christel, Christer, Chris", "3-16": "Gudmund, Gudny", "3-17": "Gjertrud, Trude", "3-18": "Aleksander, Sander, Edvard", "3-19": "Josef, Josefine, Joel", "3-20": "Joakim, Kim",
  "3-21": "Bendik, Bengt, Bent", "3-22": "Paula, Pauline", "3-23": "Gerda, Gerd", "3-24": "Ulrikke, Rikke", "3-25": "Maria, Marie, Mari", "3-26": "Gabriel, Glenn", "3-27": "Rudolf, Rudi", "3-28": "Åsta, Åste", "3-29": "Jonas, Jonatan", "3-30": "Holger, Olga, Olai", "3-31": "Vebjørn, Vegard",
  
  "4-1": "Aron, Arve, Arvid", "4-2": "Sigvard, Sivert", "4-3": "Gunnvald, Gunvor", "4-4": "Nanna, Nancy, Nina", "4-5": "Irene, Eirin, Eiril", "4-6": "Åsmund, Asmund", "4-7": "Oddveig, Oddvin", "4-8": "Asle, Atle, Ava", "4-9": "Rannveig, Rønnaug", "4-10": "Ingvald, Ingveig",
  "4-11": "Ylva, Ulf", "4-12": "Julius, Julie", "4-13": "Asta, Astrid", "4-14": "Ellinor, Nora, Noah", "4-15": "Oda, Odin, Odd", "4-16": "Magnus, Mons, Mohammad", "4-17": "Elise, Else, Elsa", "4-18": "Eilen, Eilert", "4-19": "Arnfinn, Arnstein, Alvin", "4-20": "Kjellaug, Kjellrun",
  "4-21": "Jeanette, Jannike, Jessica", "4-22": "Oddgeir, Oddny", "4-23": "Georg, Jørgen, Jørn", "4-24": "Albert, Olaug, Olivia", "4-25": "Markus, Mark, Marco", "4-26": "Terese, Tea, Telma", "4-27": "Charles, Charlotte, Lotte", "4-28": "Vivi, Vivian, Viljar", "4-29": "Toralf, Torolf", "4-30": "Gina, Gitte",
  
  "5-1": "Filip, Valborg, Filippa", "5-2": "Åsa, Åse", "5-3": "Gjermund, Gøril", "5-4": "Monika, Mona, Milla", "5-5": "Nicole, Noel, Noor", "5-6": "Guri, Gyri, Gudbrand", "5-7": "Maia, Mai, Maiken", "5-8": "Åge, Åke, Åslaug", "5-9": "Kasper, Jesper, Kaspian", "5-10": "Asbjørg, Asbjørn, Espen",
  "5-11": "Magda, Malvin, Madelen", "5-12": "Normann, Norvald", "5-13": "Linda, Line, Linn", "5-14": "Kristian, Kristen, Karsten", "5-15": "Hallvard, Halvor", "5-16": "Sara, Siren, Samira", "5-17": "Harald, Ragnhild", "5-18": "Eirik, Erik, Erika", "5-19": "Torjus, Torje, Truls", "5-20": "Bjørnar, Bror",
  "5-21": "Helene, Ellen, Eli", "5-22": "Henning, Henny", "5-23": "Oddleif, Oddlaug", "5-24": "Ester, Iris", "5-25": "Ragna, Ragnar", "5-26": "Annbjørg, Annlaug, Anneli", "5-27": "Katinka, Cato, Carmen", "5-28": "Vilhelm, William, Willy", "5-29": "Magnar, Magnhild, Mario", "5-30": "Gard, Geir", "5-31": "Pernille, Preben",
  
  "6-1": "June, Juni", "6-2": "Runa, Runar, Rune", "6-3": "Rasmus, Rakel, Rafael", "6-4": "Heidi, Heid, Helmer", "6-5": "Torbjørg, Torbjørn, Torben", "6-6": "Gustav, Gyda", "6-7": "Robert, Robin", "6-8": "Renate, René", "6-9": "Kolbjørn, Kassandra", "6-10": "Ingolf, Ingunn",
  "6-11": "Borgar, Bjørge, Bjørg", "6-12": "Sigfrid, Sigrid, Siri", "6-13": "Tone, Tonje, Tanja", "6-14": "Erlend, Erland, Erle", "6-15": "Vigdis, Viggo, Vilja", "6-16": "Torhild, Toril, Tiril", "6-17": "Botolv, Bodil", "6-18": "Bjarne, Bjørn", "6-19": "Erling, Elling, Ellie", "6-20": "Sølve, Sølvi",
  "6-21": "Agnar, Annar, Ahmed", "6-22": "Håkon, Maud", "6-23": "Elfrid, Eldrid, Elliot", "6-24": "Johannes, Jon, Hans", "6-25": "Jørund, Jorunn", "6-26": "Jenny, Jonny, Jennifer", "6-27": "Aina, Ina, Ine", "6-28": "Lea, Leo, Leon", "6-29": "Peter, Petter, Per", "6-30": "Solbjørg, Solgunn, Sol",
  
  "7-1": "Ask, Embla", "7-2": "Kjartan, Kjellfrid", "7-3": "Andrea, Andrine, André", "7-4": "Ulrik, Ulla", "7-5": "Mirjam, Mina, Michelle", "7-6": "Torgrim, Torgunn", "7-7": "Håvard, Hulda, Hussein", "7-8": "Sunniva, Synnøve, Synne", "7-9": "Gøran, Jøran, Ørjan", "7-10": "Anita, Anja, Amina",
  "7-11": "Kjetil, Kjell", "7-12": "Elias, Eldar, Elida", "7-13": "Mildrid, Melissa, Mia", "7-14": "Solfrid, Solrun, Frøya", "7-15": "Oddmund, Oddrun", "7-16": "Susanne, Sanna, Saga", "7-17": "Guttorm, Gorm", "7-18": "Arnulf, Ørnulf", "7-19": "Gerhard, Gjert", "7-20": "Margareta, Margit, Marit",
  "7-21": "Johanne, Janne, Jane", "7-22": "Malene, Malin, Mali", "7-23": "Brita, Brit, Britt", "7-24": "Kristine, Kristin, Kristi", "7-25": "Jakob, Jack, Jim", "7-26": "Anna, Anne, Ane", "7-27": "Marita, Rita", "7-28": "Reidar, Reidun", "7-29": "Olav, Ola, Ole", "7-30": "Aurora, Audhild, Aud", "7-31": "Elin, Eline, Elina",
  
  "8-1": "Peder, Petra", "8-2": "Karen, Karin, Karina", "8-3": "Oline, Oliver, Olve", "8-4": "Arnhild, Arna, Arne", "8-5": "Osvald, Oskar", "8-6": "Loke, Lilja, Luis", "8-7": "Didrik, Doris", "8-8": "Evy, Yvonne, Yasmin", "8-9": "Ronald, Ronny", "8-10": "Lorents, Lars, Lasse",
  "8-11": "Torvald, Tarald, Tara", "8-12": "Klara, Camilla, Lara", "8-13": "Anny, Anine, Ann", "8-14": "Stella, Storm", "8-15": "Margot, Mary, Marielle", "8-16": "Brage, Brynjulf, Brynhild", "8-17": "Verner, Wenche", "8-18": "Tormod, Torodd, Valdemar", "8-19": "Sigvald, Sigve", "8-20": "Bernhard, Bernt",
  "8-21": "Ragnvald, Ragni", "8-22": "Harriet, Harry", "8-23": "Signe, Signy", "8-24": "Belinda, Bertil", "8-25": "Ludvig, Lovise, Louise", "8-26": "Øyvind, Eivind, Even", "8-27": "Roald, Rolf", "8-28": "Artur, August, Angela", "8-29": "Johan, Jone, Jo", "8-30": "Benjamin, Ben", "8-31": "Aria, Ariana, Ariel",
  
  "9-1": "Solveig, Solvor", "9-2": "Lisa, Lise, Liss", "9-3": "Alise, Alvhild, Vilde", "9-4": "Ida, Idar, Iben", "9-5": "Brede, Brian, Njål", "9-6": "Siril, Siv", "9-7": "Regine, Rose", "9-8": "Amalie, Alma, Allan", "9-9": "Trygve, Tyra, Trym", "9-10": "Tord, Tor",
  "9-11": "Dagny, Dag, Damian", "9-12": "Jofrid, Jorid", "9-13": "Stian, Stig", "9-14": "Ingebjørg, Ingeborg", "9-15": "Aslak, Eskil, Ailo", "9-16": "Lillian, Lilly, Linnea", "9-17": "Hildegunn, Hjørdis", "9-18": "Henriette, Henry", "9-19": "Konstanse, Connie, Kornelia", "9-20": "Tobias, Tage",
  "9-21": "Trine, Trond, Tamara", "9-22": "Kyrre, Kåre", "9-23": "Snorre, Snefrid", "9-24": "Jan, Jens", "9-25": "Ingvar, Yngvar", "9-26": "Einar, Endre, Elvira", "9-27": "Dagmar, Dagrun", "9-28": "Lena, Lene, Elena", "9-29": "Mikael, Mikal, Mikkel", "9-30": "Helga, Helge, Hege",
  
  "10-1": "Rebekka, Remi", "10-2": "Live, Liv, Linus", "10-3": "Evald, Evelyn, Emine", "10-4": "Frans, Frank, Fanny", "10-5": "Brynjar, Boye, Bo", "10-6": "Målfrid, Møyfrid, Mio", "10-7": "Birgitte, Birgit, Berit", "10-8": "Benedikte, Bente", "10-9": "Leif, Liam, Dennis", "10-10": "Fridtjof, Frida, Frits",
  "10-11": "Kevin, Kennet, Kent", "10-12": "Valter, Vibeke, Vilma", "10-13": "Terje, Tarjei, Torgeir", "10-14": "Kaia, Kai, Kaisa", "10-15": "Hedvig, Hedda", "10-16": "Finn, Felix, Ferdinand", "10-17": "Marta, Marte, Mathea", "10-18": "Kjersti, Kjerstin, Lukas", "10-19": "Tora, Tore", "10-20": "Henrik, Heine, Henrikke",
  "10-21": "Bergljot, Birger, Birk", "10-22": "Karianne, Karine, Kine", "10-23": "Severin, Søren, Sean", "10-24": "Eilif, Eivor, Emrik", "10-25": "Margrete, Merete, Märta", "10-26": "Amandus, Amanda", "10-27": "Sturla, Sture", "10-28": "Simon, Simen, Simone", "10-29": "Norunn, Naomi, Nikoline", "10-30": "Aksel, Ove", "10-31": "Edit, Edna",
  
  "11-1": "Veslemøy, Vetle", "11-2": "Tove, Tuva", "11-3": "Raymond, Roy", "11-4": "Otto, Ottar, Otilie", "11-5": "Egil, Egon, Eira", "11-6": "Leonard, Lennart, Leonora", "11-7": "Ingebrigt, Ingelin", "11-8": "Ingvild, Yngvild", "11-9": "Tordis, Teodor, Theo", "11-10": "Gudbjørg, Gudveig",
  "11-11": "Martin, Morten, Martine", "11-12": "Torkjell, Torkil, Tomine", "11-13": "Kirsten, Kirsti", "11-14": "Fredrik, Fred, Freddy", "11-15": "Oddfrid, Oddvar", "11-16": "Edmund, Edgar, Emilian", "11-17": "Hugo, Hogne, Hauk", "11-18": "Magne, Magny", "11-19": "Elisabet, Lisbet", "11-20": "Halvdan, Helle",
  "11-21": "Mariann, Marianne, Max", "11-22": "Cecilie, Silje, Sissel", "11-23": "Klement, Klaus, Klaudia", "11-24": "Gudrun, Guro", "11-25": "Katarina, Katrine, Kari", "11-26": "Konrad, Kurt", "11-27": "Torlaug, Torleif, Colin", "11-28": "Ruben, Rut", "11-29": "Sofie, Sonja, Sofia", "11-30": "Andreas, Anders, Ana",
  
  "12-1": "Arnold, Arnljot, Arnt", "12-2": "Borghild, Borgny, Bård", "12-3": "Sveinung, Svein", "12-4": "Barbara, Barbro", "12-5": "Stine, Ståle", "12-6": "Nikolai, Nils, Niklas", "12-7": "Hallfrid, Hallstein, Hallgeir", "12-8": "Marlene, Marion, Morgan", "12-9": "Anniken, Annette", "12-10": "Judit, James, Jardar",
  "12-11": "Daniel, Dan, Daniela", "12-12": "Pia, Peggy", "12-13": "Lucia, Lydia, Luna", "12-14": "Steinar, Stein", "12-15": "Hilda, Hilde", "12-16": "Oddbjørg, Oddbjørn", "12-17": "Inga, Inge, Iman", "12-18": "Kristoffer, Kate, Kristiane", "12-19": "Iselin, Isak, Isa", "12-20": "Abraham, Amund, Abel",
  "12-21": "Tomas, Tom, Tommy", "12-22": "Ingemar, Ingar", "12-23": "Sigurd, Sjur", "12-24": "Adam, Eva", "12-25": "Ingen navnedag (1. juledag)", "12-26": "Stefan, Steffen, Steven", "12-27": "Narve, Natalie, Nadia", "12-28": "Unni, Une, Unn", "12-29": "Vidar, Vemund, Vårin", "12-30": "David, Diana, Dina", "12-31": "Sylfest, Sylvia, Sylvi"
};

function oppdaterInformasjonsBoks() {
  const iDag = new Date();
  const aar = iDag.getFullYear();
  const maaned = iDag.getMonth();
  const dag = iDag.getDate();
  
  // 1. Sett Navnedag
  const nokkel = `${maaned + 1}-${dag}`;
  const navn = navnedagerNorge[nokkel] || "Ingen registrert navnedag";
  
  const nameDayEl = document.getElementById('nameDay');
  if (nameDayEl) nameDayEl.textContent = navn;

  // 2. Beregn Dag i året (ren dato-matematikk i UTC for å unngå sommertid-feil)
  const iDagUTC = Date.UTC(aar, maaned, dag);
  const startUTC = Date.UTC(aar, 0, 1);
  const enDag = 1000 * 60 * 60 * 24;
  
  const dagIAaret = Math.floor((iDagUTC - startUTC) / enDag) + 1;

  const dayOfYearEl = document.getElementById('dayOfYear');
  if (dayOfYearEl) dayOfYearEl.textContent = dagIAaret;

// 3. Beregn Dager til nyttår
  const erSkuddaar = (aar % 4 === 0 && aar % 100 !== 0) || (aar % 400 === 0);
  const dagerIAaretTotalt = erSkuddaar ? 366 : 365;
  const dagerTilNyttar = dagerIAaretTotalt - dagIAaret; // Ren differanse (365 - 244 = 121)

  const daysToNYEl = document.getElementById('daysToNY');
  if (daysToNYEl) {
    daysToNYEl.textContent = dagerTilNyttar;
  }
} // Husk denne parantesen!

document.addEventListener("DOMContentLoaded", oppdaterInformasjonsBoks);