const admin = require("firebase-admin")
const serviceAccount = require("../constant/expense-tracker-9eb29-firebase-adminsdk-fbsvc-72a4340dc8.json")

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})