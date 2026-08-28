/* --- DYNAMISKE LENKER --- */
let customLinks = [
  { name: "Google", url: "https://www.google.no/index.html", external: true },
  { name: "Wikipedia", url: "https://www.wikipedia.org", external: false },
  { name: "Korartí", url: "https://www.korarti.no/", external: false },
  { name: "Salaby", url: "https://www.salaby.no/", external: false },
  { name: "Skoleregler", url: "https://sites.google.com/ikrs.no/regler", external: true }
];

function renderLinks() {
  const container = document.getElementById('linksContainer');
  if (!container) return;
  container.innerHTML = "";
  customLinks.forEach(link => {
    const a = document.createElement('a');
    a.href = link.url;
    a.target = link.external ? "_blank" : "mainFrame";
    a.innerText = link.name + (link.external ? " ↗" : "");
    container.appendChild(a);
  });
}

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
  renderLinks();
  closeModal('linkModal');
}

/* --- DAGSPLAN LOGIKK --- */
const availableImages = [
  "Arbeidstime", "Bibliotek", "Engelsk", "Forestilling", "Friminutt", 
  "Gym", "Klassens time", "Krle", "Kunst", "Lek", 
  "Matematikk", "Musikk", "Naturfag", "Norsk", "Samfunnsfag", 
  "Samling", "Spising", "Stasjoner", "Stillelesing", "Svømming", "Uteskole"
];

let timeSlots = [
  { id: "t1", label: "1. time", start: "08:30", end: "09:15", time: "08.30 - 09.15", img: "" },
  { id: "t2", label: "Friminutt", start: "09:15", end: "09:30", time: "09.15 - 09.30", img: "Friminutt.png" },
  { id: "t3", label: "2. time", start: "09:30", end: "10:00", time: "09.30 - 10.00", img: "" },
  { id: "t4", label: "3. time", start: "10:00", end: "10:45", time: "10.00 - 10.45", img: "" },
  { id: "t5", label: "Spising", start: "10:45", end: "11:15", time: "10.45 - 11.15", img: "Spising.png" },
  { id: "t6", label: "Friminutt", start: "11:15", end: "11:45", time: "11.15 - 11.45", img: "Friminutt.png" },
  { id: "t7", label: "4. time", start: "11:45", end: "12:15", time: "11.45 - 12.15", img: "" },
  { id: "t8", label: "5. time", start: "12:15", end: "13:15", time: "12.15 - 13.15", img: "" }
];

function updateDates() {
  const now = new Date();
  if (now.getDay() === 1) { // Mandager slutter 13:30
    timeSlots[7].end = "13:30";
    timeSlots[7].time = "12.15 - 13.30";
  }

  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const dateEl = document.getElementById('currentDate');
  const yearEl = document.getElementById('currentYear');
  if (dateEl) dateEl.innerText = now.toLocaleDateString('no-NO', options);
  if (yearEl) yearEl.innerText = now.getFullYear();

  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  
  const dayOfYearEl = document.getElementById('dayOfYear');
  const daysToNYEl = document.getElementById('daysToNY');
  if (dayOfYearEl) dayOfYearEl.innerText = Math.floor(diff / oneDay);

  const nextYear = new Date(now.getFullYear() + 1, 0, 1);
  if (daysToNYEl) daysToNYEl.innerText = Math.ceil((nextYear - now) / oneDay);
}

function isTimeActive(startStr, endStr) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = startStr.split(':').map(Number);
  const [endH, endM] = endStr.split(':').map(Number);
  return currentMinutes >= (startH * 60 + startM) && currentMinutes < (endH * 60 + endM);
}

