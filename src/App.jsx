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
    claim: "Wasser, Schatten & Abkühlung in deiner Nähe",
    compactDefault: "Finde kühle Orte in Wien",
    swipeHint: "Nach unten wischen zum Verkleinern",

    water: "💧 Wasser",
    wc: "🚻 WC",
    shade: "🌳 Schatten",
    coolDown: "🥵 Abkühlen",

    showAll: "Alle anzeigen",
    hideAll: "Alle ausblenden",
    favorites: "⭐ Favoriten",
    info: "ℹ️ Info",
    findNearest: "Nächsten Ort finden",
    nextPlace: "Nächster Ort:",
    saveFavorite: "⭐ Favorit speichern",
    favoriteSavedButton: "⭐ Gespeichert",
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
    coolDownLoaded: "Abkühlungsorte geladen",
    loadingError: "Fehler beim Laden",
    locationError: "Dein Standort konnte nicht gefunden werden.",

    fountainNearPark: "Trinkbrunnen ca.",
    fromPark: "vom Park entfernt",
    coolScore: "Cool Score",

    reportPlace: "Datenfehler melden",
    reportSubject: "Cool Wien Datenfeedback",
    reportIntro: "Ich möchte einen Datenfehler melden:",
    reportPlaceLabel: "Ort:",
    reportTypeLabel: "Typ:",
    reportCoordinatesLabel: "Koordinaten:",
    reportNoteLabel: "Hinweis:",
    reportNotePlaceholder: "Bitte hier beschreiben, was nicht stimmt.",

    introTitle: "Willkommen bei Cool Wien 👋",
    introWaterTitle: "Wasser",
    introWaterText: "Finde Trinkbrunnen in deiner Nähe.",
    introWcTitle: "WC",
    introWcText: "Finde öffentliche WCs in Wien.",
    introShadeTitle: "Schatten",
    introShadeText: "Finde Parks und schattige Orte.",
    introCoolTitle: "Abkühlen",
    introCoolText: "Kombiniert Parks mit Trinkbrunnen in der Nähe.",
    introScoreTitle: "Cool Score",
    introScoreText:
      "Bewertet, wie gut ein Ort zum Abkühlen ist – mit Blick auf Nähe zu dir und Trinkbrunnen in Parknähe.",
    introPrivacy:
      "Dein Standort wird nicht gespeichert und nur auf deinem Gerät verwendet.",
    introButton: "Los geht’s",

    toastSearchingLocation: "📍 Standort wird gesucht …",
    toastFavoriteSaved: "⭐ Favorit gespeichert",
    toastFavoriteExists: "⭐ Schon in deinen Favoriten",
    toastLocationError: "⚠️ Standort konnte nicht gefunden werden",
    toastNoPlaceSelected: "Bitte zuerst einen Ort auswählen",
  },

  en: {
    appName: "Cool Vienna",
    claim: "Water, shade & cool-down spots near you",
    compactDefault: "Find cool places in Vienna",
    swipeHint: "Swipe down to collapse",

    water: "💧 Water",
    wc: "🚻 WC",
    shade: "🌳 Shade",
    coolDown: "🥵 Cool down",

    showAll: "Show all",
    hideAll: "Hide all",
    favorites: "⭐ Favorites",
    info: "ℹ️ Info",
    findNearest: "Find nearest place",
    nextPlace: "Nearest place:",
    saveFavorite: "⭐ Save favorite",
    favoriteSavedButton: "⭐ Saved",
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
    coolDownLoaded: "Cool-down spots loaded",
    loadingError: "Error while loading",
    locationError: "Your location could not be found.",

    fountainNearPark: "Water fountain approx.",
    fromPark: "from the park",
    coolScore: "Cool score",

    reportPlace: "Report data issue",
    reportSubject: "Cool Vienna data feedback",
    reportIntro: "I would like to report a data issue:",
    reportPlaceLabel: "Place:",
    reportTypeLabel: "Type:",
    reportCoordinatesLabel: "Coordinates:",
    reportNoteLabel: "Note:",
    reportNotePlaceholder: "Please describe what is wrong here.",

    introTitle: "Welcome to Cool Vienna 👋",
    introWaterTitle: "Water",
    introWaterText: "Find water fountains near you.",
    introWcTitle: "WC",
    introWcText: "Find public toilets in Vienna.",
    introShadeTitle: "Shade",
    introShadeText: "Find parks and shady places.",
    introCoolTitle: "Cool down",
    introCoolText: "Combines parks with nearby water fountains.",
    introScoreTitle: "Cool Score",
    introScoreText:
      "Rates how good a place is for cooling down – based on distance to you and nearby water fountains.",
    introPrivacy:
      "Your location is not stored and is only used on your device.",
    introButton: "Get started",

    toastSearchingLocation: "📍 Searching your location …",
    toastFavoriteSaved: "⭐ Favorite saved",
    toastFavoriteExists: "⭐ Already in your favorites",
    toastLocationError: "⚠️ Location could not be found",
    toastNoPlaceSelected: "Please select a place first",
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
  const [panelOffen, setPanelOffen] = useState(true);
  const [infoOffen, setInfoOffen] = useState(false);
  const [routeAuswahlOffen, setRouteAuswahlOffen] = useState(false);
  const [favoriten, setFavoriten] = useState([]);
  const [favoritenOffen, setFavoritenOffen] = useState(false);
  const [toast, setToast] = useState("");

  const [sprache, setSprache] = useState(() => {
    const gespeicherteSprache = localStorage.getItem("coolWienSprache");

    if (gespeicherteSprache && TEXTE[gespeicherteSprache]) {
      return gespeicherteSprache;
    }

    const browserSprache = navigator.language?.slice(0, 2);

    if (TEXTE[browserSprache]) {
      return browserSprache;
    }

    return "en";
  });

  const [introOffen, setIntroOffen] = useState(() => {
    return localStorage.getItem("coolWienIntroGesehen") !== "true";
  });

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
      markiereNaechstenOrt(naechsterOrt, false);
    }
  }, [sprache]);

  function spracheWechseln() {
    const neueSprache = sprache === "de" ? "en" : "de";
    setSprache(neueSprache);
    localStorage.setItem("coolWienSprache", neueSprache);
  }

  function introSchliessen() {
    setIntroOffen(false);
    localStorage.setItem("coolWienIntroGesehen", "true");
  }

  function zeigeToast(nachricht) {
    setToast(nachricht);

    setTimeout(() => {
      setToast("");
    }, 2200);
  }

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

  function favoritName(favorit) {
    const name = ortName(favorit);

    if (favorit.typ === "wasser" || favorit.typ === "wc") {
      return `${name} · ${favorit.latitude.toFixed(
        4
      )}, ${favorit.longitude.toFixed(4)}`;
    }

    return name;
  }

  function ortIcon(ort) {
    if (!ort) return "📍";

    if (ort.typ === "wasser") return "💧";
    if (ort.typ === "wc") return "🚻";
    if (ort.typ === "park") return "🌳";
    if (ort.typ === "cooldown") return "🥵";

    return "📍";
  }

  function favoritIdFuerOrt(ort) {
    if (!ort) return "";

    return `${ort.typ}-${ort.latitude}-${ort.longitude}`;
  }

  function istFavorit(ort) {
    if (!ort) return false;

    const id = favoritIdFuerOrt(ort);

    return favoriten.some((favorit) => favorit.id === id);
  }

  function entferneAlleMarker() {
    alleMarkerRef.current.forEach((marker) => marker.remove());
    alleMarkerRef.current = [];
    setAlleSichtbar(false);
  }

  function waehleOrtAus(ort) {
    const map = mapRef.current;
    const meinStandort = letzterStandortRef.current;

    if (!map || !ort) return;

    const ausgewaehlterOrt = {
      ...ort,
    };

    if (meinStandort) {
      const entfernung = Math.round(
        map.distance(meinStandort, [ort.latitude, ort.longitude])
      );

      ausgewaehlterOrt.entfernung = entfernung;
      ausgewaehlterOrt.gehzeit = Math.max(1, Math.round(entfernung / 80));

      if (ausgewaehlterOrt.typ === "cooldown") {
        ausgewaehlterOrt.coolScore = berechneCoolScore(
          entfernung,
          ausgewaehlterOrt.brunnenEntfernung
        );
      }
    } else {
      ausgewaehlterOrt.entfernung = 0;
      ausgewaehlterOrt.gehzeit = 0;
    }

    setNaechsterOrt(ausgewaehlterOrt);
    setRouteAuswahlOffen(false);

    markiereNaechstenOrt(ausgewaehlterOrt, true);

    map.setView([ort.latitude, ort.longitude], 17, {
      animate: true,
    });
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
      const istDieserOrtFavorit = istFavorit(ort);

      const kleinerIcon = L.divIcon({
        className: "kleiner-ort-icon",
        html: `
          <div class="kleiner-ort-pin ${
            istDieserOrtFavorit ? "kleiner-ort-pin-favorit" : ""
          }">
            ${ortIcon(ort)}
            ${
              istDieserOrtFavorit
                ? '<span class="favorit-badge">⭐</span>'
                : ""
            }
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      const marker = L.marker([ort.latitude, ort.longitude], {
        icon: kleinerIcon,
      })
        .addTo(map)
        .bindPopup(ortName(ort));

      marker.on("click", () => {
        waehleOrtAus(ort);
      });

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

    if (!naechster) return;

    setNaechsterOrt(naechster);
    zeigeBeideAufDerKarte(meinStandort, naechster);

    setTimeout(() => {
  markiereNaechstenOrt(naechster, true);
}, 300);
  }

  function sucheMeinenStandort() {
    setPanelOffen(false);

    const map = mapRef.current;
    if (!map) return;

    zeigeToast(t.toastSearchingLocation);

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
      zeigeToast(t.toastLocationError);
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

    if (!besterOrt) return null;

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

  function bringePopupUeberMenue() {
    const map = mapRef.current;
    if (!map) return;

    const verschiebung = panelOffen ? 240 : 90;

    setTimeout(() => {
      map.panBy([0, verschiebung], {
        animate: true,
        duration: 0.25,
      });
    }, 150);
  }

  function markiereNaechstenOrt(ort, sollKarteAusrichten = false) {
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

    const entfernungText =
      ort.entfernung > 0
        ? `<br>${ort.entfernung} ${t.metersAway}<br>ca. ${ort.gehzeit} ${t.walking}`
        : "";

    const cooldownText =
      ort.typ === "cooldown"
        ? `<br>${t.fountainNearPark} ${ort.brunnenEntfernung} m ${t.fromPark}<br>${t.coolScore}: ${ort.coolScore}/10`
        : "";

    markerRef.current = L.marker([ort.latitude, ort.longitude], {
      icon: zielIcon,
    })
      .addTo(map)
      .bindPopup(`${ortName(ort)}${entfernungText}${cooldownText}`, {
        autoPan: true,
        keepInView: true,
        maxWidth: 260,
        autoPanPadding: [40, 160],
      })
      .openPopup();

    if (sollKarteAusrichten) {
  bringePopupUeberMenue();
}
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
    if (!naechsterOrt) {
      zeigeToast(t.toastNoPlaceSelected);
      return;
    }

    const id = favoritIdFuerOrt(naechsterOrt);

    if (istFavorit(naechsterOrt)) {
      zeigeToast(t.toastFavoriteExists);
      return;
    }

    const neuerFavorit = {
      id,
      typ: naechsterOrt.typ,
      latitude: naechsterOrt.latitude,
      longitude: naechsterOrt.longitude,
      parkName: naechsterOrt.parkName || "",
      brunnenEntfernung: naechsterOrt.brunnenEntfernung || null,
      coolScore: naechsterOrt.coolScore || null,
    };

    const neueFavoriten = [...favoriten, neuerFavorit];

    setFavoriten(neueFavoriten);
    localStorage.setItem("coolWienFavoriten", JSON.stringify(neueFavoriten));

    zeigeToast(t.toastFavoriteSaved);
  }

  function entferneFavorit(id) {
    const neueFavoriten = favoriten.filter((favorit) => favorit.id !== id);

    setFavoriten(neueFavoriten);
    localStorage.setItem("coolWienFavoriten", JSON.stringify(neueFavoriten));
  }

  function zeigeFavoritAufKarte(favorit) {
    waehleOrtAus(favorit);
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
      {toast && <div className="toast">{toast}</div>}

      <button className="help-button" onClick={() => setIntroOffen(true)}>
        ?
      </button>

      {introOffen && (
        <div className="intro-overlay">
          <div className="intro-card">
            <button className="intro-close" onClick={introSchliessen}>
              ✕
            </button>

            <div className="intro-icon">🥵</div>

            <h2>{t.introTitle}</h2>

            <div className="intro-grid">
              <div className="intro-feature">
                <span>💧</span>
                <div>
                  <strong>{t.introWaterTitle}</strong>
                  <p>{t.introWaterText}</p>
                </div>
              </div>

              <div className="intro-feature">
                <span>🚻</span>
                <div>
                  <strong>{t.introWcTitle}</strong>
                  <p>{t.introWcText}</p>
                </div>
              </div>

              <div className="intro-feature">
                <span>🌳</span>
                <div>
                  <strong>{t.introShadeTitle}</strong>
                  <p>{t.introShadeText}</p>
                </div>
              </div>

              <div className="intro-feature">
                <span>🥵</span>
                <div>
                  <strong>{t.introCoolTitle}</strong>
                  <p>{t.introCoolText}</p>
                </div>
              </div>
            </div>

            <div className="intro-score-box">
              <div className="intro-score-badge">9/10</div>

              <div>
                <strong>{t.introScoreTitle}</strong>
                <p>{t.introScoreText}</p>
              </div>
            </div>

            <p className="intro-privacy">{t.introPrivacy}</p>

            <button onClick={introSchliessen}>{t.introButton}</button>
          </div>
        </div>
      )}

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

            <p className="swipe-hint">{t.swipeHint}</p>

            <p className="compact-summary">
              {naechsterOrt
                ? `${ortName(naechsterOrt)} · ${naechsterOrt.entfernung} ${t.metersAway}`
                : t.compactDefault}
            </p>
          </div>

          <button className="language-button" onClick={spracheWechseln}>
            {sprache === "de" ? "EN" : "DE"}
          </button>
        </div>

        <div className="sheet-content">
          <div className="quick-buttons">
            <button
              className={
                modus === "wasser" ? "quick-button active" : "quick-button"
              }
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
              className={
                modus === "park" ? "quick-button active" : "quick-button"
              }
              onClick={ladeParks}
            >
              {t.shade}
            </button>

            <button
              className={
                modus === "cooldown" ? "quick-button active" : "quick-button"
              }
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
                    {favoritName(favorit)}
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

                {naechsterOrt.entfernung > 0 && (
                  <p className="result-distance">
                    {naechsterOrt.entfernung} {t.metersAway} · ca.{" "}
                    {naechsterOrt.gehzeit} {t.walking}
                  </p>
                )}

                {naechsterOrt.typ === "cooldown" && (
                  <>
                    {naechsterOrt.brunnenEntfernung && (
                      <p className="result-extra">
                        {t.fountainNearPark}{" "}
                        {naechsterOrt.brunnenEntfernung} m {t.fromPark}
                      </p>
                    )}

                    {naechsterOrt.coolScore && (
                      <p className="cool-score">
                        {t.coolScore}: {naechsterOrt.coolScore}/10
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="result-actions">
                <button
                  className={
                    istFavorit(naechsterOrt)
                      ? "secondary-button favorite-active"
                      : "secondary-button"
                  }
                  onClick={speichereFavorit}
                >
                  {istFavorit(naechsterOrt)
                    ? t.favoriteSavedButton
                    : t.saveFavorite}
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