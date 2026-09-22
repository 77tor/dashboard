let totalSeconds = 300;      // Default 5 minutes
let remainingSeconds = 300;
let endTime = null;
let timerInterval = null;
let isRunning = false;
let activeMode = 'hourglass';

// SVG Hourglass Animation Setup
const SETTLED_GRAINS = 180;
const FALLING_GRAINS = 35;
const particles = [];
let pileTop = 459;

// SVG Elements
const topSand = document.getElementById("topSand");
const topSandSurface = document.getElementById("topSandSurface");
const bottomSand = document.getElementById("bottomSand");
const pileHighlight = document.getElementById("pileHighlight");
const stream = document.getElementById("sandStream");
const streamCore = document.getElementById("sandStreamCore");
const fallingGrains = document.getElementById("fallingGrains");
const settledGrains = document.getElementById("settledGrains");
const topTexture = document.getElementById("topTexture");

// General UI Elements
const mainTimeDisplay = document.getElementById("mainTimeDisplay");
const mainTimeDisplayContainer = document.getElementById("mainTimeDisplayContainer");
const circleTimeDisplay = document.getElementById("circleTimeDisplay");
const lineTimeDisplay = document.getElementById("lineTimeDisplay");
const digitalTimeDisplay = document.getElementById("digitalTimeDisplay");
const circleProgress = document.getElementById("circleProgress");
const lineProgressBar = document.getElementById("lineProgressBar");

const startPauseBtn = document.getElementById("startPauseBtn");
const resetBtn = document.getElementById("resetBtn");
const addOneMinBtn = document.getElementById("addOneMinBtn");
const statusBadge = document.getElementById("statusBadge");

const inputMinutes = document.getElementById("inputMinutes");
const inputSeconds = document.getElementById("inputSeconds");
const setCustomTimeBtn = document.getElementById("setCustomTimeBtn");

const soundSelect = document.getElementById("soundSelect");
const volumeSlider = document.getElementById("volumeSlider");
const testSoundBtn = document.getElementById("testSoundBtn");
const alarmModal = document.getElementById("alarmModal");

/* ==========================================================================
   WEB AUDIO SYNTHESIZER
   ========================================================================== */
let audioCtx = null;
let currentAlarmLoop = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSoundEffect(type) {
  const ctx = getAudioContext();
  const vol = parseFloat(volumeSlider.value);
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(vol, ctx.currentTime);
  masterGain.connect(ctx.destination);

  const now = ctx.currentTime;

  if (type === 'schoolbell') {
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + i * 400, now);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 1.2);
    }
  } else if (type === 'fanfare') {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.3, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.6);
    });
  } else if (type === 'digital') {
    [0, 0.15].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1046.5, now + delay);
      gain.gain.setValueAtTime(0.2, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + delay);
      osc.stop(now + delay + 0.08);
    });
  } else if (type === 'shiphorn') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 1.5);
  } else if (type === 'scifi') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1800, now + 0.5);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }
}

function triggerAlarmLoop() {
  if (currentAlarmLoop) clearInterval(currentAlarmLoop);
  const soundType = soundSelect.value;
  playSoundEffect(soundType);
  currentAlarmLoop = setInterval(() => {
    playSoundEffect(soundType);
  }, 1400);
}

function stopAlarmLoop() {
  if (currentAlarmLoop) {
    clearInterval(currentAlarmLoop);
    currentAlarmLoop = null;
  }
}

/* ==========================================================================
   SVG HOURGLASS ANIMATION
   ========================================================================== */
function random(min, max) {
  return min + Math.random() * (max - min);
}

function createSettledGrains() {
  if (!settledGrains) return;
  settledGrains.innerHTML = "";
  for (let i = 0; i < SETTLED_GRAINS; i++) {
    const grain = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    grain.setAttribute("r", random(.4, 1.1));
    grain.setAttribute("fill", i % 4 === 0 ? "#c78a28" : "#f1ca69");
    grain.dataset.seed = Math.random();
    settledGrains.appendChild(grain);
  }
}

function createTopTexture() {
  if (!topTexture) return;
  topTexture.innerHTML = "";
  for (let i = 0; i < 65; i++) {
    const grain = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    grain.setAttribute("r", random(.35, .8));
    grain.setAttribute("fill", i % 3 === 0 ? "#c99435" : "#f4d47a");
    grain.dataset.x = random(195, 419);
    grain.dataset.offset = Math.random();
    topTexture.appendChild(grain);
  }
}

