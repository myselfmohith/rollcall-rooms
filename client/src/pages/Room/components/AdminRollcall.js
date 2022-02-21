import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import QrCode from 'qrcode';

import { SOCKET_URL } from "../../../utils";

export default function AdminRollcall({ room_id, rollcall, allParticipants, setRollCall }) {
    const [timer, setTimer] = useState(getRemTime);
    const externalWindow = useRef();
    const [qrCodeUrl, setQrCodeUrl] = useState("https://i.pinimg.com/originals/e4/af/9f/e4af9f0025a8ce68bee2cf5a1360a501.gif");
    const [attendees, setAttendees] = useState(rollcall.attendees.filter(ele => allParticipants.find(p => p._id === ele)).map(ele => allParticipants.find(p => p._id === ele)));

    function getRemTime() {
        const ctime = new Date();
        const closingTime = new Date(rollcall.closingTime);
        let rem_sec = closingTime.getTime() - ctime.getTime();
        rem_sec = rem_sec < 0 ? 0 : rem_sec;
        return Math.floor(rem_sec / 1000)
    }

    function openImage() {
        const new_window = window.open("", "Qr Code", "popup");
        new_window.document.title = "Qr Code";
        externalWindow.current = new_window;
        new_window.document.body.innerHTML = `
        <img style="max-width: 90vw;max-height: 90vh;margin: auto;" src="${qrCodeUrl}" alt="QR Code" align="middle" />
        `;
    }

    function updateQR(qrText) {
        QrCode.toDataURL(qrText, { width: 1000 }, (err, url) => {
            setQrCodeUrl(url);
            externalWindow.current && externalWindow.current.document.querySelector("img").setAttribute("src", url);
        })
    }

    function showAbsentees() {
        let members = allParticipants.map(p => {
            const index = attendees.findIndex(att => att._id === p._id);
            if (index >= 0) p.rollcall = "P";
            else p.rollcall = "A";
            return p
        })
        members = members.sort((a, b) => {
            if (a.rollcall === b.rollcall) {
                return a.uid - b.uid
            }
            return a.rollcall < b.rollcall ? -1 : 1;
        })

        generateCSV(members);
    }

    useEffect(() => {
        const updateSec = setInterval(() => {
            setTimer(getRemTime)
        }, 1000);

        const addUser = user_id => {
            const participant = allParticipants.find(p => p?._id === user_id);
            if (!participant) return;
            setAttendees(pre => [participant, ...pre])
        }

        const socket = io(SOCKET_URL);
        socket.emit("update-admin-id", room_id);
        socket.on("qr-code-update", updateQR);
        socket.on("user-scanned", addUser)

        return () => {
            clearInterval(updateSec);
            socket.off("qr-code-update", updateQR);
            socket.off("user-scanned", addUser)
        }
    }, [])

    return (
        <>
            <div className="admin-roll-cal-container">
                <div className="roll-call-action">
                    {
                        timer > 0 ? <>
                            <img onClick={openImage} className="qr-image" src={qrCodeUrl} alt="QR_CODE" />
                            <h3>{timer} sec</h3>
                            <p>Time Remaining</p>
                        </>
                            :
                            <b>Closed</b>
                    }
                    <p>Scanned by {attendees.length} participants</p>
                    <button onClick={showAbsentees} className="default-button">Convert to CSV</button>
                    <button title="This will just creates new rollcall removes previous" onClick={() => setRollCall(null)} className="default-button">{timer > 0 ? "Replace With New" : "Create New"}</button>
                </div>
                <div className="roll-call-attendees">
                    {attendees.map(attendee => <AttendeeIcon key={attendee.uid} emoji={attendee.emoji} uid={attendee.uid.toString()} />)}
                </div>
            </div>
        </>
    )
}


function AttendeeIcon({ emoji, uid }) {
    return (
        <div className="attendee-card">
            <div className="participant-emoji">{emoji}</div>
            <p>{uid.substring(uid.length - 4)}</p>
        </div>
    )
}


function generateCSV(arr) {
    let string = "UID,NAME,STATUS\n"
    for (const row of arr) string += `${row.uid},${row.fname + (row.lname || "")},${row.rollcall}\n`
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([string], { type: 'text/plain' }));
    a.download = 'rollcall.csv';
    a.click();
}