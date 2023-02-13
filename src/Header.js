import {Link} from "react-router-dom";
import {useContext, useEffect } from "react";
import {UserContext} from "./UserContext";
import { MdEmojiFoodBeverage, MdFastfood } from 'react-icons/md';
import { AiOutlinePlus } from 'react-icons/ai';

export default function Header() {
  const {setUserInfo,userInfo} = useContext(UserContext);

  

  useEffect(() => {
    fetch('http://localhost:4000/profile', {
      credentials: 'include',
    }).then(response => {
      response.json().then(userInfo => {
        setUserInfo(userInfo);
      });
    });
  }, []);

  function logout() {
    fetch('http://localhost:4000/logout', {
      credentials: 'include',
      method: 'POST',
    });
    setUserInfo(null);
  }

  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className="logo">face<span className="logo logo-c">c</span><div className="logo logo-icons"><MdFastfood size={20} /><MdEmojiFoodBeverage size={20} /></div>k</Link>
      <nav>
        {username && (
          <div className="header-logged-in">
            <p className="welcome-user">Welcome {username}</p>
          <Link className="create-new" to="/create">Create new post<AiOutlinePlus /></Link>
          <a className="logout" onClick={logout}>Logout</a>
          </div>
        )}
        {!username && (
          <>
            <Link className="header-button" to="/login">Login</Link>
            <Link className="header-button" to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}