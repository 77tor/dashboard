

// Sett et versjonsnummer for datastrukturen din
const APP_VERSION = "1.0.1"; 

function checkAppVersion() {
  // Sjekk om siden kjøres lokalt fra disk (file://)
  const isLocalFile = window.location.protocol === 'file:';

  // Hvis filen åpnes direkte fra lokal disk, dropper vi automatisk nullstilling
  if (isLocalFile) {
    console.log("Kjører fra lokal disk (file://) – hopper over versjonssjekk for å bevare lokal data.");
    return;
  }

  const savedVersion = localStorage.getItem('app_version');

  // Hvis brukeren på nettstedet har en eldre versjon, oppdater
  if (savedVersion !== APP_VERSION) {
    console.log("Ny versjon oppdaget på nett! Oppdaterer lokal lagring...");
    
    if (typeof defaultDayStructure !== 'undefined') {
      const days = ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag'];
      const updatedSchedule = {};
      days.forEach(d => {
        updatedSchedule[d] = JSON.parse(JSON.stringify(defaultDayStructure));
      });
      localStorage.setItem('weekSchedule', JSON.stringify(updatedSchedule));
    }

    localStorage.setItem('app_version', APP_VERSION);
  }
}

// Kjør sjekken umiddelbart
checkAppVersion();


/* --- DYNAMISKE LENKER --- */
// Standardlenker dersom brukeren ikke har lagret noe enda
const defaultLinks = [
  { name: "Google", url: "https://www.google.no", external: true },
  { name: "Wikipedia", url: "https://www.wikipedia.org", external: false },
  { name: "Korartí", url: "https://www.korarti.no/", external: false },
  { name: "Salaby", url: "https://www.salaby.no/", external: false },
  { name: "Youtube", url: "https://www.youtube.no/", external: true },
  { name: "Skoleregler", url: "https://sites.google.com/ikrs.no/regler", external: true }
];

// Laster fra localStorage eller bruker defaultLinks
let customLinks = loadState('customLinksData', defaultLinks);

// Hvis customLinks av en eller annen grunn er tom eller ugyldig:
if (!Array.isArray(customLinks) || customLinks.length === 0) {
  customLinks = defaultLinks;
}

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



/* --- LENKEREDIGERING (MED 6 PLASSER) --- */
function buildLinkEditor() {
  const table = document.getElementById('linkEditTable');
  if (!table) return;

  // Sjekk om customLinks er tom, sett standard hvis nødvendig
  if (!Array.isArray(customLinks) || customLinks.length === 0) {
    customLinks = [...defaultLinks];
  }

  // Sørg for at det alltid er nøyaktig 6 objekter i arrayen
  while (customLinks.length < 6) {
    customLinks.push({ name: "", url: "", external: false });
  }

  // Generer tabellstrukturen på nytt hver gang den åpnes
  let html = `
    <thead>
      <tr style="font-weight:bold; background:#f0f4f8; text-align:left;">
        <th style="padding:8px; border-bottom:1px solid #cbd5e1;">Knappnavn</th>
        <th style="padding:8px; border-bottom:1px solid #cbd5e1;">URL (Nettadresse)</th>
        <th style="padding:8px; border-bottom:1px solid #cbd5e1; text-align:center;">Ny fane?</th>
      </tr>
    </thead>
    <tbody id="linkEditTbody">
  `;

  // Bygg kun de første 6 radene
  for (let idx = 0; idx < 6; idx++) {
    const link = customLinks[idx] || { name: '', url: '', external: false };
    html += `
      <tr>
        <td style="padding:6px; border-bottom:1px solid #f1f5f9;">
          <input type="text" id="linkName_${idx}" value="${link.name || ''}" placeholder="Navn (f.eks. NRK)" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px; box-sizing:border-box;">
        </td>
        <td style="padding:6px; border-bottom:1px solid #f1f5f9;">
          <input type="url" id="linkUrl_${idx}" value="${link.url || ''}" placeholder="https://..." style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:4px; box-sizing:border-box;">
        </td>
        <td style="padding:6px; text-align:center; border-bottom:1px solid #f1f5f9;">
          <input type="checkbox" id="linkExt_${idx}" ${link.external ? 'checked' : ''} style="transform: scale(1.3); cursor: pointer;">
        </td>
      </tr>
    `;
  }

  html += `</tbody>`;
  table.innerHTML = html;

  // Legg til infoboksen under tabellen dersom den ikke finnes
  let infoBox = document.getElementById('linkEditInfoText');
  if (!infoBox) {
    infoBox = document.createElement('div');
    infoBox.id = 'linkEditInfoText';
    infoBox.style.cssText = 'margin-top: 12px; padding: 8px 12px; background-color: #fef3c7; color: #92400e; border-left: 4px solid #f59e0b; font-size: 0.85rem; border-radius: 4px;';
    infoBox.innerHTML = '⚠️ <strong>Merk:</strong> Enkelte nettsider tillater ikke å bli åpnet direkte inne i dashboardet. Dersom en side forblir blank, huke av for <strong>«Ny fane?»</strong>.';
    table.parentNode.insertBefore(infoBox, table.nextSibling);
  }
}

