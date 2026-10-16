const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const mapping=[['build/pdf.min.mjs','pdf.min.mjs'],['build/pdf.worker.min.mjs','pdf.worker.min.mjs'],['LICENSE','PDFJS-LICENSE']];
const verify=process.argv.includes('--verify');
for(const [src,dst] of mapping){
 const source=fs.readFileSync(path.join(root,'node_modules/pdfjs-dist',src));
 const target=path.join(root,'dist/vendor',dst);
 if(verify){if(!source.equals(fs.readFileSync(target)))throw Error('PDF.js embarqué différent du paquet verrouillé : '+dst);}
 else fs.writeFileSync(target,source);
}
console.log(verify?'PDF.js embarqué conforme au paquet verrouillé.':'PDF.js synchronisé.');
