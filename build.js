const fs = require('fs');
const path = require('path');

// Output-Ordner erstellen (Kein /de/ Ordner für dieses Projekt!)
const outputDir = path.join(__dirname, 'docs');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

console.log('🚀 Starte finale Generierung aller Park-Retter Hubs & Spokes...\n');

// --- HILFSFUNKTIONEN ---
const loadTemplate = (name) => fs.readFileSync(path.join(__dirname, name), 'utf8');

function generateCrossLinks(allItems, currentItem, urlGenerator, nameGenerator, maxLinks = 6) {
    let otherItems = allItems.filter(item => item.slug !== currentItem.slug);
    // Fisher-Yates Shuffle
    for (let i = otherItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherItems[i], otherItems[j]] = [otherItems[j], otherItems[i]];
    }
    const selectedItems = otherItems.slice(0, maxLinks);
    
    let html = '';
    selectedItems.forEach(item => {
        html += `<a href="${urlGenerator(item)}">${nameGenerator(item)}</a>\n`;
    });
    return html;
}

// 1. Dateien einlesen
const parkfirmen = JSON.parse(fs.readFileSync(path.join(__dirname, 'parkfirmen.json'), 'utf8'));
const supermaerkte = JSON.parse(fs.readFileSync(path.join(__dirname, 'supermaerkte.json'), 'utf8'));
const staedte = JSON.parse(fs.readFileSync(path.join(__dirname, 'staedte.json'), 'utf8'));
const verkehrsbetriebe = JSON.parse(fs.readFileSync(path.join(__dirname, 'verkehrsbetriebe.json'), 'utf8'));

const masterTpl = loadTemplate('parkplatz-master.html');
const ordnungsamtTpl = loadTemplate('ordnungsamt-master.html');
const blitzerTpl = loadTemplate('blitzer-master.html');
const abstandTpl = loadTemplate('abstand-master.html');
const ampelTpl = loadTemplate('ampel-master.html');
const lkwTpl = loadTemplate('lkw-master.html');
const handyTpl = loadTemplate('handy-master.html');
const ebeTpl = loadTemplate('ebe-master.html');

// 2. ALLE Sammel-Variablen sauber am Anfang deklarieren (Verhindert ReferenceErrors!)
let optFirmen = "", linkFirmen = "";
let optSupermaerkte = "", linkSupermaerkte = "";
let optStaedte = "", linkStaedte = "";
let optOrdnungsamt = "", linkOrdnungsamt = "";
let optBlitzer = "", linkBlitzer = "";
let optAbstand = "", linkAbstand = ""; 
let optAmpel = "", linkAmpel = "";
let optLkw = "", linkLkw = "";
let optHandy = "", linkHandy = "";
let optEbe = "", linkEbe = "";

// =====================================================================
// SILO 1: PARKFIRMEN (Juristische Suche)
// =====================================================================
parkfirmen.forEach(p => {
    let fName = `knoellchen-widerspruch-${p.slug}.html`;
    let crossLinks = generateCrossLinks(parkfirmen, p, item => `knoellchen-widerspruch-${item.slug}.html`, item => item.name);
    
    // NEU: Infobox auslesen (oder leer lassen, falls keine existiert)
    let infoboxText = p.infobox || ""; 

    let content = masterTpl
        .replace(/\{\{FIRMA_NAME\}\}/g, p.name)
        .replace(/\{\{FIRMA_EMAIL\}\}/g, p.email)
        .replace(/\{\{AUFTRAGGEBER\}\}/g, "dem Supermarkt") 
        .replace(/\{\{STADT_NAME\}\}/g, "Ihrer Stadt")      
        .replace(/value="dem Supermarkt, Ihrer Stadt"/g, 'value="" placeholder="z.B. Lidl, Braunschweig"') 
        .replace(/\{\{DATEINAME\}\}/g, fName)
        .replace(/\{\{BELIEBTE_LINKS\}\}/g, crossLinks)
        .replace(/\{\{STADT_INFOBOX\}\}/g, infoboxText); // NEU: Platzhalter ersetzen

    fs.writeFileSync(path.join(outputDir, fName), content, 'utf8');
    
    optFirmen += `<option value="${fName}">${p.name}</option>\n`;
    linkFirmen += `<a href="${fName}">${p.name}</a>\n`;
});