function saveLinks() {
  for (let idx = 0; idx < 6; idx++) {
    const nameInput = document.getElementById(`linkName_${idx}`);
    const urlInput = document.getElementById(`linkUrl_${idx}`);
    const extInput = document.getElementById(`linkExt_${idx}`);
    
    if (nameInput && urlInput && extInput) {
      if (!customLinks[idx]) {
        customLinks[idx] = {};
      }
      customLinks[idx].name = nameInput.value.trim();
      customLinks[idx].url = urlInput.value.trim();
      customLinks[idx].external = extInput.checked;
    }
  }
  
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

    // Tilbakestiller posisjonen til midten og gjør modalen flyttbar
    if (modalId === 'aktivitetModal') {
      modal.style.top = '50%';
      modal.style.left = '50%';
      modal.style.transform = 'translate(-50%, -50%)';

      const header = document.getElementById('aktivitetModalHeader');
      if (header && typeof makeModalDraggable === 'function') {
        makeModalDraggable(modal, header);
      }
    }
  }

  // Tvinger bygging av tabellen for Dagsplan
  if (modalId === 'planModal') {
    if (typeof getCurrentDayName === 'function') editingDay = getCurrentDayName();
    if (typeof buildPlanEditor === 'function') buildPlanEditor();
  }

  // Tvinger bygging av tabellen for Lenker
  if (modalId === 'linkModal') {
    if (typeof buildLinkEditor === 'function') buildLinkEditor();
  }

  // Tvinger generering av kortene for Aktivitet
  if (modalId === 'aktivitetModal') {
    if (typeof genererAktiviteter === 'function') genererAktiviteter();
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



/* --- DAGSPLAN LOGIKK M/ EGENDEFINERT FAG OG MODAL --- */
const availableImages = [
  "Arbeidsplan", "Bibliotek", "DKS", "Engelsk", "Forestilling", "Friminutt", 
  "Gym", "Kartlegging", "Klassens time", "Krle", "Kunst og håndverk", "Lek", 
  "Matematikk", "Musikk", "Naturfag", "Norsk", "Samfunnsfag", 
  "Samling", "Spising", "Stasjoner", "Stillelesing", "Svømming", "Uteskole"
];

let scheduleViewConfig = loadState('dagsplanVisning', {
  showLabels: true,
  showClock: true,
  font: 'standard',
  fontSize: 'large'
});

const defaultDayStructure = [
  { id: "t1", label: "1. time", start: "08:30", end: "09:15", time: "08.30 - 09.15", customSubject: "", img: "" },
  { id: "t2", label: "", start: "09:15", end: "09:30", time: "09.15 - 09.30", customSubject: "Friminutt", img: "Friminutt.png" },
  { id: "t3", label: "2. time", start: "09:30", end: "10:00", time: "09.30 - 10.00", customSubject: "", img: "" },
  { id: "t4", label: "3. time", start: "10:00", end: "10:45", time: "10.00 - 10.45", customSubject: "", img: "" },
  { id: "t5", label: "", start: "10:45", end: "11:15", time: "10.45 - 11.15", customSubject: "Spising", img: "Spising.png" },
  { id: "t6", label: "", start: "11:15", end: "11:45", time: "11.15 - 11.45", customSubject: "Friminutt", img: "Friminutt.png" },
  { id: "t7", label: "4. time", start: "11:45", end: "12:30", time: "11.45 - 12.30", customSubject: "", img: "" },
  { id: "t8", label: "5. time", start: "12:30", end: "13:15", time: "12.30 - 13.15", customSubject: "", img: "" }
];

// Kjør sjekken umiddelbart
checkAppVersion();

function createDefaultWeek() {
  const week = {
    mandag: JSON.parse(JSON.stringify(defaultDayStructure)),
    tirsdag: JSON.parse(JSON.stringify(defaultDayStructure)),
    onsdag: JSON.parse(JSON.stringify(defaultDayStructure)),
    torsdag: JSON.parse(JSON.stringify(defaultDayStructure)),
    fredag: JSON.parse(JSON.stringify(defaultDayStructure))
  };
  week.mandag[7].end = "13:30";
  week.mandag[7].time = "12.15 - 13.30";
  return week;
}

function getCurrentDayName() {
  const dayIndex = new Date().getDay();
  const dayMap = { 1: 'mandag', 2: 'tirsdag', 3: 'onsdag', 4: 'torsdag', 5: 'fredag' };
  return dayMap[dayIndex] || 'mandag';
}

let weekSchedule = loadState('dagsplanUkesplan', null) || createDefaultWeek();
let activeDay = getCurrentDayName();
let editingDay = getCurrentDayName();

// Variabel for å huske hvilken økt som opprettet det egendefinerte faget
let targetSlotIdForCustom = null;

function updateDates() {
  const now = new Date();
  const currentDay = getCurrentDayName();
  if (activeDay !== currentDay) {
    activeDay = currentDay;
    renderSchedule();
  }

  const dateEl = document.getElementById('currentDate');
  const yearEl = document.getElementById('currentYear');
  const timeEl = document.getElementById('currentTime');

  if (dateEl && yearEl) {
    const rawDay = now.toLocaleDateString('nb-NO', { weekday: 'long' });
    const dayName = rawDay.charAt(0).toUpperCase() + rawDay.slice(1);
    const dayNum = now.getDate();
    const monthName = now.toLocaleDateString('nb-NO', { month: 'long' });
    const year = now.getFullYear();
    const timeString = now.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });

    dateEl.innerText = dayName;
    yearEl.innerText = `${dayNum}. ${monthName} ${year}`;
    if (timeEl) timeEl.innerText = timeString;
  }
}
setInterval(updateDates, 1000);

function isTimeActive(startStr, endStr) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);
  return currentMinutes >= (startH * 60 + startM) && currentMinutes < (endH * 60 + endM);
}


// Legg til en ny økt på den dagen du redigerer nå
function addNewSlot() {
  saveCurrentEditState();
  
  const currentSlots = weekSchedule[editingDay] || [];
  
  // Finn det høyeste timetallet som finnes fra før (f.eks. om siste time var "5. time")
  let maxTimeNum = 0;
  currentSlots.forEach(slot => {
    const match = slot.label.match(/(\d+)\.\s*time/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxTimeNum) maxTimeNum = num;
    }
  });

  // Neste time blir 1 høyere enn høyeste eksisterende timetall
  const nextNum = maxTimeNum + 1;
  const newId = `t_${Date.now()}`;
  
  // Beregn default start- og sluttid ut fra forrige økt dersom den finnes
  let lastEnd = "12:00";
  if (currentSlots.length > 0) {
    lastEnd = currentSlots[currentSlots.length - 1].end || "12:00";
  }
  
  const [h, m] = lastEnd.split(':').map(Number);
  const endH = (h + 1).toString().padStart(2, '0');
  const endStr = `${endH}:${m.toString().padStart(2, '0')}`;

  currentSlots.push({
    id: newId,
    label: `${nextNum}. time`,
    start: lastEnd,
    end: endStr,
    time: `${lastEnd.replace(':', '.')} - ${endStr.replace(':', '.')}`,
    customSubject: "",
    img: ""
  });

  buildPlanEditor();
}

// Slett en valgt økt
function removeSlot(slotId) {
  saveCurrentEditState();
  weekSchedule[editingDay] = weekSchedule[editingDay].filter(s => s.id !== slotId);
  buildPlanEditor();
}



