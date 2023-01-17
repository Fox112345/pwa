if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/pwa/sw.js').then(() => {
    console.log('SW registred');
  });
}