// =====================================================================
// SILO 2: SUPERMÄRKTE (Emotionale Suche)
// =====================================================================
supermaerkte.forEach(s => {
    let fName = `parkplatz-strafe-${s.slug}.html`;
    let crossLinks = generateCrossLinks(supermaerkte, s, item => `parkplatz-strafe-${item.slug}.html`, item => `${item.name} Parkplatz`);

    // NEU: Infobox auslesen (oder leer lassen, falls keine existiert)
    let infoboxText = s.infobox || "";

    let content = masterTpl
        .replace(/\{\{FIRMA_NAME\}\} Ticket erhalten\? Wehren Sie sich erfolgreich!/g, `Knöllchen auf dem ${s.name}-Parkplatz? So wehren Sie sich!`)
        .replace(/Widerspruch Parkknöllchen \{\{FIRMA_NAME\}\} \(\{\{STADT_NAME\}\}\)/g, `${s.name} Parkplatz Strafe: Widerspruch & Abzocke abwehren`)
        
        .replace(/\{\{FIRMA_NAME\}\}/g, "der Parkfirma") 
        .replace(/\{\{FIRMA_EMAIL\}\}/g, "") 
        .replace(/\{\{AUFTRAGGEBER\}\}/g, s.name)
        .replace(/\{\{STADT_NAME\}\}/g, "Ihrer Stadt")
        
        .replace(/value="der Parkfirma"/g, 'value="" placeholder="Name der Parkfirma eintragen"')
        .replace(/value="\{\{FIRMA_EMAIL\}\}"/g, 'value="" placeholder="info@parkfirma.de"')
        .replace(/value=".*, Ihrer Stadt"/g, `value="${s.name}, " placeholder="${s.name}, Stadt eintragen"`)
        
        .replace(/\{\{DATEINAME\}\}/g, fName)
        .replace(/\{\{BELIEBTE_LINKS\}\}/g, crossLinks)
        .replace(/\{\{STADT_INFOBOX\}\}/g, infoboxText); // NEU: Platzhalter ersetzen

    fs.writeFileSync(path.join(outputDir, fName), content, 'utf8');
    
    optSupermaerkte += `<option value="${fName}">${s.name} Parkplatz</option>\n`;
    linkSupermaerkte += `<a href="${fName}">${s.name} Parkplatz</a>\n`;
});

// =====================================================================
// SILO 3: STÄDTE (Lokale Suche)
// =====================================================================
staedte.forEach(c => {
    let fName = `private-strafzettel-${c.slug}.html`;
    let crossLinks = generateCrossLinks(staedte, c, item => `private-strafzettel-${item.slug}.html`, item => item.name);
    let stadtText = c.infobox || "";

    let content = masterTpl
        .replace(/\{\{FIRMA_NAME\}\} Ticket erhalten\? Wehren Sie sich erfolgreich!/g, `Private Parkplatz-Abzocke in ${c.name} abwehren`)
        .replace(/Widerspruch Parkknöllchen \{\{FIRMA_NAME\}\} \(\{\{STADT_NAME\}\}\)/g, `Parkplatz Strafe ${c.name}: Private Strafzettel abwehren`)
        
        .replace(/\{\{FIRMA_NAME\}\}/g, "der Parkfirma") 
        .replace(/\{\{FIRMA_EMAIL\}\}/g, "") 
        .replace(/\{\{AUFTRAGGEBER\}\}/g, "einem Supermarkt")
        .replace(/\{\{STADT_NAME\}\}/g, c.name)
        
        .replace(/value="der Parkfirma"/g, 'value="" placeholder="Name der Parkfirma eintragen"')
        .replace(/value="\{\{FIRMA_EMAIL\}\}"/g, 'value="" placeholder="info@parkfirma.de"')
        .replace(/value="einem Supermarkt, .+"/g, `value="" placeholder="z.B. Lidl, ${c.name}"`)
        
        .replace(/\{\{DATEINAME\}\}/g, fName)
        .replace(/\{\{BELIEBTE_LINKS\}\}/g, crossLinks)
        .replace(/\{\{STADT_INFOBOX\}\}/g, stadtText);

    fs.writeFileSync(path.join(outputDir, fName), content, 'utf8');
    
    optStaedte += `<option value="${fName}">${c.name}</option>\n`;
    linkStaedte += `<a href="${fName}">Strafzettel in ${c.name}</a>\n`;
});

