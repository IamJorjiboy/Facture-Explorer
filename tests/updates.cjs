const {test}=require('node:test');
const assert=require('node:assert/strict');
const {eligibility}=require('../electron/updates.cjs');
test('Public updates require an installed Windows app, without credentials',()=>{
  const state={packaged:true,platform:'win32',portable:false};
  assert.equal(eligibility(state),null);
  for(const change of [{packaged:false},{platform:'linux'},{portable:true}])assert.equal(typeof eligibility({...state,...change}),'string');
});
const vm=require('node:vm');
const fs=require('node:fs');
const {EventEmitter}=require('node:events');
test('Scheduled and manual checks work without credentials; restart can be postponed',async()=>{
  const scheduled=[],cleared=[],messages=[];
  const app=new EventEmitter();app.isPackaged=true;
  const updater=new EventEmitter();let checks=0,restarts=0;
  updater.checkForUpdates=async()=>{checks++;updater.emit('update-not-available');return null;};
  updater.quitAndInstall=()=>restarts++;
  const sandbox={module:{exports:{}},process:{platform:'win32',env:{}},setTimeout:(fn,ms)=>{scheduled.push({fn,ms});return 1;},setInterval:(fn,ms)=>{scheduled.push({fn,ms});return 2;},clearTimeout:id=>cleared.push(id),clearInterval:id=>cleared.push(id)};
  vm.runInNewContext(fs.readFileSync(require.resolve('../electron/updates.cjs'),'utf8'),sandbox);
  const updates=sandbox.module.exports.setupUpdates({app,autoUpdater:updater,getWindow:()=>null,dialog:{showMessageBox:async options=>{messages.push(options);return {response:0};}}});
  assert.deepEqual(scheduled.map(s=>s.ms),[15000,21600000]);
  scheduled[0].fn();await new Promise(setImmediate);
  assert.equal(checks,1);assert.equal(messages.length,0);
  await updates.check(true);assert.equal(checks,2);assert.equal(messages.length,1);
  updater.emit('update-downloaded');await new Promise(setImmediate);
  assert.equal(restarts,0);assert.equal(updater.autoInstallOnAppQuit,true);assert.equal(updater.autoDownload,true);
  await updates.check(true);assert.equal(checks,2);
  app.emit('before-quit');assert.deepEqual(cleared,[1,2]);
});
