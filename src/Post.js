import {formatISO9075} from "date-fns";
import {Link} from "react-router-dom";
import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';
import { SlLike, SlDislike } from 'react-icons/sl';
import {UserContext} from "./UserContext";


export default function Post({_id,title,summary,cover,content,createdAt,author}) {




  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userId, setUserId] = useState('');
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

  

  const handleLike = () => {
    if (!userInfo) {
      alert('You must be logged in to perform this action');
      return;
    }setLikes(likes + 1);
    axios.patch(`http://localhost:4000/post/${_id}/like`, { user: userId })
        .then(response => {
          setLikes(response.data.likes);
        })
        .catch(error => {
          console.log(error);
        });
  }

  const handleDislike = () => {
    if (!userInfo) {
      alert('You must be logged in to perform this action');
      return;
    }setDislikes(dislikes + 1);
      axios.patch(`http://localhost:4000/post/${_id}/dislike`, { user: userId })
        .then(response => {
          setDislikes(response.data.dislikes);
        })
        .catch(error => {
          console.log(error);
        });
      {;
  }
}

const token = localStorage.getItem("token");
axios.patch("/post/:id/like", {}, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})






  
  return (
    <>
      <div className="poster">
        <h2 className="title">{title}</h2>
        <p className="info">
          <a className="author">{author.username}</a>
          <time>{formatISO9075(new Date(createdAt))}</time>
        </p>
        <Link className="edit-btn" to={`/post/${_id}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="svg-icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
          </Link>
      <div className="image">
        <Link to={`/post/${_id}`}>
          <img src={'http://localhost:4000/'+cover} alt=""/>
        </Link>
      </div>
      
      <div className="like-dislike">
          <button className={`like-btn`} onClick={handleLike}><SlLike />{likes}</button>
          <button className={`dislike-btn`} onClick={handleDislike}><SlDislike />{dislikes}</button>
        </div>
      <div className="texts">
        <div className="post-summary">
        <p className="summary">{summary}</p>
        </div>
        </div>
        </div>
        </>
  );
  }