/* --- DYNAMISKE LENKER --- */
// Standardlenker dersom brukeren ikke har lagret noe enda
const defaultLinks = [
  { name: "Google", url: "https://www.google.no/index.html", external: true },
  { name: "Wikipedia", url: "https://www.wikipedia.org", external: false },
  { name: "Korartí", url: "https://www.korarti.no/", external: false },
  { name: "Salaby", url: "https://www.salaby.no/", external: false },
  { name: "Skoleregler", url: "https://sites.google.com/ikrs.no/regler", external: true }
];

// Laster eksisterende lenker fra localStorage, ellers krasjer vi tilbake til standard
let customLinks = loadState('customLinksData', defaultLinks);

function renderLinks() {
  const container = document.getElementById('linksContainer');
  if (!container) return;
  container.innerHTML = "";
  
  customLinks.forEach(link => {
    const a = document.createElement('a');
    a.href = "#"; // Hindrer at siden hopper
    
    a.onclick = (e) => {
      e.preventDefault();
      
      if (link.external) {
        // 1. Åpner den eksterne lenken i en ny fane
        window.open(link.url, '_blank');
        
        // 2. Tilbakestiller rammen i dashboardet til Hjem
        setAndSaveIframeUrl('hjem.html');
      } else {
        // Åpner lenken direkte inne i dashboardets ramme
        setAndSaveIframeUrl(link.url);

        // VISER OG OPPDATERER "VISES IKKE SIDEN?"-FELTET
        const notice = document.getElementById('iframeFallbackNotice');
        const fallbackLink = document.getElementById('fallbackExternalLink');
        
        if (notice && fallbackLink) {
          fallbackLink.href = link.url; // Setter "Klikk her"-lenken til samme URL
          notice.style.display = 'grid'; // Viser det blå feltet
        }
      }
    };

    a.innerText = link.name + (link.external ? " ↗" : "");
    container.appendChild(a);
  });
}



/* --- HJELPEFUNKSJONER FOR LOCALSTORAGE --- */
function saveState(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Kunne ikke lagre til localStorage (kjører sannsynligvis fra file://):", e);
  }
}

// Kun ÉN trygg loadState med try/catch
function loadState(key, fallback = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn("Kunne ikke lese fra localStorage (kjører sannsynligvis fra file://):", e);
    return fallback;
  }
}

