// Service worker: wakes up on a push, asks the Worker what happened, and shows the notification.
const WORKER = decodeURIComponent(new URL(self.location.href).searchParams.get('w') || '');
async function myId() { const s = await self.registration.pushManager.getSubscription(); if (!s) return ''; const h = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s.endpoint))); return [...h].map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 24); }
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('push', e => e.waitUntil((async () => {
    let msgs = []; try { const r = await fetch(WORKER + '/latest?id=' + await myId()); msgs = (await r.json()).msgs || []; } catch (x) { }
    if (!msgs.length) msgs = [{ title: 'LLD Dynasty', body: 'Something new happened in the league.', url: '' }];
    for (const m of msgs) await self.registration.showNotification(m.title, { body: m.body, icon: 'icon-192.png', badge: 'icon-192.png', data: { url: m.url || '' } });
})()));
self.addEventListener('notificationclick', e => { e.notification.close(); const url = (e.notification.data && e.notification.data.url) || self.registration.scope; e.waitUntil(clients.openWindow(url)); });