function renderSchedule() {
  const container = document.getElementById('scheduleDisplay');
  if (!container) return;
  container.innerHTML = "";

  timeSlots.forEach(slot => {
    const isActive = isTimeActive(slot.start, slot.end);
    const isPause = slot.label === "Friminutt" || slot.label === "Spising";
    
    const item = document.createElement('div');
    item.className = `schedule-card ${isPause ? 'pause-card' : ''} ${isActive ? 'active-now' : ''}`;

    let imageHTML = `<span class="schedule-empty">Ikke valgt</span>`;
    let subjectName = "";

    if (slot.img) {
      imageHTML = `<img src="Bilder/${slot.img}" class="schedule-img" alt="${slot.label}">`;
      subjectName = slot.img.replace('.png', '');
    }

    item.innerHTML = `
      <div class="schedule-time">
        <div class="schedule-label">${slot.label}</div>
        <div class="schedule-clock">${slot.time}</div>
        ${subjectName ? `<div class="schedule-subject">${subjectName}</div>` : ''}
        ${isActive ? `<span class="active-badge">NÅ</span>` : ''}
      </div>
      <div class="schedule-img-container">
        ${imageHTML}
      </div>
    `;
    container.appendChild(item);
  });
}

function buildPlanEditor() {
  const table = document.getElementById('planEditTable');
  if (!table) return;
  table.innerHTML = "";

  timeSlots.forEach((slot) => {
    let optionsHTML = `<option value="">-- Velg bilde --</option>`;
    availableImages.forEach(imgName => {
      const filename = imgName + ".png";
      const selected = slot.img === filename ? "selected" : "";
      optionsHTML += `<option value="${filename}" ${selected}>${imgName}</option>`;
    });

    const row = document.createElement('tr');
    row.innerHTML = `
      <td><label>${slot.label}<br><small style="color:#666">${slot.time}</small></label></td>
      <td>
        <select id="select_${slot.id}">
          ${optionsHTML}
        </select>
      </td>
    `;
    table.appendChild(row);
  });
}

function saveSchedule() {
  timeSlots.forEach(slot => {
    const select = document.getElementById(`select_${slot.id}`);
    if (select) slot.img = select.value;
  });
  renderSchedule();
  closeModal('planModal');
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
  const el = document.getElementById(id);
  if (el) {
    el.style.display = 'flex';
    bringToFront(el);
  }
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
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
      isDragging = true;
      offsetX = e.clientX - modal.offsetLeft;
      offsetY = e.clientY - modal.offsetTop;
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

/* --- ÅPNE FILER (PDF/BILDER I FRAME - OFFICE I NYTT VINDU) --- */
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
    const fileURL = URL.createObjectURL(file);
    const iframe = document.getElementById('mainFrame');
    if (iframe) iframe.src = fileURL;
  }
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

/* --- FILOPPLASTING MODAL LOGIKK --- */
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

/* --- GRUPPEGENERATOR LOGIKK --- */
const groupRules = [];
let currentStudents = [];

const namePresets = {
  colors: ["🟥 Rød gruppe", "🟦 Blå gruppe", "🟩 Grønn gruppe", "🟨 Gul gruppe", "🟪 Lilla gruppe", "🟧 Oransje gruppe", "⬜️ Hvit gruppe", "⬛️ Svart gruppe", "🟫 Brun gruppe"],
  animals: ["🦁 Løvene", "🐯 Tigerne", "🐘 Elefantene", "🐬 Delfinene", "🦅 Ørnene", "🐼 Pandaene", "🐺 Ulvene", "🐻 Bjørnene", "🦊 Gaupene", "🦅 Falkene"],
  shapes: ["⭕️ Sirkel", "⬛️ Firkant", "🔺 Trekant", "⭐️ Stjerne", "🔷 Diamant", "🔹 Rombe", "▫️ Kvadrat", "🛑 Åttekant", "🔻 Opp-ned trekant", "💠 Ruter"]
};

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

function checkPin() {
  const pinInput = document.getElementById('pinInput');
  const fileSelectBox = document.getElementById('fileSelectBox');
  const CORRECT_PIN = "4635"; 

  if (pinInput && pinInput.value === CORRECT_PIN) {
    if (fileSelectBox) {
      fileSelectBox.style.display = 'block';
      renderClassCheckboxes();
    }
  } else {
    alert("Feil PIN-kode! Prøv igjen.");
  }
}

