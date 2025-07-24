const admin = require("firebase-admin")
// const serviceAccount = require("../constant/expense-tracker-9eb29-firebase-adminsdk-fbsvc-72a4340dc8.json")
require('dotenv').config();

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
});

module.exports = admin