function createFallingGrains() {
  if (!fallingGrains) return;
  fallingGrains.innerHTML = "";
  particles.length = 0;
  for (let i = 0; i < FALLING_GRAINS; i++) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    element.setAttribute("r", random(.65, 1.3));
    element.setAttribute("fill", i % 3 === 0 ? "#fff0a0" : "#e7b957");
    fallingGrains.appendChild(element);

    particles.push({
      element: element,
      x: 307,
      y: random(277, 310),
      velocity: random(20, 60),
      phase: Math.random() * 10
    });
  }
}

function updateTopSand(p) {
  if (!topSand || !topSandSurface) return;
  const startLevel = 135;
  const endLevel = 268;
  const level = startLevel + p * (endLevel - startLevel);
  const depression = 3 + p * 8;

  topSand.setAttribute("d", `
    M 165 ${level}
    C 210 ${level + 1}, 245 ${level + 2}, 270 ${level + 4}
    C 286 ${level + 6}, 298 ${level + 8}, 307 ${level + depression}
    C 316 ${level + 8}, 328 ${level + 6}, 344 ${level + 4}
    C 369 ${level + 2}, 404 ${level + 1}, 450 ${level}
    L 450 275
    L 165 275
    Z
  `);

  topSandSurface.setAttribute("d", `
    M 165 ${level}
    C 210 ${level + 1}, 245 ${level + 2}, 270 ${level + 4}
    C 286 ${level + 6}, 298 ${level + 8}, 307 ${level + depression}
    C 316 ${level + 8}, 328 ${level + 6}, 344 ${level + 4}
    C 369 ${level + 2}, 404 ${level + 1}, 450 ${level}
    Z
  `);

  if (topTexture) {
    topTexture.querySelectorAll("circle").forEach(grain => {
      const x = Number(grain.dataset.x);
      const y = level + 2 + (Number(grain.dataset.offset) * 12);
      if (y < 270) {
        grain.setAttribute("cx", x);
        grain.setAttribute("cy", y);
        grain.style.opacity = ".38";
      } else {
        grain.style.opacity = "0";
      }
    });
  }
}

function updateBottomSand(p) {
  if (!bottomSand || !pileHighlight) return;
  const baseY = 459;
  const height = Math.pow(p, .80) * 112;
  pileTop = baseY - height;

  const width = 8 + Math.pow(p, .72) * 105;
  const floorY = baseY - Math.min(13, p * 18);

  bottomSand.setAttribute("d", `
    M 175 ${baseY}
    L 440 ${baseY}
    L 440 ${floorY}
    C 410 ${floorY} 382 ${floorY + 2} ${307 + width} ${floorY + 5}
    C ${307 + width * .75} ${floorY - height * .12} ${307 + width * .40} ${pileTop + height * .15} 307 ${pileTop}
    C ${307 - width * .40} ${pileTop + height * .15} ${307 - width * .75} ${floorY - height * .12} ${307 - width} ${floorY + 5}
    C 232 ${floorY + 2} 204 ${floorY} 175 ${floorY}
    Z
  `);

  const highlightWidth = width * .58;
  pileHighlight.setAttribute("d", `
    M ${307 - highlightWidth} ${floorY + 1}
    C ${307 - highlightWidth * .72} ${floorY - 2} ${307 - highlightWidth * .38} ${pileTop + height * .18} 307 ${pileTop}
    C ${307 + highlightWidth * .38} ${pileTop + height * .18} ${307 + highlightWidth * .72} ${floorY - 2} ${307 + highlightWidth} ${floorY + 1}
    Z
  `);

  if (settledGrains) {
    settledGrains.querySelectorAll("circle").forEach(grain => {
      const seed = Number(grain.dataset.seed);
      const localWidth = width * (.12 + seed * .88);
      const x = 307 + random(-localWidth, localWidth);
      const normalized = Math.abs(x - 307) / Math.max(width, 1);
      const mound = height * (1 - normalized * normalized);
      const y = baseY - mound * random(.05, .90);

      if (p > .03 && y >= pileTop && y <= baseY) {
        grain.setAttribute("cx", x);
        grain.setAttribute("cy", y);
        grain.style.opacity = Math.min(1, p * 4);
      } else {
        grain.style.opacity = "0";
      }
    });
  }
}

