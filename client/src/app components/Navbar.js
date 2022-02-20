import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { USERCONTEXT } from "../App";
import { MdOutlineArrowDropDown } from "react-icons/md";

export default function Navbar() {
    const [user, setUser,] = useContext(USERCONTEXT);
    const logOut = () => setUser(null);
    return (
        <nav>
            <Link to="/" className="brand-name">Rollcall Rooms</Link>
            <button>{user.emoji} <MdOutlineArrowDropDown color='var(--white)' />
                <ul className="menu">
                    {/* <li>Edit profile *</li> */}
                    <li onClick={logOut} >Log out</li>
                </ul>
            </button>
        </nav>
    )
}
