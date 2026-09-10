/* ==========================================================================
   ORDLISTE FOR LESEOPEGAVER (ordliste.js)
   ========================================================================== */

const ORDLISTE = {
    // 1. Lydrette ord på 2-3 bokstaver
    lydrette_2_3: [
        "is", "ut", "ut", "åa", "se", "gå", "må", "ta", "ha", "ja", "jo", "du", "vi", "re",
        "sol", "mus", "is", "båt", "bil", "sag", "fot", "kua", "hus", "rev", "lue", "ost",
        "sav", "mat", "vei", "tak", "tur", "våt", "sæd", "muss", "bål", "katt", "hund", "sau"
    ],

    // 2. Lydrette ord på 4-5 bokstaver
    lydrette_4_5: [
        "kake", "musa", "båt", "sopp", "rosa", "sone", "reise", "måne", "steg", "pose",
        "nese", "pipe", "sykkel", "traktor", "plass", "krone", "slange", "gris", "flue",
        "stein", "svamp", "prins", "trapp", "krem", "prat", "skog", "fisk", "lamm"
    ],

    // 3. Ord som begynner på bokstav (A-Å)
    begynnerPa: {
        a: ["ape", "and", "appelsin", "anker", "avis"],
        b: ["bil", "båt", "ball", "bjørn", "bok"],
        c: ["camping", "citron", "cupcake"],
        d: ["dør", "drage", "dukke", "delfin"],
        e: ["eple", "elg", "ekorn", "elv"],
        f: ["fisk", "fugl", "flue", "flaske"],
        g: ["gris", "gutt", "gave", "gull"],
        h: ["hund", "hus", "hest", "hatt"],
        i: ["is", "isbjørn", "iglo", "ingen"],
        j: ["jente", "jakke", "jul", "jordbær"],
        k: ["katt", "kake", "knapp", "krone"],
        l: ["lue", "løve", "lampe", "lastebil"],
        m: ["mus", "måne", "mat", "melk"],
        n: ["nese", "natt", "nøkkel", "nål"],
        o: ["ost", "orm", "olje", "oter"],
        p: ["penn", "pære", "papegøye", "pille"],
        q: ["quilt", "quiz"],
        r: ["rev", "ring", "rakett", "rose"],
        s: ["sol", "sopp", "sko", "slange"],
        t: ["tog", "tre", "traktor", "telt"],
        u: ["ugle", "ulv", "ur", "ut"],
        v: ["vott", "vogn", "vei", "vann"],
        w: ["waffel", "wok"],
        x: ["xylofon"],
        y: ["yoghurt", "yoyo"],
        z: ["zebra", "zoo"],
        æ: ["æda", "ærlig", "ære"],
        ø: ["øye", "ørn", "øre", "økse"],
        å: ["åre", "ål", "åpen", "åker"]
    },

    // 4. Ord som slutter på bokstav (A-Å)
    slutterPa: {
        a: ["kua", "musa", "mamma", "øya", "lue"],
        b: ["web", "snobb", "kubb"],
        c: ["pappa", "tur"],
        d: ["and", "bånd", "god", "rød"],
        e: ["kake", "pose", "nese", "flue"],
        f: ["ulv", "saft", "stoff"],
        g: ["tog", "skog", "steg", "seng"],
        h: ["ah", "oh"],
        i: ["vi", "is", "vei", "frie"],
        j: ["hei", "nei", "miljø"],
        k: ["fisk", "sol", "kake", "moro"],
        l: ["bil", "sol", "fugl", "gull"],
        m: ["orm", "is", "lim", "krem"],
        n: ["måne", "vinn", "ring", "stein"],
        o: ["sko", "koko", "radio"],
        p: ["sopp", "knapp", "hopp"],
        q: [],
        r: ["dør", "tur", "bær", "får"],
        s: ["hus", "mus", "gris", "is"],
        t: ["katt", "båt", "hatt", "natt"],
        u: ["du", "sau", "bru"],
        v: ["rev", "løv", "siv"],
        w: [],
        x: ["boks", "mira"],
        y: ["sy", "mye", "moro"],
        z: [],
        æ: ["knæ", "sæd"],
        ø: ["snø", "frø", "kjø"],
        å: ["gå", "må", "få", "på"]
    },

    // 5. De 100 vanligste ordene i det norske språket
    vanligste_100: [
        "i", "på", "og", "det", "som", "til", "er", "en", "av", "for", "at", "var", "med",
        "de", "et", "om", "har", "men", "så", "seg", "ut", "kan", "du", "fra", "han", "hun",
        "ikke", "må", "ved", "opp", "den", "over", "da", "vil", "skal", "bli", "ble", "ut",
        "hav", "sin", "et", "alle", "ha", "mot", "eller", "nå", "andre", "mye", "noe", "her",
        "etter", "eller", "noen", "under", "hva", "der", "min", "også", "både", "selv", "også",
        "igjen", "siden", "hvor", "hvis", "man", "alt", "vel", "flere", "mange", "måte", "bare",
        "sammen", "uten", "helt", "meg", "deg", "oss", "dem", "min", "din", "vår", "sine", "mitt",
        "ditt", "vårt", "dette", "disse", "slik", "hvilken", "hvilke", "ja", "nei", "jo"
    ],

    // 6. Utvidet liste med 500 vanligste ordene
    vanligste_500: [
        "i", "på", "og", "det", "som", "til", "er", "en", "av", "for", "at", "var", "med",
        "de", "et", "om", "har", "men", "så", "seg", "ut", "kan", "du", "fra", "han", "hun",
        "ikke", "må", "ved", "opp", "den", "over", "da", "vil", "skal", "bli", "ble", "sin",
        "alle", "ha", "mot", "eller", "nå", "andre", "mye", "noe", "her", "etter", "noen",
        "under", "hva", "der", "min", "også", "både", "selv", "igjen", "siden", "hvor", "hvis",
        "dag", "tid", "år", "folk", "barn", "verden", "liv", "mann", "kvinne", "hus", "skole",
        "arbeid", "del", "strikk", "først", "god", "stor", "liten", "ny", "gammel", "mange",
        "måte", "få", "se", "komme", "gå", "stå", "ta", "gi", "gjøre", "si", "få", "tro", "vite",
        "spørre", "svare", "tro", "tenke", "finne", "bruke", "visse", "holde", "legge", "måtte",
        "skulle", "kunne", "ville", "burde", "la", "høre", "kjenne", "synes", "mene", "møte"
    ],

    // 7. Ord som har emojier/bilder tilkoblet
    medBilder: [
        {ord: "agurk", symbol: "🥒", emoji: "🥒"}, {ord: "alv", symbol: "🧝", emoji: "🧝"}, {ord: "and", symbol: "🦆", emoji: "🦆"}, {ord: "ape", symbol: "🐒", emoji: "🐒"},
        {ord: "arm", symbol: "💪", emoji: "💪"}, {ord: "bad", symbol: "🛀", emoji: "🛀"}, {ord: "ball", symbol: "⚽", emoji: "⚽"},
        {ord: "banan", symbol: "🍌", emoji: "🍌"}, {ord: "benk", symbol: "🪑", emoji: "🪑"}, {ord: "bie", symbol: "🐝", emoji: "🐝"},
        {ord: "bjelle", symbol: "🔔", emoji: "🔔"}, {ord: "blad", symbol: "🍃", emoji: "🍃"}, {ord: "bløtkake", symbol: "🎂", emoji: "🎂"},
        {ord: "blyant", symbol: "✏️", emoji: "✏️"}, {ord: "bok", symbol: "📖", emoji: "📖"}, {ord: "bolle", symbol: "🥣", emoji: "🥣"}, {ord: "bonde", symbol: "👨‍🌾", emoji: "👨‍🌾"},
        {ord: "brev", symbol: "✉️", emoji: "✉️"}, {ord: "brille", symbol: "👓", emoji: "👓"}, {ord: "bro", symbol: "🌉", emoji: "🌉"}, {ord: "brokkoli", symbol: "🥦", emoji: "🥦"},
        {ord: "brus", symbol: "🥤", emoji: "🥤"}, {ord: "brød", symbol: "🍞", emoji: "🍞"}, {ord: "bue", symbol: "🏹", emoji: "🏹"}, {ord: "bukse", symbol: "👖", emoji: "👖"},
        {ord: "by", symbol: "🏙️", emoji: "🏙️"}, {ord: "bål", symbol: "🔥", emoji: "🔥"}, {ord: "båt", symbol: "🚤", emoji: "🚤"}, {ord: "bær", symbol: "🍓", emoji: "🍓"}, {ord: "bøtte", symbol: "🪣", emoji: "🪣"},
        {ord: "datamaskin", symbol: "💻", emoji: "💻"}, {ord: "do", symbol: "🚽", emoji: "🚽"}, {ord: "dolk", symbol: "🗡️", emoji: "🗡️"},
        {ord: "dopapir", symbol: "🧻", emoji: "🧻"}, {ord: "drage", symbol: "🐉", emoji: "🐉"}, {ord: "dråpe", symbol: "💧", emoji: "💧"}, {ord: "due", symbol: "🕊️", emoji: "🕊️"}, {ord: "dusj", symbol: "🚿", emoji: "🚿"},
        {ord: "egg", symbol: "🥚", emoji: "🥚"}, {ord: "ekorn", symbol: "🐿️", emoji: "🐿️"}, {ord: "elg", symbol: "🫎", emoji: "🫎"},
        {ord: "engel", symbol: "😇", emoji: "😇"}, {ord: "fisk", symbol: "🐟", emoji: "🐟"}, {ord: "fiske", symbol: "🎣", emoji: "🎣"},
        {ord: "flagg", symbol: "🚩", emoji: "🚩"}, {ord: "flaske", symbol: "🍼", emoji: "🍼"}, {ord: "fly", symbol: "✈️", emoji: "✈️"}, {ord: "fot", symbol: "🦶", emoji: "🦶"}, {ord: "frosk", symbol: "🐸", emoji: "🐸"},
        {ord: "fugl", symbol: "🐦", emoji: "🐦"}, {ord: "garn", symbol: "🧶", emoji: "🧶"}, {ord: "gave", symbol: "🎁", emoji: "🎁"},
        {ord: "giraff", symbol: "🦒", emoji: "🦒"}, {ord: "gitar", symbol: "🎸", emoji: "🎸"}, {ord: "glass", symbol: "🥛", emoji: "🥛"}, {ord: "gris", symbol: "🐷", emoji: "🐷"}, {ord: "gulrot", symbol: "🥕", emoji: "🥕"},
        {ord: "gå", symbol: "🚶", emoji: "🚶"}, {ord: "hai", symbol: "🦈", emoji: "🦈"}, {ord: "hals", symbol: "🧣", emoji: "🧣"}, {ord: "hammer", symbol: "🔨", emoji: "🔨"}, {ord: "hanske", symbol: "🧤", emoji: "🧤"},
        {ord: "heks", symbol: "🧙‍♀️", emoji: "🧙‍♀️"}, {ord: "hjerte", symbol: "❤️", emoji: "❤️"}, {ord: "hull", symbol: "🕳️", emoji: "🕳️"}, {ord: "hund", symbol: "🐕", emoji: "🐕"}, {ord: "hus", symbol: "🏠", emoji: "🏠"}, {ord: "høne", symbol: "🐔", emoji: "🐔"}, {ord: "hane", symbol: "🐓", emoji: "🐓"},
        {ord: "hånd", symbol: "✋", emoji: "✋"}, {ord: "ild", symbol: "🔥", emoji: "🔥"}, {ord: "is", symbol: "🍦", emoji: "🍦"}, {ord: "isbit", symbol: "🧊", emoji: "🧊"},
        {ord: "jakke", symbol: "🧥", emoji: "🧥"}, {ord: "jus", symbol: "🧃", emoji: "🧃"}, {ord: "kakestykke", symbol: "🍰", emoji: "🍰"},
        {ord: "katt", symbol: "🐈", emoji: "🐈"}, {ord: "kjeks", symbol: "🍪", emoji: "🍪"}, {ord: "kjelke", symbol: "🛷", emoji: "🛷"}, {ord: "kino", symbol: "🎬", emoji: "🎬"},
        {ord: "kiste", symbol: "⚰️", emoji: "⚰️"}, {ord: "kjole", symbol: "👗", emoji: "👗"}, {ord: "kjøtt", symbol: "🥩", emoji: "🥩"}, {ord: "klokke", symbol: "⏰", emoji: "⏰"}, {ord: "klovn", symbol: "🤡", emoji: "🤡"},
        {ord: "kne", symbol: "🦵", emoji: "🦵"}, {ord: "kniv", symbol: "🔪", emoji: "🔪"}, {ord: "konge", symbol: "🤴", emoji: "🤴"}, {ord: "kopp", symbol: "☕", emoji: "☕"}, {ord: "korn", symbol: "🌾", emoji: "🌾"},
        {ord: "kran", symbol: "🏗️", emoji: "🏗️"}, {ord: "krone", symbol: "👑", emoji: "👑"}, {ord: "kubbe", symbol: "🪵", emoji: "🪵"}, {ord: "kurv", symbol: "🧺", emoji: "🧺"}, {ord: "lampe", symbol: "💡", emoji: "💡"}, {ord: "lastebil", symbol: "🚛", emoji: "🚛"},
        {ord: "lue", symbol: "🧢", emoji: "🧢"}, {ord: "lus", symbol: "🪳", emoji: "🪳"}, {ord: "lys", symbol: "🕯️", emoji: "🕯️"}, {ord: "løpe", symbol: "🏃", emoji: "🏃"}, {ord: "løv", symbol: "🍃", emoji: "🍃"}, {ord: "løve", symbol: "🦁", emoji: "🦁"}, {ord: "maske", symbol: "🎭", emoji: "🎭"},
        {ord: "maur", symbol: "🐜", emoji: "🐜"}, {ord: "melk", symbol: "🥛", emoji: "🥛"}, {ord: "munn", symbol: "👄", emoji: "👄"}, {ord: "mur", symbol: "🧱", emoji: "🧱"},
        {ord: "musikk", symbol: "🎵", emoji: "🎵"}, {ord: "natt", symbol: "🌃", emoji: "🌃"}, {ord: "nese", symbol: "👃", emoji: "👃"}, {ord: "nål", symbol: "🪡", emoji: "🪡"},
        {ord: "nøtt", symbol: "🥜", emoji: "🥜"}, {ord: "orm", symbol: "🐍", emoji: "🐍"}, {ord: "ost", symbol: "🧀", emoji: "🧀"}, {ord: "øy", symbol: "🏝️", emoji: "🏝️"},
        {ord: "øye", symbol: "👁️", emoji: "👁️"}, {ord: "padde", symbol: "🐸", emoji: "🐸"}, {ord: "paraply", symbol: "☂️", emoji: "☂️"}, {ord: "penger", symbol: "💰", emoji: "💰"}, {ord: "pensel", symbol: "🖌️", emoji: "🖌️"}, {ord: "pil", symbol: "🏹", emoji: "🏹"}, {ord: "pizza", symbol: "🍕", emoji: "🍕"},
        {ord: "plante", symbol: "🌱", emoji: "🌱"}, {ord: "plaster", symbol: "🩹", emoji: "🩹"}, {ord: "pokal", symbol: "🏆", emoji: "🏆"}, {ord: "pølse", symbol: "🌭", emoji: "🌭"},
        {ord: "pære", symbol: "🍐", emoji: "🍐"}, {ord: "racerbil", symbol: "🏎️", emoji: "🏎️"}, {ord: "regn", symbol: "🌧️", emoji: "🌧️"}, {ord: "regnbue", symbol: "🌈", emoji: "🌈"},
        {ord: "reke", symbol: "🦐", emoji: "🦐"}, {ord: "ri", symbol: "🏇", emoji: "🏇"}, {ord: "ring", symbol: "💍", emoji: "💍"}, {ord: "ris", symbol: "🍚", emoji: "🍚"}, {ord: "robot", symbol: "🤖", emoji: "🤖"},
        {ord: "robåt", symbol: "🛶", emoji: "🛶"}, {ord: "rose", symbol: "🌹", emoji: "🌹"}, {ord: "sebra", symbol: "🦓", emoji: "🦓"}, {ord: "sekk", symbol: "🎒", emoji: "🎒"}, {ord: "sirkus", symbol: "🎪", emoji: "🎪"},
        {ord: "ski", symbol: "🎿", emoji: "🎿"}, {ord: "skje", symbol: "🥄", emoji: "🥄"}, {ord: "skjell", symbol: "🐚", emoji: "🐚"}, {ord: "skjerf", symbol: "🧣", emoji: "🧣"}, {ord: "skip", symbol: "🛳️", emoji: "🛳️"},
        {ord: "skjorte", symbol: "👕", emoji: "👕"}, {ord: "sko", symbol: "👟", emoji: "👟"}, {ord: "skole", symbol: "🏫", emoji: "🏫"}, {ord: "sky", symbol: "☁️", emoji: "☁️"},
        {ord: "slott", symbol: "🏰", emoji: "🏰"}, {ord: "sludd", symbol: "🌨️", emoji: "🌨️"}, {ord: "snelle", symbol: "🧵", emoji: "🧵"}, {ord: "snø", symbol: "❄️", emoji: "❄️"},
        {ord: "sokker", symbol: "🧦", emoji: "🧦"}, {ord: "sol", symbol: "☀️", emoji: "☀️"}, {ord: "sopp", symbol: "🍄", emoji: "🍄"}, {ord: "stav", symbol: "🦯", emoji: "🦯"},
        {ord: "stjerne", symbol: "⭐", emoji: "⭐"}, {ord: "stol", symbol: "🪑", emoji: "🪑"}, {ord: "strand", symbol: "🏖️", emoji: "🏖️"}, {ord: "sverd", symbol: "⚔️", emoji: "⚔️"}, {ord: "svømme", symbol: "🏊", emoji: "🏊"},
        {ord: "telt", symbol: "⛺", emoji: "⛺"}, {ord: "terning", symbol: "🎲", emoji: "🎲"}, {ord: "tomat", symbol: "🍅", emoji: "🍅"}, {ord: "traktor", symbol: "🚜", emoji: "🚜"}, {ord: "tralle", symbol: "🛒", emoji: "🛒"},
        {ord: "tre", symbol: "🌳", emoji: "🌳"}, {ord: "tromme", symbol: "🥁", emoji: "🥁"}, {ord: "tv", symbol: "📺", emoji: "📺"}, {ord: "tå", symbol: "🦶", emoji: "🦶"}, {ord: "tønne", symbol: "🛢️", emoji: "🛢️"},
        {ord: "vann", symbol: "💧", emoji: "💧"}, {ord: "vekt", symbol: "⚖️", emoji: "⚖️"}, {ord: "vest", symbol: "🦺", emoji: "🦺"}, {ord: "vogn", symbol: "🛒", emoji: "🛒"},
        {ord: "øks", symbol: "🪓", emoji: "🪓"}, {ord: "øre", symbol: "👂", emoji: "👂"}
    ]
};

/**
 * Hjelpefunksjon for å hente ord basert på valgte kriterier
 * @param {string} kategori - F.eks. 'lydrette_2_3', 'vanligste_100', 'medBilder', osv.
 * @param {string} filterParam - Ekstra parameter (f.eks. bokstav 'a' for begynnerPa)
 * @returns {Array} - En liste med ord
 */
function hentOrdFraListe(kategori, filterParam = null) {
    if (kategori === "begynnerPa" && filterParam) {
        return ORDLISTE.begynnerPa[filterParam.toLowerCase()] || [];
    }
    if (kategori === "slutterPa" && filterParam) {
        return ORDLISTE.slutterPa[filterParam.toLowerCase()] || [];
    }
    if (ORDLISTE[kategori]) {
        return ORDLISTE[kategori];
    }
    return ORDLISTE.lydrette_2_3; // Fallback
}