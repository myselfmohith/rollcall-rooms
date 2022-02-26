import { useContext, useEffect, useState } from 'react';
import "./style.css";
import { useNavigate, useParams } from 'react-router-dom';
import { USERCONTEXT } from "../../App"
import { FETCH } from '../../utils';


// COMPONENTs
import EditRoom from './components/EditRoom';
import RollCall from './components/RollCall';
import ParticipantCard from './components/ParticipantCard';
import DummyPage from './components/DummyPage';

export default function Room() {
  const navigate = useNavigate();
  const { roomid } = useParams();
  const [user, setUser, setModelElement] = useContext(USERCONTEXT);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const rollCallRoom = () => setModelElement(() =>
    <RollCall
      room={room}
      user={user}
      modelTitle="Roll Call"
      closeModel={() => setModelElement(null)}
    />
  )

  const editRoomData = () => setModelElement(() =>
    <EditRoom
      modelTitle="Edit Room Info"
      closeModel={() => setModelElement(null)}
      room={room}
      user={user}
      setRoom={setRoom}
    />
  );

  const leaveRoom = () => {
    let answer = window.confirm("Are you sure you want to leave Room")
    if (!answer) return;
    FETCH(`/rooms/leave/${room._id}`, "GET", user.jwt_token, null)
      .then(res => {
        if (res.response === "fail") throw res.message;
        navigate("/");
      })
      .catch(err => {
        if (err === "Token not found" || err === "Token Expired") return setUser(null);
        alert(err);
      });
  }

  const deleteRoom = () => {
    let answer = window.prompt(`This action cannot be undone. This will permanently delete "${room.room_name}" room.\n\nPlease type '${room.room_name}' to confirm.`);
    if (answer !== room.room_name) return;
    FETCH(`/rooms/remove/${room._id}`, "GET", user.jwt_token, null)
      .then(res => {
        if (res.response === "fail") throw res.message;
        navigate("/");
      })
      .catch(err => {
        if (err === "Token not found" || err === "Token Expired") return setUser(null);
        alert(err);
      });
  }

  const kickUser = user_id => {
    setLoading(true)
    FETCH(`/rooms/remove-user/${room._id}/${user_id}`, "GET", user.jwt_token, null)
      .then(res => {
        if (res.response === "fail") throw res.message;
        setRoom(pre => {
          pre.participants = pre.participants.filter(p => p._id !== user_id);
          return { ...pre };
        })
        setLoading(false);
      })
      .catch(err => {
        if (err === "Token not found" || err === "Token Expired") return setUser(null);
        alert(err);
        setLoading(false);
      })
  }

  useEffect(() => {
    let subscribed = true;
    if (roomid.length !== 24) return navigate("/");
    document.querySelector('meta[name="theme-color"]').content = "#39424e";
    FETCH(`/rooms/info/${roomid}`, "GET", user.jwt_token, null)
      .then(res => {
        if (res.response === "fail") throw res.message;
        if (!subscribed) return;
        setRoom(res.payload);
        setLoading(false);
        document.title = user.fname + " in " + res.payload.room_name;
        document.querySelector('link[rel*="icon"]').href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${user.emoji}</text></svg>`
      })
      .catch(err => {
        if (err === "Token not found" || err === "Token Expired") return setUser(null);
        navigate("/");
      })

    return () => {
      subscribed = false
    };
  }, [])

  if (loading) return <DummyPage />
  return (
    <>
      <div className="padding-page room-page-info">
        <h2>{room.room_name}</h2>
        <span>By {room.admin.emoji}  {room.admin.fname} {room.admin.lname || ""}.</span>
        <p>{room.description}</p>
        {!room.restrictJoin && <p>Room Code : {room._id}</p>}
      </div>

      <div className="grids-page-container padding-page">
        <h3>Room Options</h3>
        <div className="room-options">
          <button onClick={rollCallRoom} className='default-button' >Roll Call</button>
          {room.admin._id === user._id && <button onClick={editRoomData} className='default-button' >Edit Room</button>}
          {room.admin._id !== user._id && <button onClick={leaveRoom} className='default-button' >Leave Room</button>}
          {room.admin._id === user._id && <button onClick={deleteRoom} className='default-button' >  Delete Room</button>}
        </div>

        <h3>Participants ({room.participants.length})</h3>
        <div className="cards-container">
          {
            room.participants.sort().map(participant =>
              <ParticipantCard
                key={participant._id}
                emoji={participant.emoji}
                fname={participant.fname}
                lname={participant.lname || ""}
                uid={participant.uid}
                isAdmin={room.admin._id === user._id}
                kickUser={() => room.admin._id === user._id && kickUser(participant._id)}
              />)
          }
        </div>
      </div>
    </>
  )
}
