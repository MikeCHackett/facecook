import {useContext, useState} from "react";
import {Navigate} from "react-router-dom";
import {UserContext} from "../UserContext";
import { VscSignIn } from 'react-icons/vsc';
import { BsArrowBarRight } from 'react-icons/bs';

export default function LoginPage() {
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const [redirect,setRedirect] = useState(false);
  const {setUserInfo} = useContext(UserContext);

  async function login(ev) {
    ev.preventDefault();
    const response = await fetch('http://localhost:4000/login', {
      method: 'POST',
      body: JSON.stringify({username, password}),
      headers: {'Content-Type':'application/json'},
      credentials: 'include',
    });
    if (response.ok) {
      response.json().then(userInfo => {
        setUserInfo(userInfo);
        setRedirect(true);
      });
    } else {
      alert('wrong credentials');
    }
  }

  if (redirect) {
    return <Navigate to={'/'} />
  }
  return (
    <form className="login" onSubmit={login}>
      <div className="auth-title-wrapper">
      <h1 className="auth-title">facecook</h1>
      <p className="auth-title-info">Connect to share your culinary journey</p>
      </div>
      <div className="auth-form">
      <h1 className="auth-subtitle">Login <VscSignIn size={25} /></h1>
      <input type="text"
             placeholder="username"
             value={username}
             className="auth-input"
             onChange={ev => setUsername(ev.target.value)}/>
      <input type="password"
             placeholder="password"
             value={password}
             className="auth-input"
             onChange={ev => setPassword(ev.target.value)}/>
      <button className="auth-button">Login <BsArrowBarRight size={17} /></button>
      </div>
    </form>
  );
}