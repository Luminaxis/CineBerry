import React, { useEffect, useState, useRef } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import logo from "../assets/CineBerry-logo.png";

export default function MyFollowingPost() {
  const picLink =
    "https://cdn-icons-png.flaticon.com/128/3177/3177440.png";
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [comment, setComment] = useState("");
  const [show, setShow] = useState(false);
  const [item, setItem] = useState([]);
  const [isPostView, setIsPostView] = useState(true);

  // Refs for tracking currently playing video with audio
  const currentVideoRef = useRef(null);
  const currentVideoIdRef = useRef(null);
  const isAudioPlayingRef = useRef(false);

  // Toast functions
  const notifyA = (msg) => toast.error(msg);
  const notifyB = (msg) => toast.success(msg);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) {
      navigate("./signup");
    }
    fetchContent();
  }, [isPostView]);

  const fetchContent = () => {
    if (isPostView) {
      fetchPosts();
    } else {
      fetchClips();
    }
  };

  const fetchPosts = () => {
    fetch("/myfollwingpost", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setData(result);
      })
      .catch((err) => console.log(err));
  };

  const fetchClips = () => {
    fetch("/myfollowingclips", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
    })
      .then((res) => res.json())
      .then((result) => {
        setData(result);
      })
      .catch((err) => console.log(err));
  };

  // to show and hide comments
  const toggleComment = (posts) => {
    setShow(!show);
    setItem(posts);
  };

  const likeContent = (id) => {
    fetch(isPostView ? "/like" : "/likeClip", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        const newData = data.map((content) =>
          content._id === result._id ? result : content
        );
        setData(newData);
      });
  };

  const unlikeContent = (id) => {
    fetch(isPostView ? "/unlike" : "/unlikeClip", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        const newData = data.map((content) =>
          content._id === result._id ? result : content
        );
        setData(newData);
      });
  };

  // function to make comment
  const makeComment = (text, id) => {
    fetch(isPostView ? "/comment" : "/commentClip", {
      method: "put",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("jwt"),
      },
      body: JSON.stringify({
        text: text,
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        const newData = data.map((content) =>
          content._id === result._id ? result : content
        );
        setData(newData);
        setComment("");
        notifyB("Comment posted");
      });
  };

  // Handle video play with audio
  const handleVideoPlay = (content) => {
    if (currentVideoRef.current) {
      // Pause the previous video with audio
      currentVideoRef.current.pause();
      currentVideoRef.current.removeAttribute("muted");
      isAudioPlayingRef.current = false;
    }

    // Play the current video with audio
    const video = document.getElementById(content._id);
    video.play();
    video.muted = false;
    currentVideoRef.current = video;
    currentVideoIdRef.current = content._id;
    isAudioPlayingRef.current = true;
  };

  // Handle scroll to stop previous video with audio
  const handleScroll = () => {
    const videos = document.getElementsByTagName("video");
    const videoArray = Array.from(videos);

    // Find the video that is currently in view
    let currentVideoInView = null;
    for (let video of videoArray) {
      const rect = video.getBoundingClientRect();
      // Adjust the condition to check if video top is within viewport
      if (rect.top >= 0 && rect.top <= window.innerHeight) {
        currentVideoInView = video;
        break;
      }
    }

    if (currentVideoInView) {
      const currentVideoId = currentVideoInView.id;
      if (currentVideoId !== currentVideoIdRef.current) {
        // Pause the previous video with audio
        if (currentVideoRef.current && isAudioPlayingRef.current) {
          currentVideoRef.current.pause();
          currentVideoRef.current.removeAttribute("muted");
          isAudioPlayingRef.current = false;
        }

        // Play the current video with audio
        currentVideoInView.play();
        currentVideoInView.muted = false; // Unmute for audio
        isAudioPlayingRef.current = true;

        // Update refs
        currentVideoRef.current = currentVideoInView;
        currentVideoIdRef.current = currentVideoId;
      }
    }
  };


  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div>
        <img
          id="cine-berry-logo"
          src={logo}
          alt=""
          onClick={() => {
            navigate("/");
          }}
        />
      </div>

      <div className="home">
        <button
          onClick={() => {
            setIsPostView(!isPostView);
            setData([]);
          }}
          id="see-post-clip"
        >
          {isPostView ? "See Clips" : "See Posts"}
        </button>

        {/* card */}
        {data.map((content) => (
          <div className="card" key={content._id}>
            {/* card header */}
            <div className="card-header">
              <div className="card-pic">
                <img
                  src={
                    content.postedBy.Photo
                      ? content.postedBy.Photo
                      : picLink
                  }
                  alt=""
                />
              </div>
              <h5>
                <Link to={`/profile/${content.postedBy._id}`}>
                  {content.postedBy.name}
                </Link>
              </h5>
            </div>
            {/* card image */}
            <div className="card-image">
              {isPostView ? (
                <img src={content.photo} alt="" />
              ) : (
                <div className="custom-video-player">
                  <video
                    src={content.video}
                    id={content._id}
                    onClick={() => handleVideoPlay(content)}
                  />
                </div>
              )}
            </div>

            {/* card content */}
            <div className="card-content">
              {content.likes.includes(
                JSON.parse(localStorage.getItem("user"))._id
              ) ? (
                <span
                  className="material-symbols-outlined material-symbols-outlined-red"
                  onClick={() => unlikeContent(content._id)}
                >
                  favorite
                </span>
              ) : (
                <span
                  className="material-symbols-outlined"
                  onClick={() => likeContent(content._id)}
                >
                  favorite
                </span>
              )}

              <p>{content.likes.length} Likes</p>
              <p>{isPostView ? content.body : content.description} </p>
              <p
                style={{ fontWeight: "bold", cursor: "pointer" }}
                onClick={() => toggleComment(content)}
              >
                View all comments
              </p>
            </div>

            {/* add Comment */}
            <div className="add-comment">
              <span className="material-symbols-outlined">mood</span>
              <input
                type="text"
                placeholder="Add a comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                className="comment"
                onClick={() => makeComment(comment, content._id)}
              >
                Post
              </button>
            </div>
          </div>
        ))}

        {/* show Comment */}
        {show && (
          <div className="showComment">
            <div className="container">
              <div className="details">
                {/* card header */}
                <div
                  className="card-header"
                  style={{ borderBottom: "1px solid #00000029" }}
                >
                  <div className="card-pic">
                    <img
                      src={
                        item.postedBy.Photo
                          ? item.postedBy.Photo
                          : picLink
                      }
                      alt=""
                    />
                  </div>
                  <h5>{item.postedBy.name}</h5>
                </div>

                {/* commentSection */}
                <div
                  className="comment-section"
                  style={{ borderBottom: "1px solid #00000029" }}
                >
                  {item.comments.map((comment) => (
                    <p className="comm" key={comment._id}>
                      <span
                        className="commenter"
                        style={{ fontWeight: "bolder" }}
                      >
                        {comment.postedBy.name}{" "}
                      </span>
                      <span className="commentText">
                        {comment.comment}
                      </span>
                    </p>
                  ))}
                </div>

                {/* card content */}
                <div className="card-content">
                  <p>{item.likes.length} Likes</p>
                  <p>
                    {isPostView
                      ? item.body
                      : item.description}
                  </p>
                </div>

                {/* add Comment */}
                <div className="add-comment">
                  <span className="material-symbols-outlined">
                    mood
                  </span>
                  <input
                    type="text"
                    placeholder="Add a comment"
                    value={comment}
                    onChange={(e) =>
                      setComment(e.target.value)
                    }
                  />
                  <button
                    className="comment"
                    onClick={() => {
                      makeComment(comment, item._id);
                      toggleComment();
                    }}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
            <div
              className="close-comment"
              onClick={() => {
                toggleComment();
              }}
            >
              <span className="material-symbols-outlined material-symbols-outlined-comment">
                close
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
