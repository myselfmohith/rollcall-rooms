const { io } = require("../index");
const crypto = require("crypto");
const fs = require("fs");


/**
 * Generate a qr text and next qr refresh time
 * 
 * @param {Number} qrRefreshInterval 
 * @param {DateTimeMS} current_time 
 * @returns Next Refresh Time and Qr Text
 */
function generateQrText(qrRefreshInterval, current_time) {
    const qrCodeText = crypto.randomBytes(25).toString("hex");
    const qrNextRefresh = new Date(current_time + (qrRefreshInterval * 1000));
    return [qrCodeText, qrNextRefresh];
}


/**
 * Creates a Roll Call Room with an expiry of 10 Minutes after close. IF already there is room it replaces new
 * 
 * NOTE: 1 sec => 1000 mille second 
 * 
 * @param {String} roomId 
 * @param {String} adminSocketId 
 * @param {Number} closingTime Number Seconds After to Close the
 * @param {Number} qrRefreshInterval Number Seconds refresh interval
 */
function createRoom(roomId, adminSocketId = "", closeAfter, qrRefreshInterval) {
    // create rollcall for room

    this.rooms[roomId] = {}
    const current_time = new Date();
    const closingTime = new Date(current_time.getTime() + (closeAfter * 1000));
    const [qrCodeText, qrNextRefresh] = generateQrText(qrRefreshInterval, current_time.getTime());
    const deleteTime = new Date(current_time.getTime() + (closeAfter * 1000) + (5 * 60 * 1000)) // delete record after 10min

    // * ROLLCALL ROOM SCHEMA
    this.rooms[roomId] = {
        adminSocketId,
        qrCodeText,
        closingTime,
        qrRefreshInterval,
        qrNextRefresh,
        deleteTime,
        isClosed: false,
        attendees: [],
        blockIps: [],
    }


    return {
        qrCodeText,
        closingTime,
        attendees: [],
    };
}

/**
 * 
 * @param {String} room_id
 * @param {String} qrText 
 * @param {String} user_id -> Mongoose ID
 */
function verifyQrScan(room_id, qrText, user_id, ip_address) {
    const room = this.rooms[room_id];

    if (!room) throw { message: "ROLLCALL ROOM NOT FOUND" };
    if (room.isClosed) throw { message: "ROLLCALL CLOSED" };
    if (room.blockIps.includes(ip_address)) throw { message: "IP BLOCKED" }
    if (qrText !== room.qrCodeText) throw { message: "Verification Failed, Retry" };
    if (room.attendees.includes(user_id)) throw { message: "You have already Scanned" };

    this.rooms[room_id].attendees.push(user_id);
    this.rooms[room_id].blockIps.push(ip_address);

    // EMIT OT ADMIN ABOUT DETAILS
    io.to(room.adminSocketId).emit("user-scanned", user_id)
    return "Qr Code Verified.";
}



function runEachSecond() {
    const current_time_ms = new Date().getTime();
    for (const [roomId, room] of Object.entries(ROLLCALL.rooms)) {
        if (current_time_ms > room.deleteTime.getTime()) {
            delete ROLLCALL.rooms[roomId];
            continue;
        }

        if (room.isClosed) continue;

        if (current_time_ms > room.closingTime.getTime()) {
            ROLLCALL.rooms[roomId].isClosed = true;
            continue;
        }

        if (current_time_ms > room.qrNextRefresh.getTime()) {
            const [qrCodeText, qrNextRefresh] = ROLLCALL.generateQrText(room.qrRefreshInterval, current_time_ms);
            ROLLCALL.rooms[roomId].qrCodeText = qrCodeText;
            ROLLCALL.rooms[roomId].qrNextRefresh = qrNextRefresh;

            // EMIT TO ADMIN
            io.to(room.adminSocketId).emit("qr-code-update", qrCodeText);
        }
    }

    fs.writeFileSync("./rollcall.log", JSON.stringify(ROLLCALL.rooms, null, 4));
}

const ROLLCALL = {
    rooms: {},
    createRoom: createRoom,
    generateQrText: generateQrText,
    verifyQrScan: verifyQrScan,
}


setInterval(runEachSecond, 1000);

io.on("connection", socket => {
    socket.on("update-admin-id", (roomId) => {
        if (!ROLLCALL.rooms[roomId]) return
        ROLLCALL.rooms[roomId].adminSocketId = socket.id;
        socket.emit("qr-code-update", ROLLCALL.rooms[roomId].qrCodeText);
    })
})


module.exports = ROLLCALL;