import React from 'react';
import { MdPersonRemove } from "react-icons/md";

export default function ParticipantCard({ emoji, fname, lname, uid, isAdmin, kickUser }) {
  return (
    <div className='participant-card'>
      <div className="participant-emoji">{emoji}</div>
      <div className="participant-info">
        <h4>{fname} {lname}</h4>
        <p>{uid}</p>
      </div>
      {isAdmin && <div title={`Remove ${fname} ${lname} from room`} onClick={kickUser} className="kick-participant"><MdPersonRemove color='inherit' /></div>}
    </div>
  )
}
