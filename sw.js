var CACHE='antrenman-v1';
var CORE=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE).catch(function(){}); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ if(k!==CACHE) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var req=e.request;
  if(req.method!=='GET') return;
  var url=new URL(req.url);
  if(url.origin!==location.origin) return;
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(function(r){
      var copy=r.clone(); caches.open(CACHE).then(function(c){ c.put('index.html',copy); });
      return r;
    }).catch(function(){ return caches.match('index.html'); }));
    return;
  }
  e.respondWith(caches.match(req).then(function(hit){
    if(hit) return hit;
    return fetch(req).then(function(r){
      if(r && r.status===200){ var copy=r.clone(); caches.open(CACHE).then(function(c){ c.put(req,copy); }); }
      return r;
    }).catch(function(){ return hit; });
  }));
});