function renderSchedule() {
  const container = document.getElementById('scheduleDisplay') || document.getElementById('bigScheduleContainer');
  if (!container) return;
  container.innerHTML = "";

  const isMinimal = !scheduleViewConfig.showLabels && !scheduleViewConfig.showClock;

// Legg til schedule-list sammen med visningsklassene for å bevare flex-høyden (med 'large' som fallback)
  container.className = `schedule-list schedule-container schedule-font-${scheduleViewConfig.font || 'standard'} schedule-size-${scheduleViewConfig.fontSize || 'large'} ${isMinimal ? 'schedule-minimal' : ''}`;

  const timeSlots = weekSchedule[activeDay] || [];

  timeSlots.forEach(slot => {
    const isToday = getCurrentDayName() === activeDay;
    const isActive = isToday && isTimeActive(slot.start, slot.end);
    
    const subjectName = slot.customSubject || (slot.img ? slot.img.replace('.png', '') : "");
    const imagePath = slot.img ? (slot.img.startsWith('http') || slot.img.startsWith('data:') ? slot.img : `Bilder/${slot.img}`) : "";
    
    const isPause = slot.label === "Friminutt" || slot.label === "Spising" || subjectName.toLowerCase().includes("friminutt") || subjectName.toLowerCase().includes("spising");

    const item = document.createElement('div');
    item.className = `schedule-card ${isPause ? 'pause-card' : ''} ${isActive ? 'active-now' : ''}`;

    let imageHTML = `<span class="schedule-empty">Ikke valgt</span>`;
    if (imagePath) {
      imageHTML = `<img src="${imagePath}" class="schedule-img" alt="${subjectName || slot.label}">`;
    }

    const activeBadgeHTML = isActive ? `<span class="active-badge" style="margin-right: 6px; margin-top: 0;">NÅ</span>` : '';

    item.innerHTML = `
      <div class="schedule-img-container">
        ${imageHTML}
      </div>
      <div class="schedule-time">
        ${subjectName ? `<div class="schedule-subject">${subjectName}</div>` : ''}
        ${scheduleViewConfig.showLabels ? `<div class="schedule-label">${slot.label}</div>` : ''}
        ${scheduleViewConfig.showClock ? `<div class="schedule-clock" style="display: flex; align-items: center;">${activeBadgeHTML}${slot.time}</div>` : (isActive ? activeBadgeHTML : '')}
      </div>
    `;
    container.appendChild(item);
  });
}


function toggleScheduleViewOption(optionKey, value) {
  scheduleViewConfig[optionKey] = value;
  saveState('dagsplanVisning', scheduleViewConfig);
  renderSchedule();
}


function buildPlanEditor() {
  const table = document.getElementById('planEditTable');
  if (!table) return;

  const labelCb = document.getElementById('showTimeLabelCheckbox');
  const clockCb = document.getElementById('showClockCheckbox');
  const fontSel = document.getElementById('scheduleFontSelect');
  const sizeSel = document.getElementById('scheduleFontSizeSelect');

  if (labelCb) labelCb.checked = scheduleViewConfig.showLabels;
  if (clockCb) clockCb.checked = scheduleViewConfig.showClock;
  if (fontSel) fontSel.value = scheduleViewConfig.font || 'standard';
  if (sizeSel) sizeSel.value = scheduleViewConfig.fontSize || 'large';

  const days = [
    { key: 'mandag', name: 'Man' },
    { key: 'tirsdag', name: 'Tir' },
    { key: 'onsdag', name: 'Ons' },
    { key: 'torsdag', name: 'Tor' },
    { key: 'fredag', name: 'Fre' }
  ];

  let dayNav = document.getElementById('planDayNav');
  if (!dayNav) {
    dayNav = document.createElement('div');
    dayNav.id = 'planDayNav';
    dayNav.style.cssText = "display: flex; gap: 6px; margin-bottom: 12px;";
    table.parentNode.insertBefore(dayNav, table);
  }

  let dayNavHTML = '';
  days.forEach(d => {
    const isSel = d.key === editingDay;
    dayNavHTML += `
      <button type="button" onclick="switchEditDay('${d.key}')" 
              style="flex:1; padding:8px 4px; font-weight:bold; cursor:pointer; font-size:12px;
                     border:1px solid #cbd5e1; border-radius:6px; 
                     background:${isSel ? '#8b5cf6' : '#f1f5f9'}; 
                     color:${isSel ? '#fff' : '#334155'};">
        ${d.name}
      </button>`;
  });
  dayNav.innerHTML = dayNavHTML;

  let tableHTML = `
    <thead>
      <tr style="font-weight:bold; background:#f0f4f8;">
        <th style="padding:8px; text-align:center; border-bottom:1px solid #cbd5e1; width:24px;"></th>
        <th style="padding:8px; text-align:left; border-bottom:1px solid #cbd5e1;">Økt</th>
        <th style="padding:8px; text-align:left; border-bottom:1px solid #cbd5e1;">Start / Slutt</th>
        <th style="padding:8px; text-align:left; border-bottom:1px solid #cbd5e1;">Fag / Aktivitet</th>
        <th style="padding:8px; text-align:center; border-bottom:1px solid #cbd5e1; width:30px;"></th>
      </tr>
    </thead>
    <tbody>
  `;

  const currentSlots = weekSchedule[editingDay] || [];
  currentSlots.forEach((slot, index) => {
    let options = `<option value="">-- Ingen fag valgt --</option>`;
    options += `<option value="__CUSTOM__">✏️ Skriv fag selv...</option>`;
    
    availableImages.forEach(imgName => {
      const fileName = `${imgName}.png`;
      const selected = (slot.img === fileName && !slot.customSubject) ? 'selected' : '';
      options += `<option value="${fileName}" ${selected}>${imgName}</option>`;
    });

    if (slot.customSubject) {
      options += `<option value="CUSTOM:${slot.customSubject}|${slot.img}" selected>🌟 ${slot.customSubject}</option>`;
    }

    const isFirst = index === 0;
    const isLast = index === currentSlots.length - 1;

    tableHTML += `
      <tr>
        <!-- PILER FOR Å FLYTTE OPP/NED -->
        <td style="padding:4px 2px; border-bottom:1px solid #f1f5f9; text-align:center;">
          <div style="display:flex; flex-direction:column; align-items:center; gap:1px;">
            <button type="button" onclick="moveSlot(${index}, -1)" ${isFirst ? 'disabled style="opacity:0.15; cursor:default; border:none; background:none; padding:0; line-height:1;"' : 'style="border:none; background:none; cursor:pointer; font-size:10px; padding:0; line-height:1; color:#475569;"'} title="Flytt opp">▲</button>
            <button type="button" onclick="moveSlot(${index}, 1)" ${isLast ? 'disabled style="opacity:0.15; cursor:default; border:none; background:none; padding:0; line-height:1;"' : 'style="border:none; background:none; cursor:pointer; font-size:10px; padding:0; line-height:1; color:#475569;"'} title="Flytt ned">▼</button>
          </div>
        </td>
        <td style="padding:6px; border-bottom:1px solid #f1f5f9;">
          <input type="text" id="label_${slot.id}" value="${slot.label || ''}" style="width:75px; padding:3px; font-size:12px; border:1px solid #cbd5e1; border-radius:4px; font-weight:bold;">
        </td>
        <td style="padding:6px; border-bottom:1px solid #f1f5f9; white-space:nowrap;">
          <input type="time" id="start_${slot.id}" value="${slot.start}" style="padding:3px; font-size:12px; border:1px solid #cbd5e1; border-radius:4px;"> - 
          <input type="time" id="end_${slot.id}" value="${slot.end}" style="padding:3px; font-size:12px; border:1px solid #cbd5e1; border-radius:4px;">
        </td>
        <td style="padding:6px; border-bottom:1px solid #f1f5f9;">
          <select id="select_${slot.id}" onchange="handleSubjectChange('${slot.id}')" style="width:100%; padding:3px; font-size:12px; border:1px solid #cbd5e1; border-radius:4px;">
            ${options}
          </select>
        </td>
        <td style="padding:6px; border-bottom:1px solid #f1f5f9; text-align:center;">
          <button type="button" onclick="removeSlot('${slot.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:bold; font-size:14px;" title="Slett økt">✕</button>
        </td>
      </tr>
    `;
  });

  tableHTML += `</tbody>`;
  table.innerHTML = tableHTML;
}

