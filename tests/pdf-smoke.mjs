import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as canvas from '@napi-rs/canvas';
// Node 24 shim only; Chromium provides this API in the packaged Electron.
Uint8Array.prototype.toHex ??= function(){return Buffer.from(this).toString('hex');};
Object.assign(globalThis,{DOMMatrix:canvas.DOMMatrix,ImageData:canvas.ImageData,Path2D:canvas.Path2D});
const lib=await import('../dist/vendor/pdf.min.mjs');
lib.GlobalWorkerOptions.workerSrc=new URL('../dist/vendor/pdf.worker.min.mjs',import.meta.url).href;
const data=new Uint8Array(Buffer.from(fs.readFileSync(new URL('./facturx-fictif.b64',import.meta.url),'utf8'),'base64'));
const task=lib.getDocument({data,isEvalSupported:false,enableScripting:false,useWasm:false,verbosity:0});
try {
 const pdf=await task.promise;
 const attachments=await pdf.getAttachments();
 const entry=Array.from(attachments,([id,a])=>({...a,attachmentId:id})).find(a=>a.filename==='factur-x.xml');
 assert.ok(entry);
 assert.match(new TextDecoder().decode(await pdf.getAttachmentContent(entry.attachmentId)),/CrossIndustryInvoice/);
 const page=await pdf.getPage(1);
 assert.ok((await page.getTextContent()).items.some(x=>x.str.includes('FICTIF')));
 console.log('PASS PDF.js: texte et XML du PDF synthétique.');
} finally { await task.destroy(); }
const {parseInvoice}=await import('../dist/parser.js');
class NeverParse {parseFromString(){throw Error('Parser should not be reached');}}
assert.throws(()=>parseInvoice('<!DOCTYPE a SYSTEM "https://evil.test/x"><a/>',NeverParse),/DTD/);
assert.throws(()=>parseInvoice('<!ENTITY secret SYSTEM "file:///secret">',NeverParse),/ENTITY/);
console.log('PASS XML: DTD et entités externes rejetées avant analyse.');
