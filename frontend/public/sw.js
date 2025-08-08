/* global self, clients */

self.addEventListener('push', (event) => {
  try {
    const payload = event.data ? event.data.json() : {};
    const title = payload.title || 'Habitus33';
    const options = {
      body: payload.body || '',
      icon: payload.icon || '/images/mascot/habitus-logo-seal.png',
      badge: payload.badge || '/images/mascot/habitus-logo-seal.png',
      data: payload.data || {},
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    // no-op
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification && event.notification.data && event.notification.data.actionLink) || '/dashboard';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        try {
          // @ts-ignore - navigate may not exist in some contexts
          if ('navigate' in client) client.navigate(url);
          if ('focus' in client) return client.focus();
        } catch {}
      }
      if (clients.openWindow) return clients.openWindow(url);
      return undefined;
    })
  );
});


