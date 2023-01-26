const enableNotificationsButtons = document.querySelectorAll(
  '.enable-notifications'
);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => {
      console.log('SW registred');
    })
    .catch((e) => console.log(e));
}

const askForNotifications = () => {
  Notification.requestPermission((result) => {
    console.log('result', result);

    if (result !== 'granted') {
      return console.log('Permissions denied');
    }

    displayConfirmNotification();
    //Hide Button
  });
};

const displayConfirmNotification = () => {
  const options = {
    body: 'N body',
  };
  new Notification('Firsn notif', options);
};

if ('Notification' in window) {
  enableNotificationsButtons.forEach((n) => {
    n.style.display = 'inline-block';
    n.addEventListener('click', askForNotifications);
  });
}
