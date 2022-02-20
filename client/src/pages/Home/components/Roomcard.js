import React from 'react';
import { Link } from "react-router-dom";

export default function Roomcard({ roomId, bgImage, adminEmoji, roomName, adminName, roomDescription }) {
    const fallBackImage = 'https://cdn.dribbble.com/users/14997/screenshots/587335/dribbble.png';
    return (
        <Link to={roomId} className="room-card">
            <img src={bgImage || fallBackImage} alt="" className="room-bg" />
            <span className="room-admin-icon">{adminEmoji}</span>
            <p className="room-name">{roomName}</p>
            <p className="admin-name">By {adminName}.</p>
            <p className="room-description-clip">{roomDescription}</p>
        </Link>
    )
}
