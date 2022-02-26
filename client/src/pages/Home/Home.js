import { useContext, useEffect, useState } from "react";
import "./style.css";
import { USERCONTEXT } from "../../App";
import Roomcard, { DummyCard } from "./components/Roomcard";
import { AiOutlineMore } from 'react-icons/ai'

// MODELS
import JoinRoom from "./components/JoinRoom";
import CreateRoom from './components/CreateRoom';
import { FETCH } from "../../utils";

export default function Home() {
  const [user, setUser, setModelElement] = useContext(USERCONTEXT);
  const [rooms, setRooms] = useState([]);
  const [sortRooms, setSortRooms] = useState("Z-A");
  const [requestLoader, setRequestLoader] = useState(true);


  useEffect(() => {
    document.querySelector('meta[name="theme-color"]').content = "#39424e";
    FETCH("/my", "GET", user.jwt_token, null)
      .then(res => {
        if (res.response === 'fail') throw res.message;
        setRooms(res.payload.rooms);
        setRequestLoader(false);
        document.title = user.fname;
        document.querySelector('link[rel*="icon"]').href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${user.emoji}</text></svg>`
      })
      .catch(err => {
        setRequestLoader(false);
        setUser(null);
      });
  }, [])

  const createRoom = () => setModelElement(() => <CreateRoom user={user} setRooms={setRooms} modelTitle="Create Room" closeModel={() => setModelElement(null)} />);
  const joinRoom = () => setModelElement(() => <JoinRoom user={user} setRooms={setRooms} modelTitle="Join Room" closeModel={() => setModelElement(null)} />);
  const toggleSort = () => setSortRooms(pre => {
    if (pre === "A-Z") return "Z-A";
    return "A-Z";
  })
  const sortFunction = (a, b) => {
    if (sortRooms !== "A-Z") return a.room_name.toUpperCase() > b.room_name.toUpperCase() ? 1 : -1;
    return a.room_name.toUpperCase() > b.room_name.toUpperCase() ? -1 : 1;
  }

  return (
    <>
      <div className="greet">
        <h1>Hello, <span className="user-name">{user.fname} {user.lname || ""}.</span></h1>
        <span className="user-uid">@{user.uid}</span>
      </div>
      <div className="grids-page-container padding-page">

        <div className="rooms-container-header">
          <h3>Rooms</h3>
          <button> <AiOutlineMore size="20px" />
            <ul>
              <li onClick={toggleSort}>Sort {sortRooms}</li>
              <li onClick={joinRoom} >Join Room</li>
              <li onClick={createRoom} >Create Room</li>
            </ul>
          </button>
        </div>
        <div className="cards-container">

          {requestLoader ? <>
            {Array.from(Array(4).keys()).map(arr => <DummyCard key={arr} />)}
          </> : rooms.sort(sortFunction).map(room => <Roomcard
            adminEmoji={room.admin.emoji}
            adminName={room.admin.fname + " " + (room.admin.lname || "")}
            roomId={room._id}
            bgImage={room.bgImgUrl}
            roomDescription={room.description}
            roomName={room.room_name}
            key={room._id}
            isAdmin={room.admin._id === user._id}
          />)}
        </div>

      </div>
    </>
  )
}
