import React, { useState, useEffect, useRef } from "react";

export default function ProfilePic({ changeprofile }) {
  const hiddenFileInput = useRef(null);
  const [image, setImage] = useState("");
  const [url, setUrl] = useState("");

  // posting image to cloudinary
  const postDetails = async () => {
    try {
      const data = new FormData();
      data.append("file", image);
      data.append("upload_preset", "cine-berry");
      data.append("cloud_name", "dtqdz4osh");

      const res = await fetch("https://api.cloudinary.com/v1_1/dtqdz4osh/image/upload", {
        method: "post",
        body: data,
      });

      const result = await res.json();
      setUrl(result.url);
    } catch (err) {
      console.log(err);
    }
  };

  const postPic = async (imageUrl) => {
    try {
      // saving post to mongodb
      const res = await fetch("/uploadProfilePic", {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("jwt"),
        },
        body: JSON.stringify({
          pic: imageUrl,
        }),
      });

      const data = await res.json();
      console.log(data);
      changeprofile();
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  useEffect(() => {
    if (image) {
      postDetails();
    }
  }, [image]);

  useEffect(() => {
    if (url) {
      postPic(url);
    }
  }, [url]);

  return (
    <div className="profilePic darkBg">
      <div className="changePic centered">
        <div>
          <h2>Change Profile Photo</h2>
        </div>
        <div style={{ borderTop: "1px solid #00000030" }}>
          <button
            className="upload-btn"
            style={{ color: "#1EA1F7" }}
            onClick={handleClick}
          >
            Upload Photo
          </button>
          <input
            type="file"
            ref={hiddenFileInput}
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              setImage(e.target.files[0]);
            }}
          />
        </div>
        <div style={{ borderTop: "1px solid #00000030" }}>
          <button
            className="upload-btn"
            onClick={() => {
              setUrl("");
              postPic("");
            }}
            style={{ color: "#ED4956" }}
          >
            Remove Current Photo
          </button>
        </div>
        <div style={{ borderTop: "1px solid #00000030" }}>
          <button
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "15px",
            }}
            onClick={changeprofile}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
