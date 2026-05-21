const fs = require('fs');
const path = require('path');

// ==========================================
// KONFIGURATION: Setze hier deine echte Domain ein
// ==========================================
const BASE_URL = 'https://www.fix-my-ticket.de/'; 

const docsDir = path.join(__dirname, 'docs');
const sitemapPath = path.join(docsDir, 'sitemap.xml');

console.log('🤖 Starte automatische Sitemap-Generierung...');

// Prüfen, ob der docs-Ordner existiert
if (!fs.existsSync(docsDir)) {
    console.error('❌ Fehler: Der "docs"-Ordner existiert nicht. Bitte lass zuerst dein Hauptskript laufen!');
    process.exit(1);
}

// Alle Dateien aus dem docs-Ordner auslesen
const files = fs.readdirSync(docsDir);

// Nur HTML-Dateien filtern
const htmlFiles = files.filter(file => file.endsWith('.html'));

if (htmlFiles.length === 0) {
    console.warn('⚠️ Warnung: Keine HTML-Dateien im "docs"-Ordner gefunden.');
}

// XML-Struktur aufbauen
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// Heutiges Datum im Format YYYY-MM-DD für <lastmod>
const today = new Date().toISOString().split('T')[0];

htmlFiles.forEach(file => {
    // Standard-Gewichtung für normale Unterseiten (Spokes)
    let priority = '0.6';
    let changefreq = 'weekly';

    // Wichtige Hub-Seiten oder die Startseite bekommen eine höhere Priorität bei Google
    if (file === 'parkplatz-info.html' || 
        file === 'blitzer-bussgeld-info.html' || 
        file === 'lkw-bussgeld-info.html' || 
        file === 'index.html') {
        priority = '1.0';
        changefreq = 'daily';
    }

    xml += `  <url>\n`;
    xml += `    <loc>${BASE_URL}${file}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;
    xml += `  </url>\n`;
});

xml += `</urlset>\n`;

// sitemap.xml direkt in den docs-Ordner schreiben
fs.writeFileSync(sitemapPath, xml, 'utf8');

console.log(`\n🎉 Fertig! Sitemap erfolgreich mit ${htmlFiles.length} URLs generiert.`);
console.log(`📍 Gespeichert unter: ${sitemapPath}`);