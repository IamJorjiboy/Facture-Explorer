const references = new Set([
  'https://docs.peppol.eu/poacc/billing/3.0/rules/ubl-tc434/',
  'https://www.impots.gouv.fr/specifications-externes-b2b',
  'https://fnfe-mpe.org/ressources/'
]);
function externalAllowed(raw) { return typeof raw === 'string' && references.has(raw); }
function updateRequestAllowed(raw,method='GET') {
  if(!['GET','HEAD'].includes(method))return false;
  try {
    const u=new URL(raw);
    if(u.protocol!=='https:'||u.username||u.password||u.port)return false;
    if(u.hostname==='api.github.com')return /^\/repos\/IamJorjiboy\/Facture-Explorer\/releases(?:\/|$)/.test(u.pathname);
    if(u.hostname==='github.com')return u.pathname.startsWith('/IamJorjiboy/Facture-Explorer/releases/download/');
    return ['release-assets.githubusercontent.com','objects.githubusercontent.com'].includes(u.hostname);
  } catch {return false;}
}
function updateHeaders(raw,headers) {
  const api=new URL(raw).hostname==='api.github.com';
  return Object.fromEntries(Object.entries(headers).filter(([key])=>{
    const k=key.toLowerCase();
    return k!=='cookie' && k!=='referer' && (api || k!=='authorization');
  }));
}
function restrictUpdater(session) {
  session.setPermissionRequestHandler((_wc,_p,cb)=>cb(false));
  session.setPermissionCheckHandler(()=>false);
  session.webRequest.onBeforeRequest((d,cb)=>cb({cancel:!updateRequestAllowed(d.url,d.method)}));
  session.webRequest.onBeforeSendHeaders((d,cb)=>cb({requestHeaders:updateHeaders(d.url,d.requestHeaders)}));
}
module.exports={externalAllowed,updateRequestAllowed,updateHeaders,restrictUpdater};
