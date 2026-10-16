import assert from 'node:assert/strict';
import {matchRecords,textSpans,numberKey} from '../dist/recognition.js';
const span=(text,x=.1,y=.1,page=1)=>({text,x,y,page,width:.25,height:.02});
assert.equal(numberKey('1\u202f234,56 €'),'1234.56');assert.equal(numberKey('1,234.56'),'1234.56');assert.equal(numberKey('−50,00'),'-50');
let r=matchRecords([{id:27,value:'Société Étoile'}],[span('SOCIETE ETOILE')]);assert.equal(r[0].status,'unique');
r=matchRecords([{id:2,value:'20261016'}],[span('Date : 16/10/2026')]);assert.equal(r[0].status,'unique');
r=matchRecords([{id:115,value:'1234.56'}],[span('Net à payer : 1 234,56 €')]);assert.equal(r[0].status,'unique');
r=matchRecords([{id:84,value:'FR761234567890'}],[span('FR76 1234 5678 90')]);assert.equal(r[0].status,'unique');
r=matchRecords([{id:109,value:'1000.00'},{id:106,value:'1000.00'}],[span('1 000,00')]);assert(r.every(x=>x.status==='ambiguous'&&x.shared));
r=matchRecords([{id:115,value:'1200'}],[span('1 200,00'),span('1 200,00',.1,.5,2)]);assert.equal(r[0].candidateCount,2);assert.equal(r[0].status,'ambiguous');
r=matchRecords([{id:115,value:'100'}],[span('2100,00')]);assert.equal(r[0].status,'missing');
r=matchRecords([{id:115,value:'50'}],[span('-50,00')]);assert.equal(r[0].status,'missing');
r=matchRecords([{id:151,value:'S'}],[span('S')]);assert.equal(r[0].status,'unsupported');
r=matchRecords([{id:1,value:'FAC-001'}],[span('FAC-001-A')]);assert.equal(r[0].status,'missing'); // Do not match a shorter invoice identifier inside another one
r=matchRecords([{id:27,value:'Maison Horizon'}],[span('Maison',.1),{...span('Horizon',.2),width:.1}]);assert.equal(r[0].status,'unique');
const rect=textSpans({items:[{str:'Hello',transform:[10,0,0,10,20,80],width:30,fontName:'f'}],styles:{f:{ascent:.8}}},{transform:[1,0,0,-1,0,100],width:100,height:100,scale:1},1)[0];assert.equal(rect.x,.2);assert.equal(rect.y,.12);assert.equal(rect.width,.3);assert.equal(rect.height,.1);
assert.equal(matchRecords([{id:27,value:'Absent'}],[])[0].status,'missing');
console.log('PASS: numeric formats, signs, dates, identifiers, repeated values, shared BT values, missing text, fragment joining and PDF coordinates.');
