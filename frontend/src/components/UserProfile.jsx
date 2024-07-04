import React, { useEffect, useState } from "react";
import "./UserProfile.css";
import { useParams } from "react-router-dom";

export default function UserProfile() {
  const picLink =
    "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
  const { userid } = useParams();
  const [isFollow, setIsFollow] = useState(false);
  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);
  const [clips, setClips] = useState([]);

  // Function to follow user
  const followUser = (userId) => {
    fetch("/follow", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        followId: userId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setIsFollow(true);
      });
  };

  // Function to unfollow user
  const unfollowUser = (userId) => {
    fetch("/unfollow", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        followId: userId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setIsFollow(false);
      });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/user/${userid}`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("jwt"),
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const result = await response.json();
        console.log(result);
        setUser(result.user || {});
        setPosts(result.posts || []); // Ensure posts is always initialized
        setClips(result.clips || []); // Ensure clips is always initialized
        if (
          result.user &&
          result.user.followers &&
          result.user.followers.includes(
            JSON.parse(localStorage.getItem("user"))._id
          )
        ) {
          setIsFollow(true);
        } else {
          setIsFollow(false);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserData();
  }, [userid]);

  return (
    <div className="profile">
      <div className="profile-frame">
        <div className="profile-pic">
          <img src={user.Photo ? user.Photo : picLink} alt="" />
        </div>
        <div className="profile-data">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h1>{user.name}</h1>
            <button
              className="followBtn"
              onClick={() => {
                if (isFollow) {
                  unfollowUser(user._id);
                } else {
                  followUser(user._id);
                }
              }}
            >
              {isFollow ? "Unfollow" : "Follow"}
            </button>
          </div>
          <div className="profile-info user-profile-info" style={{ display: "flex" }}>
            <p>{posts.length} posts</p>
            <p>{clips.length} clips</p>
            <p>{user.followers ? user.followers.length : "0"} followers</p>
            <p>{user.following ? user.following.length : "0"} following</p>
          </div>
        </div>
      </div>
      <hr
        style={{ width: "90%", opacity: "0.8", margin: "25px auto" }}
      />
      <div className="gallery">
        {posts.map((post) => (
          <img
            key={post._id}
            src={post.photo}
            className="item"
            alt={`Post by ${user.name}`}
          />
        ))}
        {clips.map((clip) => (
          <video
            key={clip._id}
            src={clip.video} // Assuming clips have a video property
            className="item"
            autoPlay
            loop
            muted
            playsInline
            controls={false}
          />
        ))}
      </div>
    </div>
  );
}
