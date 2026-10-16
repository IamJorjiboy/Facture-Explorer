const {test}=require('node:test');
const assert=require('node:assert/strict');
const {externalAllowed,updateRequestAllowed,updateHeaders}=require('../electron/network-policy.cjs');
test('Reference URLs cannot carry invoice data in a path, query or fragment',()=>{
 const url='https://fnfe-mpe.org/ressources/';
 assert.ok(externalAllowed(url));
 for(const suffix of ['?invoice=secret','#secret','secret','/../secret'])assert.equal(externalAllowed(url+suffix),false);
});
test('Updater only downloads via HTTPS from release infrastructure',()=>{
 assert.ok(updateRequestAllowed('https://api.github.com/repos/IamJorjiboy/Facture-Explorer/releases/latest'));
 assert.ok(updateRequestAllowed('https://release-assets.githubusercontent.com/asset?signature=example'));
 for(const url of ['https://evil.test','https://api.github.com/repos/other/project/releases','http://github.com/IamJorjiboy/Facture-Explorer/releases/download/v1/app.exe','file:///secret'])assert.equal(updateRequestAllowed(url),false);
 assert.equal(updateRequestAllowed('https://api.github.com/repos/IamJorjiboy/Facture-Explorer/releases','POST'),false);
});
test('Private GitHub token is removed before CDN requests',()=>{
 const headers={Authorization:'test-token',Cookie:'test-cookie',Referer:'facture://app/','User-Agent':'test'};
 assert.deepEqual(updateHeaders('https://release-assets.githubusercontent.com/asset',headers),{'User-Agent':'test'});
 assert.equal(updateHeaders('https://api.github.com/repos/IamJorjiboy/Facture-Explorer/releases',headers).Authorization,'test-token');
});
