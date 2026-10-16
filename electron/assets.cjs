const path = require('node:path');
const allowed = new Set(['.html', '.css', '.js', '.mjs', '.json', '.xml']);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.xml':'application/xml'};
function resolveAsset(raw, root) {
  const url = new URL(raw);
  if (url.protocol !== 'facture:' || url.hostname !== 'app' || url.port || url.username || url.password) throw Error('Origin');
  const name = decodeURIComponent(url.pathname);
  if (name.includes('\\') || name.includes('\0')) throw Error('Path');
  const result = path.resolve(root, '.' + (name === '/' ? '/index.html' : name));
  const rel = path.relative(root, result);
  if (rel.startsWith('..') || path.isAbsolute(rel) || !allowed.has(path.extname(result))) throw Error('Path');
  return {file: result, mime: mime[path.extname(result)]};
}
function isInternal(raw) {
  try { const u = new URL(raw); return u.protocol === 'facture:' && u.host === 'app' && !u.username && !u.password; } catch { return false; }
}
const {externalAllowed}=require('./network-policy.cjs');
module.exports = {resolveAsset, isInternal, externalAllowed};
