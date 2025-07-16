const express = require('express')
const http = require('http');
const path = require('path');
const dbConnect = require('./database/db.connection')
const initiateRoute = require('./routes')
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors')
dotenv.config()
require('./routes/goldPrice.routes');


const app = express()
const PORT = process.env.PORT

app.use(cors({
    origin: 'https://group-investmate001.vercel.app',       // allow your React dev server
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}))

app.use(morgan('dev'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieParser());
app.use('/files', express.static(path.join(__dirname, 'uploads')));


app.get("/", (req, res) => {
    res.send("Expense Tracker Backend is running.");
});


initiateRoute(app)

dbConnect()
    .then(() => {
        console.log('DB connected SuccessFully..')
        app.listen(PORT, () => {
            console.log(`server is Listening Port No ${PORT}`)
        })
    })
    .catch(() => {
        console.log('DB connection Failed')
    })







