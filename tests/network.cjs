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
test('Authorization is removed on every update request',()=>{
 const headers={Authorization:'test-token',Cookie:'test-cookie',Referer:'facture://app/','User-Agent':'test'};
 assert.deepEqual(updateHeaders('https://release-assets.githubusercontent.com/asset',headers),{'User-Agent':'test'});
 assert.equal(updateHeaders('https://api.github.com/repos/IamJorjiboy/Facture-Explorer/releases',headers).Authorization,undefined);
});

test('Public feed and latest metadata are allowed only for this repository',()=>{
 for(const suffix of ['.atom','/latest','/download/v1.1.4/latest.yml'])assert.ok(updateRequestAllowed('https://github.com/IamJorjiboy/Facture-Explorer/releases'+suffix));
 for(const suffix of ['.atom/extra','/latest/extra','/tag/v1.1.4'])assert.equal(updateRequestAllowed('https://github.com/IamJorjiboy/Facture-Explorer/releases'+suffix),false);
 assert.equal(updateRequestAllowed('https://github.com/other/repo/releases.atom'),false);
});