/* --- LENKEREDIGERING --- */
function buildLinkEditor() {
  const table = document.getElementById('linkEditTable');
  if (!table) return;
  
  table.innerHTML = `
    <tr style="font-weight:bold; background:#f0f4f8;">
      <td style="padding:6px;">Knappnavn</td>
      <td style="padding:6px;">URL (Nettadresse)</td>
      <td style="padding:6px; text-align:center;">Ny fane?</td>
    </tr>
  `;
  
  customLinks.forEach((link, idx) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td style="width: 30%;"><input type="text" id="linkName_${idx}" value="${link.name}"></td>
      <td style="width: 55%;"><input type="url" id="linkUrl_${idx}" value="${link.url}"></td>
      <td style="width: 15%; text-align:center;">
        <input type="checkbox" id="linkExt_${idx}" ${link.external ? 'checked' : ''} style="width: auto; transform: scale(1.3); cursor: pointer;">
      </td>
    `;
    table.appendChild(row);
  });

  let infoBox = document.getElementById('linkEditInfoText');
  if (!infoBox) {
    infoBox = document.createElement('div');
    infoBox.id = 'linkEditInfoText';
    infoBox.style.cssText = 'margin-top: 12px; margin-bottom: 8px; padding: 8px 12px; background-color: #fef3c7; color: #92400e; border-left: 4px solid #f59e0b; font-size: 0.85rem; border-radius: 4px;';
    infoBox.innerHTML = '⚠️ <strong>Merk:</strong> Enkelte nettsider tillater ikke å bli åpnet direkte inne i dashboardet. Dersom en side forblir blank, huke av for <strong>«Ny fane?»</strong>.';
    table.parentNode.insertBefore(infoBox, table.nextSibling);
  }
}

function saveLinks() {
  customLinks.forEach((link, idx) => {
    const nameInput = document.getElementById(`linkName_${idx}`);
    const urlInput = document.getElementById(`linkUrl_${idx}`);
    const extInput = document.getElementById(`linkExt_${idx}`);
    if (nameInput && urlInput && extInput) {
      link.name = nameInput.value || "Uten navn";
      link.url = urlInput.value || "#";
      link.external = extInput.checked;
    }
  });
  
  saveState('customLinksData', customLinks);
  renderLinks();
  closeModal('linkModal');
}

/* --- ÅPNE MODAL-LOGIKK --- */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  const backdrop = document.getElementById('customModalBackdrop');

  if (backdrop) {
    backdrop.classList.remove('transparent-backdrop');
    backdrop.style.display = 'block';
  }

  if (modal) {
    modal.style.display = 'flex';
  }

  // Tvinger bygging av tabellen HVER GANG Dagsplan-modalen åpnes
  if (modalId === 'planModal') {
    editingDay = getCurrentDayName();
    buildPlanEditor();
  }
}

// Hvis HTML-knappen din kaller openToolModal():
function openToolModal(modalId) {
  openModal(modalId);
}


/* --- SJEKK PIN OG TØM DATA --- */
function utfoerFullNullstilling() {
  const pinInput = document.getElementById('resetPinInput');
  const errorMsg = document.getElementById('resetPinError');
  const RIKTIG_KODE = "4635";

  if (pinInput.value === RIKTIG_KODE) {
    // Koden er riktig - tøm alt!
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
  } else {
    // Feil kode - vis rød advarsel
    errorMsg.style.display = 'block';
    pinInput.style.borderColor = '#ef4444';
    pinInput.value = '';
    pinInput.focus();
  }
}

/* --- OVERSTYR ÅPNING FOR Å TØMME GAMLE TASTETRYKK --- */
const originalOpenModal = window.openModal;
window.openModal = function(modalId) {
  if (modalId === 'resetConfirmModal') {
    const pinInput = document.getElementById('resetPinInput');
    const errorMsg = document.getElementById('resetPinError');
    if (pinInput) pinInput.value = '';
    if (pinInput) pinInput.style.borderColor = '#cbd5e1';
    if (errorMsg) errorMsg.style.display = 'none';
  }
  
  // Kjører din vanlige openModal-funksjon
  const modal = document.getElementById(modalId);
  const backdrop = document.getElementById('customModalBackdrop');
  if (modal) modal.style.display = 'block';
  if (backdrop) backdrop.style.display = 'block';
};


// --- TOGGLE NATTMODUS ---
function toggleDisplayMode(modeClass) {
  // Legger til eller fjerner 'dark-mode'-klassen på <body>
  document.body.classList.toggle(modeClass);
  
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

  // Sender beskjed til iframe dersom den inneholder en lokal side
  const iframe = document.getElementById('mainFrame');
  if (iframe && iframe.contentWindow) {
    try {
      iframe.contentWindow.postMessage({ 
        type: 'SET_THEME', 
        theme: isDarkMode ? 'dark' : 'light' 
      }, '*');
    } catch (e) {
      // Ignorerer sikkerhetsbegrensninger dersom det er en ekstern nettside
    }
  }
}

// --- TOGGLE SKJUL MENY ---
function toggleHideMenu() {
  const sidebar = document.querySelector('.sidebar');
  const showBtn = document.getElementById('showMenuBtn');
  
  if (!sidebar) return;

  sidebar.classList.toggle('hidden');

  if (sidebar.classList.contains('hidden')) {
    if (showBtn) showBtn.style.display = 'block';
  } else {
    if (showBtn) showBtn.style.display = 'none';
  }
}

// --- TOGGLE SKJUL DAGSPLAN ---
function toggleHideSchedule() {
  const rightSidebar = document.querySelector('.sidebar-right');
  const showScheduleBtn = document.getElementById('showScheduleBtn');
  
  if (!rightSidebar) return;

  rightSidebar.classList.toggle('hidden');

  if (rightSidebar.classList.contains('hidden')) {
    if (showScheduleBtn) showScheduleBtn.style.display = 'block';
  } else {
    if (showScheduleBtn) showScheduleBtn.style.display = 'none';
  }
}

/* --- LASTE NED OG VISE UKEPLANER --- */
let ukeplanerData = {};

async function lastUkeplaner() {
  try {
    const res = await fetch('https://77tor.github.io/haanes-ukeplaner/ukeplaner.json?t=' + new Date().getTime());
    if (!res.ok) throw new Error("Fant ikke ukeplaner.json på GitHub");
    
    ukeplanerData = await res.json();
    console.log("Ukeplaner lastet ned:", ukeplanerData);
  } catch (err) {
    console.error("Feil ved henting av ukeplaner:", err);
    alert("Kunne ikke hente ferske ukeplaner fra nettet. Sjekk internettforbindelsen.");
  }
}

function visTrinn(trinn) {
  const data = ukeplanerData[trinn];

  if (data && data.pdf_url) {
    // Lagrer trinnet i localStorage dersom du vil bruke det senere
    localStorage.setItem('sistValgteTrinn', trinn);

    // Åpner PDF-en i hovedvisningen og lagrer lenken i localStorage
    setAndSaveIframeUrl(data.pdf_url);
    
    // Lukker ukeplan-modalen
    closeModal('ukeplanModal'); 
  } else {
    alert(`Ingen ukeplan funnet for ${trinn}. trinn denne uken.`);
  }
}


/* --- DAGSPLAN LOGIKK M/ LOCALSTORAGE --- */
const availableImages = [
  "Arbeidstime", "Bibliotek", "Engelsk", "Forestilling", "Friminutt", 
  "Gym", "Klassens time", "Krle", "Kunst", "Lek", 
  "Matematikk", "Musikk", "Naturfag", "Norsk", "Samfunnsfag", 
  "Samling", "Spising", "Stasjoner", "Stillelesing", "Svømming", "Uteskole"
];

// Standard timeoppsett som gjelder for alle dager i utgangspunktet
const defaultDayStructure = [
  { id: "t1", label: "1. time", start: "08:30", end: "09:15", time: "08.30 - 09.15", img: "" },
  { id: "t2", label: "Friminutt", start: "09:15", end: "09:30", time: "09.15 - 09.30", img: "Friminutt.png" },
  { id: "t3", label: "2. time", start: "09:30", end: "10:00", time: "09.30 - 10.00", img: "" },
  { id: "t4", label: "3. time", start: "10:00", end: "10:45", time: "10.00 - 10.45", img: "" },
  { id: "t5", label: "Spising", start: "10:45", end: "11:15", time: "10.45 - 11.15", img: "Spising.png" },
  { id: "t6", label: "Friminutt", start: "11:15", end: "11:45", time: "11.15 - 11.45", img: "Friminutt.png" },
  { id: "t7", label: "4. time", start: "11:45", end: "12:15", time: "11.45 - 12.15", img: "" },
  { id: "t8", label: "5. time", start: "12:15", end: "13:15", time: "12.15 - 13.15", img: "" }
];

// Generer en hel uke (mandag–fredag) basert på malen
function createDefaultWeek() {
  const week = {
    mandag: JSON.parse(JSON.stringify(defaultDayStructure)),
    tirsdag: JSON.parse(JSON.stringify(defaultDayStructure)),
    onsdag: JSON.parse(JSON.stringify(defaultDayStructure)),
    torsdag: JSON.parse(JSON.stringify(defaultDayStructure)),
    fredag: JSON.parse(JSON.stringify(defaultDayStructure))
  };
  // Mandager slutter 5. time kl 13:30 som standard
  week.mandag[7].end = "13:30";
  week.mandag[7].time = "12.15 - 13.30";
  return week;
}

// Hjelpefunksjon for å finne dagens ukedag (lørdag/søndag blir mandag)
function getCurrentDayName() {
  const dayIndex = new Date().getDay();
  const dayMap = { 1: 'mandag', 2: 'tirsdag', 3: 'onsdag', 4: 'torsdag', 5: 'fredag' };
  return dayMap[dayIndex] || 'mandag';
}

// Hent lagret ukesplan fra localStorage hvis den finnes, ellers lag ny (trygg mot file:// feil)
let weekSchedule = loadState('dagsplanUkesplan', null) || createDefaultWeek();

// Hvilken dag som vises på skjermen akkurat nå
let activeDay = getCurrentDayName();
// Hvilken dag som redigeres i modalen akkurat nå
let editingDay = getCurrentDayName();

function updateDates() {
  const now = new Date();
  
  // 1. Sett aktiv dag automatisk ut fra kalenderen (mandag-fredag)
  const currentDay = getCurrentDayName();
  if (activeDay !== currentDay) {
    activeDay = currentDay;
    renderSchedule();
  }

  // 2. Oppdater dato-tekstene i toppen
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const dateEl = document.getElementById('currentDate');
  const yearEl = document.getElementById('currentYear');
  if (dateEl) dateEl.innerText = now.toLocaleDateString('no-NO', options);
  if (yearEl) yearEl.innerText = now.getFullYear();
}

function isTimeActive(startStr, endStr) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);
  return currentMinutes >= (startH * 60 + startM) && currentMinutes < (endH * 60 + endM);
}

function renderSchedule() {
  const container = document.getElementById('scheduleDisplay') || document.getElementById('bigScheduleContainer');
  if (!container) return;
  container.innerHTML = "";

  const timeSlots = weekSchedule[activeDay] || [];

  timeSlots.forEach(slot => {
    const isToday = getCurrentDayName() === activeDay;
    const isActive = isToday && isTimeActive(slot.start, slot.end);
    const isPause = slot.label === "Friminutt" || slot.label === "Spising";
    
    const item = document.createElement('div');
    item.className = `schedule-card ${isPause ? 'pause-card' : ''} ${isActive ? 'active-now' : ''}`;

    let imageHTML = `<span class="schedule-empty">Ikke valgt</span>`;
    let subjectName = "";

    if (slot.img) {
      imageHTML = `<img src="Bilder/${slot.img}" class="schedule-img" alt="${slot.label}">`;
      subjectName = slot.img.replace('.png', '');
    }

    // BILDE FLEKSER ØVERST, TEKST HAVNER NEDE
    item.innerHTML = `
      <div class="schedule-img-container">
        ${imageHTML}
      </div>
      <div class="schedule-time">
        <div class="schedule-label">${slot.label}</div>
        <div class="schedule-clock">${slot.time}</div>
        ${subjectName ? `<div class="schedule-subject">${subjectName}</div>` : ''}
        ${isActive ? `<span class="active-badge">NÅ</span>` : ''}
      </div>
    `;
    container.appendChild(item);
  });
}

function buildPlanEditor() {
  const table = document.getElementById('planEditTable');
  if (!table) return;

  const days = [
    { key: 'mandag', name: 'Man' },
    { key: 'tirsdag', name: 'Tir' },
    { key: 'onsdag', name: 'Ons' },
    { key: 'torsdag', name: 'Tor' },
    { key: 'fredag', name: 'Fre' }
  ];

  // 1. Legg dagsknappene foran tabellen (hvis de ikke finnes fra før)
  let dayNav = document.getElementById('planDayNav');
  if (!dayNav) {
    dayNav = document.createElement('div');
    dayNav.id = 'planDayNav';
    dayNav.style.cssText = "display: flex; gap: 6px; margin-bottom: 12px;";
    table.parentNode.insertBefore(dayNav, table);
  }

  // 2. Tegn dagsknappene
  let dayNavHTML = '';
  days.forEach(d => {
    const isSel = d.key === editingDay;
    dayNavHTML += `
      <button type="button" onclick="switchEditDay('${d.key}')" 
              style="flex:1; padding:8px 4px; font-weight:bold; cursor:pointer; font-size:12px;
                     border:1px solid #cbd5e1; border-radius:6px; 
                     background:${isSel ? '#9c27b0' : '#f1f5f9'}; 
                     color:${isSel ? '#fff' : '#334155'};">
        ${d.name}
      </button>`;
  });
  dayNav.innerHTML = dayNavHTML;

  // 3. Bygg tabellens innhold (kun <thead> og <tbody> i tabellen)
  let tableHTML = `
    <thead>
      <tr style="font-weight:bold; background:#f0f4f8;">
        <th style="padding:8px; text-align:left; border-bottom:1px solid #cbd5e1;">Økt</th>
        <th style="padding:8px; text-align:left; border-bottom:1px solid #cbd5e1;">Start / Slutt</th>
        <th style="padding:8px; text-align:left; border-bottom:1px solid #cbd5e1;">Bilde / Fag</th>
      </tr>
    </thead>
    <tbody>
  `;

  const currentSlots = weekSchedule[editingDay] || [];
  currentSlots.forEach(slot => {
    let optionsHTML = `<option value="">-- Velg bilde --</option>`;
    availableImages.forEach(imgName => {
      const filename = imgName + ".png";
      const selected = slot.img === filename ? "selected" : "";
      optionsHTML += `<option value="${filename}" ${selected}>${imgName}</option>`;
    });

    tableHTML += `
      <tr>
        <td style="padding:6px; border-bottom:1px solid #f1f5f9;"><b>${slot.label}</b></td>
        <td style="padding:6px; border-bottom:1px solid #f1f5f9; white-space:nowrap;">
          <input type="time" id="start_${slot.id}" value="${slot.start}" style="padding:3px; font-size:12px; border:1px solid #cbd5e1; border-radius:4px;"> - 
          <input type="time" id="end_${slot.id}" value="${slot.end}" style="padding:3px; font-size:12px; border:1px solid #cbd5e1; border-radius:4px;">
        </td>
        <td style="padding:6px; border-bottom:1px solid #f1f5f9;">
          <select id="select_${slot.id}" style="width:100%; padding:4px; border:1px solid #cbd5e1; border-radius:4px;">
            ${optionsHTML}
          </select>
        </td>
      </tr>
    `;
  });

  tableHTML += `</tbody>`;

  table.innerHTML = tableHTML;
}

// Bytter dag inne i modalen
function switchEditDay(dayKey) {
  saveCurrentEditState();
  editingDay = dayKey;
  buildPlanEditor();
}

// Lagrer endringene for dagen du står på midlertidig
function saveCurrentEditState() {
  const currentSlots = weekSchedule[editingDay];
  if (!currentSlots) return;

  currentSlots.forEach(slot => {
    const startInput = document.getElementById(`start_${slot.id}`);
    const endInput = document.getElementById(`end_${slot.id}`);
    const select = document.getElementById(`select_${slot.id}`);

    if (startInput && endInput) {
      slot.start = startInput.value;
      slot.end = endInput.value;
      slot.time = `${slot.start.replace(':', '.')} - ${slot.end.replace(':', '.')}`;
    }
    if (select) {
      slot.img = select.value;
    }
  });
}


// Lagrer hele uken til localStorage
function saveSchedule() {
  // 1. VIKTIG: Hent ut de nyeste verdiene fra tabellen før vi lagrer
  saveCurrentEditState();

  // 2. Lagrer til ukesplan-objektet i localStorage
  saveState('dagsplanUkesplan', weekSchedule);
  
  // 3. Oppdaterer visningen på dashbordet
  renderSchedule();
  
  // 4. Lukker modalen
  closeModal('planModal');
}

// Tømmer og tilbakestiller hele uken
function clearSchedule() {
  if (confirm("Vil du tømme ukesplanen og tilbakestille alle tider og fag for hele uken?")) {
    localStorage.removeItem('dagsplanUkesplan');
    weekSchedule = createDefaultWeek();
    renderSchedule();
    buildPlanEditor();
  }
}

// Hjelpefunksjon hvis du vil bytte aktiv dag fra hovedskjermen
function changeActiveDay(dayName) {
  activeDay = dayName;
  renderSchedule();
}

/* --- ÅPNE MODAL FUNKSJON --- */
function openToolModal(modalId) {
  const backdrop = document.getElementById('customModalBackdrop');
  const modal = document.getElementById(modalId);

  if (backdrop) {
    backdrop.classList.remove('transparent-backdrop');
    backdrop.style.display = 'block';
  }
  if (modal) {
    modal.style.display = 'flex';
  }
  if (modalId === 'planModal') {
    buildPlanEditor();
  }
}

function toggleModalBackdrop() {
  const backdrop = document.getElementById('customModalBackdrop');
  if (backdrop) {
    backdrop.classList.toggle('transparent-backdrop');
  }
}


/* --- HJELPEFUNKSJON: Beregn påskedag for et gitt år --- */
function getEasterSunday(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, L = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * L) / 451);
  const month = Math.floor((h + L - 7 * m + 114) / 31) - 1; // 0-indeksert (3 = April)
  const day = ((h + L - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

/* --- DYNAMISK MÅNEDSKALENDER MED RØDE DAGER OG HELG --- */
function renderMiniCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  // 1. Sett tittel
  const titleElem = document.getElementById('calendarMonthTitle');
  if (titleElem) {
    const monthName = now.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' });
    titleElem.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  }

  const gridElem = document.getElementById('calendarDaysGrid');
  if (!gridElem) return;
  gridElem.innerHTML = '';

  // 2. Finn faste og bevegelige røde dager
  const redDays = new Set();
  const addRed = (m, d) => redDays.add(`${m}-${d}`);

  // Faste røde dager
  addRed(0, 1);   // 1. nyttårsdag
  addRed(4, 1);   // 1. mai
  addRed(4, 17);  // 17. mai
  addRed(11, 25); // 1. juledag
  addRed(11, 26); // 2. juledag

  // Bevegelige røde dager basert på påske
  const easter = getEasterSunday(year);
  const addOffsetDays = (offset) => {
    const d = new Date(easter);
    d.setDate(d.getDate() + offset);
    addRed(d.getMonth(), d.getDate());
  };

  addOffsetDays(-3); // Skjærtorsdag
  addOffsetDays(-2); // Langfredag
  addOffsetDays(0);  // 1. påskedag
  addOffsetDays(1);  // 2. påskedag
  addOffsetDays(39); // Kristi Himmelfartsdag
  addOffsetDays(49); // 1. pinsedag
  addOffsetDays(50); // 2. pinsedag

  // 3. Finn startdag og dager i måneden
  const firstDayOfMonth = new Date(year, month, 1);
  let startDay = firstDayOfMonth.getDay() - 1; 
  if (startDay === -1) startDay = 6; // Søndag blir indeks 6

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 4. Tomme ruter før 1. i måneden
  for (let i = 0; i < startDay; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.style.padding = '4px 0';
    gridElem.appendChild(emptyCell);
  }

  // 5. Generer alle dagene i måneden
  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    const dayOfWeek = dateObj.getDay(); // 0 = Søndag, 6 = Lørdag
    const isRedDay = redDays.has(`${month}-${day}`) || dayOfWeek === 0;
    const isSaturday = dayOfWeek === 6;

    const dayCell = document.createElement('div');
    dayCell.textContent = day;
    dayCell.style.padding = '4px 0';
    dayCell.style.display = 'flex';
    dayCell.style.alignItems = 'center';
    dayCell.style.justifyContent = 'center';
    dayCell.style.borderRadius = '50%';
    dayCell.style.aspectRatio = '1/1';
    dayCell.style.margin = '0 auto';
    dayCell.style.width = '28px';
    dayCell.style.height = '28px';

    // Fargelegging av helger og røde dager
    if (isRedDay) {
      dayCell.style.color = '#ef4444'; // Rød farge
      dayCell.style.fontWeight = 'bold';
      dayCell.style.backgroundColor = '#fef2f2'; // Svak rød bakgrunn
    } else if (isSaturday) {
      dayCell.style.color = '#64748b'; // Dus gråblå farge for lørdag
      dayCell.style.backgroundColor = '#f8fafc'; // Svak grå bakgrunn
    }

    // Highlight for i dag (overstyrer bakgrunn/tekstfarge)
    if (day === today) {
      dayCell.style.background = '#3b82f6';
      dayCell.style.color = '#ffffff';
      dayCell.style.fontWeight = '800';
      dayCell.style.boxShadow = '0 0 0 3px #93c5fd';
    }

    gridElem.appendChild(dayCell);
  }
}


/* --- OPPDATERING OG ÅPNING AV INFO-MODAL MED ÅRSHJUL OG KALENDER --- */
const infoCard = document.getElementById('infoCard');

if (infoCard) {
  infoCard.addEventListener('click', () => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0 = Jan, 1 = Feb, ..., 11 = Des

    // 1. Generer norsk dag, dato og år øverst
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    let formattedDate = now.toLocaleDateString('nb-NO', options);
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    const modalDateElem = document.getElementById('modalFullDate');
    if (modalDateElem) {
      modalDateElem.textContent = `📅 ${formattedDate}`;
    }

    // 2. Kopier data fra sidebaren
    const setElemText = (targetId, sourceId) => {
      const target = document.getElementById(targetId);
      if (target) {
        target.textContent = document.getElementById(sourceId)?.textContent || '-';
      }
    };

    setElemText('modalDayOfYear', 'dayOfYear');
    setElemText('modalDaysToNY', 'daysToNY');
    setElemText('modalNameDay', 'nameDay');
    setElemText('modalWeather', 'weather');

    // 3. Roter klokkeviseren til riktig månedssektor på aarstider.png
    const hand = document.getElementById('wheelHand');
    if (hand) {
      const monthAngles = {
        2: 15,    // Mars (øverst til høyre)
        3: 45,    // April
        4: 75,    // Mai
        5: 105,   // Juni
        6: 135,   // Juli
        7: 165,   // August
        8: 195,   // September (nederst til venstre)
        9: 225,   // Oktober
        10: 255,  // November
        11: 285,  // Desember
        0: 315,   // Januar
        1: 345    // Februar (øverst til venstre)
      };
      
      const angle = monthAngles[currentMonth];
      hand.style.transform = `rotate(${angle}deg)`;
    }

    // 4. Oppdater statustekst hvis elementet eksisterer
    const statusText = document.getElementById('seasonStatusText');
    if (statusText) {
      const monthNames = [
        "❄️ Januar (Vinter)", "❄️ Februar (Vinter)", "🌱 Mars (Vår)",
        "🌱 April (Vår)", "🌱 Mai (Vår)", "☀️ Juni (Sommer)",
        "☀️ Juli (Sommer)", "☀️ August (Sommer)", "🍂 September (Høst)",
        "🍂 Oktober (Høst)", "🍂 November (Høst)", "❄️ Desember (Vinter)"
      ];
      statusText.textContent = `Nå er vi i: ${monthNames[currentMonth]}`;
    }

    // 5. TEGN OPP DENS NÅVÆRENDE MÅNEDSKALENDER
    renderMiniCalendar();

    // 6. Åpne modalen
    if (typeof openModal === 'function') {
      openModal('dashboardInfoModal');
    }
  });
}

/* --- ÅPNE OG LUKKE DAGSPLAN MED MØRK BAKGRUNN --- */
function openScheduleModal() {
  const originalList = document.getElementById('scheduleDisplay');
  const bigContainer = document.getElementById('bigScheduleContainer');
  
  if (originalList && bigContainer) {
    bigContainer.innerHTML = originalList.innerHTML;
  }

  // Oppretter eller viser den mørke bakgrunnen
  let backdrop = document.getElementById('customModalBackdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'customModalBackdrop';
    document.body.appendChild(backdrop);
  }
  backdrop.style.display = 'block';

  // Viser modalen
  const modal = document.getElementById('scheduleModal');
  if (modal) {
    modal.style.display = 'block';
  }
}

function closeScheduleModal() {
  const modal = document.getElementById('scheduleModal');
  const backdrop = document.getElementById('customModalBackdrop');
  
  if (modal) modal.style.display = 'none';
  if (backdrop) backdrop.style.display = 'none';
}



/* --- ÅPNE OG LAGRE IFRAME-LENKE --- */
function setAndSaveIframeUrl(url) {
  if (!url) return;
  
  let embedUrl = url;
  if (embedUrl.includes('docs.google.com') && embedUrl.includes('/edit')) {
    embedUrl = embedUrl.replace(/\/edit.*$/, '/preview');
  }

  const iframe = document.getElementById('mainFrame');
  if (iframe) {
    if (embedUrl.startsWith('data:')) {
      fetch(embedUrl)
        .then(res => res.blob())
        .then(blob => {
          iframe.src = URL.createObjectURL(blob);
        })
        .catch(() => {
          iframe.src = embedUrl;
        });
    } else {
      iframe.src = embedUrl;
    }
  }

  // SJEKK FOR HVA SOM REGNES SOM INTERNT INNHOLD (SOM IKKE SKAL HA HJELPELINJE)
  const fallbackBox = document.getElementById('iframeFallbackNotice');
  const fallbackLink = document.getElementById('fallbackExternalLink');
  
  if (fallbackBox && fallbackLink) {
    // Skjuler linjen for: lokale filer (data:), Hjem-siden (.html), blanke sider, OG Google Docs/Slides
    const isInternal = embedUrl.startsWith('data:') || 
                       embedUrl.toLowerCase().includes('.html') || 
                       embedUrl === 'about:blank' || 
                       embedUrl.includes('docs.google.com');
    
    if (!isInternal) {
      fallbackLink.href = embedUrl;
      fallbackBox.style.display = 'grid'; // Vises KUN for eksterne nettsider (som TV2, NRK osv.)
    } else {
      fallbackBox.style.display = 'none'; // Skjules for Google Presentations, verktøy og Hjem
    }
  }

  try {
    saveState('activeIframeUrl', embedUrl);
  } catch (err) {
    console.warn("Innholdet var for stort til å lagres i minnet:", err);
  }
}


/* --- ÅPNE SAMLING --- */
function openSamling(url) {
  // Sjekker om url finnes, og om den starter med http (gyldig lenke)
  if (!url || url === '#' || !url.startsWith('http')) {
    alert("🚀 Denne samlingen er ikke klar ennå. Lenke mangler for denne dagen/trinnet.");
    return; // Avbryter funksjonen her
  }

  // Hvis lenken er gyldig, fortsett som før
  setAndSaveIframeUrl(url);
  closeModal('samlingModal');
}


/* --- MODALER & DRAG & DROP --- */
let highestZ = 9999;

function bringToFront(element) {
  if (!element) return;
  highestZ++;
  element.style.zIndex = highestZ;
}


function openModal(id) {
  if (id === 'planModal') buildPlanEditor();
  if (id === 'linkModal') buildLinkEditor();
  
  // Aktiver mørk/uklar bakgrunn
  const backdrop = document.getElementById('customModalBackdrop');
  if (backdrop) {
    backdrop.classList.remove('transparent-backdrop');
    backdrop.style.display = 'block';
  }
  
  const el = document.getElementById(id);
  if (el) {
    el.style.top = '50%';
    el.style.left = '50%';
    el.style.transform = 'translate(-50%, -50%)';
    
    el.style.display = 'flex';
    bringToFront(el);
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';

  // Skjul bakgrunnen KUN hvis ingen andre modaler fortsatt er åpne
  const openModals = document.querySelectorAll('.floating-modal[style*="display: flex"]');
  if (openModals.length === 0) {
    const backdrop = document.getElementById('customModalBackdrop');
    if (backdrop) backdrop.style.display = 'none';
  }
}

// Husk også å ha denne hjelpefunksjonen liggende i skriptet ditt:
function toggleModalBackdrop() {
  const backdrop = document.getElementById('customModalBackdrop');
  if (backdrop) backdrop.classList.toggle('transparent-backdrop');
}


function setupDraggableModals() {
  document.querySelectorAll('.floating-modal').forEach(modal => {
    const header = modal.querySelector('.modal-header');
    if (!header || header.dataset.dragInitialized) return;
    
    header.dataset.dragInitialized = "true";
    let isDragging = false, offsetX = 0, offsetY = 0;

    modal.addEventListener('mousedown', () => bringToFront(modal));

    header.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('close-btn')) return;
      
      const rect = modal.getBoundingClientRect();
      modal.style.transform = 'none';
      modal.style.left = `${rect.left}px`;
      modal.style.top = `${rect.top}px`;

      isDragging = true;
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        modal.style.left = `${e.clientX - offsetX}px`;
        modal.style.top = `${e.clientY - offsetY}px`;
      }
    });

    document.addEventListener('mouseup', () => isDragging = false);
  });
}


/* --- ÅPNE OG LAGRE LOKALE FILER --- */
function loadFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const fileName = file.name.toLowerCase();
  const isOfficeFile = fileName.endsWith('.docx') || fileName.endsWith('.doc') || 
                       fileName.endsWith('.pptx') || fileName.endsWith('.ppt') || 
                       fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

  if (isOfficeFile) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${file.name}</title></head>
            <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; background:#f8fafc;">
              <div style="text-align:center; padding:20px; background:white; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                <h2>Åpner ${file.name}...</h2>
                <p>Klikk på knappen under dersom filen ikke åpnes automatisk i applikasjonen:</p>
                <a href="${e.target.result}" download="${file.name}" style="display:inline-block; padding:10px 20px; background:#3b82f6; color:white; text-decoration:none; border-radius:6px; font-weight:bold;">
                  Åpne / Last ned fil
                </a>
              </div>
            </body>
          </html>
        `);
      } else {
        alert("Pop-up ble blokkert! Tillat pop-ups for dette nettstedet for å åpne Office-filer.");
      }
    };
    reader.readAsDataURL(file);
  } else {
    // Les filen og lagre den som Data-URL i localStorage
    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;
      setAndSaveIframeUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  }
}


