import { useContext, useEffect, useState } from "react";
import "./style.css";
import { USERCONTEXT } from "../../App";
import { AiOutlinePlus } from 'react-icons/ai';
import Roomcard from "./components/Roomcard";

// MODELS
import JoinRoom from "./components/JoinRoom";
import CreateRoom from './components/CreateRoom';
import { FETCH } from "../../utils";

export default function Home() {
  const [user, setUser, setModelElement] = useContext(USERCONTEXT);
  const [rooms, setRooms] = useState([]);


  useEffect(() => {
    FETCH("/my", "GET", user.jwt_token, null)
      .then(res => {
        if (res.response === 'fail') throw res.message;
        setRooms(res.payload.rooms);
        document.title = user.uid;
        document.querySelector('link[rel*="icon"]').href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${user.emoji}</text></svg>`
      })
      .catch(err => {
        setUser(null);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const createRoom = () => setModelElement(() => <CreateRoom user={user} setRooms={setRooms} modelTitle="Create Room" closeModel={() => setModelElement(null)} />);
  const joinRoom = () => setModelElement(() => <JoinRoom user={user} setRooms={setRooms} modelTitle="Join Room" closeModel={() => setModelElement(null)} />);

  return (
    <>
      <div className="greet">
        <h1>Hello, <span className="user-name">{user.fname} {user.lname || ""}.</span></h1>
        <span className="user-uid">@{user.uid}</span>
      </div>
      <div className="grids-page-container padding-page">


        <h4>Rooms as Admin</h4>
        <div className="cards-container">
          <div onClick={createRoom} className="room-card join-create-model"><AiOutlinePlus size="25px" /> CREATE ROOM</div>
          {rooms.filter(room => room.admin._id === user._id).map(room => <Roomcard
            adminEmoji={room.admin.emoji}
            adminName="you"
            roomId={room._id}
            bgImage={room.bgImgUrl}
            roomDescription={room.description}
            roomName={room.room_name}
            key={room._id}
          />)}
        </div>
        <br />


        <h4>Rooms as participant</h4>
        <div className="cards-container ">
          <div onClick={joinRoom} className="room-card join-create-model"><AiOutlinePlus size="25px" /> JOIN ROOM</div>
          {rooms.filter(room => room.admin._id !== user._id).map(room => <Roomcard
            adminEmoji={room.admin.emoji}
            adminName={room.admin.fname + (room.admin.lname || "")}
            roomId={room._id}
            bgImage={room.bgImgUrl}
            roomDescription={room.description}
            roomName={room.room_name}
            key={room._id}
          />)}
        </div>
      </div>
    </>
  )
}