// =====================================================================
// SILO 4: ORDNUNGSAMT / STAATLICHE KNÖLLCHEN
// =====================================================================
staedte.forEach(c => {
    let fName = `einspruch-ordnungsamt-${c.slug}.html`;
    let crossLinks = generateCrossLinks(staedte, c, item => `einspruch-ordnungsamt-${item.slug}.html`, item => `Ordnungsamt ${item.name}`);
    let kuerzel = c.kuerzel || c.name.charAt(0).toUpperCase();
    let stadtText = c.infobox || "";

    let content = ordnungsamtTpl
        .replace(/\{\{STADT_NAME\}\}/g, c.name)
        .replace(/\{\{STADT_NAME_LOW\}\}/g, c.slug)
        .replace(/\{\{STADT_KUERZEL\}\}/g, kuerzel)
        .replace(/\{\{DATEINAME\}\}/g, fName)
        .replace(/\{\{BELIEBTE_LINKS\}\}/g, crossLinks)
        .replace(/\{\{STADT_INFOBOX\}\}/g, stadtText);

    fs.writeFileSync(path.join(outputDir, fName), content, 'utf8');
    
    optOrdnungsamt += `<option value="${fName}">Ordnungsamt ${c.name}</option>\n`;
    linkOrdnungsamt += `<a href="${fName}">Ordnungsamt ${c.name}</a>\n`;
});

// =====================================================================
// SILO 5: BLITZER & GESCHWINDIGKEIT
// =====================================================================
staedte.forEach(c => {
    let fName = `einspruch-blitzer-${c.slug}.html`;
    let crossLinks = generateCrossLinks(staedte, c, item => `einspruch-blitzer-${item.slug}.html`, item => `Blitzer ${item.name}`);
    let kuerzel = c.kuerzel || c.name.charAt(0).toUpperCase();
    let stadtText = c.infobox || "";

    let content = blitzerTpl
        .replace(/\{\{STADT_NAME\}\}/g, c.name)
        .replace(/\{\{STADT_NAME_LOW\}\}/g, c.slug)
        .replace(/\{\{STADT_KUERZEL\}\}/g, kuerzel)
        .replace(/\{\{DATEINAME\}\}/g, fName)
        .replace(/\{\{BELIEBTE_LINKS\}\}/g, crossLinks)
        .replace(/\{\{STADT_INFOBOX\}\}/g, stadtText);

    fs.writeFileSync(path.join(outputDir, fName), content, 'utf8');
    
    optBlitzer += `<option value="${fName}">Blitzer ${c.name}</option>\n`;
    linkBlitzer += `<a href="${fName}">Blitzer ${c.name}</a>\n`;
});

// =====================================================================
// SILO 6: ABSTANDSVERSTÖSSE
// =====================================================================
staedte.forEach(c => {
    let fName = `einspruch-abstandsverstoss-${c.slug}.html`;
    let crossLinks = generateCrossLinks(staedte, c, item => `einspruch-abstandsverstoss-${item.slug}.html`, item => `Abstandsmessung ${item.name}`);
    let kuerzel = c.kuerzel || c.name.charAt(0).toUpperCase();
    let stadtText = c.infobox || "";

    let content = abstandTpl
        .replace(/\{\{STADT_NAME\}\}/g, c.name)
        .replace(/\{\{STADT_NAME_LOW\}\}/g, c.slug)
        .replace(/\{\{STADT_KUERZEL\}\}/g, kuerzel)
        .replace(/\{\{DATEINAME\}\}/g, fName)
        .replace(/\{\{BELIEBTE_LINKS\}\}/g, crossLinks)
        .replace(/\{\{STADT_INFOBOX\}\}/g, stadtText);

    fs.writeFileSync(path.join(outputDir, fName), content, 'utf8');
    
    optAbstand += `<option value="${fName}">Abstandsmessung ${c.name}</option>\n`;
    linkAbstand += `<a href="${fName}">Abstandsmessung ${c.name}</a>\n`;
});

// =====================================================================
// SILO 7: ROTE AMPEL / ROTLICHTVERSTOSS
// =====================================================================
staedte.forEach(c => {
    let fName = `einspruch-rote-ampel-${c.slug}.html`;
    let crossLinks = generateCrossLinks(staedte, c, item => `einspruch-rote-ampel-${item.slug}.html`, item => `Rote Ampel ${item.name}`);
    let kuerzel = c.kuerzel || c.name.charAt(0).toUpperCase();
    let stadtText = c.infobox || "";

    let content = ampelTpl
        .replace(/\{\{STADT_NAME\}\}/g, c.name)
        .replace(/\{\{STADT_NAME_LOW\}\}/g, c.slug)
        .replace(/\{\{STADT_KUERZEL\}\}/g, kuerzel)
        .replace(/\{\{DATEINAME\}\}/g, fName)
        .replace(/\{\{BELIEBTE_LINKS\}\}/g, crossLinks)
        .replace(/\{\{STADT_INFOBOX\}\}/g, stadtText);

    fs.writeFileSync(path.join(outputDir, fName), content, 'utf8');
    
    optAmpel += `<option value="${fName}">Rote Ampel ${c.name}</option>\n`;
    linkAmpel += `<a href="${fName}">Rote Ampel ${c.name}</a>\n`;
});

