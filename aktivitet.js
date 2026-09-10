/* --- AKTIVITETER OG BILDER --- */
const aktiviteterData = [
  // Eksisterende fra dagsplan
  { tittel: "Arbeidstime", bilde: "Aktivitet/Arbeidstime.png" },
  { tittel: "Bibliotek", bilde: "Aktivitet/Bibliotek.png" },
  { tittel: "DKS", bilde: "Aktivitet/DKS.png" },
  { tittel: "Engelsk", bilde: "Aktivitet/Engelsk.png" },
  { tittel: "Forestilling", bilde: "Aktivitet/Forestilling.png" },
  { tittel: "Friminutt", bilde: "Aktivitet/Friminutt.png" },
  { tittel: "Gym", bilde: "Aktivitet/Gym.png" },
  { tittel: "Klassens time", bilde: "Aktivitet/Klassens time.png" },
  { tittel: "Krle", bilde: "Aktivitet/Krle.png" },
  { tittel: "Kunst", bilde: "Aktivitet/Kunst.png" },
  { tittel: "Lek", bilde: "Aktivitet/Lek.png" },
  { tittel: "Matematikk", bilde: "Aktivitet/Matematikk.png" },
  { tittel: "Musikk", bilde: "Aktivitet/Musikk.png" },
  { tittel: "Naturfag", bilde: "Aktivitet/Naturfag.png" },
  { tittel: "Norsk", bilde: "Aktivitet/Norsk.png" },
  { tittel: "Samfunnsfag", bilde: "Aktivitet/Samfunnsfag.png" },
  { tittel: "Samling", bilde: "Aktivitet/Samling.png" },
  { tittel: "Spising", bilde: "Aktivitet/Spising.png" },
  { tittel: "Stasjoner", bilde: "Aktivitet/Stasjoner.png" },
  { tittel: "Stillelesing", bilde: "Aktivitet/Stillelesing.png" },
  { tittel: "Svømming", bilde: "Aktivitet/Svømming.png" },
  { tittel: "Uteskole", bilde: "Aktivitet/Uteskole.png" },

  // Nye aktiviteter
  { tittel: "Lesekvart", bilde: "Aktivitet/Lesekvart.png" },
  { tittel: "Vaske hendene", bilde: "Aktivitet/vaske.png" },
  { tittel: "Vask hendene og finn maten", bilde: "Aktivitet/vask_mat.png" },
  { tittel: "Finn Fabel Lesebok 1", bilde: "Aktivitet/Fabel1-Lesebok.png" },
  { tittel: "Finn lesebok", bilde: "Aktivitet/Stillelesing.png" },
  { tittel: "Hent mat/drikke", bilde: "Aktivitet/Spising.png" }
];

// Funksjon for å nullstille visningen slik at iframe blir synlig igjen
function nullstillAktivitetsVisning() {
  const iframe = document.getElementById('mainFrame');
  const displayBox = document.getElementById('aktivitetDisplay');

  if (displayBox) displayBox.style.display = 'none';
  if (iframe) iframe.style.display = 'block';

  // Slett den lagrede aktiviteten når brukeren går tilbake til "Hjem"
  localStorage.removeItem('aktivValgtAktivitet');
}

// Funksjon for å vise bilde og overskrift direkte i hovedvinduet
function visAktivitetiIframe(item, lagre = true) {
  const iframe = document.getElementById('mainFrame');
  const displayBox = document.getElementById('aktivitetDisplay');
  const bildeElem = document.getElementById('aktivitetBilde');
  const tekstElem = document.getElementById('aktivitetTekst');
  const customInput = document.getElementById('customAktivitetTekst');
  const fontSelect = document.getElementById('customAktivitetFont');

  if (!displayBox || !bildeElem || !tekstElem) return;

  // Sjekk om det er skrevet inn en tilpasset tittel i input-feltet
  let tittelSomSkalVises = item.tittel;
  if (lagre && customInput && customInput.value.trim() !== '') {
    tittelSomSkalVises = customInput.value.trim();
  } else if (item.customTittel) {
    tittelSomSkalVises = item.customTittel;
  }

  // Sjekk valgt font
  let valgtFont = 'standard';
  if (lagre && fontSelect) {
    valgtFont = fontSelect.value;
  } else if (item.font) {
    valgtFont = item.font;
  }

  // Skjul iframe og vis aktivitet-diven
  if (iframe) iframe.style.display = 'none';
  displayBox.style.display = 'flex';

  // Nullstill eventuell tidligere skjuling av bildet
  bildeElem.style.display = 'block';

  bildeElem.onerror = function() {
    this.style.display = 'none';
  };

  // Sett bilde og den valgte teksten
  bildeElem.src = item.bilde;
  bildeElem.alt = tittelSomSkalVises;
  
  tekstElem.style.textTransform = 'none';
  tekstElem.innerText = tittelSomSkalVises;

  // Håndtering av font og størrelse:
  if (valgtFont === 'trykkskrift') {
    tekstElem.style.fontFamily = "'FUNtasticTrykkskrift', 'Segoe UI', sans-serif";
    tekstElem.style.fontSize = "4.5rem"; // Trykkskriftstørrelse
  } else {
    tekstElem.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    tekstElem.style.fontSize = "3.5rem"; // Økt størrelse for Standard font
  }

  // Objekt for lagring i localStorage
  const objektTilLagring = {
    bilde: item.bilde,
    tittel: item.tittel,
    customTittel: tittelSomSkalVises,
    font: valgtFont
  };

  if (lagre) {
    localStorage.setItem('aktivValgtAktivitet', JSON.stringify(objektTilLagring));
    if (customInput) customInput.value = ''; // Tøm feltet etter valg
  }
}

