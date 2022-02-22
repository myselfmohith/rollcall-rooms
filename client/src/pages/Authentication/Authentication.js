import "./style.css";
import { useEffect, useState } from "react";

// COMPONENTS
import Login from "./components/Login";
import Signup from "./components/Signup";
import ChangePass from './components/ChangePass';


export default function Authentication() {
  const [hash, setHash] = useState("login");

  function getCurrentPage() {
    switch (hash) {
      case "login":
        return <Login goToPage={setHash} />
      case "signup":
        return <Signup goToPage={setHash} />
      case "change-password":
        return <ChangePass goToPage={setHash} />
      default:
        return <h1>default</h1>
    }
  }

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]').content = "#f3f7f7";
  }, [])

  return (
    <div id="auth-body">
      <div id="auth">
        <h1 className="brand-name">ROLLCALL ROOMS</h1>
        <p className="brand-description">RollCall Rooms is easy way to take attendance with in less time. We generate a random QR CODE for every 15seconds, users can scan to qr to record their presence in the room</p>
        {getCurrentPage(hash)}
      </div>
    </div>
  )
}
