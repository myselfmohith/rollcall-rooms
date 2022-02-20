import React, { useState } from 'react'
import { FETCH } from '../../../utils';

export default function CreateRoom({ setRooms, closeModel, user }) {
  const [error, setError] = useState(null);

  const [bgImage, setBgImage] = useState("");
  const fallBackImage = 'https://cdn.dribbble.com/users/14997/screenshots/587335/dribbble.png';

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    form['create-button'].disabled = true;
    const room_name = form.room_name.value,
      bgImgUrl = form['room-bg'].src,
      description = form.description.value;
    FETCH("/rooms/new", "POST", user.jwt_token, { room_name, bgImgUrl, description })
      .then(res => {
        if (res.response === "fail") throw res.message;
        form['create-button'].disabled = false;
        const room = res.payload;
        room.admin = user;
        setRooms(pre => [room, ...pre]);
        closeModel();
      }).catch(err => {
        form['create-button'].disabled = false;
        setError(err);
      });
  }


  return (
    <form onSubmit={handleSubmit}>
      <img className='room-bg' name="room-bg" src={bgImage || fallBackImage} alt="" onError={(e) => {
        e.target.onError = null;
        e.target.src = fallBackImage;
      }} />
      <input type="text" name="bgImgUrl" className='default-input' value={bgImage} onChange={(e) => setBgImage(e.target.value)} placeholder="Your room background image" />
      <input required type="text" name="room_name" className='default-input' placeholder="Your room name" />
      <textarea type="text" name="description" className='default-input' placeholder="Describe your room" />
      <p className='red-error-text'>{error}&nbsp;</p>
      <button type='submit' name="create-button" className='default-button join-create-room-button'>Create a Room</button>
    </form>
  )
}
