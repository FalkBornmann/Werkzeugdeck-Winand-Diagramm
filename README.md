# Winand-Diagramm

Interaktives Lehrtool für Werkzeugdeck: https://werkzeugdeck.pages.dev/tools/winand-diagramm/

## Funktionen

- Zustände unabhängig vergleichen oder einen mehrstufigen Prozess vom ausgewählten Zustand starten.
- Drei wählbare Ebenen: einfacher Elektrolyt; generische Komplexierung mit Temperatur/pH; Mehrkomponentenbad mit zwei Glanzbildner-Wirkklassen, Beschleuniger, Netzmittel und Puffer.
- Zehn Modellbeispiele einschließlich Gefügeübergängen und acht Prozessszenarien, frei bearbeitbare Schritte mit Rampe, Sprung und Haltephase.
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

Der Werkzeugdeck-Katalog veröffentlicht die sechs Browserdateien `index.html`, `style.css`, `app.js`, `model.js`, `render.js`, `workspace.js` aus einer festgeschriebenen Git-Revision.

## Daten und Projekt

Alle Berechnungen und Exporte erfolgen auf dem Gerät im Browser. Keine externen Bibliotheken, Analyseanbieter, KI-Anfragen oder automatische dauerhafte Speicherung. Beim Hosting erhält Cloudflare technisch notwendige Verbindungsdaten. Privates Projekt in Entwicklung. Code und Texte entstanden mit KI-Unterstützung. Für Richtigkeit und Eignung wird keine Garantie übernommen; gesetzliche Haftungsregeln bleiben unberührt.

## Überarbeitete Karte und Zustandsbedienung

- Quadratische Karte mit x-Achse oben und wachsender Inhibierung nach unten. Der Bereich endet bei j/jgrenz = 1; höhere Gesamtstromvorgaben erscheinen als Randdreieck mit tatsächlichem Zahlenwert.
- Referenzähnliche schematische Geometrie aus gemeinsamen Grenzfunktionen für Zuordnung, Füllung, Trennlinien und geprüfte Labelpositionen. Die Geometrie ist keine quantitative Anpassung experimenteller Grenzkurven.
- Standardmäßig druckfreundliche Vektorschraffuren; Farbe lässt sich optional einschalten. PNG und SVG übernehmen denselben Darstellungszustand.
- „Neuen Zustand anlegen“ erzeugt einen unabhängigen Schnappschuss. Namen: Ausgangszustand, Zustand 2, Zustand 3 usw. Kurzzeichen: AZ, Z2, Z3, …, EZ für den letzten Vergleichszustand. Zwischenzustände bleiben editierbar; zusätzliche Namen sind optional.
- Die Simulation hat einen getrennt gewählten festen Startzustand. Der laufende Punkt ist eine Raute und überschreibt keine gespeicherten Zustände. Änderungen am gewählten Startzustand berechnen den Prozess neu; die reine Editor-Auswahl oder das Ändern anderer Zustände ändert seinen Start nicht.
- Projektformat v2 speichert Prozessstart und Druckansicht. v1-Dateien bleiben importierbar und werden zunächst an AZ gebunden.

## Übergangsgefüge und Spitzenwachstum

Grenznahe Punkte erhalten zusätzliche Lehrhinweise und Vektorskizzen: Zwillings-Zwischentyp Z zwischen BR und FT (für Kupfer/Nickel als mögliche Anschauung), allgemeine BR/FT-Mischbilder für Zink sowie Mischskizzen für weitere Hauptgebietsgrenzen. Die Nähe wird grafisch mit Radius 0,03 in (x, H/100) bestimmt; das ist kein validiertes Koexistenzband.

Im FI-Umfeld ergänzen frei gesetzte Lehrregeln Nadeln/Whisker und verzweigte Dendriten als mögliche Formen. Diese Hinweise ändern weder die Hauptgebietszuordnung noch den begrenzten Metallteilstrom oder die Faraday-Schichtrechnung. Es werden keine Dendritenwahrscheinlichkeit, Astgrößen, Einsatzschwellen oder Zwillingsgesetze vorhergesagt. Quellen und Grenzen stehen im Theorieabschnitt.

Neue direkte Beispiele: BR/FT mit möglichem Z, FT/UD-Mischgefüge, prismatische Spitzen und mögliche Dendriten. Das zusätzliche Stromrampenszenario zeigt den Wechsel dieser Anschauungsformen. CSV ergänzt die Lehrhinweise; die Zeitmodell-Historie bewahrt sie mit schraffierten bzw. gepunkteten Randspuren in PNG und SVG.
