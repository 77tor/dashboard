/* --- YR / MET.NO VÆROPPKOBLING FOR HÅNES SKOLE --- */
async function oppdaterVaer() {
  const weatherEl = document.getElementById('weather');
  if (!weatherEl) return;

  const lat = 58.1786;
  const lon = 8.0914;

  const symbolMap = {
    clearsky_day: '☀️', clearsky_night: '🌙',
    fair_day: '🌤️', fair_night: '🌤️',
    partlycloudy_day: '⛅', partlycloudy_night: '⛅',
    cloudy: '☁️',
    lightrain: '🌦️', rain: '🌧️', heavyrain: '🌧️',
    sleet: '🌧️❄️', snow: '❄️', thunder: '⛈️', fog: '🌫️'
  };

  try {
    const response = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`, {
      headers: { 'User-Agent': 'HanesSkoleDashbord/1.0 (larer@skole.no)' }
    });

    if (!response.ok) throw new Error("Kunne ikke hente vær");

    const data = await response.json();
    const current = data.properties.timeseries[0].data;

    // 1. Temperatur og værsymbol
    const temp = Math.round(current.instant.details.air_temperature);
    const symbolCode = current.next_1_hours?.summary?.symbol_code || current.next_6_hours?.summary?.symbol_code || '';
    const baseSymbol = symbolCode.split('_')[0];
    const emoji = symbolMap[symbolCode] || symbolMap[baseSymbol] || '🌡️';

    // 2. Vindstyrke (m/s)
    const vind = Math.round(current.instant.details.wind_speed);

    // 3. Regnmengde de neste 1 timene (mm)
    const regn = current.next_1_hours?.details?.precipitation_amount ?? 0;

    // Bygg opp teksten
    let vaerTekst = `${emoji} ${temp}°C, 💨 ${vind} m/s`;
    
    // Vis regn kun dersom det faktiske nedbør over 0 mm
    if (regn > 0) {
      vaerTekst += `, 🌧️ ${regn} mm`;
    }

    weatherEl.textContent = vaerTekst;

  } catch (error) {
    console.error("Værfeil:", error);
    weatherEl.textContent = "🌤️ Kunne ikke laste vær";
  }
}

// Starter oppdateringen og timeren når siden er klar
document.addEventListener("DOMContentLoaded", () => {
  oppdaterVaer();

  const EN_TIME = 60 * 60 * 1000;
  setInterval(oppdaterVaer, EN_TIME);
});