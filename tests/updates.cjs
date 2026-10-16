const {test}=require('node:test');
const assert=require('node:assert/strict');
const {eligibility}=require('../electron/updates.cjs');
test('Private updates require an installed Windows app and local authentication',()=>{
  const state={packaged:true,platform:'win32',portable:false,token:'test-only'};
  assert.equal(eligibility(state),null);
  for(const change of [{packaged:false},{platform:'linux'},{portable:true},{token:''}])assert.equal(typeof eligibility({...state,...change}),'string');
});
