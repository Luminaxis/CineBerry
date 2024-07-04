import React, { useEffect, useState } from "react";
import PostDetail from "../components/PostDetails";
import "../components/UserProfile.css";
import ProfilePic from "../components/ProfilePic";

export default function Profile() {
  const picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
  const [posts, setPosts] = useState([]);
  const [clips, setClips] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [user, setUser] = useState({});
  const [changePic, setChangePic] = useState(false);

  const toggleDetails = (post) => {
    setSelectedPost(post);
    setShow(!show);
  };

  const changeProfile = () => {
    setChangePic(!changePic);
  };

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem("user"))._id;
    console.log("Fetching data for user ID:", userId);

    fetch(`/user/${userId}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok ' + res.statusText);
        }
        return res.json();
      })
      .then((result) => {
        console.log("Fetched user data:", result);
        setUser(result.user || {});
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
      });
  }, []);

  useEffect(() => {
    fetch(`/myposts`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok ' + res.statusText);
        }
        return res.json();
      })
      .then((result) => {
        console.log("Fetched posts:", result);
        setPosts(result || []);
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
      });
  }, []);

  useEffect(() => {
    fetch(`/myclips`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok ' + res.statusText);
        }
        return res.json();
      })
      .then((result) => {
        console.log("Fetched clips:", result);
        setClips(result || []);
      })
      .catch((err) => {
        console.error("Error fetching clips:", err);
      });
  }, []);

  return (
    <div className="profile">
      <div className="profile-frame">
        <div className="profile-pic">
          <img
            onClick={changeProfile}
            src={user.Photo ? user.Photo : picLink}
            alt="Profile"
          />
        </div>
        <div className="profile-data">
          <h1>{user.name}</h1>
          <div className="profile-info" style={{ display: "flex" }}>
            <p>{posts.length} posts</p>
            <p>{clips.length} clips</p>
            <p>{user.followers ? user.followers.length : "0"} followers</p>
            <p>{user.following ? user.following.length : "0"} following</p>
          </div>
        </div>
      </div>
      <hr style={{ width: "90%", opacity: "0.8", margin: "25px auto" }} />
      <div className="gallery">
        {posts.map((post) => (
          <img
            key={post._id}
            src={post.photo}
            onClick={() => toggleDetails(post)}
            className="item"
            alt="Post"
          />
        ))}
        {clips.map((clip) => (
          <video
            key={clip._id}
            src={clip.video}
            onClick={() => toggleDetails(clip)}
            className="item"
            muted
            autoPlay
            loop
          />
        ))}
      </div>
      {show && <PostDetail item={selectedPost} toggleDetails={toggleDetails} />}
      {changePic && <ProfilePic changeprofile={changeProfile} />}
    </div>
  );
}