/* --- DEDIKERT STORSKJERM FOR ÅRSHJULET --- */
function openWheelOverlay() {
  const overlay = document.getElementById('wheelFullscreenOverlay');
  const handLarge = document.getElementById('wheelHandLarge');
  
  if (overlay) {
    // Tvinger elementet helt ut til body slik at ingen modal kan ligge over det
    document.body.appendChild(overlay);
    
    overlay.style.display = 'flex';
    overlay.style.zIndex = '2147483647'; // Høyeste mulige z-index i nettlesere
    
    // Synkroniserer klokkeviseren
    const now = new Date();
    const monthAngles = {
      2: 15, 3: 45, 4: 75, 5: 105, 6: 135, 7: 165,
      8: 195, 9: 225, 10: 255, 11: 285, 0: 315, 1: 345
    };
    
    if (handLarge) {
      handLarge.style.transform = `rotate(${monthAngles[now.getMonth()]}deg)`;
    }
  }
}

function closeWheelOverlay() {
  const overlay = document.getElementById('wheelFullscreenOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// Lukk storskjerm med ESC-tasten
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeWheelOverlay();
});


/* --- FILOPPLASTING & LINK-MODAL LOGIKK --- */
function openFilePickerModal() {
  openModal('filePickerModal');
}

function closeFilePickerModal() {
  closeModal('filePickerModal');
}