function moveSlot(index, direction) {
  saveCurrentEditState();
  const slots = weekSchedule[editingDay];
  if (!slots) return;

  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= slots.length) return;

  const temp = slots[index];
  slots[index] = slots[targetIndex];
  slots[targetIndex] = temp;

  buildPlanEditor();
}

// Håndterer valg i nedtrekksmenyene
function handleSubjectChange(slotId) {
  const select = document.getElementById(`select_${slotId}`);
  if (!select) return;

  if (select.value === '__CUSTOM__') {
    targetSlotIdForCustom = slotId;
    openCustomSubjectModal();
    select.value = ""; // Tilbakestill inntil brukeren lagrer
  }
}

// Åpner modalen for egendefinert fag og fyller bilde-valgene
function openCustomSubjectModal() {
  const modal = document.getElementById('customSubjectModal');
  const imgSelect = document.getElementById('customSubjectImgSelect');
  const inputName = document.getElementById('customSubjectInput');
  const inputUrl = document.getElementById('customSubjectUrlInput');
  const inputFile = document.getElementById('customSubjectFileInput');

  if (inputName) inputName.value = '';
  if (inputUrl) inputUrl.value = '';
  if (inputFile) inputFile.value = '';

  if (imgSelect) {
    imgSelect.innerHTML = `<option value="">-- Ingen bilde --</option>`;
    availableImages.forEach(img => {
      imgSelect.innerHTML += `<option value="${img}.png">${img}</option>`;
    });
  }

  if (modal) {
    modal.style.display = 'flex';
  }
}

// Lagrer det egendefinerte faget fra modalen
function confirmCustomSubject() {
  const inputName = document.getElementById('customSubjectInput');
  const imgSelect = document.getElementById('customSubjectImgSelect');
  const inputUrl = document.getElementById('customSubjectUrlInput');
  const inputFile = document.getElementById('customSubjectFileInput');

  const subjectName = inputName ? inputName.value.trim() : '';
  if (!subjectName) {
    alert("Vennligst skriv inn et navn på faget.");
    return;
  }

  let finalImg = imgSelect ? imgSelect.value : '';

  if (inputUrl && inputUrl.value.trim() !== '') {
    finalImg = inputUrl.value.trim();
  }

  // Sjekk om brukeren har lastet opp en fil
  if (inputFile && inputFile.files && inputFile.files[0]) {
    const reader = new FileReader();
    reader.onload = function (e) {
      finalImg = e.target.result; // Konverter til data-URL base64
      applyCustomSubjectToSlot(subjectName, finalImg);
    };
    reader.readAsDataURL(inputFile.files[0]);
  } else {
    applyCustomSubjectToSlot(subjectName, finalImg);
  }
}

function applyCustomSubjectToSlot(subjectName, imgValue) {
  if (targetSlotIdForCustom) {
    const slot = weekSchedule[editingDay].find(s => s.id === targetSlotIdForCustom);
    if (slot) {
      slot.customSubject = subjectName;
      slot.img = imgValue;
    }
  }

  closeModal('customSubjectModal');
  buildPlanEditor();
}

function switchEditDay(dayKey) {
  saveCurrentEditState();
  editingDay = dayKey;
  buildPlanEditor();
}

function saveCurrentEditState() {
  const currentSlots = weekSchedule[editingDay];
  if (!currentSlots) return;

  currentSlots.forEach(slot => {
    const labelInput = document.getElementById(`label_${slot.id}`);
    const startInput = document.getElementById(`start_${slot.id}`);
    const endInput = document.getElementById(`end_${slot.id}`);
    const select = document.getElementById(`select_${slot.id}`);

    if (labelInput) {
      slot.label = labelInput.value;
    }

    if (startInput && endInput) {
      slot.start = startInput.value;
      slot.end = endInput.value;
      slot.time = `${slot.start.replace(':', '.')} - ${slot.end.replace(':', '.')}`;
    }
    if (select) {
      const val = select.value;
      if (val.startsWith('CUSTOM:')) {
        const parts = val.replace('CUSTOM:', '').split('|');
        slot.customSubject = parts[0];
        slot.img = parts[1] || '';
      } else if (val !== '__CUSTOM__') {
        slot.customSubject = '';
        slot.img = val;
      }
    }
  });
}

function saveSchedule() {
  saveCurrentEditState();
  saveState('dagsplanUkesplan', weekSchedule);
  renderSchedule();
  closeModal('planModal');
}

function clearSchedule() {
  if (confirm("Vil du tømme ukesplanen og tilbakestille alle tider og fag for hele uken?")) {
    localStorage.removeItem('dagsplanUkesplan');
    weekSchedule = createDefaultWeek();
    renderSchedule();
    buildPlanEditor();
  }
}

function changeActiveDay(dayName) {
  activeDay = dayName;
  renderSchedule();
}

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

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
  const backdrop = document.getElementById('customModalBackdrop');
  // Lukk backdrop kun hvis ingen andre modaler er åpne
  const openModals = document.querySelectorAll('.floating-modal[style*="display: flex"]');
  if (backdrop && openModals.length === 0) {
    backdrop.style.display = 'none';
  }
}

function toggleModalBackdrop() {
  const backdrop = document.getElementById('customModalBackdrop');
  if (backdrop) {
    backdrop.classList.toggle('transparent-backdrop');
  }
}

// Åpne modalen for tømmingsvalg
function openResetModal() {
  saveCurrentEditState();
  const modal = document.getElementById('resetOptionsModal');
  if (modal) modal.style.display = 'block';
}

