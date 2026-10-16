function eligibility({packaged,platform,portable}) {
  if (!packaged || platform !== 'win32') return 'Les mises à jour sont disponibles dans la version Windows installée.';
  if (portable) return 'Cette version est portable. Installez la version Installation pour bénéficier des mises à jour automatiques.';
  return null;
}
function setupUpdates({app,dialog,autoUpdater,getWindow,env=process.env}) {
  let busy=false, manual=false, ready=false;
  const show = options => {
    const window = getWindow();
    return window && !window.isDestroyed() ? dialog.showMessageBox(window,options) : dialog.showMessageBox(options);
  };
  const blocked = () => eligibility({packaged:app.isPackaged,platform:process.platform,portable:!!env.PORTABLE_EXECUTABLE_FILE});
  autoUpdater.autoDownload=true;
  autoUpdater.autoInstallOnAppQuit=true;
  autoUpdater.allowPrerelease=false;
  autoUpdater.allowDowngrade=false;
  // Public release checks need no credentials; never log request headers.
  autoUpdater.logger=null;
  autoUpdater.on('update-not-available',()=>{
    if(manual)void show({type:'info',message:'Vous disposez de la dernière version publiée.'});
  });
  autoUpdater.on('error',()=>{
    if(manual)void show({type:'warning',message:'Mise à jour indisponible.',detail:'Vérifiez la connexion, la présence d’une version publiée avec latest.yml et son installateur.'});
    busy=false;manual=false;
  });
  autoUpdater.on('update-downloaded',async()=>{
    ready=true;
    const result=await show({type:'info',message:'Une mise à jour est prête.',detail:'Exportez vos repères avant de redémarrer. Si vous choisissez Plus tard, elle sera installée à la fermeture normale de l’application.',buttons:['Plus tard','Redémarrer et installer'],defaultId:0,cancelId:0});
    if(result.response===1)autoUpdater.quitAndInstall();
  });
  async function check(interactive=false) {
    const reason=blocked();
    if(reason){if(interactive)await show({type:'info',message:'Mises à jour',detail:reason});return;}
    if(ready){if(interactive)await show({type:'info',message:'Mise à jour prête : fermez puis relancez l’application après avoir exporté vos repères.'});return;}
    if(busy)return;
    busy=true;manual=interactive;
    try {const result=await autoUpdater.checkForUpdates();if(result?.downloadPromise)await result.downloadPromise;}
    catch { /* error event gives a sanitized user message */ }
    finally {busy=false;manual=false;}
  }
  if(!blocked()){
    const initial=setTimeout(()=>void check(),15000);
    const periodic=setInterval(()=>void check(),6*60*60*1000);
    app.on('before-quit',()=>{clearTimeout(initial);clearInterval(periodic);});
  }
  return {check};
}
module.exports={setupUpdates,eligibility};