function updateStream(p) {
  if (!stream || !streamCore) return;
  if (!isRunning || p >= 1) {
    stream.style.opacity = "0";
    streamCore.style.opacity = "0";
    return;
  }

  const impactY = pileTop - 1;
  let strength = p > .98 ? 1 - ((p - .98) / .02) : 1;
  strength = Math.max(0, Math.min(1, strength));

  const pulse = 1 + Math.sin(performance.now() / 110) * .06;
  const width = (2.0 + strength * 2.2) * pulse;

  stream.setAttribute("d", `M 307 275 C 306.4 295 307.6 320 307 ${impactY}`);
  stream.setAttribute("stroke-width", width);
  stream.style.opacity = strength;

  streamCore.setAttribute("d", `M 307 275 C 306.8 295 307.2 320 307 ${impactY}`);
  streamCore.setAttribute("stroke-width", Math.max(.6, width * .28));
  streamCore.style.opacity = strength * .85;
}

function updateParticles(timestamp, p) {
  if (!isRunning || p >= .999) {
    particles.forEach(particle => { particle.element.style.opacity = "0"; });
    return;
  }

  const targetY = pileTop - 2;
  particles.forEach(particle => {
    particle.velocity += .45;
    particle.y += particle.velocity * .016;
    particle.x = 307 + Math.sin(timestamp / 170 + particle.phase) * 1.2;

    if (particle.y >= targetY) {
      particle.y = 278 + random(0, 3);
      particle.velocity = random(24, 55);
      particle.x = 307 + random(-.8, .8);
    }

    particle.element.setAttribute("cx", particle.x);
    particle.element.setAttribute("cy", particle.y);
    particle.element.style.opacity = p < .98 ? ".82" : ".25";
  });
}

/* ==========================================================================
   RENDER & SYNCHRONIZATION LOOP
   ========================================================================== */
function renderHourglassFrame(timestamp) {
  const elapsedRatio = Math.min(1, Math.max(0, (totalSeconds - remainingSeconds) / totalSeconds));

  updateTopSand(elapsedRatio);
  updateBottomSand(elapsedRatio);
  updateStream(elapsedRatio);
  updateParticles(timestamp || performance.now(), elapsedRatio);

  if (isRunning && activeMode === 'hourglass') {
    requestAnimationFrame(renderHourglassFrame);
  }
}

function updateDisplay() {
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Update text representations
  if (mainTimeDisplay) mainTimeDisplay.textContent = formattedTime;
  if (circleTimeDisplay) circleTimeDisplay.textContent = formattedTime;
  if (lineTimeDisplay) lineTimeDisplay.textContent = formattedTime;
  if (digitalTimeDisplay) digitalTimeDisplay.textContent = formattedTime;

  // Browser Tab Title Update
  document.title = isRunning ? `(${formattedTime}) Tidsur` : 'Tidsur';

  // Update Circle Progress
  if (circleProgress) {
    const ratio = remainingSeconds / totalSeconds;
    const circumference = 2 * Math.PI * 42; 
    const dashoffset = circumference * (1 - ratio);
    circleProgress.style.strokeDashoffset = dashoffset;
  }

  // Update Line Progress
  if (lineProgressBar) {
    const ratio = remainingSeconds / totalSeconds;
    lineProgressBar.style.width = `${(ratio * 100)}%`;
  }

  // Render static frame for hourglass
  if (!isRunning || activeMode !== 'hourglass') {
    renderHourglassFrame(performance.now());
  }
}

/* ==========================================================================
   TIMER CONTROL LOGIC (ACCURATE TIMESTAMP-BASED)
   ========================================================================== */
function startTimer() {
  if (isRunning) return;
  getAudioContext();
  isRunning = true;

  endTime = Date.now() + remainingSeconds * 1000;

  if (startPauseBtn) {
    startPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i> <span>Pause</span>';
    startPauseBtn.classList.remove('from-sky-500', 'to-indigo-600');
    startPauseBtn.classList.add('from-amber-500', 'to-orange-600');
  }

  if (statusBadge) {
    statusBadge.className = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
    statusBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping"></span> Kjører';
  }

  timerInterval = setInterval(() => {
    const now = Date.now();
    remainingSeconds = Math.max(0, Math.round((endTime - now) / 1000));

    updateDisplay();

    if (remainingSeconds <= 0) {
      pauseTimer();
      triggerAlarmModal();
    }
  }, 250);

  if (activeMode === 'hourglass') {
    requestAnimationFrame(renderHourglassFrame);
  }
}

function pauseTimer() {
  if (!isRunning) return;
  isRunning = false;
  clearInterval(timerInterval);

  if (startPauseBtn) {
    startPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i> <span>Start</span>';
    startPauseBtn.classList.remove('from-amber-500', 'to-orange-600');
    startPauseBtn.classList.add('from-sky-500', 'to-indigo-600');
  }

  if (statusBadge) {
    statusBadge.className = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
    statusBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-amber-500 mr-2"></span> Pauset';
  }

  updateDisplay();
}

