const {test} = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {resolveAsset,isInternal,externalAllowed} = require('../electron/assets.cjs');
const root = path.resolve('dist');
test('Modules, XML and workers resolve inside packaged assets',()=>{
  for (const file of ['index.html','catalog.json','sample-cii.xml','recognition-worker.js','vendor/pdf.worker.min.mjs']) {
    assert.equal(resolveAsset('facture://app/'+file,root).file,path.join(root,file));
  }
});
test('Reject other origins and path escapes',()=>{
  for(const url of ['https://app/index.html','facture://evil/index.html','facture://app/%2e%2e%2fpackage.json','facture://app/..%5cpackage.json','facture://app/%00.js','facture://app/main.cjs']) assert.throws(()=>resolveAsset(url,root));
});
test('Only documented HTTPS references may open externally',()=>{
  assert.ok(externalAllowed('https://docs.peppol.eu/poacc/billing/3.0/'));
  for (const url of ['file:///etc/passwd','javascript:alert(1)','https://docs.peppol.eu.evil.test','https://a:b@docs.peppol.eu/']) assert.equal(externalAllowed(url),false);
  assert.equal(isInternal('facture://app/index.html#demo'),true);
  assert.equal(isInternal('https://app/index.html'),false);
});
