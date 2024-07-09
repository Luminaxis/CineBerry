import React, { useEffect, useState } from "react";
import PostDetail from "../components/PostDetails";
import "../components/UserProfile.css";
import ProfilePic from "../components/ProfilePic";
import { toast } from 'react-toastify';
import { Link } from "react-router-dom";
import { TiArrowBack } from "react-icons/ti";

export default function Profile() {
  const picLink = "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
  const [posts, setPosts] = useState([]);
  const [clips, setClips] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [user, setUser] = useState({});
  const [changePic, setChangePic] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

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

  const notifyA = (msg) => toast.error(msg);
  const notifyB = (msg) => toast.success(msg);

  const handleProfilePicUpload = (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "cine-berry");
    data.append("cloud_name", "dtqdz4osh");

    setIsUploading(true);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.cloudinary.com/v1_1/dtqdz4osh/image/upload", true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        updateProfilePic(response.url);
      } else {
        notifyA("Failed to upload file");
      }
      setIsUploading(false);
      setUploadProgress(0);
    };

    xhr.onerror = () => {
      notifyA("Failed to upload file");
      setIsUploading(false);
      setUploadProgress(0);
    };

    xhr.send(data);
  };

  const updateProfilePic = (url) => {
    fetch('/uploadProfilePic', {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        pic: url,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.error) {
          notifyA(result.error);
        } else {
          notifyB("Profile picture updated successfully");
          setUser((prevState) => {
            return {
              ...prevState,
              Photo: result.pic,
            };
          });
        }
      })
      .catch((err) => {
        console.error("Error updating profile picture:", err);
      });
  };

  return (
    <div className="profile">
      <div id="back-arrow">
      <Link to="/" className="back-link"> {/* Add Link to home page with a back arrow */}
      <TiArrowBack size={40}/>
      </Link>
      </div>
      
      <div className="profile-frame">
        <div className="profile-pic">
          <img
            onClick={() => document.getElementById('profilePicInput').click()}
            src={user.Photo ? user.Photo : picLink}
            alt="Profile"
          />
          <input
            type="file"
            id="profilePicInput"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={(e) => handleProfilePicUpload(e.target.files[0])}
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
      {isUploading && (
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}>
            {Math.round(uploadProgress)}%
          </div>
        </div>
      )}
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
