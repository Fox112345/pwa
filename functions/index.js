const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
exports.storePostData = functions.https.onRequest((request, response) => {
  cors((request, response) => {
    admin
      .database()
      .ref('posts')
      .push({
        id: request.body.id,
        title: request.body.title,
        location: request.body.location,
        image: request.body.image,
      })
      .then(() => {
        response
          .status(201)
          .json({ message: 'Data stored', id: request.body.id });
      })
      .catch((e) => {
        response.status(500).json({ error: e });
      });
  });
});