function loadFileAndCloseModal(event) {
  if (typeof loadFile === 'function') {
    loadFile(event);
  }
  closeFilePickerModal();
}

function loadGoogleUrlAndClose() {
  const urlInput = document.getElementById('googleUrlInput');
  if (!urlInput || !urlInput.value.trim()) {
    alert("Vennligst lim inn en gyldig nettadresse.");
    return;
  }

  let url = urlInput.value.trim();

  // Konverter Google Drive / Docs-lenker til preview
  if (url.includes('docs.google.com')) {
    if (url.includes('/edit') && !url.includes('embedded=true')) {
      url = url.replace(/\/edit.*$/, '/preview');
    }
  }

  setAndSaveIframeUrl(url);

  urlInput.value = "";
  closeFilePickerModal();
}


/* --- GJØR MODALER DRAS-BARE --- */
function makeElementDraggable(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const header = modal.querySelector('.modal-header') || modal.firstElementChild;
  if (!header) return;

  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  header.style.cursor = 'move';
  header.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;

    const rect = modal.getBoundingClientRect();
    modal.style.transform = 'none';
    modal.style.top = rect.top + 'px';
    modal.style.left = rect.left + 'px';

    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    modal.style.top = (modal.offsetTop - pos2) + 'px';
    modal.style.left = (modal.offsetLeft - pos1) + 'px';
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function initDraggableModals() {
  makeElementDraggable('studentModal');   
  makeElementDraggable('groupModal');     
  makeElementDraggable('timerModal');     
  makeElementDraggable('lykkehjulModal'); 
  makeElementDraggable('planModal');      
  makeElementDraggable('scheduleModal');  // <-- Aktiverer flytting for storvisningen
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDraggableModals);
} else {
  initDraggableModals();
}

