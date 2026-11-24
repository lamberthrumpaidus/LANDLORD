/* ALL Create by LamberthRumpaidus */
(function(){
 if(!('serviceWorker' in navigator)||!window.isSecureContext)return;
 const root=document.querySelector('#settingsPanel .settings-scroll');
 const line=document.createElement('div');line.className='setting-line';
 const label=document.createElement('label');label.textContent='OFFLINE';
 const status=document.createElement('output');status.id='offlineStatus';status.textContent='Preparing offline assets…';status.setAttribute('aria-live','polite');
 line.append(label,status);root?.append(line);
 navigator.serviceWorker.register('./sw.js').then(async()=>{
  await navigator.serviceWorker.ready;
  status.textContent='Offline ready';
  document.documentElement.dataset.offline='ready';
 }).catch(error=>{status.textContent='Offline unavailable';console.warn('LANDLORD offline:',error);});
})();
