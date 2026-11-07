# Winand-Diagramm

Interaktives Lehrtool für Werkzeugdeck: https://werkzeugdeck.pages.dev/tools/winand-diagramm/

## Funktionen

- Zustände unabhängig vergleichen oder einen mehrstufigen Prozess vom ausgewählten Zustand starten.
- Drei wählbare Ebenen: einfacher Elektrolyt; generische Komplexierung mit Temperatur/pH; Mehrkomponentenbad mit zwei Glanzbildner-Wirkklassen, Beschleuniger, Netzmittel und Puffer.
- Sechs Modellbad-Beispiele und sieben Prozessszenarien, frei bearbeitbare Schritte mit Rampe, Sprung und Haltephase.
- Quasistationärer Parameterpfad oder Zeitmodell mit Transport-/Adsorptionsverzögerung, Faraday-Schichtwachstum und optionaler Metallbilanz eines endlichen Bades.
- Winandkarte (Inhibierung wächst nach unten), qualitative Gefügeskizzen, Schichthistorie und Schichtdickenverlauf.
- Lokale PNG- und echte SVG-Exporte für alle drei Darstellungen; CSV-Werte und JSON-Projekte zum Wiederladen.

## Fachliche Einordnung

Dies ist ein Lehrmodell, kein kalibriertes Galvanik-Auslegungsprogramm. Gebietsgrenzen, Hemmungsfunktion, Temperaturkorrektur, Additivwirkungen, lokale pH-Abweichung und Stromausbeute sind ausdrücklich illustrative Ansätze. Die Bibliothek enthält keine anwendungsfertigen Rezepturen. Konstanten, Gleichungen, Grenzen und eingeordnete Fachquellen stehen im aufklappbaren Theorieabschnitt der Anwendung.

Die x-Achse verwendet den Betrag der vorgegebenen Gesamtstromdichte geteilt durch den Modell-Grenzstrom. Der Metallteilstrom wird separat begrenzt und für die Schichtrechnung benutzt. Gleichartige Diagrammkoordinaten garantieren keine identische reale Schicht. Historische Lagen werden erhalten; einzelne Körner und Rekristallisation werden nicht simuliert.

## Lokal verwenden und testen

Node.js >= 20. Keine installierbaren Laufzeitabhängigkeiten erforderlich.

```sh
npm test
node --check app.js
```

Den Ordner mit einem lokalen HTTP-Server ausliefern, beispielsweise `python -m http.server 8080`, und im Browser öffnen. ES-Module benötigen einen HTTP-Ursprung; ein direktes Öffnen von index.html als file:// ist nicht vorgesehen.

Der Werkzeugdeck-Katalog veröffentlicht die fünf Browserdateien `index.html`, `style.css`, `app.js`, `model.js`, `render.js` aus einer festgeschriebenen Git-Revision.

## Daten und Projekt

Alle Berechnungen und Exporte erfolgen auf dem Gerät im Browser. Keine externen Bibliotheken, Analyseanbieter, KI-Anfragen oder automatische dauerhafte Speicherung. Beim Hosting erhält Cloudflare technisch notwendige Verbindungsdaten. Privates Projekt in Entwicklung. Code und Texte entstanden mit KI-Unterstützung. Für Richtigkeit und Eignung wird keine Garantie übernommen; gesetzliche Haftungsregeln bleiben unberührt.
