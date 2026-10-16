// Navisaf Rastreo en vivo · service worker
// Guarda la app (pantallas, íconos, librería de mapas) para que abra rápido.
// Los datos de MyGeotab y los mapas NUNCA se guardan: siempre se piden en vivo.
const CACHE='navisaf-vivo-v1';
const SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET')return;                       // llamadas a MyGeotab (POST): directo a la red
  if(u.origin===location.origin){                           // la app: primero red, si no hay señal usa la copia
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r;}).catch(()=>caches.match(e.request)));
  }else if(u.hostname==='cdnjs.cloudflare.com'||u.hostname.endsWith('gstatic.com')||u.hostname==='fonts.googleapis.com'){
    e.respondWith(caches.match(e.request).then(m=>m||fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r;})));
  }
});