// Håndtere de fire ulike valgene
function executeReset(action) {
  const days = ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag'];

  if (action === 'clearDay') {
    if (weekSchedule[editingDay]) {
      weekSchedule[editingDay].forEach(slot => {
        const isPause = slot.customSubject === "Friminutt" || slot.customSubject === "Spising";
        if (!isPause) {
          slot.customSubject = "";
          slot.img = "";
        }
      });
    }
  } 
  else if (action === 'resetDay') {
    if (confirm(`Vil du tilbakestille ${editingDay} til standard oppsett?`)) {
      weekSchedule[editingDay] = JSON.parse(JSON.stringify(defaultDayStructure));
    } else {
      return;
    }
  } 
  else if (action === 'clearAll') {
    days.forEach(d => {
      if (weekSchedule[d]) {
        weekSchedule[d].forEach(slot => {
          const isPause = slot.customSubject === "Friminutt" || slot.customSubject === "Spising";
          if (!isPause) {
            slot.customSubject = "";
            slot.img = "";
          }
        });
      }
    });
  } 
  else if (action === 'resetAll') {
    if (confirm("Vil du tilbakestille HELE ukeplanen til standard oppsett?")) {
      days.forEach(d => {
        weekSchedule[d] = JSON.parse(JSON.stringify(defaultDayStructure));
      });
    } else {
      return;
    }
  }

  closeModal('resetOptionsModal');
  buildPlanEditor();
  if (typeof renderSchedule === 'function') {
    renderSchedule();
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

  // Skjuler aktivitetsvisningen dersom den er aktiv
  if (typeof nullstillAktivitetsVisning === 'function') {
    nullstillAktivitetsVisning();
  }
  
  let embedUrl = url;
  if (embedUrl.includes('docs.google.com') && embedUrl.includes('/edit')) {
    embedUrl = embedUrl.replace(/\/edit.*$/, '/preview');
  }

  const iframe = document.getElementById('mainFrame');
  if (iframe) {
    try {
      // Endrer kun src direkte – unngår å lese contentWindow/contentDocument
      iframe.src = embedUrl;
    } catch (e) {
      console.warn("Blokkert av file:// sikkerhetspolicy:", e);
    }
  }

  // Håndtering av hjelpelinje for eksterne lenker
  const fallbackBox = document.getElementById('iframeFallbackNotice');
  const fallbackLink = document.getElementById('fallbackExternalLink');
  
  if (fallbackBox && fallbackLink) {
    const isInternal = embedUrl.startsWith('data:') || 
                       embedUrl.toLowerCase().includes('.html') || 
                       embedUrl === 'about:blank' || 
                       embedUrl.includes('docs.google.com');
    
    if (!isInternal) {
      fallbackLink.href = embedUrl;
      fallbackBox.style.display = 'grid';
    } else {
      fallbackBox.style.display = 'none';
    }
  }

  try {
    saveState('activeIframeUrl', embedUrl);
  } catch (err) {
    console.warn("Lagring mislyktes:", err);
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

  // Tømmer lenketabellen slik at den kan bygges på nytt ved neste åpning
  if (id === 'linkModal') {
    const table = document.getElementById('linkEditTable');
    if (table) table.innerHTML = '';
  }

  // Skjul bakgrunnen KUN hvis ingen andre modaler fortsatt er åpne
  const openModals = document.querySelectorAll('.floating-modal[style*="display: flex"]');
  if (openModals.length === 0) {
    const backdrop = document.getElementById('customModalBackdrop');
    if (backdrop) backdrop.style.display = 'none';
  }
}

function toggleModalBackdrop(modalId) {
  // Sjekker først om det er sendt med en ID, ellers henger den på selve modalen eller backdrop
  const modal = modalId ? document.getElementById(modalId) : null;
  const backdrop = document.getElementById('customModalBackdrop') || document.querySelector('.modal-backdrop');

  if (modal) {
    modal.classList.toggle('hide-backdrop');
  }
  if (backdrop) {
    backdrop.classList.toggle('transparent-backdrop');
  }
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
  
  // Aktiverer flytting (drag) for modalen når den åpnes
  const modal = document.getElementById('filePickerModal');
  const header = document.getElementById('filePickerHeader');
  if (typeof makeModalDraggable === 'function' && modal && header) {
    makeModalDraggable(modal, header);
  }
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

  // Automatisk omformatering av Google-lenker slik at de tillates i iframe
  if (url.includes('docs.google.com')) {
    if (url.includes('/edit')) {
      url = url.replace(/\/edit.*$/, '/preview');
    } else if (url.includes('/view')) {
      url = url.replace(/\/view.*$/, '/preview');
    } else if (!url.includes('/preview')) {
      url = url.replace(/\/$/, '') + '/preview';
    }
  } else if (url.includes('drive.google.com/file/d/')) {
    url = url.replace(/\/view.*$/, '/preview');
  }

  // Sender lenken til iframe
  if (typeof setAndSaveIframeUrl === 'function') {
    setAndSaveIframeUrl(url);
  } else {
    const iframe = document.getElementById('mainFrame');
    if (iframe) iframe.src = url;
  }

  urlInput.value = "";
  closeFilePickerModal();
}

function aapnGoogleDrive() {
  window.open('https://drive.google.com', '_blank');
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

/* --- EKTE FULLSKJERM FOR HELE NETTSIDEN (F11-EFFEKT) --- */
function togglePageFullscreen() {
  if (!document.fullscreenElement) {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen();
    } else if (docEl.webkitRequestFullscreen) {
      docEl.webkitRequestFullscreen();
    } else if (docEl.msRequestFullscreen) {
      docEl.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}

// Oppdaterer teksten på knappen automatisk
document.addEventListener('fullscreenchange', updatePageFullscreenBtn);
document.addEventListener('webkitfullscreenchange', updatePageFullscreenBtn);
document.addEventListener('msfullscreenchange', updatePageFullscreenBtn);

function updatePageFullscreenBtn() {
  const btn = document.getElementById('pageFullscreenBtn');
  if (!btn) return;

  if (document.fullscreenElement) {
    btn.innerHTML = '🗗 Avslutt fullskjerm';
  } else {
    btn.innerHTML = '🖥️ Fullskjerm';
  }
}

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
    
    // Aktiv knapp (Admin) -> Grønn
    if (adminBtn) {
      adminBtn.classList.add('active');
      adminBtn.style.setProperty('background-color', '#4CAF50', 'important');
      adminBtn.style.setProperty('color', '#ffffff', 'important');
    }
    // Inaktiv knapp (Visning) -> Nøytral grå
    if (studentBtn) {
      studentBtn.classList.remove('active');
      studentBtn.style.setProperty('background-color', '#f1f5f9', 'important');
      studentBtn.style.setProperty('color', '#475569', 'important');
    }
  } else {
    if (adminTab) adminTab.style.display = 'none';
    if (studentTab) studentTab.style.display = 'block';
    
    // Aktiv knapp (Visning) -> Grønn
    if (studentBtn) {
      studentBtn.classList.add('active');
      studentBtn.style.setProperty('background-color', '#4CAF50', 'important');
      studentBtn.style.setProperty('color', '#ffffff', 'important');
    }
    // Inaktiv knapp (Admin) -> Nøytral grå
    if (adminBtn) {
      adminBtn.classList.remove('active');
      adminBtn.style.setProperty('background-color', '#f1f5f9', 'important');
      adminBtn.style.setProperty('color', '#475569', 'important');
    }
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

function closeTimerModal() {
  const modal = document.getElementById('timerModal'); // Legg merke til 'r' i timerModal
  const backdrop = document.getElementById('customModalBackdrop') || document.querySelector('.modal-backdrop');

  // Stopp timerkjøring og alarmer
  if (typeof stopTimerProcess === 'function') stopTimerProcess();
  if (typeof stopAlarmEffects === 'function') stopAlarmEffects();

  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('active');
  }

  if (backdrop) {
    backdrop.style.display = 'none';
    backdrop.classList.remove('active', 'transparent-backdrop');
  }
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

function closeTimeModal() {
  // 1. Stopp timeren og slå av alarmer
  stopTimerProcess();
  stopAlarmEffects();

  // 2. Hent inn elementene
  const modal = document.getElementById('timerModal');
  const backdrop = document.getElementById('customModalBackdrop');

  // 3. Skjul selve tidsur-vinduet
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }

  // 4. Skjul den mørke bakgrunnen
  if (backdrop) {
    backdrop.classList.remove('active');
    backdrop.style.display = 'none';
  }
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

/* --- AUTO-BYGG MODAL NÅR DEN VISES --- */
document.addEventListener('DOMContentLoaded', () => {
  const linkModal = document.getElementById('linkModal');
  
  if (linkModal) {
    // Fanger opp når modalen endrer style (f.eks. fra display:none til display:flex)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'style') {
          const isVisible = window.getComputedStyle(linkModal).display !== 'none';
          if (isVisible) {
            buildLinkEditor();
          }
        }
      });
    });
  }
});



