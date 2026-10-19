const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve('_site'), requests=[], errors=[];
 const server=http.createServer((req,res)=>{
   const url=new URL(req.url,'http://localhost');
   if(!url.pathname.startsWith('/Facture-Explorer/')){res.writeHead(404).end();return;}
   const file=path.resolve(root,'.'+url.pathname.slice('/Facture-Explorer'.length).replace(/\/$/,'/index.html'));
   if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
   const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
   try{res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'}).end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
   const origin='http://127.0.0.1:'+server.address().port;
   browser=await chromium.launch({headless:true,args:['--no-sandbox']});
   const context=await browser.newContext();
   context.on('request',r=>requests.push({url:r.url(),method:r.method(),body:r.postData(),type:r.resourceType()}));
   const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.goto(origin+'/Facture-Explorer/');
   await page.locator('.invoice').waitFor();
   await page.locator('[data-nav="import"]').click();
   for(const syntax of ['ubl','cii']){
     await page.locator('#xmlFile').setInputFiles({name:'CONFIDENTIEL-'+syntax+'.xml',mimeType:'application/xml',buffer:fs.readFileSync('dist/sample-'+syntax+'.xml')});
     await page.locator('.import-meta').waitFor();
     assert.ok((await page.locator('#importBody').innerText()).length>100);
   }
   await page.locator('#pdfFile').setInputFiles({name:'CONFIDENTIEL-facturx.pdf',mimeType:'application/pdf',buffer:Buffer.from(fs.readFileSync('tests/facturx-fictif.b64','utf8'),'base64')});
   await page.waitForFunction(()=>document.querySelector('#fileStatus')?.textContent.includes('Texte analysé'),{},{timeout:30000});
   assert.ok(await page.locator('#pdfCanvas').count());
   assert.ok(await page.locator('#pdfList [data-pick]').count());
   const leaked=requests.filter(r=>!r.url.startsWith(origin+'/Facture-Explorer/')||r.method!=='GET'||r.body||/CONFIDENTIEL/.test(r.url)||['fetch','xhr','websocket','ping'].includes(r.type));
   assert.deepEqual(leaked,[]);assert.deepEqual(errors,[]);
   assert.deepEqual(await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length})),{local:0,session:0});
   const baseline=requests.length;
   assert.equal(await page.evaluate(async()=>{try{await fetch('/Facture-Explorer/?CONFIDENTIEL');return false;}catch{return true;}}),true);
   // The policy must also reject requests to the hosting origin.
   await page.locator('#clearImport').click();
   await page.locator('.upload-panel').waitFor();
   assert.equal(await page.locator('#pdfCanvas').count(),0);
   console.log('PASS web: UBL, CII, Factur-X, local recognition, no document network requests or browser storage, connect-src none, session cleared.');
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
