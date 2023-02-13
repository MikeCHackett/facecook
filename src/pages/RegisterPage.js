import {useState} from "react";
import { GiArchiveRegister } from 'react-icons/gi';
import { BsArrowBarRight } from 'react-icons/bs';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function register(ev) {
    ev.preventDefault();
    const response = await fetch('http://localhost:4000/register', {
      method: 'POST',
      body: JSON.stringify({username,password}),
      headers: {'Content-Type':'application/json'},
    });
    if (response.status === 200) {
      alert('registration successful');
    } else {
      alert('registration failed');
    }
  }
  return (
    <form className="register" onSubmit={register}>
      <div className="auth-title-wrapper">
      <h1 className="auth-title">facecook</h1>
      <p className="auth-title-info">Join our growing community</p>
      </div>
      <div className="auth-form">
      <h1 className="auth-subtitle">Register <GiArchiveRegister size={25} /></h1>
      <input type="text"
             placeholder="username"
             value={username}
             className="auth-input"
             onChange={ev => setUsername(ev.target.value)}/>
      <input type="password"
             placeholder="password"
             className="auth-input"
             value={password}
             onChange={ev => setPassword(ev.target.value)}/>
      <button className="auth-button">Register <BsArrowBarRight size={17} /></button>
      </div>
    </form>
  );
}