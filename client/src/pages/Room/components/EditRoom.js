import { useEffect, useRef, useState } from 'react';
import { FETCH } from '../../../utils'

export default function EditRoom({ room, user, setRoom, closeModel }) {
    const [bgImage, setBgImage] = useState(room.bgImgUrl);
    const formRef = useRef();
    const [error, setError] = useState(null);


    const fallBackImage = 'https://cdn.dribbble.com/users/14997/screenshots/587335/dribbble.png';
    useEffect(() => {
        formRef.current.bgImgUrl.value = room.bgImgUrl || "";
        formRef.current.description.value = room.description || "";
        formRef.current['restrictJoin'].checked = room.restrictJoin;
    }, [])


    function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        formRef.current['edit-button'].disabled = true;
        const room_id = room._id,
            bgImgUrl = formRef.current['room-bg'].src,
            description = formRef.current.description.value,
            restrictJoin = formRef.current['restrictJoin'].checked;
        if (bgImage === room.bgImgUrl && description === room.description && restrictJoin === room.restrictJoin) {
            formRef.current['edit-button'].disabled = false;
            setError("There Seem to be no changes")
            return;
        }
        FETCH("/rooms/edit", "POST", user.jwt_token, { room_id, bgImgUrl, description, restrictJoin })
            .then(res => {
                if (res.response === "fail") throw res.message;
                setRoom(pre => {
                    pre.bgImgUrl = bgImgUrl;
                    pre.description = description;
                    pre.restrictJoin = restrictJoin;
                    return pre;
                })
                formRef.current['edit-button'].disabled = false;
                closeModel();
            })
            .catch(err => {
                formRef.current['edit-button'].disabled = false;
                setError(err)
            })

    }

    return (
        <form onSubmit={handleSubmit} ref={formRef}>
            <img name="room-bg" className='room-bg' src={bgImage || fallBackImage} alt="" onError={(e) => {
                e.target.onError = null;
                e.target.src = fallBackImage;
            }} />
            <input type="text" name="bgImgUrl" className='default-input' value={bgImage} onChange={(e) => setBgImage(e.target.value)} placeholder="Your room background image" />
            <textarea type="text" name="description" className='default-input' placeholder="Describe your room" />
            <p>
                <label>
                    Close Joining: &nbsp; <input type="checkbox" name="restrictJoin" />
                </label>
            </p>
            <p className='red-error-text'>{error}&nbsp;</p>
            <button name="edit-button" className='default-button join-create-room-button'>Edit a Room</button>
        </form>
    )
}
