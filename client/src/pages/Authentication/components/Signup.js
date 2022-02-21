import { useContext, useState } from 'react';
import { USERCONTEXT } from '../../../App';
import { FETCH } from '../../../utils';

// uid<Number>,password<String> -> /auth/login
export default function Signup({ goToPage }) {
  const [, setUser,] = useContext(USERCONTEXT);
  const [error, setError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    form['signup-button'].disabled = true;
    const uid = form.uid.value,
      password = form.password.value,
      repass = form['retype-password'].value,
      emoji = form.emoji.value,
      fname = form.fname.value,
      lname = form.lname.value;
    setError(null);
    if (password !== repass) {
      form['signup-button'].disabled = false;
      setError("Password doesn't match.");
      return;
    };
    FETCH("/auth/signup", "POST", null, { uid, password, fname, lname, emoji })
      .then(res => {
        if (res.response === "fail") throw res.message;
        form['signup-button'].disabled = false;
        setUser(res.payload);
      }).catch(err => {
        form['signup-button'].disabled = false;
        if (err.includes("duplicate key")) setError("USER ALREADY EXISTS");
        else setError(err);
      })
  }

  return (
    <form onSubmit={handleSubmit} className='container'>
      <h2>Sign Up</h2>
      <input required className='default-input' title='Your Emoticon' autoComplete='off' type="text" name="emoji" placeholder='Your emoji' />
      <input pattern='\d{10}' title='Your uid should of length 10 numbers' required className='default-input' type="text" autoComplete='off' name="uid" placeholder=' Your unique id*' />
      <input required className='default-input' type="text" name="fname" placeholder='Your First Name*' />
      <input className='default-input' type="text" name="lname" placeholder='Your Last Name' />
      <input required className='default-input' type="password" name="password" placeholder='Your password*' />
      <input required className='default-input' type="password" name="retype-password" placeholder='Retype your password*' />
      <p className='red-error-text'>{error}&nbsp;</p>
      <button className='default-button' type="submit" name='signup-button'>Create An Account</button>
      <span onClick={() => goToPage("login")} className="goto-link">Already an User? Log in.</span>
    </form>
  )
}
