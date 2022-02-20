const { User, Room } = require("../models/model");


/**
 * USER JOIN A ROOM USING ID
 * 
 * @param {String} user_id 
 * @param {String} room_id 
 * @returns {Promise} User Data
 */
function joinRoom(user_id, room_id) {
    return User.findById(user_id)
        .then(user => {
            if (!user) throw { message: "USER: NOT FOUND" };
            if (user.rooms.includes(room_id)) throw { message: "USER: Already in Room" };
            user.rooms.push(room_id);
            return user.save()
        });
}

/**
 * USER LEAVES A ROOM USING ID
 * 
 * @param {String} user_id 
 * @param {String} room_id 
 * @returns {Promise} User Data
 */
function leaveRoom(user_id, room_id) {
    return User.findById(user_id)
        .then(user => {
            if (!user) throw { message: "USER: NOT FOUND" };
            if (!user.rooms.includes(room_id)) throw { message: "USER: Not in Room" };
            user.rooms = user.rooms.filter(ids => ids.toString() !== room_id);
            return user.save()
        });
}


/**
 * CREATE A ROOM AND USER JOINS ROOM
 * 
 * @param {Object} room_object The Room creation object with required fields
 * @returns {Promise} Created Room Details
 */
function createRoom(room_object) {
    const room = new Room(room_object);
    const admin_id = room.admin;
    return room.save()
        .then(() => joinRoom(admin_id, room._id))
        .then(() => {
            const roomData = room;
            roomData.participants = undefined;
            return roomData
        });
}

/**
 * REMOVES ROOM FROM DATA BASE AND REMOVES ALL USER FROM THIS ROOM
 * @param {Room} room 
 * @returns {Promise} Deleted Room
 */
function removeRoom(room) {
    const participants = room.participants;
    const room_id = room._id.toString();
    participants.push(room.admin);
    return room.remove()
        .then(() => Promise.all(participants.map(participant => leaveRoom(participant.toString(), room_id))));
}

/**
 * Adds Single Participant to room
 * 
 * @param {String} room_id 
 * @param {String} user_id 
 * @returns {Promise} Room person Added to
 */
function addParticipant(room_id, user_id) {
    return Room.findById(room_id)
        .populate({ path: "admin", select: "-rooms -password" })
        .then(room => {
            if (!room) throw { message: "ROOM: NOT FOUND" }
            if (room.restrictJoin) throw { message: "JOIN OF ROOM IS RESTRICTED" };
            if (room.participants.includes(user_id)) throw { message: "ROOM: Already In Room" };
            if (room.admin._id.toString() === user_id) throw { message: "ROOM: You are Admin" };
            room.participants.push(user_id)
            return room.save();
        });
}

/**
 * Remove Single Participant from Room
 * @param {String} room_id 
 * @param {String} user_id 
 *  @param {String} admin_id - To remove a user pass admin user id
 * @returns {Promise} Room Deleted Person
 */
function removeParticipant(room_id, user_id, admin_id = null) {
    return Room.findById(room_id)
        .then(room => {
            if (!room) throw { message: "ROOM: NOT FOUND" }
            if (admin_id && room.admin.toString() !== admin_id) throw { message: "ROOM: You have no privileges" };
            if (room.admin.toString() === user_id) throw { message: "ROOM: You are Admin You can Delete Room" };
            if (!room.participants.includes(user_id)) throw { message: "ROOM: Not in Room" };
            room.participants = room.participants.filter(ids => ids.toString() !== user_id);
            return room.save();
        });
}


module.exports.joinRoom = joinRoom;
module.exports.leaveRoom = leaveRoom;
module.exports.createRoom = createRoom;
module.exports.removeRoom = removeRoom;
module.exports.addParticipant = addParticipant;
module.exports.removeParticipant = removeParticipant;