// =====================================================================
// SILO 8: LKW & BERUFSKRAFTFAHRER
// =====================================================================
staedte.forEach(c => {
    let fName = `einspruch-lkw-bussgeld-${c.slug}.html`;
    let crossLinks = generateCrossLinks(staedte, c, item => `einspruch-lkw-bussgeld-${item.slug}.html`, item => `LKW-Kontrolle ${item.name}`);
    let kuerzel = c.kuerzel || c.name.charAt(0).toUpperCase();
    let stadtText = c.infobox || "";

    let content = lkwTpl
        .replace(/\{\{STADT_NAME\}\}/g, c.name)
        .replace(/\{\{STADT_NAME_LOW\}\}/g, c.slug)
        .replace(/\{\{STADT_KUERZEL\}\}/g, kuerzel)
        .replace(/\{\{DATEINAME\}\}/g, fName)
        .replace(/\{\{BELIEBTE_LINKS\}\}/g, crossLinks)
        .replace(/\{\{STADT_INFOBOX\}\}/g, stadtText);

    fs.writeFileSync(path.join(outputDir, fName), content, 'utf8');
    
    optLkw += `<option value="${fName}">LKW-Kontrolle ${c.name}</option>\n`;
    linkLkw += `<a href="${fName}">LKW-Kontrolle ${c.name}</a>\n`;
});

// =====================================================================
// SILO 9: HANDY AM STEUER
// =====================================================================
staedte.forEach(c => {
    let fName = `einspruch-handy-am-steuer-${c.slug}.html`;
    let crossLinks = generateCrossLinks(staedte, c, item => `einspruch-handy-am-steuer-${item.slug}.html`, item => `Handyverstoß ${item.name}`);
    let kuerzel = c.kuerzel || c.name.charAt(0).toUpperCase();
    let stadtText = c.infobox || "";

    let content = handyTpl
        .replace(/\{\{STADT_NAME\}\}/g, c.name)
        .replace(/\{\{STADT_NAME_LOW\}\}/g, c.slug)
        .replace(/\{\{STADT_KUERZEL\}\}/g, kuerzel)
        .replace(/\{\{DATEINAME\}\}/g, fName)
        .replace(/\{\{BELIEBTE_LINKS\}\}/g, crossLinks)
        .replace(/\{\{STADT_INFOBOX\}\}/g, stadtText);

    fs.writeFileSync(path.join(outputDir, fName), content, 'utf8');
    
    optHandy += `<option value="${fName}">Handy am Steuer ${c.name}</option>\n`;
    linkHandy += `<a href="${fName}">Handy am Steuer ${c.name}</a>\n`;
});

// =====================================================================
// SILO 10: ÖPNV / ERHÖHTES BEFÖRDERUNGSENTGELT (60€ Strafe)
// =====================================================================
verkehrsbetriebe.forEach(v => {
    let fName = `einspruch-60-euro-${v.slug}.html`;
    // Crosslinks nur zu anderen Verkehrsbetrieben generieren
    let crossLinks = generateCrossLinks(verkehrsbetriebe, v, item => `einspruch-60-euro-${item.slug}.html`, item => item.name);
    
    let infoboxText = v.infobox || "";

    let content = ebeTpl
        .replace(/\{\{VERKEHRSBETRIEB_NAME\}\}/g, v.name)
        .replace(/\{\{VERKEHRSBETRIEB_EMAIL\}\}/g, v.email)
        .replace(/\{\{STADT_NAME\}\}/g, v.stadt)
        .replace(/\{\{DATEINAME\}\}/g, fName)
        .replace(/\{\{BELIEBTE_LINKS\}\}/g, crossLinks)
        .replace(/\{\{STADT_INFOBOX\}\}/g, infoboxText);

    fs.writeFileSync(path.join(outputDir, fName), content, 'utf8');
    
    // Für einen zukünftigen Hub-aufbau speichern
    optEbe += `<option value="${fName}">${v.name}</option>\n`;
    linkEbe += `<a href="${fName}">60€ Strafe ${v.name} (${v.stadt})</a>\n`;
});