/* --- FULLSKJERM FOR MIDTFELT --- */
function toggleMainFrameFullscreen() {
  const container = document.getElementById('mainFrameContainer');
  const btn = document.getElementById('fullscreenBtn');
  if (!container || !btn) return;

  container.classList.toggle('is-fullscreen');
  const isFS = container.classList.contains('is-fullscreen');

  btn.innerHTML = isFS ? '🗗 Gå ut av fullskjerm' : '⛶ Fullskjerm';
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const container = document.getElementById('mainFrameContainer');
    const btn = document.getElementById('fullscreenBtn');
    if (container && container.classList.contains('is-fullscreen')) {
      container.classList.remove('is-fullscreen');
      if (btn) btn.innerHTML = '⛶ Fullskjerm';
    }
  }
});



/* --- GRUPPEGENERATOR DEFINISJONER --- */
const groupRules = [];
let currentStudents = [];

const namePresets = {
  colors: ["🟥 Rød gruppe", "🟦 Blå gruppe", "🟩 Grønn gruppe", "🟨 Gul gruppe", "🟪 Lilla gruppe", "🟧 Oransje gruppe", "⬜️ Hvit gruppe", "⬛️ Svart gruppe", "🟫 Brun gruppe"],
  animals: ["🦁 Løvene", "🐯 Tigerne", "🐘 Elefantene", "🐬 Delfinene", "🦅 Ørnene", "🐼 Pandaene", "🐺 Ulvene", "🐻 Bjørnene", "🦊 Gaupene", "🦅 Falkene"],
  shapes: ["⭕️ Sirkel", "⬛️ Firkant", "🔺 Trekant", "⭐️ Stjerne", "🔷 Diamant", "🔹 Rombe", "▫️ Kvadrat", "🛑 Åttekant", "🔻 Opp-ned trekant", "💠 Ruter"]
};

// Setter standardverdier og viser klasselistene automatisk uten PIN
function initGroupApp() {
  setGroupDefaults();
  
  // Viser feltet for valgbare klasser direkte
  const fileSelectBox = document.getElementById('fileSelectBox');
  if (fileSelectBox) {
    fileSelectBox.style.display = 'block';
  }
  
  // Genererer avkrysningsboksene for klassene med én gang
  renderClassCheckboxes();
}

// Kjøres automatisk når siden lastes
document.addEventListener('DOMContentLoaded', initGroupApp);

function setGroupDefaults() {
  const modeSelect = document.getElementById('modeSelect') || document.getElementById('groupMode');
  const numberInput = document.getElementById('numberInput') || document.getElementById('groupCount') || document.getElementById('groupSize');
  const namingSelect = document.getElementById('namingSelect') || document.getElementById('groupTheme');

  if (modeSelect) {
    const hasNumGroupsOption = Array.from(modeSelect.options).some(opt => opt.value === 'numGroups');
    modeSelect.value = hasNumGroupsOption ? 'numGroups' : 'total';
    toggleMode();
  }

  if (numberInput) {
    numberInput.value = 3;
  }

  if (namingSelect) {
    namingSelect.value = 'animals';
  }
}

function switchGroupTab(tab) {
  const adminTab = document.getElementById('adminGroupView');
  const studentTab = document.getElementById('studentGroupView');
  const adminBtn = document.getElementById('tabAdminBtn');
  const studentBtn = document.getElementById('tabStudentBtn');

  if (tab === 'admin') {
    if (adminTab) adminTab.style.display = 'block';
    if (studentTab) studentTab.style.display = 'none';
    if (adminBtn) adminBtn.classList.add('active');
    if (studentBtn) studentBtn.classList.remove('active');
  } else {
    if (adminTab) adminTab.style.display = 'none';
    if (studentTab) studentTab.style.display = 'block';
    if (studentBtn) studentBtn.classList.add('active');
    if (adminBtn) adminBtn.classList.remove('active');
  }
}


function renderClassCheckboxes() {
  const containers = [
    document.getElementById('classCheckboxContainer'),
    document.getElementById('studentClassCheckboxContainer')
  ];

  if (!window.classLists) return;

  const savedClasses = JSON.parse(localStorage.getItem('selectedClasses') || '[]');

  containers.forEach(container => {
    if (!container) return;
    container.innerHTML = '';

    Object.keys(window.classLists).forEach(className => {
      const label = document.createElement('label');
      label.style.cssText = 'display:flex; align-items:center; gap:4px; cursor:pointer;';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = className;
      checkbox.className = 'class-checkbox';
      
      if (savedClasses.includes(className)) {
        checkbox.checked = true;
      }

      checkbox.onchange = (e) => syncAndSaveClasses(e.target.value, e.target.checked);

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(className));
      container.appendChild(label);
    });
  });

  if (savedClasses.length > 0) {
    updateSelectedClasses();
  }
}

// Synkroniserer avkryssing mellom begge modalene og lagrer i minnet
function syncAndSaveClasses(className, isChecked) {
  const allCheckboxes = document.querySelectorAll(`.class-checkbox[value="${className}"]`);
  allCheckboxes.forEach(cb => cb.checked = isChecked);

  const selectedClassNames = Array.from(document.querySelectorAll('#classCheckboxContainer input[type="checkbox"]:checked')).map(cb => cb.value);
  localStorage.setItem('selectedClasses', JSON.stringify(selectedClassNames));

  updateSelectedClasses();
}

