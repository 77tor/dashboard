window.classLists = window.classLists || {};

// Definerer globale variabler trygt
const knownGenders = window.knownGenders || {};
const groupRules = [];
let currentStudents = [];

const namePresets = {
  colors: ["🟥 Rød gruppe", "🟦 Blå gruppe", "🟩 Grønn gruppe", "🟨 Gul gruppe", "🟪 Lilla gruppe", "🟧 Oransje gruppe", "⬜️ Hvit gruppe", "⬛️ Svart gruppe", "🟫 Brun gruppe"],
  animals: ["🦁 Løvene", "🐯 Tigerne", "🐘 Elefantene", "🐬 Delfinene", "🦅 Ørnene", "🐼 Pandaene", "🐺 Ulvene", "🐻 Bjørnene", "🦊 Gaupene", "🦅 Falkene"],
  shapes: ["⭕️ Sirkel", "⬛️ Firkant", "🔺 Trekant", "⭐️ Stjerne", "🔷 Diamant", "🔹 Rombe", "▫️ Kvadrat", "🛑 Åttekant", "🔻 Opp-ned trekant", "💠 Ruter"]
};

// Fisher-Yates hjelpefunksjon for ekte tilfeldig stokking
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

document.addEventListener('DOMContentLoaded', initGroupApp);

function initGroupApp() {
  setGroupDefaults();
  renderClassCheckboxes();
}

function setGroupDefaults() {
  const modeSelect = document.getElementById('modeSelect');
  const numberInput = document.getElementById('numberInput');
  const namingSelect = document.getElementById('namingSelect');

  if (modeSelect) modeSelect.value = 'numGroups';
  if (numberInput) numberInput.value = 3;
  if (namingSelect) namingSelect.value = 'animals';
  
  toggleMode();
}

function switchGroupTab(tab) {
  const adminTab = document.getElementById('adminGroupView');
  const studentTab = document.getElementById('studentGroupView');
  const adminBtn = document.getElementById('tabAdminBtn');
  const studentBtn = document.getElementById('tabStudentBtn');

  if (tab === 'admin') {
    adminTab.style.display = 'block';
    studentTab.style.display = 'none';
    adminBtn.classList.add('active');
    studentBtn.classList.remove('active');
  } else {
    adminTab.style.display = 'none';
    studentTab.style.display = 'block';
    studentBtn.classList.add('active');
    adminBtn.classList.remove('active');
  }
}

function renderClassCheckboxes() {
  const container = document.getElementById('classCheckboxContainer');
  if (!container || !window.classLists) return;

  const savedClasses = JSON.parse(localStorage.getItem('selectedClasses') || '[]');
  container.innerHTML = '';

  Object.keys(window.classLists).forEach(className => {
    const label = document.createElement('label');
    label.style.cssText = 'display:flex; align-items:center; gap:6px; cursor:pointer;';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = className;
    checkbox.className = 'class-checkbox';
    
    if (savedClasses.includes(className)) {
      checkbox.checked = true;
    }

    checkbox.onchange = () => syncAndSaveClasses();

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(className));
    container.appendChild(label);
  });

  if (savedClasses.length > 0) {
    updateSelectedClasses();
  }
}

function syncAndSaveClasses() {
  const selectedClassNames = Array.from(document.querySelectorAll('#classCheckboxContainer input[type="checkbox"]:checked')).map(cb => cb.value);
  localStorage.setItem('selectedClasses', JSON.stringify(selectedClassNames));
  updateSelectedClasses();
}

function updateSelectedClasses() {
  const checkboxes = document.querySelectorAll('#classCheckboxContainer input[type="checkbox"]:checked');
  const groupTextarea = document.getElementById('studentsInput');

  currentStudents = [];
  let nameList = [];

  const selectedClassNames = Array.from(checkboxes).map(cb => cb.value);
  const isMultiple = selectedClassNames.length > 1;

  checkboxes.forEach(cb => {
    const className = cb.value;
    const list = window.classLists[className] || [];
    
    list.forEach(studentName => {
      const gender = knownGenders[studentName] || parseGenderFromName(studentName) || 'u';
      const genderTag = gender === 'g' ? ' (g)' : gender === 'j' ? ' (j)' : '';
      const displayName = isMultiple ? `${studentName}${genderTag} (${className})` : `${studentName}${genderTag}`;

      currentStudents.push({
        name: studentName,
        className: className,
        displayName: displayName,
        gender: gender
      });

      nameList.push(displayName);
    });
  });

  if (groupTextarea) groupTextarea.value = nameList.join('\n');

  const balanceOption = document.getElementById('balanceClassesOption');
  if (balanceOption) {
    balanceOption.style.display = isMultiple ? 'flex' : 'none';
  }

  updateStudentCount();
  renderGenderEditor();
}

