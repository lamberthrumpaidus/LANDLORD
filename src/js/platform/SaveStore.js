/* ALL Create by LamberthRumpaidus */
(function(root){
'use strict';
const KEY='landlord-openrealms-save-v1',DB='LANDLORD-progress',STORE='snapshots';
let memory=null,db=null,initialized=false,revision=0,mirror='pending',writes=0,queue=Promise.resolve();
function valid(raw){try{const x=JSON.parse(raw);return !!x&&Array.isArray(x.seals)&&x.seals.length===7;}catch{return false;}}
function local(){try{return localStorage.getItem(KEY);}catch{return null;}}
function setLocal(raw){try{if(raw===null)localStorage.removeItem(KEY);else localStorage.setItem(KEY,raw);}catch{}}
const initial=local();if(valid(initial))memory=initial;
function open(){
 return new Promise((resolve,reject)=>{
  if(!root.indexedDB)return reject(Error('IndexedDB unavailable'));
  const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>{const database=req.result;if(!database.objectStoreNames.contains(STORE))database.createObjectStore(STORE);};
  req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);req.onblocked=()=>reject(Error('IndexedDB blocked'));
 });
}
function read(){return new Promise((resolve,reject)=>{const req=db.transaction(STORE,'readonly').objectStore(STORE).get(KEY);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
function put(raw){return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put({raw,updated:Date.now()},KEY);tx.oncomplete=()=>{writes++;resolve();};tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}
const ready=(async()=>{
 try{db=await open();db.onversionchange=()=>{db.close();db=null;mirror='unavailable';};const snapshot=await read();
  if(revision===0&&!memory&&valid(snapshot?.raw)){memory=snapshot.raw;setLocal(memory);}
  if(revision===0&&memory&&memory!==snapshot?.raw)await put(memory);
  mirror='ready';
 }catch(error){mirror='unavailable';console.warn('LANDLORD progress mirror:',error);}
 finally{initialized=true;}
})();
function enqueue(raw){queue=queue.then(async()=>{await ready;if(db){try{await put(raw);}catch(error){mirror='unavailable';console.warn('LANDLORD progress write:',error);}}});return queue;}
function write(raw){if(!valid(raw))return false;revision++;memory=raw;setLocal(raw);enqueue(raw);return true;}
function clear(){revision++;memory=null;setLocal(null);enqueue(null);}
root.LandlordSaveStore={ready,write,clear,getRaw:()=>memory,has:()=>valid(memory),flush:()=>queue,status:()=>({initialized,mirror,writes,has:valid(memory)})};
})(globalThis);