// =====================================================================
// HUB-SEITE 1 GENERIEREN (Parkplatz)
// =====================================================================
if (fs.existsSync(path.join(__dirname, 'hub-parkplatz-master.html'))) {
    let hubContent = loadTemplate('hub-parkplatz-master.html')
        .replace(/\{\{OPT_FIRMEN\}\}/g, optFirmen)
        .replace(/\{\{LINK_FIRMEN\}\}/g, linkFirmen)
        .replace(/\{\{OPT_SUPERMAERKTE\}\}/g, optSupermaerkte)
        .replace(/\{\{LINK_SUPERMAERKTE\}\}/g, linkSupermaerkte)
        .replace(/\{\{OPT_STAEDTE\}\}/g, optStaedte)
        .replace(/\{\{LINK_STAEDTE\}\}/g, linkStaedte)
        .replace(/\{\{OPT_ORDNUNGSAMT\}\}/g, optOrdnungsamt)
        .replace(/\{\{LINK_ORDNUNGSAMT\}\}/g, linkOrdnungsamt);
        
    fs.writeFileSync(path.join(outputDir, 'parkplatz-info.html'), hubContent, 'utf8');
    console.log('✅ Hub-Seite für Parkplätze erfolgreich generiert.');
} else {
    console.warn("⚠️ hub-parkplatz-master.html fehlt noch, Hub wurde übersprungen.");
}

// =====================================================================
// HUB-SEITE 2 GENERIEREN (Blitzer, Abstand, Ampel, Handy)
// =====================================================================
if (fs.existsSync(path.join(__dirname, 'hub-blitzer-master.html'))) {
    let hubBlitzerContent = loadTemplate('hub-blitzer-master.html')
        .replace(/\{\{OPT_BLITZER\}\}/g, optBlitzer)
        .replace(/\{\{LINK_BLITZER\}\}/g, linkBlitzer)
        .replace(/\{\{OPT_ABSTAND\}\}/g, optAbstand)
        .replace(/\{\{LINK_ABSTAND\}\}/g, linkAbstand)
        .replace(/\{\{OPT_AMPEL\}\}/g, optAmpel)       
        .replace(/\{\{LINK_AMPEL\}\}/g, linkAmpel)    
        .replace(/\{\{OPT_HANDY\}\}/g, optHandy)       
        .replace(/\{\{LINK_HANDY\}\}/g, linkHandy);    
        
    fs.writeFileSync(path.join(outputDir, 'blitzer-bussgeld-info.html'), hubBlitzerContent, 'utf8');
    console.log('✅ Hub-Seite für Blitzer, Abstand & Ampel erfolgreich generiert.');
} else {
    console.warn("⚠️ hub-blitzer-master.html fehlt noch, Blitzer-Hub wurde übersprungen.");
}

// =====================================================================
// HUB-SEITE 3 GENERIEREN (LKW)
// =====================================================================
if (fs.existsSync(path.join(__dirname, 'hub-lkw-master.html'))) {
    let hubLkwContent = loadTemplate('hub-lkw-master.html')
        .replace(/\{\{OPT_LKW\}\}/g, optLkw)       
        .replace(/\{\{LINK_LKW\}\}/g, linkLkw);    
        
    fs.writeFileSync(path.join(outputDir, 'lkw-bussgeld-info.html'), hubLkwContent, 'utf8');
    console.log('✅ Hub-Seite für LKW & Berufskraftfahrer erfolgreich generiert.');
} else {
    console.warn("⚠️ hub-lkw-master.html fehlt noch, LKW-Hub wurde übersprungen.");
}

// =====================================================================
// HUB-SEITE 4 GENERIEREN (ÖPNV / Bahn / 60 Euro)
// =====================================================================
if (fs.existsSync(path.join(__dirname, 'hub-bahn-master.html'))) {
    let hubBahnContent = loadTemplate('hub-bahn-master.html')
        .replace(/\{\{OPT_EBE\}\}/g, optEbe)       
        .replace(/\{\{LINK_EBE\}\}/g, linkEbe);    
        
    fs.writeFileSync(path.join(outputDir, 'bahn-bussgeld-info.html'), hubBahnContent, 'utf8');
    console.log('✅ Hub-Seite für Bahn & ÖPNV erfolgreich generiert.');
} else {
    console.warn("⚠️ hub-bahn-master.html fehlt noch, Bahn-Hub wurde übersprungen (kann später hinzugefügt werden).");
}

console.log('\n🎉 Fertig! Der Build lief ohne Fehler durch.');