/* --- MENYER (HJEM, SKJERMSPARER & INNSTILLINGER) --- */

// Vis/skjul Hjem-meny
function toggleHomeMenu(event) {
  if (event) event.stopPropagation();
  const homeDropdown = document.getElementById('homeDropdown');
  const settingsDropdown = document.getElementById('settingsDropdown');
  
  if (settingsDropdown) settingsDropdown.style.display = 'none';
  if (homeDropdown) {
    const isVisible = homeDropdown.style.display === 'block';
    homeDropdown.style.display = isVisible ? 'none' : 'block';
  }
}

// Vis/skjul Innstillinger-meny
function toggleSettingsMenu(event) {
  if (event) event.stopPropagation();
  const homeDropdown = document.getElementById('homeDropdown');
  const settingsDropdown = document.getElementById('settingsDropdown');
  
  if (homeDropdown) homeDropdown.style.display = 'none';
  if (settingsDropdown) {
    const isVisible = settingsDropdown.style.display === 'block';
    settingsDropdown.style.display = isVisible ? 'none' : 'block';
  }
}

// Lukker alle menyene automatisk ved klikk utenfor
window.addEventListener('click', function() {
  const homeDropdown = document.getElementById('homeDropdown');
  const settingsDropdown = document.getElementById('settingsDropdown');
  if (homeDropdown) homeDropdown.style.display = 'none';
  if (settingsDropdown) settingsDropdown.style.display = 'none';
});

// Hjelpefunksjon for å gå Hjem
function triggerGoHome() {
  if (typeof nullstillAktivitetsVisning === 'function') {
    nullstillAktivitetsVisning();
  }
  if (typeof goHome === 'function') {
    goHome();
  } else {
    const iframe = document.getElementById('mainIframe') || document.querySelector('iframe');
    if (iframe) iframe.src = 'hjem.html';
  }
}

// Åpner valgt visning i iframe (bilde, sort skjerm eller whiteboard)
function openScreensaver(type) {
  if (typeof nullstillAktivitetsVisning === 'function') {
    nullstillAktivitetsVisning();
  }

  const iframe = document.getElementById('mainIframe') || document.querySelector('iframe');
  if (iframe) {
    if (type === 'sort') {
      iframe.src = 'about:blank';
      iframe.onload = function() {
        try {
          iframe.contentDocument.body.style.backgroundColor = '#000000';
          iframe.contentDocument.body.style.margin = '0';
        } catch(e) {
          iframe.style.backgroundColor = '#000000';
        }
      };
      iframe.style.backgroundColor = '#000000';
    } else if (type === 'whiteboard') {
      iframe.style.backgroundColor = '';
      iframe.onload = null;
      iframe.src = 'whiteboard.html';
    } else {
      iframe.style.backgroundColor = '';
      iframe.onload = null;
      iframe.src = 'skjermsparer.html';
    }
  }
}



/* --- TID - KLOKKEMODAL --- */
let timeModalInterval = null;

// Oversikt over merkedager på primstaven (MM-DD)
const primstavDager = {
  '01-01': { navn: 'Nyttårsdag (Årsdag)', desc: 'Starten på det nye året. Været i dag varslet om hele årets avling.' },
  '01-13': { navn: 'Tyvendedag jul', desc: 'Siste dag av julen. «Knut jager julen ut» med feiekosten.' },
  '02-02': { navn: 'Kyndelsmesse', desc: 'Lysmesse. Halvparten av vinterfôret til dyrene bør være igjen.' },
  '03-21': { navn: 'Vårjevndøgn (Vårfruemesse)', desc: 'Dag og natt er like lange. Bekker begynner å tine.' },
  '04-14': { navn: 'Sommarmål (Sommerdag)', desc: 'Første dag på primstavens sommerside! Nå starter sommerhalvåret.' },
  '04-23': { navn: 'Jørgensdag', desc: 'Vernedag for husdyrene før de slippes ut på beite.' },
  '05-03': { navn: 'Korsmesse vår', desc: 'Budeiene begynner forberedelsene til å flytte på setra.' },
  '06-24': { navn: 'Sankthans (Jonsok)', desc: 'Midtsommer. Nå snur solen og dagene blir sakte kortere.' },
  '07-29': { navn: 'Olsok', desc: 'Minne om Olav den hellige. Skuronna (skjæring av kornet) starter.' },
  '08-10': { navn: 'Larsok', desc: 'Hvis det regner i dag, blir det en fuktig høst.' },
  '08-24': { navn: 'Barsok', desc: 'Første høstdag i folketroen. Seterjentene gjør seg klare til heimreise.' },
  '09-21': { navn: 'Matteusmesse', desc: 'Innhøstingen av epler, nøtter og rotfrukter må være ferdig.' },
  '09-29': { navn: 'Mikkelsmess', desc: 'Innhøstingen feires! Nå skal alt korn og avling være i hus.' },
  '10-14': { navn: 'Vinterdag (Vinternatt)', desc: 'Første dag på primstavens vinterside! Nå starter vinterhalvåret.' },
  '11-01': { navn: 'Helgemesse (Allehelgensdag)', desc: 'Sjekk seil og båter – nå begynner de store høststormene.' },
  '11-25': { navn: 'Kari med rokken (Katarinadag)', desc: 'Nå må julespinningen og forberedelsene til julestria starte.' },
  '12-13': { navn: 'Lussinatt', desc: 'Årets lengste og skumleste natt ifølge den gamle kalenderen.' },
  '12-21': { navn: 'Tomas brygger', desc: 'Nå skal juleølet være ferdig brygget og smakt på.' },
  '12-25': { navn: 'Første juledag', desc: 'Stor helgedag. Vinden i dag forteller hvor stormfullt året blir.' }
};