function updateSelectedClasses() {
  const checkboxes = document.querySelectorAll('#classCheckboxContainer input[type="checkbox"]:checked');
  const groupTextarea = document.getElementById('studentsInput') || document.getElementById('groupStudentsInput');
  const studentTextarea = document.getElementById('studentListInput');

  currentStudents = [];
  let nameList = [];

  const selectedClassNames = Array.from(checkboxes).map(cb => cb.value);
  const isMultiple = selectedClassNames.length > 1;

  checkboxes.forEach(cb => {
    const className = cb.value;
    const list = window.classLists[className] || [];
    
    list.forEach(studentName => {
      const displayName = isMultiple ? `${studentName} (${className})` : studentName;
      currentStudents.push({
        name: studentName,
        className: className,
        displayName: displayName
      });
      nameList.push(displayName);
    });
  });

  const textContent = nameList.join('\n');

  // Fyller inn elevlisten i begge felt samtidig
  if (groupTextarea) groupTextarea.value = textContent;
  if (studentTextarea) studentTextarea.value = textContent;

  const balanceOption = document.getElementById('balanceClassesOption');
  if (balanceOption) {
    balanceOption.style.display = isMultiple ? 'flex' : 'none';
  }

  updateStudentCount();
}


function uploadStudentFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const contents = e.target.result;
    const names = contents
      .split(/\r?\n|,|;/)
      .map(name => name.trim())
      .filter(name => name.length > 0);

    currentStudents = names.map(n => ({ name: n, className: '', displayName: n }));

    const textarea = document.getElementById('studentsInput') || document.getElementById('groupStudentsInput');
    if (textarea) {
      textarea.value = names.join('\n');
    }

    const balanceOption = document.getElementById('balanceClassesOption');
    if (balanceOption) balanceOption.style.display = 'none';

    updateStudentCount();
  };
  reader.readAsText(file);
}

function updateStudentCount() {
  const input = document.getElementById('studentsInput') || document.getElementById('groupStudentsInput');
  if (!input) return;
  const count = input.value.split('\n').map(s => s.trim()).filter(s => s.length > 0).length;
  const badge = document.getElementById('studentCountBadge');
  if (badge) badge.innerText = `${count} personer registrert`;
}

function addRule() {
  const p1 = document.getElementById('person1').value.trim();
  const p2 = document.getElementById('person2').value.trim();
  const type = document.getElementById('ruleType').value;

  if (!p1 || !p2 || p1.toLowerCase() === p2.toLowerCase()) {
    alert("Vennligst oppgi to ulike navn.");
    return;
  }

  groupRules.push({ p1, p2, type });
  document.getElementById('person1').value = '';
  document.getElementById('person2').value = '';
  renderRules();
}

function removeRule(index) {
  groupRules.splice(index, 1);
  renderRules();
}

function renderRules() {
  const list = document.getElementById('rulesList');
  if (!list) return;
  list.innerHTML = '';
  groupRules.forEach((r, i) => {
    const txt = r.type === 'MUST' ? `<b>${r.p1}</b> & <b>${r.p2}</b> MÅ være sammen` : `<b>${r.p1}</b> & <b>${r.p2}</b> SKAL IKKE være sammen`;
    list.innerHTML += `<div style="display:flex; justify-content:space-between; align-items:center; background:#f1f5f9; padding:0.3rem 0.6rem; margin-top:0.3rem; border-radius:4px; font-size:12px;">
      <span>${txt}</span>
      <button type="button" onclick="removeRule(${i})" style="color:red; border:none; background:none; cursor:pointer; font-weight:bold;">✕</button>
    </div>`;
  });
}

function toggleMode() {
  const modeSelect = document.getElementById('modeSelect') || document.getElementById('groupMode');
  const label = document.getElementById('numberLabel') || document.getElementById('groupModeLabel');
  if (modeSelect && label) {
    const mode = modeSelect.value;
    label.innerHTML = (mode === 'perGroup' || mode === 'perGroupSize') 
      ? '<b>Antall personer per gruppe:</b>' 
      : '<b>Totalt antall grupper:</b>';
  }
}

function toggleCustomNaming() {
  const namingSelect = document.getElementById('namingSelect');
  const container = document.getElementById('customNamingContainer');
  if (namingSelect && container) {
    container.style.display = (namingSelect.value === 'custom') ? 'block' : 'none';
  }
}

/* --- GRUPPEGENERATOR LOGIKK --- */
function getGroupName(index) {
  const namingSelect = document.getElementById('namingSelect');
  const namingType = namingSelect ? namingSelect.value : 'numbers';

  if (namingType === 'numbers') return `🔢 Gruppe ${index + 1}`;
  if (namingType === 'letters') return `🔤 Gruppe ${String.fromCharCode(65 + (index % 26))}`;
  if (namingType === 'custom') {
    const customInput = document.getElementById('customNamesInput');
    const rawCustom = customInput ? customInput.value : '';
    const names = rawCustom.split(',').map(s => s.trim()).filter(s => s.length > 0);
    return names[index] ? `✨ ${names[index]}` : `✨ Gruppe ${index + 1}`;
  }
  
  // Sjekker om namePresets eksisterer før den slås opp
  if (typeof namePresets !== 'undefined' && namePresets[namingType]) {
    const preset = namePresets[namingType];
    return preset[index] ? preset[index] : `${preset[index % preset.length]} ${Math.floor(index / preset.length) + 1}`;
  }

  return `Gruppe ${index + 1}`;
}

function generateGroups() {
  const inputEl = document.getElementById('studentsInput') || document.getElementById('groupStudentsInput');
  if (!inputEl) return;
  
  const lines = inputEl.value.split('\n').map(s => s.trim()).filter(s => s.length > 0);

  if (lines.length === 0) {
    alert("Ingen personer registrert! Legg inn navn på elever først.");
    return;
  }

  let studentPool = lines.map(line => {
    const match = currentStudents.find(s => s.displayName === line);
    return match || { name: line, className: '', displayName: line };
  });

  const modeEl = document.getElementById('modeSelect') || document.getElementById('groupMode');
  const numEl = document.getElementById('numberInput') || document.getElementById('groupSizeValue');
  const isBalanced = document.getElementById('balanceClassesToggle')?.checked && document.getElementById('balanceClassesOption')?.style.display !== 'none';
  
  const mode = modeEl ? modeEl.value : 'perGroup';
  const numVal = parseInt(numEl ? numEl.value : 3, 10) || 1;

  let numGroups = (mode === 'perGroup' || mode === 'perGroupSize') 
    ? Math.ceil(studentPool.length / numVal) 
    : Math.min(numVal, studentPool.length);

  numGroups = Math.max(1, numGroups);

  let bestResult = null;
  let minViolations = Infinity;

  for (let attempt = 0; attempt < 2500; attempt++) {
    const groups = Array.from({ length: numGroups }, () => []);

    if (isBalanced) {
      let classBins = {};
      studentPool.forEach(student => {
        const key = student.className || 'Ukjent';
        if (!classBins[key]) classBins[key] = [];
        classBins[key].push(student);
      });

      Object.keys(classBins).forEach(k => {
        classBins[k].sort(() => Math.random() - 0.5);
      });

      let groupIndex = 0;
      Object.keys(classBins).forEach(k => {
        classBins[k].forEach(student => {
          groups[groupIndex].push(student);
          groupIndex = (groupIndex + 1) % numGroups;
        });
      });

    } else {
      const shuffled = [...studentPool].sort(() => Math.random() - 0.5);
      shuffled.forEach((student, index) => {
        groups[index % numGroups].push(student);
      });
    }

    const violations = countViolations(groups);
    if (violations < minViolations) {
      minViolations = violations;
      bestResult = groups;
    }
    if (violations === 0) break;
  }

  renderGroupsToContainer('studentResults', bestResult);
}

function countViolations(groups) {
  let violations = 0;
  groupRules.forEach(rule => {
    const p1 = (rule.p1 || '').toLowerCase();
    const p2 = (rule.p2 || '').toLowerCase();

    const p1Group = groups.findIndex(g => g.some(s => s.name.toLowerCase().includes(p1) || s.displayName.toLowerCase().includes(p1)));
    const p2Group = groups.findIndex(g => g.some(s => s.name.toLowerCase().includes(p2) || s.displayName.toLowerCase().includes(p2)));

    if (p1Group !== -1 && p2Group !== -1) {
      if (rule.type === 'MUST' && p1Group !== p2Group) violations++;
      if (rule.type === 'MUST_NOT' && p1Group === p2Group) violations++;
    }
  });
  return violations;
}

function renderGroupsToContainer(containerId, groups) {
  const container = document.getElementById(containerId) || document.getElementById('groupsDisplayContainer');
  if (!container) return;
  container.innerHTML = '';

  groups.forEach((group, index) => {
    const title = getGroupName(index);
    const card = document.createElement('div');
    card.style.cssText = "background:#fff; border-top:4px solid var(--primary, #4f46e5); padding:0.8rem; border-radius:6px; box-shadow:0 1px 3px rgba(0,0,0,0.1);";
    card.innerHTML = `
      <h3 style="margin:0 0 0.5rem 0; font-size:15px; color:var(--primary, #4f46e5); border-bottom:1px solid #f1f5f9; padding-bottom:0.3rem;">${title} (${group.length})</h3>
      <ul style="list-style:none; padding:0; margin:0; font-size:14px;">
        ${group.map(student => `<li style="padding:0.2rem 0; border-bottom:1px dashed #e2e8f0;">${student.displayName}</li>`).join('')}
      </ul>
    `;
    container.appendChild(card);
  });
}


