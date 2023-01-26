var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector(
  '#close-create-post-modal-btn'
);

const form = document.querySelector('form');
const titleInput = document.querySelector('#title');
const locationInput = document.querySelector('#location');

var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// const saveButtonHandler = () => {
//   console.log('132');
//   if ('caches' in window) {
//     caches.open('user').then((cache) => {
//       cache.add('https://httpbin.org/get');
//       cache.add('src/images/sf-boat.jpg');
//     });
//   }
// };

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className =
    'shared-moment-card mdl-card mdl-shadow--2dp mdl-cell--middle';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // let cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', saveButtonHandler);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

const updateUI = (data) => {
  data.forEach((element) => {
    createCard(element);
  });
};

const url = 'https://pwagram-bc9da-default-rtdb.firebaseio.com/posts.json';

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    let dataArray = [];
    for (let key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  })
  .catch(() => {
    if ('indexedDB' in window) {
      readAllData('posts').then((data) => {
        console.log('indexedDB', data);
        updateUI(data);
      });
    }
  });

const sendData = () => {
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: {
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image:
        'https://firebasestorage.googleapis.com/v0/b/pwagram-bc9da.appspot.com/o/sf-boat.jpg?alt=media&token=eb918613-a0c2-4b91-b5cf-918740ceacdb',
    },
  }).then((res) => {
    console.log('Sent data', res);
    updateUI();
  });
};

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Enter vaalid data');
    return;
  }

  closeCreatePostModal();

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then((sw) => {
      writeData('sync-posts', {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
        image:
          'https://firebasestorage.googleapis.com/v0/b/pwagram-bc9da.appspot.com/o/sf-boat.jpg?alt=media&token=eb918613-a0c2-4b91-b5cf-918740ceacdb',
      })
        .then(() => sw.sync.register('sync-new-posts'))
        .then(() => {
          const snackbarContainer = document.querySelector(
            '#confirmation-toast'
          );
          const data = {
            message: 'Saved for syncing',
          };
          snackbarContainer.MaterialSnackbar.showSnackbar(data);
        })
        .catch((e) => console.log(e));
    });
  } else {
    sendData();
  }
});
