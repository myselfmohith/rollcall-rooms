const route = require("express").Router();
const { Room } = require("../models/model");
const { createRoom, addParticipant, joinRoom, removeParticipant, leaveRoom, removeRoom } = require("../utils/user-room-operations");
const ROLLCALL = require("../utils/rollcall");

// * CREATE ROOM
route.post("/new", (req, res) => {
    const { room_name, bgImgUrl, description } = req.body;
    createRoom({ room_name, bgImgUrl, description, admin: req.user._id })
        .then(room => res.json({ response: 'ok', payload: room }))
        .catch(err => res.json({ response: 'fail', message: err.message }));
})

// * GET ROOM
route.get("/info/:room_id", (req, res) => {
    const room_id = req.params.room_id;
    Room.findById(room_id)
        .populate([{ path: "admin", select: "-rooms -password" }, { path: "participants", select: "-rooms -password" }])
        .then(room => {
            if (!room) throw { message: "ROOM NOT FOUND" };
            if (room.admin._id.toString() === req.user._id) return res.json({ response: 'ok', payload: room });
            if (room.participants.find(p => p._id.toString() === req.user._id)) return res.json({ response: 'ok', payload: room });
            throw { message: "YOUR ARE NOT IN ROOM" };
        })
        .catch(err => res.json({ response: 'fail', message: err.message }));
})

// * JOIN ROOM
route.get("/join/:room_id", (req, res) => {
    const user_id = req.user._id;
    const room_id = req.params.room_id;
    addParticipant(room_id, user_id)
        .then(room => {
            current_room = room;
            current_room.participants = undefined;
            return joinRoom(user_id, room_id);
        })
        .then(() => res.json({ response: 'ok', payload: current_room }))
        .catch(err => res.json({ response: 'fail', message: err.message }));
})

// * LEAVE ROOM
route.get("/leave/:room_id", (req, res) => {
    const user_id = req.user._id;
    const room_id = req.params.room_id;
    let current_room = null;
    removeParticipant(room_id, user_id)
        .then(() => leaveRoom(user_id, room_id))
        .then(() => res.json({ response: 'ok' }))
        .catch(err => res.json({ response: 'fail', message: err.message }));
})

// * EDIT ROOM INFO
route.post("/edit", (req, res) => {
    const { room_id, bgImgUrl, description, restrictJoin } = req.body;
    Room.findById(room_id)
        .then(room => {
            if (!room) throw { message: "ROOM NOT FOUND" };
            if (room.admin.toString() !== req.user._id) throw { message: "No Privileges" }
            room.bgImgUrl = bgImgUrl;
            room.description = description;
            room.restrictJoin = restrictJoin;
            return room.save();
        })
        .then(() => res.json({ response: 'ok' }))
        .catch(err => res.json({ response: 'fail', message: err.message }));
})

// * REMOVE ROOM
route.get("/remove/:room_id", (req, res) => {
    const room_id = req.params.room_id;
    Room.findById(room_id)
        .then(room => {
            if (!room) throw { message: "ROOM NOT FOUND" };
            if (room.admin.toString() !== req.user._id) throw { message: "No Privileges" }
            return removeRoom(room);
        })
        .then(() => res.json({ response: 'ok' }))
        .catch(err => res.json({ response: 'fail', message: err.message }));
})

// * ADMIN REMOVE USER
route.get("/remove-user/:room_id/:user_id", (req, res) => {
    const { room_id, user_id } = req.params;
    removeParticipant(room_id, user_id, req.user._id)
        .then(() => leaveRoom(user_id, room_id))
        .then(() => res.json({ response: 'ok' }))
        .catch(err => res.json({ response: 'fail', message: err.message }));
})

module.exports = route;