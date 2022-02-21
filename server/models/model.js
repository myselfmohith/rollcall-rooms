const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    uid: { type: Number, required: true, unique: true },
    emoji: { type: String, required: true },
    fname: { type: String, required: true },
    lname: String,
    password: { type: String, required: true },
    rooms: [{ type: Schema.Types.ObjectId, ref: 'Room' }]
})
const User = model('User', userSchema);



const roomSchema = new Schema({
    room_name: { type: String, required: true },
    bgImgUrl: { type: String },
    description: { type: String },
    admin: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restrictJoin: { type: Boolean, default: false },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }]
})
const Room = model('Room', roomSchema);


module.exports = { User, Room };