function parseGenderFromName(text) {
  const lower = text.toLowerCase();
  if (lower.includes('(g)') || lower.includes('(gutt)') || lower.includes('(boy)')) return 'g';
  if (lower.includes('(j)') || lower.includes('(jente)') || lower.includes('(girl)')) return 'j';
  return null;
}

function cleanStudentName(rawName) {
  // Fjerner alle forekomster av (g), (j), (gutt), (jente), osv.
  return rawName.replace(/\s*\((g|j|gutt|jente|boy|girl)\)/gi, '').trim();
}

function handleStudentsInputChanged() {
  const input = document.getElementById('studentsInput');
  if (!input) return;

  const lines = input.value.split('\n').map(s => s.trim()).filter(s => s.length > 0);

  currentStudents = lines.map(line => {
    const parsedGender = parseGenderFromName(line);
    const cleanName = cleanStudentName(line);

    const gender = parsedGender || knownGenders[cleanName] || 'u';

    return {
      name: cleanName,
      className: '',
      displayName: line,
      gender: gender
    };
  });

  updateStudentCount();
  renderGenderEditor();
}

function renderGenderEditor() {
  const editorList = document.getElementById('genderEditorList');
  if (!editorList) return;

  if (currentStudents.length === 0) {
    editorList.innerHTML = '<div style="font-size: 0.8rem; color: #94a3b8; font-style: italic;">Ingen elever i listen.</div>';
    return;
  }

  editorList.innerHTML = '';
  currentStudents.forEach((student, index) => {
    const row = document.createElement('div');
    row.className = 'gender-row';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = student.name + (student.className ? ` (${student.className})` : '');

    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '4px';

    const btnG = document.createElement('button');
    btnG.type = 'button';
    btnG.className = `gender-btn ${student.gender === 'g' ? 'active-g' : ''}`;
    btnG.textContent = '👦 Gutt';
    btnG.onclick = () => setStudentGender(index, 'g');

    const btnJ = document.createElement('button');
    btnJ.type = 'button';
    btnJ.className = `gender-btn ${student.gender === 'j' ? 'active-j' : ''}`;
    btnJ.textContent = '👧 Jente';
    btnJ.onclick = () => setStudentGender(index, 'j');

    btnContainer.appendChild(btnG);
    btnContainer.appendChild(btnJ);

    row.appendChild(nameSpan);
    row.appendChild(btnContainer);
    editorList.appendChild(row);
  });
}

function setStudentGender(index, gender) {
  if (!currentStudents[index]) return;

  const current = currentStudents[index].gender;
  const newGender = current === gender ? 'u' : gender; // Toggle til 'u' (ubestemt) hvis trykket på nytt
  currentStudents[index].gender = newGender;

  // Oppdater navnet i tekstboksen
  const input = document.getElementById('studentsInput');
  if (input) {
    const lines = input.value.split('\n');
    if (lines[index] !== undefined) {
      // Vask bort alle eksisterende tagger først
      const clean = cleanStudentName(lines[index]);
      const tag = newGender === 'g' ? ' (g)' : newGender === 'j' ? ' (j)' : '';
      
      lines[index] = clean + tag;
      input.value = lines.join('\n');
      currentStudents[index].displayName = lines[index];
    }
  }

  renderGenderEditor();
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

    const textarea = document.getElementById('studentsInput');
    if (textarea) textarea.value = names.join('\n');

    handleStudentsInputChanged();
  };
  reader.readAsText(file);
}

function updateStudentCount() {
  const input = document.getElementById('studentsInput');
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
    alert("Vennligst oppgi to ulike navn for regelen.");
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

  if (groupRules.length === 0) {
    list.innerHTML = '<div style="font-size: 0.85rem; color: #94a3b8; font-style: italic;">Ingen regler lagt til ennå.</div>';
    return;
  }

  list.innerHTML = '';
  groupRules.forEach((r, i) => {
    const isMust = r.type === 'MUST';
    const txt = isMust 
      ? `✅ <b>${r.p1}</b> & <b>${r.p2}</b> MÅ være sammen` 
      : `⛔️ <b>${r.p1}</b> & <b>${r.p2}</b> SKAL IKKE være sammen`;
    
    list.innerHTML += `
      <div class="rule-item ${isMust ? '' : 'rule-must-not'}">
        <span>${txt}</span>
        <button class="rule-remove" onclick="removeRule(${i})" title="Slett regel">&times;</button>
      </div>
    `;
  });
}

function toggleMode() {
  const modeSelect = document.getElementById('modeSelect');
  const label = document.getElementById('numberLabel');
  if (modeSelect && label) {
    label.innerHTML = (modeSelect.value === 'perGroup') 
      ? 'Antall personer per gruppe:' 
      : 'Totalt antall grupper:';
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
    const cycle = Math.floor(index / preset.length);
    const suffix = cycle > 0 ? ` ${cycle + 1}` : '';
    return (preset[index % preset.length]) + suffix;
  }

  return `Gruppe ${index + 1}`;
}