function openTimeModal() {
  const modal = document.getElementById('timeModal');
  const backdrop = document.getElementById('customModalBackdrop') || document.querySelector('.modal-backdrop');
  const header = document.getElementById('timeModalHeader') || modal?.querySelector('.info-modal-header') || modal?.querySelector('.modal-header');

  if (modal) {
    // 1. Vis modal og plasser sentrert (Tilpasset 920px bredde)
    modal.style.display = 'flex';
    modal.classList.add('active');
    modal.style.top = '6vh';
    modal.style.left = 'calc(50vw - 460px)';

    // 2. Vis mørk bakgrunn
    if (backdrop) {
      backdrop.style.display = 'block';
      backdrop.classList.add('active');
      backdrop.classList.remove('transparent-backdrop');
    }

    // 3. Start klokke og oppdater detaljer
    updateTimeModalDetails();
    if (timeModalInterval) clearInterval(timeModalInterval);
    timeModalInterval = setInterval(updateTimeModalDetails, 1000);

    // 4. Aktiver dragging på selve modalen
    if (header) {
      makeElementDraggable(modal, header);
    }
  }
}

function closeTimeModal(e) {
  const modal = document.getElementById('timeModal');
  const backdrop = document.getElementById('customModalBackdrop') || document.querySelector('.modal-backdrop');

  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('active');
  }

  if (backdrop) {
    backdrop.style.display = 'none';
    backdrop.classList.remove('active', 'transparent-backdrop');
  }

  if (timeModalInterval) {
    clearInterval(timeModalInterval);
  }
}

function toggleModalBackdrop() {
  const backdrop = document.getElementById('customModalBackdrop') || document.querySelector('.modal-backdrop');
  if (backdrop) {
    backdrop.classList.toggle('transparent-backdrop');
  }
}

function updateTimeModalDetails() {
  const now = new Date();

  // 1. Ukedag, Dato og Ukenummer
  const rawDay = now.toLocaleDateString('nb-NO', { weekday: 'long' });
  const dayName = rawDay.charAt(0).toUpperCase() + rawDay.slice(1);
  const fullDate = `${now.getDate()}. ${now.toLocaleDateString('nb-NO', { month: 'long' })} ${now.getFullYear()}`;
  const weekNum = typeof getWeekNumber === 'function' ? getWeekNumber(now) : '';

  const dayEl = document.getElementById('modalDayName');
  if (dayEl) dayEl.innerText = dayName;

  const dateEl = document.getElementById('timeModalFullDate');
  if (dateEl) dateEl.innerText = fullDate;

  const weekEl = document.getElementById('modalWeekNumber');
  if (weekEl) weekEl.innerText = `Uke ${weekNum}`;

  const headerSub = document.getElementById('modalHeaderSub');
  if (headerSub) headerSub.innerText = `${dayName} ${fullDate} • Uke ${weekNum}`;

  // 2. Digital Klokke med sekunder
  const digitalClock = document.getElementById('modalDigitalClock');
  if (digitalClock) digitalClock.innerText = now.toLocaleTimeString('nb-NO');

  // 3. Viser på Analog Klokke
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();

  const secDeg = (seconds / 60) * 360;
  const minDeg = ((minutes + seconds / 60) / 60) * 360;
  const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;

  const secEl = document.getElementById('clockSecond');
  const minEl = document.getElementById('clockMinute');
  const hourEl = document.getElementById('clockHour');

  if (secEl) secEl.style.transform = `rotate(${secDeg}deg)`;
  if (minEl) minEl.style.transform = `rotate(${minDeg}deg)`;
  if (hourEl) hourEl.style.transform = `rotate(${hourDeg}deg)`;

  // 4. Astronomi-info
  const sunriseEl = document.getElementById('modalSunrise');
  const sunsetEl = document.getElementById('modalSunset');
  if (sunriseEl) sunriseEl.innerText = "06:32";
  if (sunsetEl) sunsetEl.innerText = "20:15";

  if (typeof updateMoonPhaseSvg === 'function') {
    updateMoonPhaseSvg(now);
  }

  // 5. Oppdater Primstav
  oppdaterPrimstav(now);

  // 6. Oppdater Ukens Sitat (fra sitat.js)
  if (typeof oppdaterUkensSitat === 'function') {
    oppdaterUkensSitat(now);
  }
}

// Slår opp merkedag på primstaven
function oppdaterPrimstav(dato) {
  const m = String(dato.getMonth() + 1).padStart(2, '0');
  const d = String(dato.getDate()).padStart(2, '0');
  const nokkel = `${m}-${d}`;

  const nameEl = document.getElementById('modalPrimstavName');
  const descEl = document.getElementById('modalPrimstavDesc');

  if (!nameEl || !descEl) return;

  if (primstavDager[nokkel]) {
    nameEl.textContent = primstavDager[nokkel].navn;
    descEl.textContent = primstavDager[nokkel].desc;
  } else {
    // Sjekker om vi er i sommerhalvåret (14. april - 13. oktober)
    const mNum = dato.getMonth() + 1;
    const dNum = dato.getDate();
    const erSommer = (mNum > 4 || (mNum === 4 && dNum >= 14)) && (mNum < 10 || (mNum === 10 && dNum < 14));
    
    nameEl.textContent = erSommer ? 'Sommerhalvår' : 'Vinterhalvår';
    descEl.textContent = erSommer 
      ? 'Primstaven viser sommersiden (løvtre-symbolikk).' 
      : 'Primstaven viser vintersiden (snø-/snaufjell-symbolikk).';
  }
}

// Beregner ukenummer (ISO-8601)
function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

// Dynamisk SVG-tegning for månefasen
function updateMoonPhaseSvg(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const c = Math.floor(365.25 * year) + Math.floor(365.25 * month) + day;
  const phase = (c - 2451549.5) % 29.53;
  const normalizedPhase = phase < 0 ? phase + 29.53 : phase;

  const path = document.getElementById('moonPhasePath');
  const textEl = document.getElementById('modalMoonPhaseText');
  if (!path || !textEl) return;

  const phaseRatio = normalizedPhase / 29.53;
  const illum = 0.5 * (1 - Math.cos(2 * Math.PI * phaseRatio));
  const r = 14;

  let d = "";
  if (phaseRatio <= 0.5) {
    const rx = Math.abs(r * (1 - 2 * illum));
    const sweep = illum < 0.5 ? 0 : 1;
    d = `M 16 2 A 14 14 0 0 1 16 30 A ${rx} 14 0 0 ${sweep} 16 2`;
  } else {
    const rx = Math.abs(r * (1 - 2 * illum));
    const sweep = illum > 0.5 ? 1 : 0;
    d = `M 16 2 A ${rx} 14 0 0 ${sweep} 16 30 A 14 14 0 0 1 16 2`;
  }

  path.setAttribute('d', d);

  if (normalizedPhase < 1.84) textEl.innerText = "Nymåne";
  else if (normalizedPhase < 5.53) textEl.innerText = "Voksende sigd";
  else if (normalizedPhase < 9.22) textEl.innerText = "Halvmåne (1. kvarter)";
  else if (normalizedPhase < 12.91) textEl.innerText = "Voksende måneskinn";
  else if (normalizedPhase < 16.61) textEl.innerText = "Fullmåne";
  else if (normalizedPhase < 20.30) textEl.innerText = "Minkende måneskinn";
  else if (normalizedPhase < 23.99) textEl.innerText = "Halvmåne (siste kvarter)";
  else if (normalizedPhase < 27.68) textEl.innerText = "Minkende sigd";
  else textEl.innerText = "Nymåne";
}

