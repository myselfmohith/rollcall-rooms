const route = require('express').Router();
const { User } = require("../models/model");
const { signToken } = require("../middleware/authentication");
// TODO: HASH PASSWORDS


route.post("/login", (req, res) => {
    const { uid, password } = req.body;
    User.findOne({ uid, password })
        .then(user => {
            if (!user) throw { message: "CHECK THE UID AND PASSWORD" }
            const tokenWithData = signToken({ ...user._doc, password: undefined, rooms: undefined });
            return res.json({ response: 'ok', payload: tokenWithData });
        })
        .catch(err => res.json({ response: 'fail', message: err.message }));
})


route.post("/signup", (req, res) => {
    const { uid, password, fname, lname, emoji } = req.body;
    // TODO: VALIDATE EMOJI
    const user = new User({
        uid,
        password,
        emoji,
        fname,
        lname
    });
    user.save()
        .then(data => {
            const tokenWithData = signToken({ ...data._doc, password: undefined, rooms: undefined });
            return res.json({ response: 'ok', payload: tokenWithData });
        })
        .catch(err => res.json({ response: 'fail', message: err.message }));
})


route.post("/changepassword", (req, res) => {
    const { uid, password, newPassword } = req.body;
    User.findOne({ uid, password })
        .then(user => {
            if (!user) throw { message: "CHECK THE UID AND PASSWORD" }
            user.password = newPassword;
            return user.save();
        })
        .then(() => res.json({ response: 'ok' }))
        .catch(err => res.json({ response: 'fail', message: err.message }));
})



module.exports = route;