function generateGroups() {
  const inputEl = document.getElementById('studentsInput');
  if (!inputEl) return;

  const lines = inputEl.value.split('\n').map(s => s.trim()).filter(s => s.length > 0);

  if (lines.length === 0) {
    alert("Ingen personer registrert! Gå til Admin og legg inn navn på elever først.");
    return;
  }

  let studentPool = lines.map(line => {
    const cleanName = cleanStudentName(line);
    const match = currentStudents.find(s => s.displayName === line || s.name === cleanName);
    const gender = parseGenderFromName(line) || (match ? match.gender : knownGenders[cleanName] || 'u');

    return {
      name: cleanName,
      className: match ? match.className : '',
      displayName: line,
      gender: gender
    };
  });

  const genderFilter = document.getElementById('genderFilterSelect')?.value || 'random';

  if (genderFilter === 'girlsOnly') {
    studentPool = studentPool.filter(s => s.gender === 'j');
    if (studentPool.length === 0) {
      alert("Fant ingen jenter i listen! Pass på at elever er merket med (j) eller redigert i Admin.");
      return;
    }
  } else if (genderFilter === 'boysOnly') {
    studentPool = studentPool.filter(s => s.gender === 'g');
    if (studentPool.length === 0) {
      alert("Fant ingen gutter i listen! Pass på at elever er merket med (g) eller redigert i Admin.");
      return;
    }
  }

  const modeEl = document.getElementById('modeSelect');
  const numEl = document.getElementById('numberInput');
  const isBalanced = document.getElementById('balanceClassesToggle')?.checked && document.getElementById('balanceClassesOption')?.style.display !== 'none';

  const mode = modeEl ? modeEl.value : 'numGroups';
  const numVal = parseInt(numEl ? numEl.value : 3, 10) || 1;

  let numGroups = (mode === 'perGroup') 
    ? Math.ceil(studentPool.length / numVal) 
    : Math.min(numVal, studentPool.length);

  numGroups = Math.max(1, numGroups);

  let bestResult = null;
  let minViolations = Infinity;

  for (let attempt = 0; attempt < 2500; attempt++) {
    const groups = Array.from({ length: numGroups }, () => []);

    if (genderFilter === 'balanced') {
      let girls = shuffleArray(studentPool.filter(s => s.gender === 'j'));
      let boys = shuffleArray(studentPool.filter(s => s.gender === 'g'));
      let unknown = shuffleArray(studentPool.filter(s => s.gender !== 'j' && s.gender !== 'g'));

      let gIndex = 0;
      girls.forEach(girl => {
        groups[gIndex].push(girl);
        gIndex = (gIndex + 1) % numGroups;
      });

      boys.forEach(boy => {
        groups[gIndex].push(boy);
        gIndex = (gIndex + 1) % numGroups;
      });

      unknown.forEach(u => {
        groups[gIndex].push(u);
        gIndex = (gIndex + 1) % numGroups;
      });

    } else if (isBalanced) {
      let classBins = {};
      studentPool.forEach(student => {
        const key = student.className || 'Ukjent';
        if (!classBins[key]) classBins[key] = [];
        classBins[key].push(student);
      });

      Object.keys(classBins).forEach(k => {
        classBins[k] = shuffleArray(classBins[k]);
      });

      let groupIndex = 0;
      Object.keys(classBins).forEach(k => {
        classBins[k].forEach(student => {
          groups[groupIndex].push(student);
          groupIndex = (groupIndex + 1) % numGroups;
        });
      });

    } else {
      const shuffled = shuffleArray(studentPool);
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
    const p1 = (rule.p1 || '').trim().toLowerCase();
    const p2 = (rule.p2 || '').trim().toLowerCase();

    const p1Group = groups.findIndex(g => g.some(s => s.name.toLowerCase() === p1 || s.displayName.toLowerCase() === p1));
    const p2Group = groups.findIndex(g => g.some(s => s.name.toLowerCase() === p2 || s.displayName.toLowerCase() === p2));

    if (p1Group !== -1 && p2Group !== -1) {
      if (rule.type === 'MUST' && p1Group !== p2Group) violations++;
      if (rule.type === 'MUST_NOT' && p1Group === p2Group) violations++;
    }
  });
  return violations;
}

function renderGroupsToContainer(containerId, groups) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  groups.forEach((group, index) => {
    const title = getGroupName(index);
    const card = document.createElement('div');
    card.className = 'group-card';

    card.innerHTML = `
      <h3>
        <span>${title}</span>
        <span class="count-tag">${group.length} ${group.length === 1 ? 'person' : 'personer'}</span>
      </h3>
      <ul>
        ${group.map(student => {
          const icon = student.gender === 'j' ? ' <span class="gender-icon" title="Jente">👧</span>' : student.gender === 'g' ? ' <span class="gender-icon" title="Gutt">👦</span>' : '';
          return `<li><span>${student.displayName}</span>${icon}</li>`;
        }).join('')}
      </ul>
    `;
    container.appendChild(card);
  });
}