/* --- ELEVTREKKER LOGIKK MED RULETTEFFEKT --- */
let drawnStudents = loadState('drawnStudentsHistory', []);
let currentAngle = 0;
let isSpinning = false;
let blinkInterval = null;
let lastWinnerIndex = -1;
let isBlinking = false;
let activeWheelStudents = [];

const farger = ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#84cc16'];

function hentAktiveElever() {
  const inputEl = document.getElementById('studentListInput');
  if (!inputEl) return [];
  const rawInput = inputEl.value;
  let allStudents = rawInput.split('\n').map(s => s.trim()).filter(s => s.length > 0);
  
  const rememberCheckbox = document.getElementById('rememberDrawn');
  const remember = rememberCheckbox ? rememberCheckbox.checked : false;

  return remember ? allStudents.filter(name => !drawnStudents.includes(name)) : allStudents;
}

function stoppBlinking() {
  if (blinkInterval) {
    clearInterval(blinkInterval);
    blinkInterval = null;
  }
  isBlinking = false;
  lastWinnerIndex = -1;
}

function oppdaterHjul(skalLasteNyeElever = false) {
  const canvas = document.getElementById('bigWheelCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  if (skalLasteNyeElever || activeWheelStudents.length === 0) {
    activeWheelStudents = hentAktiveElever();
  }
  
  const elever = activeWheelStudents;
  const numSegments = elever.length;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = canvas.width / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (numSegments === 0) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Alle elever er trukket! 🎉', centerX, centerY);
    return;
  }

  const anglePerSegment = (2 * Math.PI) / numSegments;

  elever.forEach((elev, i) => {
    const startAngle = currentAngle + i * anglePerSegment;
    const endAngle = startAngle + anglePerSegment;

    const erVinnerSegment = (i === lastWinnerIndex);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();

    if (erVinnerSegment && isBlinking) {
      ctx.fillStyle = '#fbbf24'; // Gull/gul blinking på vinner
    } else {
      ctx.fillStyle = farger[i % farger.length];
    }
    
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = erVinnerSegment ? 6 : 3;
    ctx.stroke();

    // Tegn elevnavn med større skrifttype
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + anglePerSegment / 2);
    ctx.textAlign = 'right';
    
    if (erVinnerSegment && isBlinking) {
      ctx.fillStyle = '#0f172a';
      ctx.font = '800 20px sans-serif';
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
    }
    
    ctx.fillText(elev.length > 15 ? elev.substring(0, 13) + '..' : elev, radius - 20, 6);
    ctx.restore();
  });

  // Midtsirkel med Hånes-skole preg
  ctx.beginPath();
  ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 4;
  ctx.stroke();
}

function spinWheel() {
  if (isSpinning) return;

  stoppBlinking();
  oppdaterHjul(true); // Fjern forrige vinner før ny snurr

  const elever = activeWheelStudents;

  if (elever.length === 0) {
    alert("Alle elever på listen er allerede trukket! Nullstill historikken for å starte på nytt.");
    return;
  }

  isSpinning = true;
  const drawBtn = document.getElementById('bigDrawBtn');
  if (drawBtn) drawBtn.disabled = true;

  const resultBox = document.getElementById('drawResult');
  if (resultBox) resultBox.style.display = 'none';

  const extraRounds = 5 + Math.random() * 4;
  const totalRotation = extraRounds * 2 * Math.PI;
  const startAngle = currentAngle;
  const targetAngle = currentAngle + totalRotation;

  const duration = 4500; // 4.5 sekunder spenning
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const easeOut = 1 - Math.pow(1 - progress, 3);
    currentAngle = startAngle + (targetAngle - startAngle) * easeOut;

    oppdaterHjul(false);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      if (drawBtn) drawBtn.disabled = false;

      const normalizedAngle = (2 * Math.PI - (currentAngle % (2 * Math.PI)) + (3 * Math.PI / 2)) % (2 * Math.PI);
      const segmentAngle = (2 * Math.PI) / elever.length;
      const winnerIndex = Math.floor(normalizedAngle / segmentAngle) % elever.length;
      const winner = elever[winnerIndex];

      startVinnerBlinking(winnerIndex, winner);
    }
  }

  requestAnimationFrame(animate);
}

function startVinnerBlinking(winnerIndex, winner) {
  lastWinnerIndex = winnerIndex;
  
  blinkInterval = setInterval(() => {
    isBlinking = !isBlinking;
    oppdaterHjul(false);
  }, 350);

  const rememberCheckbox = document.getElementById('rememberDrawn');
  if (rememberCheckbox && rememberCheckbox.checked) {
    drawnStudents.push(winner);
    saveState('drawnStudentsHistory', drawnStudents);
    updateDrawnHistory();
  }

  const winnerEl = document.getElementById('winnerNames');
  const resultBox = document.getElementById('drawResult');
  if (winnerEl) winnerEl.innerHTML = `🎉 ${winner} 🎉`;
  if (resultBox) resultBox.style.display = 'block';

  if (typeof confetti === 'function') {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  }
}

function updateDrawnHistory() {
  const countBadge = document.getElementById('drawnCount');
  const historyList = document.getElementById('drawnHistoryList');
  if (countBadge) countBadge.innerText = drawnStudents.length;
  
  if (historyList) {
    if (drawnStudents.length === 0) {
      historyList.innerHTML = '<span style="font-style: italic; color: #94a3b8;">Ingen elever trukket ennå.</span>';
    } else {
      // Viser trukkede elever som pene merkelapper i historikklisten
      historyList.innerHTML = drawnStudents.map((name, index) => 
        `<div style="background: #f1f5f9; padding: 6px 10px; border-radius: 6px; font-weight: 600; display: flex; justify-content: space-between;">
           <span>${index + 1}. ${name}</span>
           <span style="color: #22c55e;">✓</span>
         </div>`
      ).reverse().join('');
    }
  }
}

function resetDrawnHistory() {
  stoppBlinking();
  drawnStudents = [];
  saveState('drawnStudentsHistory', []);
  updateDrawnHistory();
  oppdaterHjul(true);
  const resultBox = document.getElementById('drawResult');
  if (resultBox) resultBox.style.display = 'none';
}

// Initialiser historikk og hjul ved sidenoppstart
document.addEventListener('DOMContentLoaded', () => {
  updateDrawnHistory();
  setTimeout(() => oppdaterHjul(true), 300);
});

/* --- TIDSUR LOGIKK --- */
let timer = null;
let totalSeconds = 300;
let initialSeconds = 300;
let isRunning = false;
let alarmInterval = null;
let playCount = 0;

// AudioContext for syntetisk lydgenerering
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function updateTimerDisplay() {
  const display = document.getElementById('timerDisplay');
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (display) {
    display.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
}

function applyInputTime() {
  if (isRunning) return; // Ikke avbryt hvis den allerede kjører

  const minInput = document.getElementById('min');
  const secInput = document.getElementById('sec');
  
  const m = parseInt(minInput && minInput.value !== "" ? minInput.value : 0, 10);
  const s = parseInt(secInput && secInput.value !== "" ? secInput.value : 0, 10);
  
  totalSeconds = (m * 60) + s;
  initialSeconds = totalSeconds;
  updateTimerDisplay();
}

function setPreset(minutes) {
  const minInput = document.getElementById('min');
  const secInput = document.getElementById('sec');
  if (minInput) minInput.value = minutes;
  if (secInput) secInput.value = 0;
  resetTimer();
}

function toggleTimer() {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  const startBtn = document.getElementById('startBtn');
  
  // Les inn fra boksene hvis den ikke er startet
  if (!isRunning && totalSeconds === initialSeconds) {
    applyInputTime();
  }

  if (totalSeconds <= 0) return;

  isRunning = true;
  if (startBtn) {
    startBtn.textContent = 'Pause';
    startBtn.style.backgroundColor = '#f39c12';
  }

  if (timer) clearInterval(timer);

  timer = setInterval(() => {
    totalSeconds--;
    updateTimerDisplay();

    if (totalSeconds <= 0) {
      stopTimerProcess();
      triggerAlarm();
    }
  }, 1000);
}

function pauseTimer() {
  stopTimerProcess();
}

function stopTimerProcess() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  isRunning = false;
  const startBtn = document.getElementById('startBtn');
  if (startBtn) {
    startBtn.textContent = 'Start';
    startBtn.style.backgroundColor = '#2ecc71';
  }
}

