import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

const TRINKBRUNNEN_URL = "/trinkbrunnen.json";
const WC_URL = "/wcs.json";
const PARK_URL = "/parks.json";

const TEXTE = {
  de: {
    appName: "Cool Wien",
    water: "💧 Wasser",
    wc: "🚻 WC",
    shade: "🌳 Schatten",
    showAll: "Alle anzeigen",
    hideAll: "Alle ausblenden",
    favorites: "⭐ Favoriten",
    info: "ℹ️ Info",
    searchNearby: "In meiner Nähe suchen",
    nextPlace: "Nächster Ort:",
    saveFavorite: "⭐ Favorit speichern",
    openRoute: "Route öffnen",
    appleMaps: "Apple Maps",
    googleMaps: "Google Maps",
    noFavorites: "Noch keine Favoriten gespeichert.",
    privacyTitle: "Datenschutz:",
    privacyText:
      "Cool Wien speichert deinen Standort nicht. Die Suche nach Orten in deiner Nähe passiert nur auf deinem Gerät.",
    sourcesTitle: "Datenquellen:",
    sourcesText: "Stadt Wien – data.wien.gv.at, OpenStreetMap und CARTO.",
    metersAway: "m entfernt",
    walking: "Min. zu Fuß",
    waterFountainName: "Trinkbrunnen 💧",
    publicToiletName: "Öffentliche WC-Anlage 🚻",
    parkName: "Park 🌳",
    youAreHere: "Du bist ungefähr hier",
    loadingData: "Lade Daten ...",
    loadingWater: "Lade Trinkbrunnen ...",
    loadingWc: "Lade WCs ...",
    loadingParks: "Lade Parks ...",
    waterLoaded: "Trinkbrunnen geladen",
    wcLoaded: "WCs geladen",
    parksLoaded: "Parks geladen",
    loadingError: "Fehler beim Laden",
    locationError: "Dein Standort konnte nicht gefunden werden.",
    coolDown: "🥵 Abkühlen",
coolDownLoaded: "Abkühlungsorte geladen",
fountainNearPark: "Trinkbrunnen ca.",
fromPark: "vom Park entfernt",
reportPlace: "Datenfehler melden",
reportSubject: "Cool Wien Datenfeedback",
reportIntro: "Ich möchte einen Datenfehler melden:",
reportPlaceLabel: "Ort:",
reportTypeLabel: "Typ:",
reportCoordinatesLabel: "Koordinaten:",
reportNoteLabel: "Hinweis:",
reportNotePlaceholder: "Bitte hier beschreiben, was nicht stimmt.",
coolScore: "Cool Score",
claim: "Wasser, Schatten & Abkühlung in deiner Nähe",
compactDefault: "Finde kühle Orte in Wien",
findNearest: "Nächsten Ort finden",
  },
  en: {
    appName: "Cool Vienna",
    water: "💧 Water",
    wc: "🚻 WC",
    shade: "🌳 Shade",
    showAll: "Show all",
    hideAll: "Hide all",
    favorites: "⭐ Favorites",
    info: "ℹ️ Info",
    searchNearby: "Search nearby",
    nextPlace: "Nearest place:",
    saveFavorite: "⭐ Save favorite",
    openRoute: "Open route",
    appleMaps: "Apple Maps",
    googleMaps: "Google Maps",
    noFavorites: "No favorites saved yet.",
    privacyTitle: "Privacy:",
    privacyText:
      "Cool Vienna does not store your location. Nearby search happens only on your device.",
    sourcesTitle: "Data sources:",
    sourcesText: "City of Vienna – data.wien.gv.at, OpenStreetMap and CARTO.",
    metersAway: "m away",
    walking: "min. walk",
    waterFountainName: "Water fountain 💧",
    publicToiletName: "Public toilet 🚻",
    parkName: "Park 🌳",
    youAreHere: "You are approximately here",
    loadingData: "Loading data ...",
    loadingWater: "Loading water fountains ...",
    loadingWc: "Loading public toilets ...",
    loadingParks: "Loading parks ...",
    waterLoaded: "Water fountains loaded",
    wcLoaded: "Public toilets loaded",
    parksLoaded: "Parks loaded",
    loadingError: "Error while loading",
    locationError: "Your location could not be found.",
    coolDown: "🥵 Cool down",
coolDownLoaded: "Cool-down spots loaded",
fountainNearPark: "Water fountain approx.",
fromPark: "from the park",
reportPlace: "Report data issue",
reportSubject: "Cool Vienna data feedback",
reportIntro: "I would like to report a data issue:",
reportPlaceLabel: "Place:",
reportTypeLabel: "Type:",
reportCoordinatesLabel: "Coordinates:",
reportNoteLabel: "Note:",
reportNotePlaceholder: "Please describe what is wrong here.",
coolScore: "Cool score",
claim: "Water, shade & cool-down spots near you",
compactDefault: "Find cool places in Vienna",
findNearest: "Find nearest place",
  },
};