// Funksjon for å endre teksten direkte på hovedskjermen med blyant-knappen
function endreAktivitetTekstEtterpaa() {
  const tekstElem = document.getElementById('aktivitetTekst');
  if (!tekstElem) return;

  const naavaerendeTekst = tekstElem.innerText;
  const nyTekst = prompt("Endre teksten for aktiviteten:", naavaerendeTekst);

  if (nyTekst !== null && nyTekst.trim() !== "") {
    tekstElem.style.textTransform = 'none';
    tekstElem.innerText = nyTekst.trim();

    // Oppdater i localStorage slik at den nye teksten huskes ved F5
    const lagretData = localStorage.getItem('aktivValgtAktivitet');
    if (lagretData) {
      try {
        let item = JSON.parse(lagretData);
        item.customTittel = nyTekst.trim();
        localStorage.setItem('aktivValgtAktivitet', JSON.stringify(item));
      } catch (e) {
        console.error("Kunne ikke oppdatere lagret tekst", e);
      }
    }
  }
}

// Funksjon for å sjekke om det finnes en lagret aktivitet fra før
function lastLagretAktivitet() {
  const lagretData = localStorage.getItem('aktivValgtAktivitet');
  if (lagretData) {
    try {
      const item = JSON.parse(lagretData);
      visAktivitetiIframe(item, false); // Viser uten å overskrive
    } catch (e) {
      console.error("Kunne ikke laste lagret aktivitet", e);
    }
  }
}

// Funksjon for å generere knapper i modalen
function genererAktiviteter() {
  const container = document.getElementById('aktivitetGridContainer');
  if (!container) return;

  container.innerHTML = '';

  aktiviteterData.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'cursor: pointer; text-align: center; padding: 12px 8px; transition: all 0.2s ease; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fff; border: 1.5px solid #e2e8f0; border-radius: 10px;';
    
    card.innerHTML = `
      <img src="${item.bilde}" alt="${item.tittel}" style="height: 60px; max-width: 100%; object-fit: contain; margin-bottom: 8px;" onerror="this.style.display='none';">
      <div style="font-weight: 700; font-size: 0.85rem; color: #1e293b; line-height: 1.2; text-transform: none;">${item.tittel}</div>
    `;

    card.onclick = () => {
      visAktivitetiIframe(item, true); // Lagrer valget
      if (typeof closeModal === 'function') {
        closeModal('aktivitetModal');
      }
    };

    card.onmouseover = () => {
      card.style.transform = 'translateY(-3px)';
      card.style.borderColor = '#0284c7';
      card.style.boxShadow = '0 4px 12px rgba(2, 132, 199, 0.15)';
    };
    card.onmouseout = () => {
      card.style.transform = 'translateY(0)';
      card.style.borderColor = '#e2e8f0';
      card.style.boxShadow = 'none';
    };

    container.appendChild(card);
  });
}

// Funksjon for å gjøre modaler draggbare
function makeModalDraggable(modalElem, headerElem) {
  if (!modalElem || !headerElem) return;

  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  headerElem.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    
    const rect = modalElem.getBoundingClientRect();
    modalElem.style.transform = 'none';
    modalElem.style.top = rect.top + 'px';
    modalElem.style.left = rect.left + 'px';

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

    modalElem.style.top = (modalElem.offsetTop - pos2) + "px";
    modalElem.style.left = (modalElem.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Kjør ved oppstart
document.addEventListener('DOMContentLoaded', () => {
  genererAktiviteter();
  lastLagretAktivitet(); // Henter fram aktiviteten hvis du oppdaterer siden
});