function renderClassCheckboxes() {
  const container = document.getElementById('classCheckboxContainer');
  if (!container || !window.classLists) return;

  container.innerHTML = '';
  Object.keys(window.classLists).forEach(className => {
    const label = document.createElement('label');
    label.style.cssText = 'display:flex; align-items:center; gap:4px; cursor:pointer;';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = className;
    checkbox.onchange = updateSelectedClasses;

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(className));
    container.appendChild(label);
  });
}

function updateSelectedClasses() {
  const checkboxes = document.querySelectorAll('#classCheckboxContainer input[type="checkbox"]:checked');
  const textarea = document.getElementById('studentsInput') || document.getElementById('groupStudentsInput');
  
  currentStudents = [];
  const selectedClassNames = Array.from(checkboxes).map(cb => cb.value);
  const isMultiple = selectedClassNames.length > 1;

  checkboxes.forEach(cb => {
    const className = cb.value;
    const list = window.classLists[className] || [];
    
    list.forEach(studentName => {
      currentStudents.push({
        name: studentName,
        className: className,
        displayName: isMultiple ? `${studentName} (${className})` : studentName
      });
    });
  });

  if (textarea) {
    textarea.value = currentStudents.map(s => s.displayName).join('\n');
  }

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
  if (namePresets[namingType]) {
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
    const p1 = rule.p1.toLowerCase();
    const p2 = rule.p2.toLowerCase();

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

/* --- ELEVTREKKER LOGIKK --- */
let drawnStudents = [];

function loadStudentFile(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const el = document.getElementById('studentListInput');
      if (el) el.value = e.target.result;
    };
    reader.readAsText(file);
  }
}

function drawStudents() {
  const inputEl = document.getElementById('studentListInput');
  if (!inputEl) return;
  
  const rawInput = inputEl.value;
  let allStudents = rawInput.split('\n').map(s => s.trim()).filter(s => s.length > 0);

  if (allStudents.length === 0) {
    alert("Vennligst legg til noen elevnavn først!");
    return;
  }

  const rememberCheckbox = document.getElementById('rememberDrawn');
  const remember = rememberCheckbox ? rememberCheckbox.checked : false;
  
  let availableStudents = remember 
    ? allStudents.filter(name => !drawnStudents.includes(name))
    : [...allStudents];

  if (availableStudents.length === 0) {
    alert("Alle elever på listen er allerede trukket! Nullstill historikken for å starte på nytt.");
    return;
  }

  const countEl = document.getElementById('drawCount');
  let count = parseInt(countEl ? countEl.value : 1) || 1;
  count = Math.min(count, availableStudents.length);

  let shuffled = [...availableStudents].sort(() => 0.5 - Math.random());
  let winners = shuffled.slice(0, count);

  if (remember) {
    drawnStudents.push(...winners);
    updateDrawnHistory();
  }

  const winnerEl = document.getElementById('winnerNames');
  const resultBox = document.getElementById('drawResult');
  if (winnerEl) winnerEl.innerHTML = winners.join('<br>');
  if (resultBox) resultBox.style.display = 'block';
}

function updateDrawnHistory() {
  const countBadge = document.getElementById('drawnCount');
  const historyList = document.getElementById('drawnHistoryList');
  if (countBadge) countBadge.innerText = drawnStudents.length;
  if (historyList) {
    historyList.innerText = drawnStudents.length > 0 ? drawnStudents.join(', ') : 'Ingen ennå';
  }
}

function resetDrawnHistory() {
  drawnStudents = [];
  updateDrawnHistory();
  const resultBox = document.getElementById('drawResult');
  if (resultBox) resultBox.style.display = 'none';
}

/* --- TIDSUR LOGIKK --- */
let timer = null;
let totalSeconds = 300;
let initialSeconds = 300;
let isRunning = false;
let currentAudio = null;
let playCount = 0;

