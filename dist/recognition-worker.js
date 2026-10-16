import {matchRecords} from './recognition.js';
self.onmessage=({data})=>{try{self.postMessage({results:matchRecords(data.records,data.spans)});}catch(e){self.postMessage({error:e.message});}};
