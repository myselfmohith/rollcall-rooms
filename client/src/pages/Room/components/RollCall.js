import React, { useEffect, useState } from 'react';
import { FETCH } from '../../../utils';
import AdminRollCall from './AdminRollcall';
import UserRollCall from "./UserRollCall";

export default function RollCall({ room, user }) {
    const [rollcall, setRollCall] = useState(null);
    const [loading, setLoading] = useState(true);
    const isAdmin = room.admin._id === user._id;
    const [error, setError] = useState(null);

    useEffect(() => {
        FETCH(`/rollcall/info/${room._id}`, "GET", user.jwt_token, null)
            .then((res) => {
                if (res.response === "fail") throw res.message;
                setRollCall(res.rollcall);
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
            });
    }, [])


    function handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        form['create-rollcall-button'].disabled = true;
        const roomID = room._id,
            closeAfter = Number(form.closeAfter.value),
            qrRefreshInterval = Number(form.qrRefreshInterval.value);

        if (qrRefreshInterval > closeAfter) {
            form['create-rollcall-button'].disabled = false;
            setError("Refresh interval cannot be greater than Close time");
            return;
        }

        FETCH("/rollcall/create", "POST", user.jwt_token, { roomID, closeAfter, qrRefreshInterval })
            .then(res => {
                if (res.response === "fail") throw res.message;
                setRollCall(res.rollcall);
                form['create-rollcall-button'].disabled = false;
            })
            .catch(err => {
                setError("Refresh interval cannot be greater than Close time");
                form['create-rollcall-button'].disabled = false;
            })
    }


    if (loading) return <p></p>
    if (isAdmin && rollcall) return <AdminRollCall setRollCall={setRollCall} room_id={room._id} rollcall={rollcall} allParticipants={room.participants} />
    if (!isAdmin && !rollcall) return <h3>No Current Rollcall</h3>
    if (!isAdmin && rollcall.attended) return <h3>Your Rollcall is Approved</h3>
    if (!isAdmin && rollcall.isClosed) return <h3>Current Rollcall is closed</h3>
    if (!isAdmin && rollcall) return <UserRollCall setRollCall={setRollCall} room_id={room._id} user_token={user.jwt_token} />
    if (isAdmin && !rollcall) return (
        <form onSubmit={handleSubmit}>
            <h3>Create Roll Call</h3>
            <input required type="Number" name="closeAfter" min="15" className="default-input" placeholder="Close the Roll in seconds" />
            <input required type="Number" name="qrRefreshInterval" min="15" className="default-input" placeholder="Qr Refresh in seconds" />
            <p className='red-error-text'>{error}&nbsp;</p>
            <button name="create-rollcall-button" type="submit" className='default-button' style={{ float: "right" }} >Start rollcall</button>
        </form>
    )
}

// if there is current rollcall open that
// else create one