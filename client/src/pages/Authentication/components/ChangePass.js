import { useState } from 'react';
import { FETCH } from '../../../utils';

// uid<Number>,password<String> -> /auth/login
export default function ChangePass({ goToPage }) {
  const [error, setError] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    form['change-pass-button'].disabled = true;
    const uid = form["uid"].value,
      password = form["old-password"].value,
      newPassword = form["new-password"].value,
      rePass = form["retype-password"].value;
    setError(null);
    if (newPassword !== rePass) {
      form['change-pass-button'].disabled = false;
      setError("Passwords doesn't match.");
      return;
    };
    FETCH("/auth/changepassword", "POST", null, { uid, password, newPassword })
      .then(res => {
        if (res.response === "fail") throw res.message;
        form['change-pass-button'].disabled = false;
        goToPage("login");
      })
      .catch(err => {
        setError(err);
        form['change-pass-button'].disabled = false;
      });
  }

  return (
    <form onSubmit={handleSubmit} className='container'>
      <h2>Change Password</h2>
      <input pattern='\d{10}' title='Your uid should of length 10 numbers' required type="text" name="uid" className="default-input" placeholder='Your unique id' />
      <input required type="password" name="old-password" className="default-input" placeholder='Your old password' />
      <input required type="password" name="new-password" className="default-input" placeholder='Your new password' />
      <input required type="password" name="retype-password" className="default-input" placeholder='Retype new password' />
      <p className='red-error-text'>{error}&nbsp;</p>
      <button className='default-button' type="submit" name="change-pass-button">Change Password</button>
      <span onClick={() => goToPage("login")} className="goto-link">Go back to log in.</span>
    </form>
  )
}