function updateTimerDisplay() {
  const display = document.getElementById('timerDisplay');
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (display) display.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function setPreset(minutes) {
  pauseTimer();
  const minInput = document.getElementById('min');
  const secInput = document.getElementById('sec');
  if (minInput) minInput.value = minutes;
  if (secInput) secInput.value = 0;
  applyInputTime();
}

function applyInputTime() {
  const minInput = document.getElementById('min');
  const secInput = document.getElementById('sec');
  const m = parseInt(minInput ? minInput.value : 0) || 0;
  const s = parseInt(secInput ? secInput.value : 0) || 0;
  totalSeconds = m * 60 + s;
  initialSeconds = totalSeconds;
  updateTimerDisplay();
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
  if (totalSeconds <= 0) applyInputTime();
  if (totalSeconds <= 0) return;

  isRunning = true;
  if (startBtn) {
    startBtn.textContent = 'Pause';
    startBtn.style.backgroundColor = '#f39c12';
  }

  timer = setInterval(() => {
    totalSeconds--;
    updateTimerDisplay();

    if (totalSeconds <= 0) {
      clearInterval(timer);
      isRunning = false;
      if (startBtn) {
        startBtn.textContent = 'Start';
        startBtn.style.backgroundColor = '#2ecc71';
      }
      triggerAlarm();
    }
  }, 1000);
}

function pauseTimer() {
  const startBtn = document.getElementById('startBtn');
  clearInterval(timer);
  isRunning = false;
  if (startBtn) {
    startBtn.textContent = 'Start';
    startBtn.style.backgroundColor = '#2ecc71';
  }
}

function resetTimer() {
  pauseTimer();
  totalSeconds = initialSeconds;
  updateTimerDisplay();
}

function testSound() {
  stopAudio();
  const soundTypeSelect = document.getElementById('soundType');
  const soundFile = soundTypeSelect ? soundTypeSelect.value : '';
  currentAudio = new Audio(soundFile);
  currentAudio.play().catch(e => alert("Kunne ikke laste filen: " + soundFile + "\nSjekk at filen ligger i mappen 'Lyder'."));
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
  const soundFile = soundTypeSelect ? soundTypeSelect.value : '';
  const repeatVal = soundRepeatSelect ? soundRepeatSelect.value : '1';

  currentAudio = new Audio(soundFile);

  if (repeatVal === 'loop') {
    currentAudio.loop = true;
  } else {
    const maxRepeats = parseInt(repeatVal);
    currentAudio.addEventListener('ended', function() {
      playCount++;
      if (playCount < maxRepeats) {
        this.currentTime = 0;
        this.play();
      }
    });
  }

  currentAudio.play().catch(e => console.log("Lyd-avspilling blokkert eller fil mangler."));
}

function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

function stopAlarmEffects() {
  const body = document.getElementById('timerModalBody');
  if (body) body.classList.remove('alarm-active');
  stopAudio();
}

function closeAlarmModal() {
  const alarmModal = document.getElementById('alarmModal');
  stopAlarmEffects();
  if (alarmModal) alarmModal.style.display = 'none';
  resetTimer();
}

function restartSameTime() {
  const alarmModal = document.getElementById('alarmModal');
  stopAlarmEffects();
  if (alarmModal) alarmModal.style.display = 'none';
  resetTimer();
  startTimer();
}

/* --- NAVIGASJON LOGIKK --- */
function goHome() {
  const mainFrame = document.getElementById('mainFrame');
  if (mainFrame) {
    mainFrame.src = 'hjem.html';
  }
}

/* LISTENERS & INIT */
window.onload = function() {
  renderLinks();
  updateDates();
  renderSchedule();
  setupDraggableModals();

  const minInput = document.getElementById('min');
  const secInput = document.getElementById('sec');
  if (minInput) minInput.addEventListener('change', applyInputTime);
  if (secInput) secInput.addEventListener('change', applyInputTime);

  setInterval(renderSchedule, 60000);
};