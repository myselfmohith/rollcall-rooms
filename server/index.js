require('dotenv').config();
let socketCORS = {}

// ! ONLY FOR DEV
const isDEV = process.env.ENVIRONMENT === "DEV";
if (isDEV) {
    socketCORS = {
        cors: {
            origin: '*'
        }
    }
}

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(server, socketCORS);

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to MongoDB"));


// !IN DEV ONLY
if (isDEV) {
    const cors = require('cors');
    app.use(cors())
}


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "..", "client", "build")));

module.exports.io = io;

app.get("/api", (req, res) => {
    res.json({ response: 'ok', ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress });
})


app.use('/api/auth', require('./routes/auth'));

// PRIVATE ROUTES
app.use("/api", require('./middleware/authentication').verifyJWT);
app.use("/api/my", require("./routes/my"))
app.use("/api/rooms", require("./routes/rooms"))
app.use('/api/rollcall', require("./routes/rollcall"));


app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
})

server.listen(process.env.PORT, () => console.log("Server Running on http://localhost:", process.env.PORT));
