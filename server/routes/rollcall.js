const route = require('express').Router();
const { Room } = require("../models/model");
const ROLLCALL = require("../utils/rollcall");

// ADMIN: CREATE ROOM
route.post("/create", (req, res) => {
    const { roomID, closeAfter, qrRefreshInterval } = req.body;
    Room.findById(roomID)
        .then(room => {
            if (!room) throw { message: "ROOM DOESN'T EXISTS" }
            if (room.admin.toString() !== req.user._id) throw { message: "YOU HAVE NO PRIVILEGES" };
            return ROLLCALL.createRoom(roomID, null, closeAfter, qrRefreshInterval);
        })
        .then(rollcall => res.json({ response: 'ok', rollcall }))
        .catch(err => res.json({ response: 'fail', message: err.message }));
})

// USER & ADMIN: GET ROOM DATA IF AVAILABLE
route.get("/info/:roomId", (req, res) => {
    const roomId = req.params.roomId;
    Room.findById(roomId)
        .then(room => {
            if (!room) throw { message: "ROOM DOESN'T EXISTS" }
            if (!ROLLCALL.rooms[roomId]) return null;
            if (room.admin.toString() !== req.user._id) return { isClosed: ROLLCALL.rooms[roomId]['isClosed'], attended: ROLLCALL.rooms[roomId].attendees.includes(req.user._id) };
            const { qrCodeText, closingTime, attendees } = ROLLCALL.rooms[roomId];
            return {
                qrCodeText,
                closingTime,
                attendees,
            }
        })
        .then(rollcall => res.json({ response: 'ok', rollcall }))
        .catch(err => res.json({ response: 'fail', message: err.message }));
})


// USER: VERIFY SCAN
route.get("/scan/:roomID/:qrText", (req, res) => {
    const { roomID, qrText } = req.params;
    const verified = new Promise((resolve, reject) => resolve(ROLLCALL.verifyQrScan(roomID, qrText, req.user._id, req.headers['x-forwarded-for'] || req.socket.remoteAddress )));
    verified
        .then(() => res.json({ response: 'ok' }))
        .catch(err => res.json({ response: 'fail', message: err.message }));
})


module.exports = route;