function resetTimer() {
  // 1. Stopp timeren og slå av alarmlyd/effekter
  stopTimerProcess();
  stopAlarmEffects();

  // 2. Skjul alarm-modalen dersom den er åpen
  const alarmModal = document.getElementById('alarmModal');
  if (alarmModal) alarmModal.style.display = 'none';

  // 3. Tilbakestill tid-feltene til 5 min og 0 sek
  const minInput = document.getElementById('min');
  const secInput = document.getElementById('sec');
  if (minInput) minInput.value = 5;
  if (secInput) secInput.value = 0;

  // 4. Tilbakestill lyd-valgene til standard
  const soundTypeSelect = document.getElementById('soundType');
  const soundRepeatSelect = document.getElementById('soundRepeat');
  if (soundTypeSelect) soundTypeSelect.value = 'chime';
  if (soundRepeatSelect) soundRepeatSelect.value = 'loop';

  // 5. Oppdater variabler og skjermvisningen til 05:00
  totalSeconds = 300;
  initialSeconds = 300;
  updateTimerDisplay();
}


/* --- SYNTETISK LYDGENERATOR --- */
function playSynthSound(type) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  if (type === 'digital') {
    // Pipe-toner (pip-pip-pip)
    [0, 0.15, 0.3].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now + delay); // A5
      gain.gain.setValueAtTime(0.3, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.1);
    });
  } else if (type === 'alarm') {
    // Kraftig, gjennomtrengende staccato-alarm
    [0, 0.2, 0.4].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(960, now + delay);
      osc.frequency.setValueAtTime(1200, now + delay + 0.07);

      gain.gain.setValueAtTime(0.5, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.15);
    });
  } else if (type === 'siren') {
    // Rask, to-toners utrykningssirene
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.setValueAtTime(1050, now + 0.15);
    osc.frequency.setValueAtTime(700, now + 0.3);
    osc.frequency.setValueAtTime(1050, now + 0.45);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  } else if (type === 'shiphorn') {
    // Dyp, kraftig og skjærende tåkelur/skipsfløyte
    [130, 131, 260].forEach(freq => { // Flere svingninger gir fetere klang
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    });
  } else if (type === 'chime') {
    // Varm akkord / marimba
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + (index * 0.08));
      gain.gain.setValueAtTime(0.4, now + (index * 0.08));
      gain.gain.exponentialRampToValueAtTime(0.001, now + (index * 0.08) + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + (index * 0.08));
      osc.stop(now + (index * 0.08) + 1.2);
    });
  } else if (type === 'fanfare') {
    // Seiers-fanfare
    const notes = [
      { f: 523.25, t: 0, d: 0.15 },
      { f: 659.25, t: 0.15, d: 0.15 },
      { f: 783.99, t: 0.30, d: 0.15 },
      { f: 1046.50, t: 0.45, d: 0.5 }
    ];
    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(note.f, now + note.t);
      gain.gain.setValueAtTime(0.15, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + note.t);
      osc.stop(now + note.t + note.d);
    });
  } else if (type === 'pulse') {
    // Lav puls
    [0, 0.25].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, now + delay);
      gain.gain.setValueAtTime(0.6, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.18);
    });
  } else if (type === 'gameover') {
    // Synkende tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.6);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  }
}

function testSound() {
  const soundTypeSelect = document.getElementById('soundType');
  const type = soundTypeSelect ? soundTypeSelect.value : 'digital';
  playSynthSound(type);
}

function triggerAlarm() {
  const body = document.getElementById('timerModalBody');
  const alarmModal = document.getElementById('alarmModal');
  if (body) body.classList.add('alarm-active');
  if (alarmModal) alarmModal.style.display = 'flex';
  playAlarmSound();
}

function playAlarmSound() {
  stopAudio();
  playCount = 0;
  const soundTypeSelect = document.getElementById('soundType');
  const soundRepeatSelect = document.getElementById('soundRepeat');
  const type = soundTypeSelect ? soundTypeSelect.value : 'digital';
  const repeatVal = soundRepeatSelect ? soundRepeatSelect.value : '1';

  // Spill av første gang umiddelbart
  playSynthSound(type);
  playCount = 1;

  if (repeatVal === 'loop') {
    alarmInterval = setInterval(() => {
      playSynthSound(type);
    }, 1500);
  } else {
    const maxRepeats = parseInt(repeatVal, 10);
    if (maxRepeats > 1) {
      alarmInterval = setInterval(() => {
        if (playCount < maxRepeats) {
          playSynthSound(type);
          playCount++;
        } else {
          clearInterval(alarmInterval);
          alarmInterval = null;
        }
      }, 1500);
    }
  }
}

function stopAudio() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
}

function stopAlarmEffects() {
  const body = document.getElementById('timerModalBody');
  if (body) body.classList.remove('alarm-active');
  stopAudio();
}

function closeAlarmModal() {
  // 1. Stopp lydeffekter og blinking
  stopAlarmEffects();

  // 2. Skjul alarm-modalen
  const alarmModal = document.getElementById('alarmModal');
  if (alarmModal) {
    alarmModal.style.display = 'none';
  }

  // 3. Stopp timerkjøringen
  stopTimerProcess();

  // 4. Sett tiden tilbake til det den var satt til, uten å starte nedtellingen
  totalSeconds = initialSeconds;
  updateTimerDisplay();
}

function restartSameTime() {
  // 1. Stopp lydeffekter og skjult alarm-modalen
  stopAlarmEffects();
  const alarmModal = document.getElementById('alarmModal');
  if (alarmModal) {
    alarmModal.style.display = 'none';
  }

  // 2. Hent tiden du brukte sist (eller les fra input dersom initialSeconds mangler)
  if (!initialSeconds || initialSeconds <= 0) {
    const minInput = document.getElementById('min');
    const secInput = document.getElementById('sec');
    const m = parseInt(minInput ? minInput.value : 0, 10) || 0;
    const s = parseInt(secInput ? secInput.value : 0, 10) || 0;
    initialSeconds = (m * 60) + s;
  }

  // 3. Sett totalSeconds tilbake til startverdien og start timeren på nytt
  totalSeconds = initialSeconds;
  updateTimerDisplay();
  startTimer();
}


/* --- Hjelpefunksjon for sanering --- */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
  });
}



/* --- NAVIGASJON (HJEM) --- */
function goHome() {
  const mainFrame = document.getElementById('mainFrame');
  if (mainFrame) mainFrame.src = 'hjem.html';

  // Skjuler linjen
  const notice = document.getElementById('iframeFallbackNotice');
  if (notice) notice.style.display = 'none';

  localStorage.removeItem('activeIframeUrl');
}

function makeElementDraggable(elmnt, header) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (header) {
    header.onmousedown = dragMouseDown;
  } else {
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    // Sjekk at brukeren ikke klikket på lukkeknappen (✕)
    if (e.target.classList.contains('close-btn')) return;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    elmnt.style.transform = "none"; // Fjerner sentrering når man begynner å dra
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Aktiver flytting når siden lastes
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('planModal');
  const header = document.getElementById('planModalHeader');
  if (modal && header) {
    makeElementDraggable(modal, header);
  }
});

/* --- SAMLET OPPSTARTSLOGIKK --- */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderLinks === 'function') renderLinks();
  if (typeof updateClock === 'function') updateClock();
  
  // Oppdaterer dato og setter riktig dag fra kalenderen ved start
  if (typeof updateDates === 'function') updateDates();
  if (typeof renderSchedule === 'function') renderSchedule();
  if (typeof setupDraggableModals === 'function') setupDraggableModals();

  if (typeof loadState === 'function') {
    const lastUrl = loadState('activeIframeUrl');
    if (lastUrl) {
      const iframe = document.getElementById('mainFrame');
      if (iframe) iframe.src = lastUrl;
    }
  }

  const minInput = document.getElementById('min');
  const secInput = document.getElementById('sec');
  if (minInput) minInput.addEventListener('change', applyInputTime);
  if (secInput) secInput.addEventListener('change', applyInputTime);

  // Kjører hvert sekund for å holde klokken, datovedlikehold og "NÅ"-markøren oppdatert
  setInterval(() => {
    if (typeof updateClock === 'function') updateClock();
    if (typeof updateDates === 'function') updateDates();
    if (typeof renderSchedule === 'function') renderSchedule();
  }, 1000);
});