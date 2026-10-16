const {app, BrowserWindow, protocol, session, shell, Menu, dialog} = require('electron');
const {readFile} = require('node:fs/promises');
const path = require('node:path');
const {resolveAsset, isInternal, externalAllowed} = require('./assets.cjs');
protocol.registerSchemesAsPrivileged([{scheme:'facture', privileges:{standard:true, secure:true, supportFetchAPI:true, corsEnabled:true}}]);
app.setAppUserModelId('fr.factureexplorer.desktop');
let win;
let updates;
let documentSession;
const csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data: blob:; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'";
function openReference(url) {
  if (externalAllowed(url)) shell.openExternal(url).catch(() => dialog.showErrorBox('Lien indisponible', 'Impossible d’ouvrir le navigateur.'));
}
async function createWindow() {
  win = new BrowserWindow({
    width:1440, height:960, minWidth:900, minHeight:650,
    icon:path.join(__dirname, '../dist/assets/app-icon.png'),
    title:'Facture Explorer', backgroundColor:'#f5f6fa', show:false,
    webPreferences:{nodeIntegration:false, contextIsolation:true, sandbox:true, webSecurity:true, devTools:!app.isPackaged, session:documentSession, spellcheck:false}
  });
  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(({url}) => {openReference(url);return {action:'deny'};});
  win.webContents.on('will-navigate', (event,url) => {if (!isInternal(url)) {event.preventDefault();openReference(url);}});
  win.webContents.on('will-attach-webview', event => event.preventDefault());
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {label:'Fichier', submenu:[
      {label:'Imprimer le lisible', accelerator:'CmdOrCtrl+P', click:()=>win.webContents.print({printBackground:true})},
      {type:'separator'}, {label:'Quitter',role:'quit'}
    ]},
    {label:'Édition',submenu:[{role:'undo',label:'Annuler'},{role:'redo',label:'Rétablir'},{type:'separator'},{role:'cut',label:'Couper'},{role:'copy',label:'Copier'},{role:'paste',label:'Coller'},{role:'selectAll',label:'Tout sélectionner'}]},
    {label:'Affichage',submenu:[{role:'resetZoom',label:'Taille réelle'},{role:'zoomIn',label:'Agrandir'},{role:'zoomOut',label:'Réduire'},{role:'togglefullscreen',label:'Plein écran'}]},
    {label:'Aide',submenu:[{label:'Rechercher une mise à jour',click:()=>updates?.check(true)},{label:'À propos',click:()=>dialog.showMessageBox(win,{type:'info',icon:path.join(__dirname, '../dist/assets/app-icon.png'),
    title:'Facture Explorer',message:'Facture Explorer '+app.getVersion(),detail:'Factures traitées localement. Repérage BT pédagogique et heuristique. Les PDF scannés nécessitent un OCR non inclus dans cette version.'})}]}
  ]));
  await win.loadURL('facture://app/index.html');
}
app.whenReady().then(async () => {
  const ses = documentSession = session.fromPartition('invoice-documents',{cache:false});
  ses.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
  ses.setPermissionCheckHandler(()=>false);
  // Only bundled resources and in-memory downloads can be requested by the renderer.
  ses.webRequest.onBeforeRequest((details,callback)=>{
    callback({cancel:!isInternal(details.url) && !details.url.startsWith('blob:') && !details.url.startsWith('data:')});
  });
  ses.on('will-download', (_event,item) => {
    item.setSaveDialogOptions({title:'Enregistrer les repères BT',defaultPath:path.join(app.getPath('downloads'),path.basename(item.getFilename()))});
  });
  ses.protocol.handle('facture', async request => {
    try {
      if(request.method !== 'GET') return new Response('',{status:405});
      const asset = resolveAsset(request.url,path.join(__dirname,'../dist'));
      return new Response(await readFile(asset.file),{headers:{'Content-Type':asset.mime,'Content-Security-Policy':csp,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
    } catch {return new Response('Ressource introuvable',{status:404});}
  });
  await createWindow();
  const autoUpdater=require('electron-updater').autoUpdater;
  require('./network-policy.cjs').restrictUpdater(autoUpdater.netSession);
  updates = require('./updates.cjs').setupUpdates({app,dialog,autoUpdater,getWindow:()=>win});
  app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)createWindow();});
}).catch(error=>{dialog.showErrorBox('Démarrage impossible',error.message);app.quit();});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
