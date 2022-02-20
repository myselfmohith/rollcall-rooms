const route = require("express").Router();
const { User } = require("../models/model")

route.get("/", (req, res) => {
    User.findById(req.user._id)
        .select("-password")
        .populate({ path: "rooms", select: "-participants", populate: { path: "admin", select: "emoji fname lname" } })
        .then(userdata => res.json({ response: "ok", payload: userdata }))
        .catch(err => res.json({ response: 'fail', message: err.message }));
})


route.post("/edit", (req, res) => {
    User.findById(req.user._id)
        .then(user => {
            user.emoji = req.body.emoji || user.emoji;
            user.fname = req.body.fname || user.fname;
            user.lname = req.body.lname || user.lname;
            return user.save()
        })
        .then(() => res.json({ response: 'ok' }))
        .catch(err => res.json({ response: 'fail', message: err.message }));
})

module.exports = route;