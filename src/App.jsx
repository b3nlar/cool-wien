import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

const TRINKBRUNNEN_URL = "/trinkbrunnen.json";
const WC_URL = "/wcs.json";
const PARK_URL = "/parks.json";

export default function App() {
  const mapRef = useRef(null);
  const orteRef = useRef([]);
  const markerRef = useRef(null);
  const standortMarkerRef = useRef(null);
  const letzterStandortRef = useRef(null);
  const alleMarkerRef = useRef([]);

  const [anzahl, setAnzahl] = useState(0);
  const [status, setStatus] = useState("Lade Daten ...");
  const [modus, setModus] = useState("Wasser 💧");
  const [naechsterOrt, setNaechsterOrt] = useState(null);
  const [alleSichtbar, setAlleSichtbar] = useState(false);
  const [panelOffen, setPanelOffen] = useState(false);

  useEffect(() => {
    const map = L.map("map", {
      zoomControl: false,
    }).setView([48.2082, 16.3738], 13);

    mapRef.current = map;

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          "© OpenStreetMap © CARTO | Datenquelle: Stadt Wien - data.wien.gv.at",
        subdomains: "abcd",
        maxZoom: 20,
      }
    ).addTo(map);

    ladeWasser();

    return () => {
      map.remove();
    };
  }, []);

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
      let iconText = "📍";

      if (ort.typ === "wasser") {
        iconText = "💧";
      }

      if (ort.typ === "wc") {
        iconText = "🚻";
      }

      if (ort.typ === "park") {
        iconText = "🌳";
      }

      const kleinerIcon = L.divIcon({
        className: "kleiner-ort-icon",
        html: `<div class="kleiner-ort-pin">${iconText}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([ort.latitude, ort.longitude], {
        icon: kleinerIcon,
      })
        .addTo(map)
        .bindPopup(ort.name);

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
    setModus("Wasser 💧");
    setStatus("Lade Trinkbrunnen ...");
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
          name: "Trinkbrunnen 💧",
        });
      });

      setAnzahl(orteRef.current.length);
      setStatus("Trinkbrunnen geladen");
      aktualisiereNaechstenOrt(letzterStandortRef.current);
    } catch (fehler) {
      console.error(fehler);
      setStatus("Fehler beim Laden");
    }
  }

  async function ladeWCs() {
    setModus("WC 🚻");
    setStatus("Lade WCs ...");
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
          name: "Öffentliche WC-Anlage 🚻",
        });
      });

      setAnzahl(orteRef.current.length);
      setStatus("WCs geladen");
      aktualisiereNaechstenOrt(letzterStandortRef.current);
    } catch (fehler) {
      console.error(fehler);
      setStatus("Fehler beim Laden");
    }
  }

  async function ladeParks() {
    setModus("Schatten 🌳");
    setStatus("Lade Parks ...");
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
          "Park";

        orteRef.current.push({
          latitude,
          longitude,
          typ: "park",
          name: `${parkName} 🌳`,
        });
      });

      setAnzahl(orteRef.current.length);
      setStatus("Parks geladen");
      aktualisiereNaechstenOrt(letzterStandortRef.current);
    } catch (fehler) {
      console.error(fehler);
      setStatus("Fehler beim Laden");
    }
  }

  function aktualisiereNaechstenOrt(meinStandort) {
    if (!meinStandort || orteRef.current.length === 0) return;

    const naechster = findeNaechstenOrt(meinStandort);

    setNaechsterOrt(naechster);
    markiereNaechstenOrt(naechster);
    zeigeBeideAufDerKarte(meinStandort, naechster);
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
        .bindPopup("Du bist ungefähr hier")
        .openPopup();

      aktualisiereNaechstenOrt(meinStandort);
    });

    map.once("locationerror", () => {
      alert("Dein Standort konnte nicht gefunden werden.");
    });
  }

  function findeNaechstenOrt(meinStandort) {
    let besterOrt = null;
    let kleinsteEntfernung = Infinity;

    orteRef.current.forEach((ort) => {
      const entfernung = mapRef.current.distance(meinStandort, [
        ort.latitude,
        ort.longitude,
      ]);

      if (entfernung < kleinsteEntfernung) {
        kleinsteEntfernung = entfernung;
        besterOrt = ort;
      }
    });

    return {
      ...besterOrt,
      entfernung: Math.round(kleinsteEntfernung),
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

    let iconText = "📍";

    if (ort.typ === "wasser") {
      iconText = "💧";
    }

    if (ort.typ === "wc") {
      iconText = "🚻";
    }

    if (ort.typ === "park") {
      iconText = "🌳";
    }

    const zielIcon = L.divIcon({
      className: "ziel-icon",
      html: `<div class="ziel-pin">${iconText}</div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22],
    });

    markerRef.current = L.marker([ort.latitude, ort.longitude], {
      icon: zielIcon,
    })
      .addTo(map)
      .bindPopup(`${ort.name}<br>${ort.entfernung} m entfernt`)
      .openPopup();
  }

  function routeOeffnen() {
    if (!naechsterOrt) return;

    const latitude = naechsterOrt.latitude;
    const longitude = naechsterOrt.longitude;

    const url = `https://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=w`;

    window.open(url, "_blank");
  }

  return (
  <div className="app">
    <div className={panelOffen ? "box open" : "box closed"}>
      <h1>Cool Wien</h1>

      <div
  className="sheet-handle-area"
  onClick={() => setPanelOffen(!panelOffen)}
>
  <div className="sheet-handle"></div>
</div>

      {panelOffen && (
        <>
          <div className="quick-buttons">
            <button
              className={
                modus === "Wasser 💧" ? "quick-button active" : "quick-button"
              }
              onClick={ladeWasser}
            >
              💧 Wasser
            </button>

            <button
              className={
                modus === "WC 🚻" ? "quick-button active" : "quick-button"
              }
              onClick={ladeWCs}
            >
              🚻 WC
            </button>

            <button
              className={
                modus === "Schatten 🌳" ? "quick-button active" : "quick-button"
              }
              onClick={ladeParks}
            >
              🌳 Schatten
            </button>
          </div>

          <button className="secondary-button" onClick={zeigeAlleOrte}>
            {alleSichtbar ? "Alle ausblenden" : "Alle anzeigen"}
          </button>

          <button onClick={sucheMeinenStandort}>In meiner Nähe suchen</button>

          {naechsterOrt && (
            <>
              <div className="result">
                <p className="result-label">Nächster Ort:</p>
                <p className="result-name">{naechsterOrt.name}</p>
                <p className="result-distance">
                  {naechsterOrt.entfernung} m entfernt
                </p>
              </div>

              <button onClick={routeOeffnen}>Route öffnen</button>
            </>
          )}
        </>
      )}
    </div>

    <div id="map"></div>
  </div>
);
}