// ==========================================
//  Steadte optimieren
// ==========================================
const fs = require('fs');
const path = require('path');

// ==========================================
// 1. HIER  OPENAI API-KEY EINTRAGEN
// ==========================================
const API_KEY = "";

const inputPath = path.join(__dirname, 'staedte.json');
const outputPath = path.join(__dirname, 'staedte_optimiert.json');

// Hilfsfunktion für eine kurze Pause (Rate-Limit-Schutz)
const delay = ms => new Promise(res => setTimeout(res, ms));

async function generateInfobox(stadtName, kuerzel) {
    const prompt = `
Du bist ein SEO-Texter und Rechtsexperte für deutsches Verkehrsrecht.
Schreibe mir für die Stadt "${stadtName}" (Kfz-Kennzeichen: ${kuerzel}) einen SEO-Infobox-Text (ca. 70-90 Wörter) zum Thema Verkehrsüberwachung.

Der Text muss in ein HTML <p>-Tag eingefasst sein. 

WICHTIGE VORGABEN:
1. Nenne 1 bis 2 echte, bekannte Bundesstraßen, Autobahnen oder Hauptverkehrsadern in oder an dieser Stadt.
2. Erwähne den Parkdruck (z.B. durch Tourismus, Pendler, Einkaufszentrum, Industrie etc.).
3. Der Text muss logisch so formuliert sein, dass er auf Seiten für Blitzer, Parkverstöße UND Abschleppen passt.
4. Nenne im letzten Satz ZWINGEND das für "${stadtName}" zuständige Amtsgericht (recherchiere das korrekte). Beispiel: "Zuständig für rechtliche Einsprüche ist hier das Amtsgericht [Name]."
5. Antworte AUSSCHLIESSLICH mit dem fertigen HTML-String (kein Markdown drumherum, keine Erklärungen).
`;

    try {
        // Direkter API-Aufruf über die in Node.js integrierte fetch-Funktion
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-5.4-mini",
                messages: [
                    { role: "system", content: "Du bist ein präziser, sachlicher SEO-Texter. Du lieferst puren HTML-Code ohne Formatierungs-Ticks (kein ```html)." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`API Fehler: ${response.status} - ${errBody}`);
        }

        const data = await response.json();
        let text = data.choices[0].message.content.trim();
        
        // Markdown-Blöcke sicherheitshalber entfernen
        text = text.replace(/^```html\s*/i, '').replace(/\s*```$/i, '');
        return text;
        
    } catch (error) {
        console.error(`❌ Fehler bei ${stadtName}:`, error.message);
        return null;
    }
}

async function processStaedte() {
    console.log('🚀 Starte KI-Generierung für staedte.json ohne externe Pakete...\n');
    
    if (!fs.existsSync(inputPath)) {
        console.error('❌ Fehler: staedte.json nicht gefunden im Ordner', __dirname);
        return;
    }
    
    const staedte = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    console.log(`📌 ${staedte.length} Städte gefunden. Lehne dich zurück, das dauert ein paar Minuten...\n`);

    const staedteOptimiert = [];

    // Alle Städte durchgehen
    for (let i = 0; i < staedte.length; i++) {
        let stadt = staedte[i];
        
        // Überspringe Städte, die bereits von der KI bearbeitet wurden (Erkennbar am Wort Amtsgericht)
        if (stadt.infobox && stadt.infobox.includes('Amtsgericht')) {
            console.log(`⏭️ [${i+1}/${staedte.length}] ${stadt.name} bereits optimiert, überspringe.`);
            staedteOptimiert.push(stadt);
            continue;
        }

        console.log(`⏳ [${i+1}/${staedte.length}] Generiere Text für: ${stadt.name}...`);
        
        const neueInfobox = await generateInfobox(stadt.name, stadt.kuerzel || "");
        
        const stadtGesichert = {
    name: stadt.name,
    slug: stadt.slug,
    kuerzel: stadt.kuerzel,
    infobox: neueInfobox || stadt.infobox
};

staedteOptimiert.push(stadtGesichert);

        // Nach jeder Stadt direkt in die Datei speichern (Schutz bei Abbruch)
        fs.writeFileSync(outputPath, JSON.stringify(staedteOptimiert, null, 2), 'utf8');

        // 1 Sekunde Pause für das API Rate-Limit
        await delay(1000);
    }

    console.log('\n✅ FERTIG! Alle Städte wurden erfolgreich optimiert und in staedte_optimiert.json gespeichert.');
    console.log('👉 Lösche nun deinen API-Key aus diesem Skript und benenne "staedte_optimiert.json" in "staedte.json" um.');
}

processStaedte();