export default function App() {
  const mapRef = useRef(null);
  const orteRef = useRef([]);
  const wasserOrteRef = useRef([]);
const parkOrteRef = useRef([]);
  const markerRef = useRef(null);
  const standortMarkerRef = useRef(null);
  const letzterStandortRef = useRef(null);
  const alleMarkerRef = useRef([]);
  const touchStartYRef = useRef(null);

  const [anzahl, setAnzahl] = useState(0);
  const [status, setStatus] = useState(TEXTE.de.loadingData);
  const [modus, setModus] = useState("wasser");
  const [naechsterOrt, setNaechsterOrt] = useState(null);
  const [alleSichtbar, setAlleSichtbar] = useState(false);
  const [panelOffen, setPanelOffen] = useState(false);
  const [infoOffen, setInfoOffen] = useState(false);
  const [routeAuswahlOffen, setRouteAuswahlOffen] = useState(false);
  const [favoriten, setFavoriten] = useState([]);
  const [favoritenOffen, setFavoritenOffen] = useState(false);
  const [sprache, setSprache] = useState("de");

  const t = TEXTE[sprache];

  useEffect(() => {
    const map = L.map("map", {
      zoomControl: false,
      attributionControl: false,
    }).setView([48.2082, 16.3738], 12);

    mapRef.current = map;

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        subdomains: "abcd",
        maxZoom: 20,
      }
    ).addTo(map);

    L.control
      .attribution({
        position: "topright",
        prefix: "Leaflet",
      })
      .addAttribution(
        "© OpenStreetMap © CARTO | Datenquelle: Stadt Wien - data.wien.gv.at"
      )
      .addTo(map);

    ladeWasser();

    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    const gespeicherteFavoriten = localStorage.getItem("coolWienFavoriten");

    if (gespeicherteFavoriten) {
      setFavoriten(JSON.parse(gespeicherteFavoriten));
    }
  }, []);

  useEffect(() => {
    setStatus(t.loadingData);

    if (standortMarkerRef.current) {
      standortMarkerRef.current.bindPopup(t.youAreHere);
    }

    if (naechsterOrt) {
      markiereNaechstenOrt(naechsterOrt);
    }
  }, [sprache]);

  function ortName(ort) {
    if (!ort) return "";

    if (ort.typ === "wasser") {
      return t.waterFountainName;
    }

    if (ort.typ === "wc") {
      return t.publicToiletName;
    }

    if (ort.typ === "park") {
      if (ort.parkName) {
        return `${ort.parkName} 🌳`;
      }

      return t.parkName;
    }
if (ort.typ === "cooldown") {
  if (ort.parkName) {
    return `${ort.parkName} 🌳 + 💧`;
  }

  return `${t.parkName} + 💧`;
}
    return ort.name || "";
  }

  function ortIcon(ort) {
    if (!ort) return "📍";

    if (ort.typ === "wasser") return "💧";
    if (ort.typ === "wc") return "🚻";
    if (ort.typ === "park") return "🌳";
    if (ort.typ === "cooldown") return "🥵";

    return "📍";
  }

  function entferneAlleMarker() {
    alleMarkerRef.current.forEach((marker) => marker.remove());
    alleMarkerRef.current = [];
    setAlleSichtbar(false);
  }

  function zeigeAlleOrte() {
    const map = mapRef.current;
    if (!map) return;

    if (alleSichtbar) {
      entferneAlleMarker();
      return;
    }

    entferneAlleMarker();

    orteRef.current.forEach((ort) => {
      const kleinerIcon = L.divIcon({
        className: "kleiner-ort-icon",
        html: `<div class="kleiner-ort-pin">${ortIcon(ort)}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([ort.latitude, ort.longitude], {
        icon: kleinerIcon,
      })
        .addTo(map)
        .bindPopup(ortName(ort));

      alleMarkerRef.current.push(marker);
    });

    setAlleSichtbar(true);
  }

  function entferneZielMarker() {
    entferneAlleMarker();

    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    setNaechsterOrt(null);
  }

  async function ladeWasser() {
    setModus("wasser");
    setStatus(t.loadingWater);
    setRouteAuswahlOffen(false);
    entferneZielMarker();

    try {
      const antwort = await fetch(TRINKBRUNNEN_URL);
      const daten = await antwort.json();
      const features = daten.features || [];

      orteRef.current = [];

      features.forEach((ort) => {
        const koordinaten = ort.geometry?.coordinates;
        if (!koordinaten) return;

        const longitude = koordinaten[0];
        const latitude = koordinaten[1];

        orteRef.current.push({
          latitude,
          longitude,
          typ: "wasser",
        });
      });
      wasserOrteRef.current = orteRef.current;

      setAnzahl(orteRef.current.length);
      setStatus(t.waterLoaded);
      aktualisiereNaechstenOrt(letzterStandortRef.current);
    } catch (fehler) {
      console.error(fehler);
      setStatus(t.loadingError);
    }
  }

  async function ladeWCs() {
    setModus("wc");
    setStatus(t.loadingWc);
    setRouteAuswahlOffen(false);
    entferneZielMarker();

    try {
      const antwort = await fetch(WC_URL);
      const daten = await antwort.json();
      const features = daten.features || [];

      orteRef.current = [];

      features.forEach((ort) => {
        const koordinaten = ort.geometry?.coordinates;
        if (!koordinaten) return;

        const longitude = koordinaten[0];
        const latitude = koordinaten[1];

        orteRef.current.push({
          latitude,
          longitude,
          typ: "wc",
        });
      });

      setAnzahl(orteRef.current.length);
      setStatus(t.wcLoaded);
      aktualisiereNaechstenOrt(letzterStandortRef.current);
    } catch (fehler) {
      console.error(fehler);
      setStatus(t.loadingError);
    }
  }

  async function ladeParks() {
    setModus("park");
    setStatus(t.loadingParks);
    setRouteAuswahlOffen(false);
    entferneZielMarker();

    try {
      const antwort = await fetch(PARK_URL);
      const daten = await antwort.json();
      const features = daten.features || [];

      orteRef.current = [];

      features.forEach((ort) => {
        const koordinaten = ort.geometry?.coordinates;
        if (!koordinaten) return;

        const longitude = koordinaten[0];
        const latitude = koordinaten[1];

        const parkName =
          ort.properties?.ANL_NAME ||
          ort.properties?.PARKANLAGE ||
          ort.properties?.NAME ||
          "";

        orteRef.current.push({
          latitude,
          longitude,
          typ: "park",
          parkName,
        });
      });
      parkOrteRef.current = orteRef.current;

      setAnzahl(orteRef.current.length);
      setStatus(t.parksLoaded);
      aktualisiereNaechstenOrt(letzterStandortRef.current);
    } catch (fehler) {
      console.error(fehler);
      setStatus(t.loadingError);
    }
  }

  async function ladeAbkuehlen() {
  setModus("cooldown");
  setStatus(t.loadingParks);
  setRouteAuswahlOffen(false);
  entferneZielMarker();

  try {
    if (wasserOrteRef.current.length === 0) {
      const wasserAntwort = await fetch(TRINKBRUNNEN_URL);
      const wasserDaten = await wasserAntwort.json();
      const wasserFeatures = wasserDaten.features || [];

      wasserOrteRef.current = wasserFeatures
        .map((ort) => {
          const koordinaten = ort.geometry?.coordinates;
          if (!koordinaten) return null;

          return {
            latitude: koordinaten[1],
            longitude: koordinaten[0],
            typ: "wasser",
          };
        })
        .filter(Boolean);
    }

    if (parkOrteRef.current.length === 0) {
      const parkAntwort = await fetch(PARK_URL);
      const parkDaten = await parkAntwort.json();
      const parkFeatures = parkDaten.features || [];

      parkOrteRef.current = parkFeatures
        .map((ort) => {
          const koordinaten = ort.geometry?.coordinates;
          if (!koordinaten) return null;

          const parkName =
            ort.properties?.ANL_NAME ||
            ort.properties?.PARKANLAGE ||
            ort.properties?.NAME ||
            "";

          return {
            latitude: koordinaten[1],
            longitude: koordinaten[0],
            typ: "park",
            parkName,
          };
        })
        .filter(Boolean);
    }

    const abkuehlOrte = parkOrteRef.current.map((park) => {
      let naechsterBrunnen = null;
      let brunnenEntfernung = Infinity;

      wasserOrteRef.current.forEach((brunnen) => {
        const entfernung = mapRef.current.distance(
          [park.latitude, park.longitude],
          [brunnen.latitude, brunnen.longitude]
        );

        if (entfernung < brunnenEntfernung) {
          brunnenEntfernung = entfernung;
          naechsterBrunnen = brunnen;
        }
      });

      return {
        ...park,
        typ: "cooldown",
        brunnen: naechsterBrunnen,
        brunnenEntfernung: Math.round(brunnenEntfernung),
      };
    });

    orteRef.current = abkuehlOrte.filter(
      (ort) => ort.brunnen && ort.brunnenEntfernung <= 250
    );

    setAnzahl(orteRef.current.length);
    setStatus(t.coolDownLoaded);
    aktualisiereNaechstenOrt(letzterStandortRef.current);
  } catch (fehler) {
    console.error(fehler);
    setStatus(t.loadingError);
  }
}

  function aktualisiereNaechstenOrt(meinStandort) {
  setRouteAuswahlOffen(false);

  if (!meinStandort || orteRef.current.length === 0) return;

  const naechster = findeNaechstenOrt(meinStandort);

  setNaechsterOrt(naechster);
  zeigeBeideAufDerKarte(meinStandort, naechster);

  setTimeout(() => {
    markiereNaechstenOrt(naechster);
  }, 300);
}

  function sucheMeinenStandort() {
    setPanelOffen(false);

    const map = mapRef.current;
    if (!map) return;

    map.locate({
      setView: true,
      maxZoom: 16,
    });

    map.once("locationfound", (event) => {
      const meinStandort = event.latlng;
      letzterStandortRef.current = meinStandort;

      if (standortMarkerRef.current) {
        standortMarkerRef.current.remove();
      }

      const standortIcon = L.divIcon({
        className: "standort-icon",
        html: '<div class="standort-punkt"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });

      standortMarkerRef.current = L.marker(meinStandort, {
        icon: standortIcon,
      })
        .addTo(map)
        .bindPopup(t.youAreHere)
        .openPopup();

      aktualisiereNaechstenOrt(meinStandort);
    });

    map.once("locationerror", () => {
      alert(t.locationError);
    });
  }

  function berechneCoolScore(entfernungZumUser, brunnenEntfernung) {
  let score = 10;

  if (entfernungZumUser > 300) score -= 1;
  if (entfernungZumUser > 600) score -= 1;
  if (entfernungZumUser > 1000) score -= 2;

  if (brunnenEntfernung > 50) score -= 1;
  if (brunnenEntfernung > 150) score -= 1;
  if (brunnenEntfernung > 250) score -= 2;

  return Math.max(1, Math.min(10, score));
}

  function findeNaechstenOrt(meinStandort) {
  let besterOrt = null;
  let besteBewertung = Infinity;

  orteRef.current.forEach((ort) => {
    const entfernung = mapRef.current.distance(meinStandort, [
      ort.latitude,
      ort.longitude,
    ]);

    let bewertung = entfernung;

    if (ort.typ === "cooldown") {
      bewertung = entfernung + ort.brunnenEntfernung * 2;
    }

    if (bewertung < besteBewertung) {
      besteBewertung = bewertung;
      besterOrt = {
        ...ort,
        entfernung: Math.round(entfernung),
      };
    }
  });

  const gehzeit = Math.max(1, Math.round(besterOrt.entfernung / 80));

  if (besterOrt.typ === "cooldown") {
    besterOrt.coolScore = berechneCoolScore(
      besterOrt.entfernung,
      besterOrt.brunnenEntfernung
    );
  }

  return {
    ...besterOrt,
    gehzeit,
  };
}

  function zeigeBeideAufDerKarte(meinStandort, ort) {
    const map = mapRef.current;
    if (!map || !ort) return;

    const bereich = L.latLngBounds([
      meinStandort,
      [ort.latitude, ort.longitude],
    ]);

    map.fitBounds(bereich, {
      paddingTopLeft: [60, 80],
      paddingBottomRight: [60, 220],
      maxZoom: 17,
    });
  }

  function markiereNaechstenOrt(ort) {
    const map = mapRef.current;
    if (!map || !ort) return;

    if (markerRef.current) {
      markerRef.current.remove();
    }

    const zielIcon = L.divIcon({
      className: "ziel-icon",
      html: `<div class="ziel-pin">${ortIcon(ort)}</div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22],
    });

    markerRef.current = L.marker([ort.latitude, ort.longitude], {
  icon: zielIcon,
})
  .addTo(map)
  .bindPopup(
    `${ortName(ort)}<br>${ort.entfernung} ${t.metersAway}<br>ca. ${
      ort.gehzeit
    } ${t.walking}${
      ort.typ === "cooldown"
        ? `<br>${t.fountainNearPark} ${ort.brunnenEntfernung} m ${t.fromPark}<br>${t.coolScore}: ${ort.coolScore}/10`
        : ""
    }`,
    {
      autoPan: true,
      keepInView: true,
      maxWidth: 260,
      autoPanPadding: [40, 160],
    }
  )
  .openPopup();
  }

  function handleTouchStart(event) {
    event.stopPropagation();
    touchStartYRef.current = event.touches[0].clientY;
  }

  function handleTouchEnd(event) {
    event.stopPropagation();

    if (touchStartYRef.current === null) return;

    const startY = touchStartYRef.current;
    const endY = event.changedTouches[0].clientY;
    const unterschied = startY - endY;

    if (unterschied > 40) {
      setPanelOffen(true);
    }

    if (unterschied < -40) {
      setPanelOffen(false);
    }

    touchStartYRef.current = null;
  }

  function speichereFavorit() {
    if (!naechsterOrt) return;

    const neuerFavorit = {
      id: `${naechsterOrt.typ}-${naechsterOrt.latitude}-${naechsterOrt.longitude}`,
      typ: naechsterOrt.typ,
      latitude: naechsterOrt.latitude,
      longitude: naechsterOrt.longitude,
      parkName: naechsterOrt.parkName || "",
    };

    const gibtEsSchon = favoriten.some(
      (favorit) => favorit.id === neuerFavorit.id
    );

    if (gibtEsSchon) return;

    const neueFavoriten = [...favoriten, neuerFavorit];

    setFavoriten(neueFavoriten);
    localStorage.setItem("coolWienFavoriten", JSON.stringify(neueFavoriten));
  }

  function entferneFavorit(id) {
    const neueFavoriten = favoriten.filter((favorit) => favorit.id !== id);

    setFavoriten(neueFavoriten);
    localStorage.setItem("coolWienFavoriten", JSON.stringify(neueFavoriten));
  }

  function zeigeFavoritAufKarte(favorit) {
    const favoritOrt = {
      ...favorit,
      entfernung: 0,
      gehzeit: 0,
    };

    setNaechsterOrt(favoritOrt);
    markiereNaechstenOrt(favoritOrt);

    mapRef.current.setView([favorit.latitude, favorit.longitude], 17);
  }

function ortMelden() {
  if (!naechsterOrt) return;

  const betreff = encodeURIComponent(t.reportSubject);

  const text = encodeURIComponent(
    `${t.reportIntro}

${t.reportPlaceLabel} ${ortName(naechsterOrt)}
${t.reportTypeLabel} ${naechsterOrt.typ}
${t.reportCoordinatesLabel} ${naechsterOrt.latitude}, ${naechsterOrt.longitude}

${t.reportNoteLabel}
${t.reportNotePlaceholder}`
  );

  const url = `mailto:?subject=${betreff}&body=${text}`;

  window.location.href = url;
}

  function routeAppleMapsOeffnen() {
    if (!naechsterOrt) return;

    const latitude = naechsterOrt.latitude;
    const longitude = naechsterOrt.longitude;

    const url = `https://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=w`;

    window.open(url, "_blank");
  }

  function routeGoogleMapsOeffnen() {
    if (!naechsterOrt) return;

    const latitude = naechsterOrt.latitude;
    const longitude = naechsterOrt.longitude;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;

    window.open(url, "_blank");
  }

  return (
    <div className="app">
      <div
        className={panelOffen ? "box open" : "box closed"}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="sheet-handle-area"
          onClick={() => setPanelOffen(!panelOffen)}
        >
          <div className="sheet-handle"></div>
        </div>

        <div className="header-row">
  <div className="title-block">
    <h1>{t.appName}</h1>
    <p className="claim">{t.claim}</p>
    <p className="compact-summary">
      {naechsterOrt
        ? `${ortName(naechsterOrt)} · ${naechsterOrt.entfernung} ${t.metersAway}`
        : t.compactDefault}
    </p>
  </div>

  <button
    className="language-button"
    onClick={() => setSprache(sprache === "de" ? "en" : "de")}
  >
    {sprache === "de" ? "EN" : "DE"}
  </button>
</div>

        <div className="sheet-content">
          <div className="quick-buttons">
            <button
              className={modus === "wasser" ? "quick-button active" : "quick-button"}
              onClick={ladeWasser}
            >
              {t.water}
            </button>

            <button
              className={modus === "wc" ? "quick-button active" : "quick-button"}
              onClick={ladeWCs}
            >
              {t.wc}
            </button>

            <button
              className={modus === "park" ? "quick-button active" : "quick-button"}
              onClick={ladeParks}
            >
              {t.shade}
            </button>

            <button
  className={modus === "cooldown" ? "quick-button active" : "quick-button"}
  onClick={ladeAbkuehlen}
>
  {t.coolDown}
</button>
          </div>

          <div className="small-actions">
            <button className="secondary-button" onClick={zeigeAlleOrte}>
              {alleSichtbar ? t.hideAll : t.showAll}
            </button>

            <button
              className="secondary-button"
              onClick={() => setFavoritenOffen(!favoritenOffen)}
            >
              {t.favorites}
            </button>

            <button
              className="secondary-button"
              onClick={() => setInfoOffen(!infoOffen)}
            >
              {t.info}
            </button>
          </div>

          {favoritenOffen && (
            <div className="favoriten-box">
              {favoriten.length === 0 && (
                <p className="empty-text">{t.noFavorites}</p>
              )}

              {favoriten.map((favorit) => (
                <div className="favorit-item" key={favorit.id}>
                  <button
                    className="favorit-name"
                    onClick={() => zeigeFavoritAufKarte(favorit)}
                  >
                    {ortName(favorit)}
                  </button>

                  <button
                    className="favorit-delete"
                    onClick={() => entferneFavorit(favorit.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {infoOffen && (
            <div className="info-box">
              <p>
                <strong>{t.privacyTitle}</strong> {t.privacyText}
              </p>

              <p>
                <strong>{t.sourcesTitle}</strong> {t.sourcesText}
              </p>
            </div>
          )}

          <button onClick={sucheMeinenStandort}>{t.findNearest}</button>

          {naechsterOrt && (
            <>
              <div className="result">
                <p className="result-label">{t.nextPlace}</p>
                <p className="result-name">{ortName(naechsterOrt)}</p>
                <p className="result-distance">
                  {naechsterOrt.entfernung} {t.metersAway} · ca.{" "}
                  {naechsterOrt.gehzeit} {t.walking}
                  {naechsterOrt.typ === "cooldown" && (
  <>
    <p className="result-extra">
      {t.fountainNearPark} {naechsterOrt.brunnenEntfernung} m{" "}
      {t.fromPark}
    </p>

    <p className="cool-score">
      {t.coolScore}: {naechsterOrt.coolScore}/10
    </p>
  </>
)}
                </p>
              </div>

              <div className="result-actions">
  <button className="secondary-button" onClick={speichereFavorit}>
    {t.saveFavorite}
  </button>

  <button className="secondary-button" onClick={ortMelden}>
    {t.reportPlace}
  </button>
</div>

              <button onClick={() => setRouteAuswahlOffen(!routeAuswahlOffen)}>
                {t.openRoute}
              </button>

              {routeAuswahlOffen && (
                <div className="route-buttons">
                  <button onClick={routeAppleMapsOeffnen}>{t.appleMaps}</button>
                  <button onClick={routeGoogleMapsOeffnen}>
                    {t.googleMaps}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div id="map"></div>
    </div>
  );
}