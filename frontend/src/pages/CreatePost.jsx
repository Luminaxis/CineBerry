import React, { useState, useEffect } from "react";
import "./Createpost.css";
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

export default function Createpost() {
  const [body, setBody] = useState("");
  const [media, setMedia] = useState(null);
  const [url, setUrl] = useState("");
  const [isClip, setIsClip] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  // Toast functions
  const notifyA = (msg) => toast.error(msg);
  const notifyB = (msg) => toast.success(msg);

  useEffect(() => {
    if (url) {
      const endpoint = isClip ? "/createClip" : "/createPost";
      fetch(endpoint, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("jwt"),
        },
        body: JSON.stringify({
          description: body,
          [isClip ? "video" : "pic"]: url,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setIsUploading(false);
          setUploadProgress(0);
          if (data.error) {
            notifyA(data.error);
          } else {
            notifyB("Successfully Posted");
            navigate("/");
          }
        })
        .catch((err) => {
          setIsUploading(false);
          setUploadProgress(0);
          console.log(err);
        });
    }
  }, [url, body, navigate, isClip]);

  const postDetails = () => {
    if (!media) {
      notifyA("Please select a file");
      return;
    }
  
    const data = new FormData();
    data.append("file", media);
    data.append("upload_preset", "cine-berry");
    data.append("cloud_name", "dtqdz4osh");
  
    const uploadUrl = isClip
      ? "https://api.cloudinary.com/v1_1/dtqdz4osh/video/upload"
      : "https://api.cloudinary.com/v1_1/dtqdz4osh/image/upload";
  
    setIsUploading(true);
  
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl, true);
  
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        setUploadProgress(percentComplete);
      }
    };
  
    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        setUrl(response.url);
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
  
  const loadfile = (event) => {
    var output = document.getElementById("output");
    const file = event.target.files[0];
    if (isClip) {
      output.src = URL.createObjectURL(file);
      output.onload = function () {
        URL.revokeObjectURL(output.src); // free memory
      };
      output.play();
    } else {
      output.src = URL.createObjectURL(file);
      output.onload = function () {
        URL.revokeObjectURL(output.src); // free memory
      };
    }
    setMedia(file);
  };

  return (
    <div className="createPost">
      {/* header */}
      <div className="post-header">
        <h4 style={{ margin: "3px auto" }}>{isClip ? "Create New Clip" : "Create New Post"}</h4>
        <button id="post-btn" onClick={postDetails}>Post</button>
        <button id="toggle-btn" onClick={() => setIsClip(!isClip)}>
          {isClip ? "Switch to Post" : "Switch to Clip"}
        </button>
      </div>
      {/* media preview */}
      <div className="main-div">
        {isClip ? (
          <video
            id="output"
            autoPlay
            loop
            muted
            style={{ display: isClip ? "block" : "none" }}
          />
        ) : (
          <img
            id="output"
            style={{ display: isClip ? "none" : "block" }}
            src="https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-image-512.png"
            alt="preview"
          />
        )}
        <input
          type="file"
          accept={isClip ? "video/*" : "image/*"}
          onChange={loadfile}
        />
      </div>
      {/* details */}
      <div className="details">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a caption...."
        ></textarea>
      </div>
      {/* upload progress */}
      {isUploading && (
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}>
            {Math.round(uploadProgress)}%
          </div>
        </div>
      )}
    </div>
  );
}