// Gjør modalen flyttbar fra headeren
function makeElementDraggable(elmnt, header) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  if (header) {
    header.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

    e = e || window.event;
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
    elmnt.style.position = 'fixed';
    elmnt.style.margin = '0';
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}



// --- INNSTILLINGER, FONT & VISNINGSSTYRING ---

// 1. Font- og størrelsesfunksjoner
function brukerByttFont(fontValg) {
  if (fontValg === 'trykkskrift') {
    document.body.classList.add('bruker-trykkskrift');
  } else {
    document.body.classList.remove('bruker-trykkskrift');
  }
}

function brukerByttFontSize(sizeValg) {
  document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
  document.body.classList.add('font-size-' + sizeValg);
}

// 2. Åpne innstillinger-modal og les ut nåværende status
function aepneInnstillinger() {
  const fontSelect = document.getElementById('fontSelect');
  const fontSizeSelect = document.getElementById('fontSizeSelect');
  
  if (fontSelect) fontSelect.value = localStorage.getItem('valgtFont') || 'standard';
  if (fontSizeSelect) fontSizeSelect.value = localStorage.getItem('valgtFontSize') || 'medium';

  // Nattmodus status
  const darkInput = document.getElementById('toggleDarkMode');
  if (darkInput) {
    darkInput.checked = document.body.classList.contains('dark-mode');
  }
  
  // Dagsplan status (.sidebar-right)
  const scheduleInput = document.getElementById('toggleSchedule');
  const rightSidebar = document.querySelector('.sidebar-right');
  if (scheduleInput && rightSidebar) {
    scheduleInput.checked = !rightSidebar.classList.contains('hidden');
  }

  // Venstremeny status (.sidebar)
  const sidebarInput = document.getElementById('toggleSidebar');
  const sidebar = document.querySelector('.sidebar');
  if (sidebarInput && sidebar) {
    sidebarInput.checked = !sidebar.classList.contains('hidden');
  }

  openModal('innstillingerModal');
}

// 3. Lagre innstillinger (Gjenbruker eksisterende toggle-funksjoner)
function lagreInnstillinger() {
  // Font og størrelse
  const fontValg = document.getElementById('fontSelect').value;
  const sizeValg = document.getElementById('fontSizeSelect').value;
  brukerByttFont(fontValg);
  brukerByttFontSize(sizeValg);
  localStorage.setItem('valgtFont', fontValg);
  localStorage.setItem('valgtFontSize', sizeValg);

  // A. Nattmodus
  const wantDark = document.getElementById('toggleDarkMode')?.checked;
  const isDark = document.body.classList.contains('dark-mode');
  if (wantDark !== isDark) {
    toggleDisplayMode('dark-mode');
  }

  // B. Dagsplan (.sidebar-right)
  const wantSchedule = document.getElementById('toggleSchedule')?.checked;
  const rightSidebar = document.querySelector('.sidebar-right');
  const isScheduleVisible = rightSidebar && !rightSidebar.classList.contains('hidden');
  if (wantSchedule !== isScheduleVisible) {
    toggleHideSchedule();
  }

  // C. Venstremeny (.sidebar)
  const wantSidebar = document.getElementById('toggleSidebar')?.checked;
  const sidebar = document.querySelector('.sidebar');
  const isSidebarVisible = sidebar && !sidebar.classList.contains('hidden');
  if (wantSidebar !== isSidebarVisible) {
    toggleHideMenu();
  }

  closeModal('innstillingerModal');
}

// 4. Avbryt innstillinger
function avbrytInnstillinger() {
  closeModal('innstillingerModal');
}


// Skjuler bildeboksen for aktivitet og viser iFramen igjen
function skjulAktivitetDisplay() {
  const display = document.getElementById('aktivitetDisplay');
  const frame = document.getElementById('mainFrame');
  
  if (display) display.style.display = 'none';
  if (frame) frame.style.display = 'block';
}

/* --- VENSTRESIDE-MENY-LUKKER/ÅPNER--- */
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const arrow = document.getElementById('toggleArrow');
  
  sidebar.classList.toggle('collapsed');
  
  if (sidebar.classList.contains('collapsed')) {
    arrow.textContent = '❯';
  } else {
    arrow.textContent = '❮';
  }
}


/* --- SAMLET OPPSTARTSLOGIKK --- */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderLinks === 'function') renderLinks();
  if (typeof updateClock === 'function') updateClock();
  
  // Oppdaterer dato og setter riktig dag fra kalenderen ved start
  if (typeof updateDates === 'function') updateDates();
  if (typeof renderSchedule === 'function') renderSchedule();

  // Trygg kjøring av modal-oppsett for å forhindre stopp i skriptet lokalt
  if (typeof setupDraggableModals === 'function') {
    try {
      setupDraggableModals();
    } catch (err) {
      console.warn("Kunne ikke initiere modal-drag lokalt:", err);
    }
  }

  // Henting av lagret URL med feilhåndtering for file://
  try {
    if (typeof loadState === 'function') {
      const lastUrl = loadState('activeIframeUrl');
      if (lastUrl) {
        const iframe = document.getElementById('mainFrame');
        if (iframe) iframe.src = lastUrl;
      }
    }
  } catch (err) {
    console.warn("Lese fra localStorage mislyktes lokalt:", err);
  }

  const minInput = document.getElementById('min');
  const secInput = document.getElementById('sec');
  if (minInput && typeof applyInputTime === 'function') minInput.addEventListener('change', applyInputTime);
  if (secInput && typeof applyInputTime === 'function') secInput.addEventListener('change', applyInputTime);

  // Kjører hvert sekund for å holde klokken, datovedlikehold og "NÅ"-markøren oppdatert
  setInterval(() => {
    if (typeof updateClock === 'function') updateClock();
    if (typeof updateDates === 'function') updateDates();
    if (typeof renderSchedule === 'function') renderSchedule();
  }, 1000);
});