import { useState } from "react"
import { FETCH } from "../../../utils";


export default function JoinRoom({ closeModel, setRooms, user }) {
    const [error, setError] = useState(null);
    const [roomid, setRoomId] = useState("");

    function handleClick(e) {
        setError(null);
        e.target.disabled = true;
        if (roomid.length !== 24) {
            e.target.disabled = false;
            setError("ROOM ID IS OF 24 CHARACTERS BUT ENTERED " + roomid.length);
            return;
        };
        FETCH(`/rooms/join/${roomid}`, "GET", user.jwt_token, null)
            .then(res => {
                if (res.response === "fail") throw res.message;
                const room = res.payload;
                setRooms(pre => [room, ...pre])
                closeModel();
            })
            .catch(err => {
                e.target.disabled = false;
                setError(err);
            });
    }

    return (
        <>
            <input type="text" className="default-input" placeholder="24 characters room id" value={roomid} onChange={e => setRoomId(e.target.value)} />
            <p className='red-error-text'>{error}&nbsp;</p>
            <button onClick={handleClick} type="submit" className="default-button join-create-room-button">Join Room</button>
        </>
    )
}