function resetTimer() {
  pauseTimer();
  remainingSeconds = totalSeconds;
  if (statusBadge) {
    statusBadge.className = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    statusBadge.innerHTML = '<span class="w-2 h-2 rounded-full bg-slate-400 mr-2"></span> Klar';
  }
  updateDisplay();
}

function setTotalTime(seconds) {
  totalSeconds = Math.max(1, seconds);
  remainingSeconds = totalSeconds;
  resetTimer();
}

function triggerAlarmModal() {
  if (alarmModal) {
    alarmModal.classList.remove('hidden');
    alarmModal.classList.add('flex');
  }
  triggerAlarmLoop();
}

function closeAlarmModal() {
  stopAlarmLoop();
  if (alarmModal) {
    alarmModal.classList.add('hidden');
    alarmModal.classList.remove('flex');
  }
}

/* ==========================================================================
   EVENT LISTENERS & KEYBOARD SHORTCUTS
   ========================================================================== */
if (startPauseBtn) {
  startPauseBtn.addEventListener('click', () => {
    if (isRunning) pauseTimer(); else startTimer();
  });
}

if (resetBtn) {
  resetBtn.addEventListener('click', resetTimer);
}

if (addOneMinBtn) {
  addOneMinBtn.addEventListener('click', () => {
    totalSeconds += 60;
    remainingSeconds += 60;
    if (isRunning) {
      endTime += 60000;
    }
    updateDisplay();
  });
}

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const secs = parseInt(e.currentTarget.dataset.time, 10);
    setTotalTime(secs);
  });
});

if (setCustomTimeBtn) {
  setCustomTimeBtn.addEventListener('click', () => {
    const mins = parseInt(inputMinutes.value, 10) || 0;
    const secs = parseInt(inputSeconds.value, 10) || 0;
    const calculated = (mins * 60) + secs;
    if (calculated > 0) {
      setTotalTime(calculated);
    }
  });
}

// Mode Switcher
document.querySelectorAll('.mode-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    activeMode = e.currentTarget.dataset.mode;

    document.querySelectorAll('.mode-btn').forEach(b => {
      b.className = "mode-btn px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-all";
    });
    e.currentTarget.className = "mode-btn px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm";

    document.querySelectorAll('.view-mode').forEach(view => view.classList.remove('active'));

    if (activeMode === 'hourglass') {
      document.getElementById('viewHourglass').classList.add('active');
      if (mainTimeDisplayContainer) mainTimeDisplayContainer.style.display = 'block';
      if (isRunning) requestAnimationFrame(renderHourglassFrame);
    } else {
      document.getElementById(`view${activeMode.charAt(0).toUpperCase() + activeMode.slice(1)}`).classList.add('active');
      if (mainTimeDisplayContainer) mainTimeDisplayContainer.style.display = 'none';
    }

    updateDisplay();
  });
});

// Sound Controls & Alarm Modal Buttons
if (testSoundBtn) {
  testSoundBtn.addEventListener('click', () => playSoundEffect(soundSelect.value));
}

// 1. "Stopp alarm" - stopper lyden, men beholder modalen på skjermen
const btnStopAlarmOnly = document.getElementById('btnStopAlarmOnly');
if (btnStopAlarmOnly) {
  btnStopAlarmOnly.addEventListener('click', stopAlarmLoop);
}

// 2. "Kjør samme tid på nytt" - stopper lyden, lukker modalen og starter timeren
const btnRestartTimer = document.getElementById('btnRestartTimer');
if (btnRestartTimer) {
  btnRestartTimer.addEventListener('click', () => {
    closeAlarmModal();
    resetTimer();
    startTimer();
  });
}

// 3. "Lukk" - stopper lyden og lukker modalen
const btnCloseModal = document.getElementById('btnCloseModal');
if (btnCloseModal) {
  btnCloseModal.addEventListener('click', closeAlarmModal);
}

// Theme Toggle
const themeToggleBtn = document.getElementById('themeToggleBtn');
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
  });
}

// Fullscreen Toggle
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => console.warn(err));
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
  }
}

const fullscreenBtn = document.getElementById('fullscreenBtn');
if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', toggleFullscreen);
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  if (e.code === 'Space') {
    e.preventDefault();
    if (isRunning) pauseTimer(); else startTimer();
  } else if (e.code === 'KeyR') {
    resetTimer();
  } else if (e.code === 'KeyF') {
    toggleFullscreen();
  }
});

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
window.onload = function() {
  createSettledGrains();
  createTopTexture();
  createFallingGrains();
  updateDisplay();
};