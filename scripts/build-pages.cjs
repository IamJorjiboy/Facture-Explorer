const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, '_site');
fs.rmSync(output, {recursive:true, force:true});
fs.cpSync(path.join(root, 'dist'), output, {recursive:true});
const file = path.join(output, 'index.html');
let html = fs.readFileSync(file, 'utf8');
const csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data: blob:; connect-src 'none'; worker-src 'self' blob:; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'";
html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="'+csp+'"><meta name="referrer" content="no-referrer">');
html = html.replace('Application bureau ·', 'Version web ·');
html = html.replace('● Outil pédagogique', '● Fichiers traités dans votre navigateur');
html = html.replace('<footer>', '<footer><p>Vos factures sont traitées localement dans cet onglet. Exportez vos repères avant de fermer. <a href="https://github.com/IamJorjiboy/Facture-Explorer/releases/latest" target="_blank" rel="noopener noreferrer">Télécharger l’application Windows ↗</a></p>');
if (!html.includes('Version web ·')) throw new Error('Libellé de version web absent');
fs.writeFileSync(file, html);
fs.writeFileSync(path.join(output, '.nojekyll'), '');
for (const resource of ['app.js','catalog.json','parser.js','recognition-worker.js','vendor/pdf.min.mjs','vendor/pdf.worker.min.mjs','assets/app-icon.png']) {
  if (!fs.existsSync(path.join(output, resource))) throw new Error('Ressource manquante : '+resource);
}
console.log('Version web préparée dans _site, sans fichier utilisateur.');

// Bundle the public reference data so document processing needs no fetch/XHR.
const data = {
  catalog: JSON.parse(fs.readFileSync(path.join(root, 'dist/catalog.json'), 'utf8')),
  ubl: fs.readFileSync(path.join(root, 'dist/sample-ubl.xml'), 'utf8'),
  cii: fs.readFileSync(path.join(root, 'dist/sample-cii.xml'), 'utf8')
};
fs.writeFileSync(path.join(output, 'reference-data.js'), 'export default '+JSON.stringify(data)+';\n');
const appFile = path.join(output, 'app.js');
let source = fs.readFileSync(appFile, 'utf8');
source = "import referenceData from './reference-data.js';\n" + source;
const replacements = [
  ["await fetch('catalog.json').then(r=>{if(!r.ok)throw Error('Catalogue indisponible');return r.json()})", 'referenceData.catalog'],
  ["await fetch('sample-ubl.xml').then(r=>r.text())", 'referenceData.ubl'],
  ["await fetch('sample-cii.xml').then(r=>r.text())", 'referenceData.cii']
];
for(const [before, after] of replacements) {
  if(!source.includes(before))throw new Error('Adaptation web à revoir : '+before);
  source = source.replace(before, after);
}
if(/\bfetch\s*\(/.test(source))throw new Error('Appel réseau inattendu dans la version web');
fs.writeFileSync(appFile, source);
